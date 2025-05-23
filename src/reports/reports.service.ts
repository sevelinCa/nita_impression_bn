import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Between } from 'typeorm';
import { Event } from 'src/typeorm/entities/Event.entity';
import { User } from 'src/typeorm/entities/User.entity';
@Injectable()
export class ReportsService {
  constructor(protected readonly entityManager: EntityManager) {}

  async monthlyReport() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalEventsInMonth = await this.entityManager
      .getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.eventItems', 'eventItems')
      .leftJoinAndSelect('eventItems.rentalMaterial', 'rentalMaterial')
      .where('event.createdAt BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth,
        endOfMonth,
      })
      .andWhere('event.status != :status', { status: 'planning' })
      .getMany();

    let totalEvents = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    for (const event of totalEventsInMonth) {
      if (event.status === 'cancelled') {
        continue;
      }
      totalIncome += event.cost;
      totalEvents = totalEvents + 1;

      let totalEventExpense = event.employeeFee;

      for (const eventItem of event.eventItems) {
        if (eventItem.rentalMaterial) {
          const rentingCost: number = Number(
            eventItem.rentalMaterial.rentingCost,
          );

          totalEventExpense += rentingCost * eventItem.quantity;
        }

        if (eventItem.type) {
          const price: number = Number(eventItem.price);

          totalEventExpense += price * eventItem.quantity;
        }
      }

      totalExpense += totalEventExpense;
    }

    return {
      totalIncome,
      totalExpense,
      totalEvents,
      events: totalEventsInMonth.map((event) => ({
        ...event,
        size: event.size || 'N/A',
      })),
    };
  }

  async closedEventReport(even: Event) {
    const admin = await this.entityManager.findOne(User, {
      where: { role: 'admin' },
    });
    const event = await this.entityManager.findOne(Event, {
      where: { id: even.id },
      relations: [
        'eventItems',
        'eventItems.rentalMaterial',
        'eventItems.material',
        'eventUsers',
      ],
    });
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'closed') {
      throw new BadRequestException('Event is not closed');
    }

    let totalExpense = event.employeeFee || 0;
    const itemizedExpenses = [];
    for (const eventItem of event.eventItems) {
      let itemExpense = 0;

      if (eventItem.material && eventItem.type === null) {
        continue;
      }

      if (eventItem.rentalMaterial) {
        const rentingCost: number = Number(
          eventItem.rentalMaterial.rentingCost,
        );
        itemExpense += rentingCost * eventItem.quantity;
      }

      if (eventItem.type) {
        const price: number = Number(eventItem.price);
        itemExpense += price * eventItem.quantity;
      }

      itemizedExpenses.push({
        name:
          eventItem.rentalMaterial?.name || eventItem.names || 'Unknown Item',
        quantity: eventItem.quantity,
        cost: itemExpense,
      });

      totalExpense += itemExpense;
    }

    return {
      name: event?.name,
      eventId: event.id,
      eventType: event.size,
      eventDate: event.date,
      customers: event.eventUsers.length,
      customerEmail: admin.email,
      totalIncome: event.cost,
      totalExpense,
      profit: event.cost - totalExpense,
      itemizedExpenses,
      employeeFee: event.employeeFee,
    };
  }

  async yearlyReport(userId: string) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException('Only admin is allowed to view materials');

    const now = new Date();
    const year = now.getFullYear();

    const monthlyReports = [];

    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);

      const totalEventsInMonth = await this.entityManager.find(Event, {
        where: { date: Between(startOfMonth, endOfMonth) },
        relations: ['eventItems', 'eventItems.rentalMaterial'],
      });

      let totalIncome = 0;
      let totalExpense: number = 0;

      for (const event of totalEventsInMonth) {
        if (event.status === 'cancelled' || event.status === 'planning') {
          continue;
        }
        totalIncome += event.cost;

        let totalEventExpense: number = event.employeeFee || 0;

        for (const eventItem of event.eventItems) {
          if (eventItem.rentalMaterial) {
            const rentingCost: number = Number(
              eventItem.rentalMaterial.rentingCost,
            );

            totalEventExpense += rentingCost * eventItem.quantity;
          }

          if (eventItem.type) {
            const price: number = Number(eventItem.price);

            totalEventExpense += price * eventItem.quantity;
          }
        }

        totalExpense += totalEventExpense;
      }

      const monthName = startOfMonth.toLocaleString('default', {
        month: 'long',
      });

      monthlyReports.push({
        [monthName.toLowerCase()]: {
          income: Number(totalIncome),
          expense: Number(totalExpense),
        },
      });
    }

    return monthlyReports;
  }

  async getEventsByDateRange(startDate: Date, endDate: Date, userId: string) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException('Only admin is allowed to view materials');
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    const events = await this.entityManager
      .getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.eventItems', 'eventItems')
      .leftJoinAndSelect('eventItems.rentalMaterial', 'rentalMaterial')
      .leftJoinAndSelect('eventItems.material', 'material')
      .leftJoinAndSelect('event.eventUsers', 'users')
      .where('event.createdAt BETWEEN :startDate AND :endDate', {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      })
      .getMany();

    if (!events) {
      throw new Error('No events found within the given date range.');
    }

    const eventReports = events
      .filter(
        (event) => event.status !== 'cancelled' && event.status !== 'planning',
      )
      .map((event) => {
        let totalExpense = event.employeeFee || 0;

        for (const eventItem of event.eventItems) {
          if (eventItem.rentalMaterial) {
            const rentingCost: number = Number(
              eventItem.rentalMaterial.rentingCost,
            );

            totalExpense += rentingCost * eventItem.quantity;
          }

          if (eventItem.type) {
            const price: number = Number(eventItem.price);

            totalExpense += price * eventItem.quantity;
          }
        }

        return {
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          totalIncome: event.cost,
          totalExpense: totalExpense,
          netProfit: event.cost - totalExpense,
        };
      });

    const totals = eventReports.reduce(
      (acc, event) => {
        return {
          totalIncome: acc.totalIncome + event.totalIncome,
          totalExpense: acc.totalExpense + event.totalExpense,
          netProfit: acc.netProfit + event.netProfit,
        };
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
      },
    );

    return {
      events: eventReports,
      summary: {
        totalEvents: eventReports.length,
        ...totals,
      },
    };
  }
}
