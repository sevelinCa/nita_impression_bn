import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The new password for the user',
    example: 'newpassword123',
    minLength: 5,
  })
  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Confirmation of the new password, must match the password',
    example: 'newpassword123',
    minLength: 5,
  })
  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
