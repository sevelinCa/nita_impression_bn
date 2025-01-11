import { Module } from '@nestjs/common';
import { RentalMaterialsService } from './rental-materials.service';
import { RentalMaterialsController } from './rental-materials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User.entity';
import { RentalMaterial } from '../typeorm/entities/RentalMaterial.entity';
import { Category } from 'src/typeorm/entities/Category.entity';
import { BaseService } from 'src/base.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, RentalMaterial, Category])],
  controllers: [RentalMaterialsController],
  providers: [RentalMaterialsService, BaseService, JwtService],
})
export class RentalMaterialsModule {}
