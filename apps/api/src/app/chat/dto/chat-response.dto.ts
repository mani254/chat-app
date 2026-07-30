import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserSummaryDto {
  @ApiProperty({ example: '60d5ecb8b392d511f8b1c411' })
  _id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiPropertyOptional({ example: '#1f8a70' })
  color?: string;

  @ApiProperty({ example: true })
  isOnline!: boolean;
}

export class MessageSummaryDto {
  @ApiProperty({ example: '60d5ecb8b392d511f8b1c411' })
  _id!: string;

  @ApiProperty({ example: 'Hello there!' })
  content!: string;

  @ApiProperty({ enum: ['text', 'media', 'note'], example: 'text' })
  messageType!: 'text' | 'media' | 'note';

  @ApiProperty({ type: () => UserSummaryDto })
  sender!: UserSummaryDto;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z' })
  createdAt!: string;
}

export class ChatResponseDto {
  @ApiProperty({ example: '60d5ecb8b392d511f8b1c412' })
  _id!: string;

  @ApiPropertyOptional({ example: 'Team Alpha' })
  name?: string;

  @ApiPropertyOptional({ example: 'Our team group' })
  description?: string;

  @ApiProperty({ example: false })
  isGroupChat!: boolean;

  @ApiProperty({ type: [UserSummaryDto] })
  users!: UserSummaryDto[];

  @ApiPropertyOptional({ type: () => UserSummaryDto })
  groupAdmin?: UserSummaryDto;

  @ApiPropertyOptional({ type: () => MessageSummaryDto })
  latestMessage?: MessageSummaryDto;

  @ApiPropertyOptional({ example: 'https://example.com/group.jpg' })
  avatar?: string;

  @ApiProperty({ description: 'Unread message count for requesting user', example: 3 })
  unreadCount!: number;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z' })
  updatedAt!: string;
}

export class ChatListResponseDto {
  @ApiProperty({ type: [ChatResponseDto] })
  items!: ChatResponseDto[];

  @ApiPropertyOptional({
    description: 'Cursor for next page (updatedAt ISO string)',
    example: '2026-07-28T10:00:00.000Z',
  })
  nextCursor?: string;

  @ApiProperty({ example: true })
  hasMore!: boolean;
}
