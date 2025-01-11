import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The current password of the user',
    example: 'oldPassword123',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: 'The new password for the user account',
    example: 'newPassword123',
  })
  @IsString()
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation of the new password',
    example: 'newPassword123',
  })
  @IsString()
  confirmPassword: string;
}
