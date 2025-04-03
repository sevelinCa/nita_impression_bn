import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class AuthPayloadDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: process.env.ADMIN_MAIL,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: process.env.ADMIN_PASS,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
