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

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    MaterialsModule,
    RentalMaterialsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
