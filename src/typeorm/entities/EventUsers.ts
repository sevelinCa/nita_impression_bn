import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './Event.entity';
import { User } from './User.entity';

@Entity('event_users')
export class EventUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.eventUsers)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User, (user) => user.eventUsers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fee: number;
}
