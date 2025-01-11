import { PartialType } from '@nestjs/swagger';
import { CreateRentalMaterialDto } from './rental-materials.dto';

export class UpdateRentalMaterialDto extends PartialType(
  CreateRentalMaterialDto,
) {}
