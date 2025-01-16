import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, JwtService],
})
export class ReportsModule {}
