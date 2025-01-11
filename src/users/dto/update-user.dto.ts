import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL of the user',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profile?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+250788123456',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Physical address of the user',
    example: '123 Main St, Kigali, Rwanda',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Age of the user',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  age?: number;
}
