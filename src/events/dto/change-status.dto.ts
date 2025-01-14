import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({
    description: 'The status of the event',
    enum: ['ongoing', 'done', 'closed', 'cancelled'],
    example: 'ongoing',
  })
  @IsEnum(['ongoing', 'done', 'cancelled'], {
    message: 'Status must be one of: ongoing, done, cancelled',
  })
  status: 'ongoing' | 'done' | 'cancelled';
}
