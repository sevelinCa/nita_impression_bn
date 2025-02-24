import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User.entity';
import { EventItem } from 'src/typeorm/entities/EventItem.entity';
import { Material } from 'src/typeorm/entities/Material.entity';
import { RentalMaterial } from 'src/typeorm/entities/RentalMaterial.entity';
import { JwtService } from '@nestjs/jwt';
import { BaseService } from 'src/base.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Event,
      EventItem,
      Material,
      RentalMaterial,
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService, JwtService, BaseService],
})
export class EventsModule {}
