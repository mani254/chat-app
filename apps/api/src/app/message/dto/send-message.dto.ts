import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SendMessageRequestDto {
  @ApiProperty({ example: '60d5ecb8b392d511f8b1c412' })
  @IsMongoId()
  chatId!: string;

  @ApiProperty({ example: 'Hello, how are you?' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({ enum: ['text', 'media', 'note'], example: 'text' })
  @IsOptional()
  @IsIn(['text', 'media', 'note'])
  messageType?: 'text' | 'media' | 'note';

  @ApiPropertyOptional({
    type: [String],
    description: 'Pre-uploaded file URLs from /messages/upload',
    example: ['https://example.com/file.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaLinks?: string[];

  @ApiPropertyOptional({
    description: 'ID of message being replied to',
    example: '60d5ecb8b392d511f8b1c411',
  })
  @IsOptional()
  @IsMongoId()
  replyToId?: string;
}
