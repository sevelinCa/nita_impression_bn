import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Material } from './Material.entity';
import { RentalMaterial } from './RentalMaterial.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Material, (material) => material.category)
  materials: Material[];

  @OneToMany(() => RentalMaterial, (rentalMaterial) => rentalMaterial.category)
  rentalMaterials: RentalMaterial[];
}
