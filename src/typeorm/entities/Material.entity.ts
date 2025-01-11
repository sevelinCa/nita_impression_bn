import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from './Category.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Category, (category) => category.materials)
  category: Category;

  @Column('int')
  quantity: number;

  @Column('decimal', { nullable: true })
  price?: number;

  @Column('decimal', { nullable: true })
  rentalPrice?: number;
}
