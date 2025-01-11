import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMaterialDto {
  @ApiProperty({
    description: 'The name of the material (optional)',
    example: 'Projector',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The quantity of the material (optional)',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  quantity?: number;

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
