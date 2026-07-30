import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatRequestDto {
  @ApiPropertyOptional({
    description: 'For DM: the MongoDB ID of the recipient user',
    example: '60d5ecb8b392d511f8b1c411',
  })
  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  @ApiProperty({
    description: 'true = group chat, false = direct message',
    example: false,
  })
  @IsBoolean()
  isGroupChat!: boolean;

  @ApiPropertyOptional({
    description: 'Group chat name (required when isGroupChat = true)',
    example: 'Team Alpha',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Group chat description',
    example: 'Our team chat',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional({
    description: 'Array of participant user IDs for group chat',
    type: [String],
    example: ['60d5ecb8b392d511f8b1c411'],
  })
  @IsOptional()
  @IsMongoId({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Avatar URL for group chat',
    example: 'https://example.com/group.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
