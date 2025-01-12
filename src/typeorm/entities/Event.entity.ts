import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User.entity';
import { EventItem } from './Expense.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('date')
  date: Date;

  @Column({
    type: 'enum',
    enum: ['planning', 'ongoing', 'done', 'closed', 'cancelled'],
    default: 'planning',
  })
  status: string;

  @Column()
  cost: number;

  @Column()
  employeeFee: number;

  @Column()
  address: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.events)
  user: User;

  // Add the OneToMany relation here
  @OneToMany(() => EventItem, (eventItem) => eventItem.event)
  eventItems: EventItem[];
}
