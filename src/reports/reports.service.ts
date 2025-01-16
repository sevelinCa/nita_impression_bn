import { BadRequestException, Injectable } from '@nestjs/common';
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

    const totalEventsInMonth = await this.entityManager.find(Event, {
      where: { date: Between(startOfMonth, endOfMonth) },
      relations: ['eventItems', 'eventItems.rentalMaterial'],
    });
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
        if (eventItem.price) {
          totalEventExpense += eventItem.price * eventItem.quantity;
        }

        if (eventItem.rentalMaterial) {
          totalEventExpense +=
            eventItem.rentalMaterial.rentingCost * eventItem.quantity;
        }
      }

      totalExpense += totalEventExpense;
    }

    return {
      totalIncome,
      totalExpense,
      totalEvents,
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
        'user',
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
      if (eventItem.price) {
        itemExpense += eventItem.price * eventItem.quantity;
      }

      if (eventItem.rentalMaterial) {
        itemExpense +=
          eventItem.rentalMaterial.rentingCost * eventItem.quantity;
      }

      itemizedExpenses.push({
        name:
          eventItem.material?.name ||
          eventItem.rentalMaterial?.name ||
          'Unknown Item',
        quantity: eventItem.quantity,
        cost: itemExpense,
      });

      totalExpense += itemExpense;
    }

    return {
      name: event.user.fullName,
      eventId: event.id,
      eventDate: event.date,
      customerName: admin.fullName,
      customerEmail: admin.email,
      totalIncome: event.cost,
      totalExpense,
      profit: event.cost - totalExpense,
      itemizedExpenses,
      employeeFee: event.employeeFee,
    };
  }
}
