import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventUser } from './EventUsers';

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

  @Column('date', { nullable: true })
  age: Date;

  @Column({ nullable: true, length: 255 })
  address: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EventUser, (eventUser) => eventUser.user)
  eventUsers: EventUser[];
}
