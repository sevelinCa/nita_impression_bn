import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Event } from './Event.entity';

@Entity('event_modifications')
export class EventModification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  adminId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @Column({
    type: 'enum',
    enum: ['create', 'update', 'status_change', 'add_item', 'add_employee'],
  })
  actionType: string;

  @Column({ type: 'json', nullable: true })
  modificationDetails: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
