import { DataSource } from 'typeorm';
import { User } from './typeorm/entities/User.entity';
import { Material } from './typeorm/entities/Material.entity';
import { RentalMaterial } from './typeorm/entities/RentalMaterial.entity';
import { Category } from './typeorm/entities/Category.entity';
import { Event } from './typeorm/entities/Event.entity';
import { EventItem } from './typeorm/entities/EventItem';
import { Return } from './typeorm/entities/Return.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    Material,
    RentalMaterial,
    Category,
    Event,
    EventItem,
    Return,
  ],
  migrations: ['src/migrations/*.ts'],
});
