import { Module } from '@nestjs/common';
import { ReturnService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Return } from 'src/typeorm/entities/Return.entity';
import { Event } from 'src/typeorm/entities/Event.entity';
import { User } from 'src/typeorm/entities/User.entity';
import { Material } from 'src/typeorm/entities/Material.entity';
import { RentalMaterial } from 'src/typeorm/entities/RentalMaterial.entity';
import { EventItem } from 'src/typeorm/entities/EventItem';
import { JwtService } from '@nestjs/jwt';
import { BaseService } from 'src/base.service';
import { MailService } from 'src/mail/mail.service';
import { ReportsService } from 'src/reports/reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Return,
      Event,
      User,
      Material,
      RentalMaterial,
      EventItem,
    ]),
  ],
  controllers: [ReturnsController],
  providers: [
    ReturnService,
    JwtService,
    BaseService,
    MailService,
    ReportsService,
  ],
})
export class ReturnsModule {}
