import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './Event.entity';
import { User } from './User.entity';
import { Material } from './Material.entity';
import { RentalMaterial } from './RentalMaterial.entity';
import { EventItem } from './EventItem';

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.id)
  event: Event;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => EventItem, (eventItem) => eventItem.id)
  @JoinColumn({ name: 'eventItemId' })
  eventItem: EventItem;

  @ManyToOne(() => Material, (material) => material.id, { nullable: true })
  material?: Material;

  @ManyToOne(() => RentalMaterial, (rentalMaterial) => rentalMaterial.id, {
    nullable: true,
  })
  rentalMaterial?: RentalMaterial;

  @Column('int')
  returnedQuantity: number;

  @Column('int')
  remainingQuantity: number;

  @Column({
    type: 'enum',
    enum: ['complete', 'incomplete'],
  })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
