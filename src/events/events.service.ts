import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Event } from 'src/typeorm/entities/Event.entity';
import { EventItem } from 'src/typeorm/entities/Expense.entity';
import { Material } from 'src/typeorm/entities/Material.entity';
import { RentalMaterial } from 'src/typeorm/entities/RentalMaterial.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from 'src/typeorm/entities/User.entity';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { BaseService } from 'src/base.service';

interface ConsolidatedItem {
  materialId?: string;
  rentalMaterialId?: string;
  names?: string;
  type?: string;
  price?: number;
  quantity: number;
}

@Injectable()
export class EventsService {
  constructor(
    private dataSource: DataSource,
    protected readonly entityManager: EntityManager,
    private readonly baseService: BaseService,
  ) {}

  private consolidateItems(items: CreateEventDto['items']): ConsolidatedItem[] {
    const consolidatedMap = new Map<string, ConsolidatedItem>();

    items.forEach((item) => {
      let key: string;

      if (item.materialId) {
        key = `material-${item.materialId}`;
      } else if (item.rentalMaterialId) {
        key = `rental-${item.rentalMaterialId}`;
      } else {
        key = `custom-${item.names}-${item.type}-${item.price}`;
      }

      if (consolidatedMap.has(key)) {
        const existing = consolidatedMap.get(key)!;
        existing.quantity += item.quantity;
      } else {
        consolidatedMap.set(key, {
          materialId: item.materialId,
          rentalMaterialId: item.rentalMaterialId,
          names: item.names,
          type: item.type,
          price: item.price,
          quantity: item.quantity,
        });
      }
    });

    return Array.from(consolidatedMap.values());
  }

  async create(createEventDto: CreateEventDto, userId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      const user = await this.entityManager.findOne(User, {
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User Not Found');

      if (user.role !== 'admin')
        throw new ForbiddenException('Only admin is allowed to view materials');

      const event = entityManager.create(Event, {
        name: createEventDto.name,
        date: createEventDto.date,
        address: createEventDto.address,
        status: 'planning',
        cost: createEventDto.cost,
        employeeFee: createEventDto.employeeFee,
        user,
      });

      await entityManager.save(Event, event);

      const eventItems: EventItem[] = [];

      const consolidatedItems = this.consolidateItems(createEventDto.items);

      for (const item of consolidatedItems) {
        if (item.materialId && item.rentalMaterialId) {
          throw new BadRequestException(
            'An item cannot have both materialId and rentalMaterialId.',
          );
        }

        if (!item.materialId && !item.rentalMaterialId) {
          if (!item.names || !item.price || !item.quantity || !item.type) {
            throw new BadRequestException(
              'If materialId and rentalMaterialId are not provided, item must include names, price, quantity, and type.',
            );
          }
        }

        const eventItem = entityManager.create(EventItem, {
          event,
          quantity: item.quantity,
          names: item.names,
          price: item.price,
          type: item.type,
        });

        if (item.type === 'returnable') {
          const returnableMaterial = entityManager.create(Material, {
            name: item.names,
            quantity: item.quantity,
            price: item.price,
          });
          await entityManager.save(Material, returnableMaterial);
        }

        if (item.materialId) {
          const material = await entityManager.findOne(Material, {
            where: { id: item.materialId },
          });
          if (!material) {
            throw new BadRequestException(
              `Material with ID ${item.materialId} not found.`,
            );
          }

          if (material.quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for material ${material.name}. Available: ${material.quantity}, Requested: ${item.quantity}`,
            );
          }

          material.quantity -= item.quantity;
          await entityManager.save(Material, material);

          eventItem.material = material;
        }

        if (item.rentalMaterialId) {
          const rentalMaterial = await entityManager.findOne(RentalMaterial, {
            where: { id: item.rentalMaterialId },
          });
          if (!rentalMaterial) {
            throw new BadRequestException(
              `Rental material with ID ${item.rentalMaterialId} not found.`,
            );
          }

          if (rentalMaterial.quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for rental material ${rentalMaterial.name}. Available: ${rentalMaterial.quantity}, Requested: ${item.quantity}`,
            );
          }

          eventItem.rentalMaterial = rentalMaterial;
          rentalMaterial.quantity -= item.quantity;
          await entityManager.save(RentalMaterial, rentalMaterial);
        }

        eventItems.push(eventItem);
      }

      await entityManager.save(EventItem, eventItems);

      await entityManager.save(Event, event);

      await queryRunner.commitTransaction();
      return {
        event: {
          id: event.id,
          name: event.name,
          date: event.date,
          status: event.status,
          cost: event.cost,
          address: event.address,
          userFullName: user.fullName,
          employeeFee: event.employeeFee,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        },
        items: eventItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          names: item.names,
          price: item.price,
          type: item.type,
          ...(item.rentalMaterial && {
            rentalMaterial: {
              id: item.rentalMaterial.id,
              name: item.rentalMaterial.name,
              quantity: item.rentalMaterial.quantity,
              rentingCost: item.rentalMaterial.rentingCost,
              vendorName: item.rentalMaterial.vendorName,
              status: item.rentalMaterial.status,
            },
          }),
          ...(item.material && {
            material: {
              id: item.material.id,
              name: item.material.name,
              quantity: item.material.quantity,
              price: item.material.price,
            },
          }),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async eventDetails(eventId: string, userId: string) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException('Only admin is allowed to view materials');

    const event = await this.entityManager.findOne(Event, {
      where: { id: eventId },
      relations: [
        'eventItems',
        'eventItems.material',
        'eventItems.rentalMaterial',
      ],
    });


    return event;
  }

  async findAll(paginationQuery: PaginationQueryDto, id: string) {
    const user = await this.entityManager.findOne(User, { where: { id } });
    if (user === null) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException(
        'Only admin is allowed to view all materials',
      );
    const { skip, take } =
      this.baseService.initializePagination(paginationQuery);

    const [events, totalCount] = await this.entityManager.findAndCount(Event, {
      take,
      skip,
    });

    return this.baseService.paginate(events, totalCount, paginationQuery);
  }
}
