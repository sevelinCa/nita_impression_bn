import {
  IsArray,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class UpdateReturnItemDto {
  @ApiProperty({
    description: 'Unique identifier of the existing return',
    example: 'e1c9023f-9a0b-4bdc-8ea8-b5f7d80d6c35',
  })
  @IsUUID()
  @IsNotEmpty()
  returnId: string;

  @ApiProperty({
    description: 'Quantity of items being returned',
    example: 5,
    minimum: 0,
  })
  @Min(0, { message: 'Returned quantity must be at least 0.' })
  returnedQuantity: number;
}

export class UpdateReturnDto {
  @ApiProperty({
    description: 'Unique identifier of the event',
    example: 'a7d2346e-f9bd-4d9b-ae87-78c9a5f3bdda',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'List of returns to update with their respective quantities',
    type: [UpdateReturnItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateReturnItemDto)
  items: UpdateReturnItemDto[];
}
