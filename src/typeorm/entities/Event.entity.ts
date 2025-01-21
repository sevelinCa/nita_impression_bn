import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';
import { EventItem } from './EventItem';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.events)
  users: User[];

  @OneToMany(() => EventItem, (eventItem) => eventItem.event)
  eventItems: EventItem[];
}
