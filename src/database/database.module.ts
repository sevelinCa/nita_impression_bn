import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User.entity';
import { Material } from 'src/typeorm/entities/Material.entity';
import { RentalMaterial } from 'src/typeorm/entities/RentalMaterial.entity';
import { Category } from 'src/typeorm/entities/Category.entity';
import { Event } from 'src/typeorm/entities/Event.entity';
import { EventItem } from 'src/typeorm/entities/EventItem.entity';
import { Return } from 'src/typeorm/entities/Return.entity';
import { ConfigModule } from '@nestjs/config';
import { EventUser } from 'src/typeorm/entities/EventUsers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
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
        EventUser,
      ],
      synchronize: process.env.DATABASE_SYNC === 'true',
      migrations: ['dist/src/migrations/*.js'],
    }),
    TypeOrmModule.forFeature([
      User,
      Material,
      RentalMaterial,
      Category,
      Event,
      EventItem,
      Return,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
