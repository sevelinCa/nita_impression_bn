import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Return } from '../typeorm/entities/Return.entity';
import { Event } from '../typeorm/entities/Event.entity';
import { User } from '../typeorm/entities/User.entity';
import { Material } from '../typeorm/entities/Material.entity';
import { RentalMaterial } from '../typeorm/entities/RentalMaterial.entity';
import { CreateReturnDto } from './create-return.dto';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { BaseService } from 'src/base.service';
import { MailService } from 'src/mail/mail.service';
import { ReportsService } from 'src/reports/reports.service';

@Injectable()
export class ReturnService {
  constructor(
    private dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly baseService: BaseService,
    private readonly mailService: MailService,
    private readonly reportService: ReportsService,
  ) {}

  async createReturn(createReturnDto: CreateReturnDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      const admin = await entityManager.findOne(User, {
        where: { id: userId },
      });
      if (!admin || admin.role !== 'admin') {
        throw new ForbiddenException('Only admins can process returns');
      }

      const event = await entityManager.findOne(Event, {
        where: {
          id: createReturnDto.eventId,
        },
        relations: [
          'eventItems',
          'eventItems.material',
          'eventItems.rentalMaterial',
        ],
      });

      if (!event) {
        throw new NotFoundException('Event not found or unauthorized');
      }

      if (event.employeeFee <= 0) {
        throw new ForbiddenException('Employee fee is not set');
      }

      if (event.status !== 'done') {
        throw new BadRequestException(
          'Can only process returns for completed events',
        );
      }

      const returns: Return[] = [];

      for (const item of createReturnDto.items) {
        const eventItem = event.eventItems.find(
          (ei) => ei.id === item.eventItemId,
        );
        if (!eventItem) {
          throw new BadRequestException(
            `Event item ${item.eventItemId} not found`,
          );
        }

        const isReturnable = eventItem.material || eventItem.rentalMaterial;
        if (!isReturnable) {
          continue;
        }

        const existingReturn = await entityManager
          .createQueryBuilder(Return, 'return')
          .leftJoinAndSelect('return.eventItem', 'eventItem')
          .leftJoinAndSelect('return.material', 'material')
          .leftJoinAndSelect('return.rentalMaterial', 'rentalMaterial')
          .where('return.event = :eventId', { eventId: event.id })
          .andWhere('eventItem.id = :eventItemId', {
            eventItemId: eventItem.id,
          })
          .getOne();

        let returnRecord: Return;

        if (existingReturn) {
          const newTotalReturned =
            existingReturn.returnedQuantity + item.returnedQuantity;

          if (newTotalReturned > eventItem.quantity) {
            throw new BadRequestException(
              `Cannot return more items than borrowed. Total returned would be: ${newTotalReturned}, Original: ${eventItem.quantity}`,
            );
          }

          returnRecord = existingReturn;
          returnRecord.returnedQuantity = newTotalReturned;
          returnRecord.remainingQuantity =
            eventItem.quantity - newTotalReturned;
          returnRecord.status =
            returnRecord.remainingQuantity === 0 ? 'complete' : 'incomplete';
        } else {
          if (item.returnedQuantity > eventItem.quantity) {
            throw new BadRequestException(
              `Cannot return more items than borrowed. Requested: ${item.returnedQuantity}, Borrowed: ${eventItem.quantity}`,
            );
          }

          const remainingQuantity = eventItem.quantity - item.returnedQuantity;

          returnRecord = entityManager.create(Return, {
            event,
            eventItem,
            returnedQuantity: item.returnedQuantity,
            remainingQuantity,
            status: remainingQuantity === 0 ? 'complete' : 'incomplete',
          });
        }

        if (eventItem.material) {
          const material = await entityManager.findOne(Material, {
            where: { id: eventItem.material.id },
          });
          if (material) {
            material.quantity += item.returnedQuantity;
            await entityManager.save(Material, material);
            returnRecord.material = material;
          }
        }

        if (eventItem.rentalMaterial) {
          const rentalMaterial = await entityManager.findOne(RentalMaterial, {
            where: { id: eventItem.rentalMaterial.id },
          });
          if (rentalMaterial) {
            rentalMaterial.quantity += item.returnedQuantity;
            await entityManager.save(RentalMaterial, rentalMaterial);
            returnRecord.rentalMaterial = rentalMaterial;
          }
        }

        await entityManager.save(Return, returnRecord);
        returns.push(returnRecord);
      }

      const returnableItems = event.eventItems.filter(
        (item) => item.material || item.rentalMaterial,
      );

      const remainingItems = [];
      for (const item of returnableItems) {
        const itemReturns = await entityManager
          .createQueryBuilder(Return, 'return')
          .where('return.event = :eventId', { eventId: event.id })
          .andWhere('return.eventItem = :eventItemId', { eventItemId: item.id })
          .getMany();

        const totalReturned = itemReturns.reduce(
          (sum, r) => sum + r.returnedQuantity,
          0,
        );

        if (totalReturned < item.quantity) {
          remainingItems.push({
            itemId: item.id,
            name: item.material?.name || item.rentalMaterial?.name,
            totalQuantity: item.quantity,
            returnedQuantity: totalReturned,
            remainingQuantity: item.quantity - totalReturned,
            type: item.material ? 'material' : 'rental',
            materialId: item.material?.id || item.rentalMaterial?.id,
          });
        }
      }
      if (remainingItems.length === 0) {
        event.status = 'closed';
        await this.entityManager.save(Event, event);

        const report = await this.reportService.closedEventReport(event);
        await this.mailService.sendEventReport({
          name: report.name,
          customerName: report.customerName,
          customerEmail: report.customerEmail,
          eventId: report.eventId,
          eventDate: report.eventDate,
          totalIncome: report.totalIncome,
          itemizedExpenses: report.itemizedExpenses,
          employeeFee: report.employeeFee,
          totalExpense: report.totalExpense,
        });
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Returns processed successfully',
        event: {
          id: event.id,
          status: event.status,
        },
        returns: returns.map((r) => ({
          id: r.id,
          returnedQuantity: r.returnedQuantity,
          remainingQuantity: r.remainingQuantity,
          status: r.status,
          materialId: r.material?.id,
          rentalMaterialId: r.rentalMaterial?.id,
        })),
        remainingItems:
          remainingItems.length > 0
            ? {
                count: remainingItems.length,
                items: remainingItems,
              }
            : null,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getReturnsByEvent(eventId: string, userId: string) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const returns = await this.entityManager.find(Return, {
      where: {
        event: { id: eventId },
      },
      relations: ['event', 'material', 'rentalMaterial'],
    });

    if (returns.length === 0) {
      throw new NotFoundException('No returns found for this event');
    }

    return returns.map((r) => ({
      id: r.id,
      eventName: r.event.name,
      returnedQuantity: r.returnedQuantity,
      remainingQuantity: r.remainingQuantity,
      status: r.status,
      material: r.material
        ? {
            id: r.material.id,
            name: r.material.name,
          }
        : null,
      rentalMaterial: r.rentalMaterial
        ? {
            id: r.rentalMaterial.id,
            name: r.rentalMaterial.name,
          }
        : null,
      createdAt: r.createdAt,
    }));
  }

  async findAll(paginationQuery: PaginationQueryDto, adminId: string) {
    const { skip, take } =
      this.baseService.initializePagination(paginationQuery);
    const admin = await this.entityManager.findOne(User, {
      where: { id: adminId },
    });
    if (admin === null) throw new NotFoundException('User Not Found');

    if (admin.role !== 'admin') {
      throw new ForbiddenException(
        'Only admin is allowed to access this endpoint',
      );
    }

    const [returns, totalCount] = await this.entityManager.findAndCount(
      Return,
      {
        take,
        skip,
        relations: ['event', 'material', 'rentalMaterial'],
      },
    );

    return this.baseService.paginate(returns, totalCount, paginationQuery);
  }

  async getReturnsByStatus(
    paginationQuery: PaginationQueryDto,
    adminId: string,
    status: string,
  ) {
    const { skip, take } =
      this.baseService.initializePagination(paginationQuery);
    const admin = await this.entityManager.findOne(User, {
      where: { id: adminId },
    });
    if (admin === null) throw new NotFoundException('User Not Found');

    if (admin.role !== 'admin') {
      throw new ForbiddenException(
        'Only admin is allowed to access this endpoint',
      );
    }

    const [returns, totalCount] = await this.entityManager.findAndCount(
      Return,
      {
        take,
        skip,
        where: { status: status },
      },
    );

    return this.baseService.paginate(returns, totalCount, paginationQuery);
  }
}
