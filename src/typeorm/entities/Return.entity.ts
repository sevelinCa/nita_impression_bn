import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Event } from './Event.entity';
import { User } from './User.entity';
import { Material } from './Material.entity';
import { RentalMaterial } from './RentalMaterial.entity';

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.id)
  event: Event;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Material, (material) => material.id, { nullable: true })
  material?: Material;

  @ManyToOne(() => RentalMaterial, (rentalMaterial) => rentalMaterial.id, {
    nullable: true,
  })
  rentalMaterial?: RentalMaterial;

  @Column('int')
  quantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
