import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'The page number to retrieve',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsPositive()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'The number of items per page',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsPositive()
  perPage: number = 100;
}
