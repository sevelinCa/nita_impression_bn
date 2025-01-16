import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { MaterialsModule } from './materials/materials.module';
import { RentalMaterialsModule } from './rental-materials/rental-materials.module';
import { EventsModule } from './events/events.module';
import { ReturnsModule } from './returns/returns.module';
import { MailService } from './mail/mail.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './reports/reports.module';
import { ReportsService } from './reports/reports.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    MaterialsModule,
    RentalMaterialsModule,
    EventsModule,
    ReturnsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService, ReportsService],
})
export class AppModule {}
