import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Event } from 'src/typeorm/entities/Event.entity';
import { EventItem } from 'src/typeorm/entities/EventItem.entity';
import { Material } from 'src/typeorm/entities/Material.entity';
import { RentalMaterial } from 'src/typeorm/entities/RentalMaterial.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from 'src/typeorm/entities/User.entity';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { BaseService } from 'src/base.service';
import { ChangeStatusDto } from './dto/change-status.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Return } from 'src/typeorm/entities/Return.entity';
import { EventUser } from 'src/typeorm/entities/EventUsers';

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

      const user = await entityManager.findOne(User, {
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User Not Found');

      if (user.role !== 'admin')
        throw new ForbiddenException('Only admin is allowed to create events');

      const employees = await Promise.all(
        createEventDto.employees.map(async (emp) => {
          if (emp.employeeId && emp.employeeFullNames) {
            throw new BadRequestException(
              `You must provide either employeeId or employeeFullNames, not both.`,
            );
          }

          let employee: User;

          if (emp.employeeId) {
            employee = await entityManager.findOne(User, {
              where: { id: emp.employeeId },
            });

            if (!employee) {
              throw new NotFoundException(
                `Employee with ID ${emp.employeeId} not found.`,
              );
            }

            if (employee.role !== 'worker') {
              throw new BadRequestException(
                `Only workers can be assigned to events. Invalid role for employee ID: ${emp.employeeId}`,
              );
            }
          } else if (emp.employeeFullNames) {
            employee = entityManager.create(User, {
              fullName: emp.employeeFullNames,
              role: 'worker',
            });
            await entityManager.save(User, employee);
          } else {
            throw new BadRequestException(
              `You must provide either employeeId or employeeFullNames.`,
            );
          }

          return { employee, fee: emp.fee };
        }),
      );

      const totalEmployeeFee = employees.reduce((sum, emp) => sum + emp.fee, 0);

      const event = entityManager.create(Event, {
        name: createEventDto.name,
        date: createEventDto.date,
        address: createEventDto.address,
        status: 'planning',
        size: createEventDto.size,
        cost: createEventDto.cost,
        employeeFee: totalEmployeeFee,
      });

      await entityManager.save(Event, event);

      const eventUsers = employees.map(({ employee, fee }) => {
        return entityManager.create(EventUser, {
          event,
          user: employee,
          fee,
        });
      });

      await entityManager.save(EventUser, eventUsers);

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
          eventItem.material = returnableMaterial;
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

  async update(
    eventId: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      const user = await entityManager.findOne(User, {
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User Not Found');

      if (user.role !== 'admin') {
        throw new ForbiddenException('Only admin can update events');
      }

      const event = await entityManager.findOne(Event, {
        where: { id: eventId },
        relations: ['eventUsers', 'eventUsers.user', 'eventItems'],
      });
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      if (updateEventDto.name !== undefined) event.name = updateEventDto.name;
      if (updateEventDto.date !== undefined) event.date = updateEventDto.date;
      if (updateEventDto.address !== undefined)
        event.address = updateEventDto.address;
      if (updateEventDto.cost !== undefined) event.cost = updateEventDto.cost;
      if (updateEventDto.size !== undefined) event.size = updateEventDto.size;

      if (updateEventDto.addEmployees) {
        for (const emp of updateEventDto.addEmployees) {
          if (emp.employeeId && emp.employeeFullNames) {
            throw new BadRequestException(
              'Provide either employeeId or employeeFullNames, not both',
            );
          }

          let employee: User;

          if (emp.employeeId) {
            employee = await entityManager.findOne(User, {
              where: { id: emp.employeeId },
            });

            if (!employee) {
              throw new NotFoundException(
                `Employee with ID ${emp.employeeId} not found`,
              );
            }

            if (employee.role !== 'worker') {
              throw new BadRequestException(`Employee role must be 'worker'`);
            }

            const existingEventUser = event.eventUsers.find(
              (eu) => eu.user.id === emp.employeeId,
            );

            if (existingEventUser) {
              existingEventUser.fee = emp.fee;
              await entityManager.save(EventUser, existingEventUser);
            } else {
              const newEventUser = entityManager.create(EventUser, {
                event,
                user: employee,
                fee: emp.fee,
              });
              await entityManager.save(EventUser, newEventUser);
              event.eventUsers.push(newEventUser);
            }
          } else if (emp.employeeFullNames) {
            employee = entityManager.create(User, {
              fullName: emp.employeeFullNames,
              role: 'worker',
            });
            await entityManager.save(User, employee);

            const newEventUser = entityManager.create(EventUser, {
              event,
              user: employee,
              fee: emp.fee,
            });
            await entityManager.save(EventUser, newEventUser);
            event.eventUsers.push(newEventUser);
          } else {
            throw new BadRequestException(
              'Provide either employeeId or employeeFullNames',
            );
          }
        }

        const totalEmployeeFee = event.eventUsers.reduce(
          (sum, eu) => sum + eu.fee,
          0,
        );
        event.employeeFee = totalEmployeeFee;
      }

      if (updateEventDto.addItems) {
        const newItems: EventItem[] = [];
        const consolidatedItems = this.consolidateItems(
          updateEventDto.addItems,
        );

        for (const item of consolidatedItems) {
          if (item.materialId && item.rentalMaterialId) {
            throw new BadRequestException(
              'An item cannot have both materialId and rentalMaterialId',
            );
          }

          if (!item.materialId && !item.rentalMaterialId) {
            if (!item.names || !item.price || !item.quantity || !item.type) {
              throw new BadRequestException(
                'Item must include names, price, quantity, and type if materialId and rentalMaterialId are not provided',
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
            eventItem.material = returnableMaterial;
            await entityManager.save(Material, returnableMaterial);
            await entityManager.save(EventItem, eventItem);
          }

          if (item.materialId) {
            const material = await entityManager.findOne(Material, {
              where: { id: item.materialId },
            });

            if (!material) {
              throw new NotFoundException(
                `Material with ID ${item.materialId} not found`,
              );
            }

            if (material.quantity < item.quantity) {
              throw new BadRequestException(
                `Insufficient stock for material ${material.name}. Available: ${material.quantity}, Requested: ${item.quantity}`,
              );
            }

            const existingMaterial = await entityManager.findOne(EventItem, {
              where: { event: { id: event.id }, material: { id: material.id } },
              relations: ['material'],
            });

            if (existingMaterial) {
              throw new BadRequestException(
                `Material with ID ${item.materialId} is already part of this event`,
              );
            }

            material.quantity -= item.quantity;
            await entityManager.save(Material, material);

            eventItem.material = material;
            await entityManager.save(EventItem, eventItem);
          }

          if (item.rentalMaterialId) {
            const rentalMaterial = await entityManager.findOne(RentalMaterial, {
              where: { id: item.rentalMaterialId },
            });

            if (!rentalMaterial) {
              throw new NotFoundException(
                `Rental material with ID ${item.rentalMaterialId} not found`,
              );
            }

            if (rentalMaterial.quantity < item.quantity) {
              throw new BadRequestException(
                `Insufficient stock for rental material ${rentalMaterial.name}. Available: ${rentalMaterial.quantity}, Requested: ${item.quantity}`,
              );
            }

            const existingRentalMaterial = await entityManager.findOne(
              EventItem,
              {
                where: {
                  event: { id: event.id },
                  rentalMaterial: { id: rentalMaterial.id },
                },
                relations: ['rentalMaterial'],
              },
            );

            if (existingRentalMaterial) {
              throw new BadRequestException(
                `Rental material with ID ${item.rentalMaterialId} is already part of this event`,
              );
            }

            rentalMaterial.quantity -= item.quantity;
            await entityManager.save(RentalMaterial, rentalMaterial);

            eventItem.rentalMaterial = rentalMaterial;
            await entityManager.save(EventItem, eventItem);
          }

          newItems.push(eventItem);
        }

        event.eventItems.push(...newItems);
        await entityManager.save(EventItem, newItems);
      }

      await entityManager.save(Event, event);

      await queryRunner.commitTransaction();

      return { message: 'Event updated successfully', event };
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
        'eventUsers',
        'eventUsers.user',
      ],
    });

    return {
      ...event,
      eventUsers: event.eventUsers.map((eventUser) => ({
        id: eventUser.user.id,
        fee: eventUser.fee,
        fullName: eventUser.user?.fullName || undefined,
      })),
    };
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
      relations: [
        'eventItems',
        'eventItems.material',
        'eventItems.rentalMaterial',
        'eventUsers',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
    return this.baseService.paginate(events, totalCount, paginationQuery);
  }

  async findByUser(
    paginationQuery: PaginationQueryDto,
    adminId: string,
    userId: string,
  ) {
    const admin = await this.entityManager.findOne(User, {
      where: { id: adminId },
    });
    if (!admin) {
      throw new NotFoundException('Admin User Not Found');
    }

    if (admin.role !== 'admin') {
      throw new ForbiddenException(
        'Only admins are allowed to view all events by a user',
      );
    }

    const employee = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    if (!employee) {
      throw new NotFoundException('Employee Not Found');
    }

    if (employee.role !== 'worker') {
      throw new BadRequestException('Must be employee not admin buddy');
    }

    const { skip, take } =
      this.baseService.initializePagination(paginationQuery);

    const [events, totalCount] = await this.entityManager.findAndCount(Event, {
      where: { eventUsers: { id: employee.id } },
      take,
      skip,
      relations: [
        'eventItems',
        'eventItems.material',
        'eventItems.rentalMaterial',
      ],
    });

    return this.baseService.paginate(events, totalCount, paginationQuery);
  }

  async updateEventStatusService(
    changeStatusDto: ChangeStatusDto,
    adminId: string,
    eventId: string,
  ) {
    const admin = await this.entityManager.findOne(User, {
      where: { id: adminId },
    });
    if (!admin) {
      throw new NotFoundException('Admin User Not Found');
    }

    if (admin.role !== 'admin') {
      throw new ForbiddenException(
        'Only admins are allowed to update event status',
      );
    }

    const event = await this.entityManager.findOne(Event, {
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    switch (changeStatusDto.status) {
      case 'ongoing':
      case 'done':
        return this.updateSimpleEventStatus(event, changeStatusDto.status);

      case 'cancelled':
        return this.handleCancelledEvent(event);

      default:
        throw new BadRequestException('Invalid status provided');
    }
  }

  private async updateSimpleEventStatus(
    event: Event,
    status: string,
  ): Promise<Event> {
    event.status = status;
    return await this.entityManager.save(event);
  }

  private async handleCancelledEvent(event: Event): Promise<void> {
    event.status = 'cancelled';

    const eventItems = await this.entityManager.find(EventItem, {
      where: { event: { id: event.id } },
      relations: ['material', 'rentalMaterial'],
    });

    for (const item of eventItems) {
      if (item.type === 'returnable') {
        const material =
          item.material ||
          (await this.entityManager.findOne(Material, {
            where: { id: item.material?.id },
          }));

        if (material) {
          await this.entityManager.remove(Material, material);
        }
      }

      if (item.material) {
        item.material.quantity += item.quantity;
        await this.entityManager.save(Material, item.material);
      }

      if (item.rentalMaterial) {
        item.rentalMaterial.quantity += item.quantity;
        await this.entityManager.save(RentalMaterial, item.rentalMaterial);
      }
    }

    await this.entityManager.save(Event, event);
  }

  async eventItems(userId: string, paginationQuery: PaginationQueryDto) {
    const admin = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    if (!admin) {
      throw new UnauthorizedException();
    }

    if (admin.role !== 'admin') {
      throw new ForbiddenException(
        'Only admins are allowed to update event status',
      );
    }

    const { skip, take } =
      this.baseService.initializePagination(paginationQuery);

    const [events, totalCount] = await this.entityManager.findAndCount(
      EventItem,
      {
        take,
        skip,
        relations: ['material', 'rentalMaterial'],
      },
    );

    return this.baseService.paginate(events, totalCount, paginationQuery);
  }

  async delete(eventId: string, userId: string) {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const admin = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
        });

        if (!admin) {
          throw new UnauthorizedException();
        }

        if (admin.role !== 'admin') {
          throw new ForbiddenException(
            'Only admins are allowed to delete events',
          );
        }

        const event = await transactionalEntityManager.findOne(Event, {
          where: { id: eventId },
          relations: ['eventUsers', 'eventItems'],
        });

        if (!event) {
          throw new NotFoundException('Event not found');
        }

        if (event.eventUsers?.length > 0) {
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(EventUser)
            .where('eventId = :eventId', { eventId })
            .execute();
        }

        if (event.eventItems?.length > 0) {
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(Return)
            .where('eventItemId IN (:...eventItemIds)', {
              eventItemIds: event.eventItems.map((item) => item.id),
            })
            .execute();

          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(EventItem)
            .where('eventId = :eventId', { eventId })
            .execute();
        }

        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(Event)
          .where('id = :id', { id: eventId })
          .execute();
      },
    );
  }
}
