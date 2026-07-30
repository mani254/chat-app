import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNumberString, IsOptional } from 'class-validator';

export class GetMessagesQueryDto {
  @ApiPropertyOptional({
    description: 'Cursor: _id of oldest message from previous page',
    example: '60d5ecb8b392d511f8b1c411',
  })
  @IsOptional()
  @IsMongoId()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Max messages to return (max 100)', example: 50 })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
