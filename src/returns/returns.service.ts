import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Return } from '../typeorm/entities/Return.entity';
import { Event } from '../typeorm/entities/Event.entity';
import { EventItem } from '../typeorm/entities/EventItem';
import { User } from '../typeorm/entities/User.entity';
import { Material } from '../typeorm/entities/Material.entity';
import { RentalMaterial } from '../typeorm/entities/RentalMaterial.entity';
import { CreateReturnDto } from './create-return.dto';

@Injectable()
export class ReturnService {
  constructor(
    private dataSource: DataSource,
    private readonly entityManager: EntityManager,
  ) {}

  async createReturn(createReturnDto: CreateReturnDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      const admin = await this.entityManager.findOne(User, {
        where: { id: userId },
      });
      if (!admin) {
        throw new NotFoundException('Admin User Not Found');
      }

      if (admin.role !== 'admin') {
        throw new ForbiddenException(
          'Only admins are allowed to view all events by a user',
        );
      }

      const user = await entityManager.findOne(User, {
        where: { id: createReturnDto.employeeId },
      });
      if (!user) {
        throw new NotFoundException('Employee Not Found');
      }

      const event = await entityManager.findOne(Event, {
        where: {
          id: createReturnDto.eventId,
          user: { id: createReturnDto.employeeId },
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

      if (event.status !== 'done') {
        throw new BadRequestException(
          'Can only process returns for completed events',
        );
      }

      const returnableItems = event.eventItems.filter(
        (ei) => ei.type !== 'non-returnable',
      );
      const missingItems = returnableItems.filter(
        (ei) =>
          !createReturnDto.items.some((item) => item.eventItemId === ei.id),
      );

      if (missingItems.length > 0) {
        throw new BadRequestException(
          `Missing return entries for the following event items: ${missingItems
            .map((item) => item.id)
            .join(', ')}`,
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

        if (eventItem.type === 'non-returnable') {
          continue;
        }

        if (item.returnedQuantity > eventItem.quantity) {
          throw new BadRequestException(
            `Cannot return more items than borrowed. Requested: ${item.returnedQuantity}, Borrowed: ${eventItem.quantity}`,
          );
        }

        const remainingQuantity = eventItem.quantity - item.returnedQuantity;

        const returnRecord = entityManager.create(Return, {
          event,
          user,
          returnedQuantity: item.returnedQuantity,
          remainingQuantity,
          status: remainingQuantity === 0 ? 'complete' : 'incomplete',
        });

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

        returns.push(returnRecord);
      }

      await entityManager.save(Return, returns);

      const allReturnsComplete = returns.every((r) => r.status === 'complete');
      if (allReturnsComplete) {
        event.status = 'closed';
        await entityManager.save(Event, event);
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
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getReturns(userId: string, adminId: string) {
    const admin = await this.entityManager.findOne(User, {
      where: { id: adminId },
    });
    if (admin === null) throw new NotFoundException('User Not Found');

    if (admin.role !== 'admin') {
      throw new ForbiddenException(
        'Only admin is allowed to access this endpoint',
      );
    }
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const returns = await this.entityManager.find(Return, {
      where: { user: { id: userId } },
      relations: ['event', 'material', 'rentalMaterial'],
    });

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
}
