import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddEventItemDto {
  @ApiPropertyOptional({
    description: 'ID of the material to add',
    type: String,
    example: 'mat-12345',
  })
  @IsString()
  @IsOptional()
  @IsUUID()
  materialId?: string;

  @ApiPropertyOptional({
    description: 'ID of the rental material to add',
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

export class AddEmployeeDto {
  @ApiPropertyOptional({
    description: 'ID of the employee to add',
    type: String,
    example: '044233db-cce3-404b-a12f-6732b7b596f5',
  })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Full name of the new employee (if not registered)',
    type: String,
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  employeeFullNames?: string;
}

export class UpdateEventDto {
  @ApiPropertyOptional({
    description: 'Employee fee for the event',
    type: Number,
    example: 200,
  })
  @IsNumber()
  @IsOptional()
  employeeFee?: number;

  @ApiPropertyOptional({
    description: 'New employees to add to the event',
    type: [AddEmployeeDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddEmployeeDto)
  @IsOptional()
  addEmployees?: AddEmployeeDto[];

  @ApiPropertyOptional({
    description: 'New items to add to the event',
    type: [AddEventItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddEventItemDto)
  @IsOptional()
  addItems?: AddEventItemDto[];
}
