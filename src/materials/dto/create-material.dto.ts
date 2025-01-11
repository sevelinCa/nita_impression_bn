import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'The name of the material',
    example: 'Projector',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The category ID the material belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'The quantity of the material',
    example: 100,
  })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'The price of the material (optional)',
    example: 35000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  price?: number;

  @ApiProperty({
    description: 'The rental price of the material (optional)',
    example: 1500,
    required: false,
  })
  @IsOptional()
  @IsInt()
  rentalPrice?: number;
}
