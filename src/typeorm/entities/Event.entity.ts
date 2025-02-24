import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventItem } from './EventItem.entity';
import { EventUser } from './EventUsers';

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
    enum: ['small', 'big'],
  })
  size: string;

  @Column({
    type: 'enum',
    enum: ['planning', 'ongoing', 'done', 'closed', 'cancelled'],
    default: 'planning',
  })
  status: string;

  @Column()
  cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  employeeFee: number;

  @Column()
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EventUser, (eventUser) => eventUser.event, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  eventUsers: EventUser[];

  @OneToMany(() => EventItem, (eventItem) => eventItem.event, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  eventItems: EventItem[];
}
