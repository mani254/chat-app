import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserSummaryDto } from '../../chat/dto/chat-response.dto';

export class MessageReplyDto {
  @ApiProperty({ example: '60d5ecb8b392d511f8b1c411' })
  _id!: string;

  @ApiProperty({ example: 'Hey what is up?' })
  content!: string;

  @ApiProperty({ enum: ['text', 'media', 'note'], example: 'text' })
  messageType!: 'text' | 'media' | 'note';

  @ApiProperty({ type: () => UserSummaryDto })
  sender!: UserSummaryDto;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z' })
  createdAt!: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: '60d5ecb8b392d511f8b1c411' })
  _id!: string;

  @ApiProperty({ example: '60d5ecb8b392d511f8b1c412' })
  chatId!: string;

  @ApiProperty({ type: () => UserSummaryDto })
  sender!: UserSummaryDto;

  @ApiProperty({ example: 'Hello, how are you?' })
  content!: string;

  @ApiProperty({ enum: ['text', 'media', 'note'], example: 'text' })
  messageType!: 'text' | 'media' | 'note';

  @ApiProperty({ type: [String], example: [] })
  mediaLinks!: string[];

  @ApiPropertyOptional({ type: () => MessageReplyDto })
  replyTo?: MessageReplyDto;

  @ApiProperty({
    type: [String],
    description: 'User IDs who have read this message',
    example: ['60d5ecb8b392d511f8b1c411'],
  })
  readBy!: string[];

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z' })
  updatedAt!: string;
}

export class MessageListResponseDto {
  @ApiProperty({ type: [MessageResponseDto] })
  items!: MessageResponseDto[];

  @ApiPropertyOptional({
    description: 'Cursor for next page (_id of oldest message)',
    example: '60d5ecb8b392d511f8b1c411',
  })
  nextCursor?: string;

  @ApiProperty({ example: true })
  hasMore!: boolean;

  @ApiProperty({ example: 142 })
  total!: number;
}

export class UploadResponseDto {
  @ApiProperty({ type: [String], description: 'Uploaded file URLs' })
  mediaLinks!: string[];

  @ApiProperty({ enum: ['media', 'note'], example: 'media' })
  messageType!: 'media' | 'note';
}
