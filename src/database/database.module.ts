import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User.entity';
import { Material } from 'src/typeorm/entities/Material.entity';
import { RentalMaterial } from 'src/typeorm/entities/RentalMaterial.entity';
import { Category } from 'src/typeorm/entities/Category.entity';
import { Event } from 'src/typeorm/entities/Event.entity';
import { Expense } from 'src/typeorm/entities/Expense.entity';
import { Return } from 'src/typeorm/entities/Return.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE_NAME || 'nita_impressions',
      entities: [
        User,
        Material,
        RentalMaterial,
        Category,
        Event,
        Expense,
        Return,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Material,
      RentalMaterial,
      Category,
      Event,
      Expense,
      Return,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
