import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class DateRangeDto {
  @ApiProperty({
    example: '2025-01-01',
    description: 'Start date for the report range',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2025-12-31',
    description: 'End date for the report range',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
