import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from 'src/typeorm/entities/Material.entity';
import { User } from 'src/typeorm/entities/User.entity';
import { Category } from 'src/typeorm/entities/Category.entity';
import { BaseService } from 'src/base.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Material, User, Category])],
  controllers: [MaterialsController],
  providers: [MaterialsService, BaseService, JwtService],
})
export class MaterialsModule {}
