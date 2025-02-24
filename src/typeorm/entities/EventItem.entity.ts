import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Event } from './Event.entity';
import { Material } from './Material.entity';
import { RentalMaterial } from './RentalMaterial.entity';

@Entity('eventItems')
export class EventItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.id)
  event: Event;

  @ManyToOne(() => Material, (material) => material.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  material?: Material;

  @ManyToOne(() => RentalMaterial, (rentalMaterial) => rentalMaterial.id, {
    nullable: true,
  })
  rentalMaterial?: RentalMaterial;

  @Column('int')
  quantity: number;

  @Column({ nullable: true })
  names?: string;

  @Column('decimal', { nullable: true })
  price?: number;

  @Column({
    type: 'enum',
    enum: ['returnable', 'non-returnable'],
    nullable: true,
  })
  type: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
