import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'The password of the user',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'The phone number of the user',
    example: '07863823932',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'The age of the user',
    type: String,
    format: 'date-time',
    example: '2025-01-01T10:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  age?: Date;

  @ApiPropertyOptional({
    description: 'The address of the user',
    example: '1kigali, rwanda',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
  @ApiPropertyOptional({
    description: 'Employee price',
    example: 200.3,
  })
  @IsNumber()
  @IsOptional()
  price: number;
}
