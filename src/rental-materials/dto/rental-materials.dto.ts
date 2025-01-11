import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDecimal,
  IsDate,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreateRentalMaterialDto {
  @ApiProperty({
    description: 'The name of the rental material',
    type: String,
    example: 'Excavator',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The quantity of the rental material available',
    type: Number,
    example: 10,
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    description: 'The renting cost per unit of the rental material',
    type: Number,
    example: 25000,
  })
  @IsNumber()
  rentingCost: number;

  @ApiProperty({
    description: 'The name of the vendor supplying the rental material',
    type: String,
    example: "John's Equipment",
  })
  @IsString()
  vendorName: string;

  @ApiProperty({
    description: 'The contact information of the vendor',
    type: String,
    example: '123-456-7890',
  })
  @IsString()
  vendorContact: string;

  @ApiProperty({
    description: 'The rental start date in `YYYY-MM-DD` format',
    type: String,
    format: 'date',
    example: '2025-01-01',
  })
  @IsDate()
  rentalDate: Date;

  @ApiProperty({
    description: 'The rental return date in `YYYY-MM-DD` format',
    type: String,
    format: 'date',
    example: '2025-02-01',
  })
  @IsDate()
  returnDate: Date;

  @ApiProperty({
    description: 'The categoryId of the rental material',
    type: String,
    required: false,
    example: 'f3295164-8921-4c04-b539-4d9c570e3ac7',
  })
  @IsUUID()
  categoryId: string;
}
