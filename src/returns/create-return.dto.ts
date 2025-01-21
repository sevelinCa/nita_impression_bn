import {
  IsArray,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ReturnItemDto {
  @ApiProperty({
    description: 'Unique identifier of the event item',
    example: 'e1c9023f-9a0b-4bdc-8ea8-b5f7d80d6c35',
  })
  @IsUUID()
  @IsNotEmpty()
  eventItemId: string;

  @ApiProperty({
    description: 'Quantity of items being returned',
    example: 5,
    minimum: 1,
  })
  @Min(1, { message: 'Returned quantity must be at least 1.' })
  returnedQuantity: number;

  @ApiProperty({
    description: 'Optional existing return ID for subsequent returns',
    example: 'e1c9023f-9a0b-4bdc-8ea8-b5f7d80d6c35',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  returnId?: string;
}

export class CreateReturnDto {
  @ApiProperty({
    description: 'Unique identifier of the event',
    example: 'a7d2346e-f9bd-4d9b-ae87-78c9a5f3bdda',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description:
      'List of items being returned with their respective quantities',
    type: [ReturnItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];
}
