import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'The full name of the admin',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'The email address of the admin',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'The password of the admin',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;

  @ApiPropertyOptional({
    description: 'The phone number of the admin',
    example: '07863823932',
    required: false,
  })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'DOB',
    type: String,
    format: 'date-time',
    example: '2025-01-01T10:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  age: Date;

  @ApiPropertyOptional({
    description: 'The address of the admin',
    example: 'kigali, rwanda',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
