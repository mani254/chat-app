import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetChatsQueryDto {
  @ApiPropertyOptional({
    description: 'Cursor for pagination (updatedAt ISO string of last item)',
    example: '2026-07-28T12:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of chats to return', example: 20 })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Filter chats by type',
    enum: ['all', 'group', 'direct'],
    example: 'all',
  })
  @IsOptional()
  @IsIn(['all', 'group', 'direct'])
  type?: 'all' | 'group' | 'direct';
}
