import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from './Category.entity';

@Entity('rental_materials')
export class RentalMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('int')
  quantity: number;

  @Column('decimal')
  rentingCost: number;

  @Column()
  vendorName: string;

  @Column()
  vendorContact: string;

  @Column('date')
  rentalDate: Date;

  @Column('date')
  returnDate: Date;

  @ManyToOne(() => Category, (category) => category.rentalMaterials)
  category: Category;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;
}
