import {
  IsString,
  IsDate,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class EventItemDto {
  @ApiPropertyOptional({
    description: 'ID of the material',
    type: String,
    example: 'mat-12345',
  })
  @IsString()
  @IsOptional()
  @IsUUID()
  materialId?: string;

  @ApiPropertyOptional({
    description: 'ID of the rental material',
    type: String,
    example: 'rent-54321',
  })
  @IsString()
  @IsOptional()
  @IsUUID()
  rentalMaterialId?: string;

  @ApiProperty({
    description: 'Quantity of the item',
    type: Number,
    example: 5,
  })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Names or description of the item',
    type: String,
    example: 'Chair, Table',
  })
  @IsString()
  @IsOptional()
  names?: string;

  @ApiPropertyOptional({
    description: 'Price of the item',
    type: Number,
    example: 100.5,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Type of the item',
    enum: ['returnable', 'non-returnable'],
    example: 'returnable',
  })
  @IsString()
  @IsOptional()
  type?: 'returnable' | 'non-returnable';
}

export class CreateEventDto {
  @ApiProperty({
    description: 'Name of the event',
    type: String,
    example: 'Wedding Party',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Date of the event',
    type: String,
    format: 'date-time',
    example: '2025-01-01T10:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'Address of the event',
    type: String,
    example: '123 Main Street, Kigali',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Total cost of the event',
    type: Number,
    example: 5000.75,
  })
  @IsNumber()
  cost: number;

  @ApiProperty({
    description: 'ID of an employee',
    type: Number,
    example: '044233db-cce3-404b-a12f-6732b7b596f5',
  })
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    description: 'Fee for employees working at the event',
    type: Number,
    example: 200.5,
  })
  @IsNumber()
  employeeFee: number;

  @ApiProperty({
    description: 'List of items associated with the event',
    type: [EventItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventItemDto)
  items: EventItemDto[];
}
