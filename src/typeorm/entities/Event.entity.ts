import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EventItem } from './EventItem.entity';
import { EventUser } from './EventUsers';
import { User } from './User.entity';

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

  @Column()
  employeeFee: number;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

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
