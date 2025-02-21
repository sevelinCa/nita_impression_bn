import { DataSource } from 'typeorm';
import { User } from './src/typeorm/entities/User.entity';
import { Material } from './src/typeorm/entities/Material.entity';
import { RentalMaterial } from './src/typeorm/entities/RentalMaterial.entity';
import { Category } from './src/typeorm/entities/Category.entity';
import { Event } from './src/typeorm/entities/Event.entity';
import { EventItem } from './src/typeorm/entities/EventItem.entity';
import { Return } from './src/typeorm/entities/Return.entity';
import 'dotenv/config';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
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
  migrations: ['dist/src/migrations/*.js'],
  synchronize: process.env.DATABASE_SYNC === 'false',
});

export default dataSource;
//migrations: ['dist/src/migrations/*.js'],
