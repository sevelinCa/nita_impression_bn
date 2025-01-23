import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from './Event.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  fullName: string;

  @Column({ unique: true, length: 255, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: 'worker', length: 50 })
  role: string;

  @Column({ nullable: true, length: 15 })
  phoneNumber: string;

  @Column({ nullable: true })
  profile: string;

  @Column('int', { nullable: true })
  age: number;

  @Column({ nullable: true, length: 255 })
  address: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Event, (event) => event.users)
  @JoinTable({
    name: 'events_users',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'eventId', referencedColumnName: 'id' },
  })
  events: Event[];
}
