import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { MessageEntity, UserEntity } from '@org/dal';
import { ChatRepository, MessageRepository, UserRepository } from '@org/dal';
import type {
  MessageListResponseDto,
  MessageResponseDto,
  SendMessageRequestDto,
  GetMessagesQueryDto,
} from './dto';
import { UserSummaryDto } from '../chat/dto/chat-response.dto';

// ─── Internal Mappers ─────────────────────────────────────────────────────────

function toUserSummary(user: UserEntity): UserSummaryDto {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? undefined,
    color: user.color ?? undefined,
    isOnline: user.isOnline ?? false,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Build a fully populated MessageResponseDto from a raw MessageEntity.
   */
  async buildMessageResponse(msg: MessageEntity): Promise<MessageResponseDto> {
    const [senderEntity, replyToEntity] = await Promise.all([
      this.userRepository.findById(msg._sender),
      msg._replyTo ? this.messageRepository.findById(msg._replyTo) : Promise.resolve(null),
    ]);

    if (!senderEntity) {
      throw new NotFoundException(`Sender ${msg._sender} not found`);
    }

    let replyTo: MessageResponseDto['replyTo'] | undefined;
    if (replyToEntity) {
      const replySender = await this.userRepository.findById(replyToEntity._sender);
      if (replySender) {
        replyTo = {
          _id: replyToEntity._id,
          content: replyToEntity.content,
          messageType: replyToEntity.messageType as 'text' | 'media' | 'note',
          sender: toUserSummary(replySender),
          createdAt: (replyToEntity.createdAt as Date).toISOString(),
        };
      }
    }

    return {
      _id: msg._id,
      chatId: msg._chat,
      sender: toUserSummary(senderEntity),
      content: msg.content,
      messageType: msg.messageType as 'text' | 'media' | 'note',
      mediaLinks: msg.mediaLinks ?? [],
      replyTo,
      readBy: msg._readBy,
      createdAt: (msg.createdAt as Date).toISOString(),
      updatedAt: (msg.updatedAt as Date).toISOString(),
    };
  }

  // ─── Get Messages (Cursor Paginated) ─────────────────────────────────────

  async getMessages(
    chatId: string,
    query: GetMessagesQueryDto,
    user: UserEntity,
  ): Promise<MessageListResponseDto> {
    // Verify user is a member
    const isMember = await this.chatRepository.isMember(chatId, user._id);
    if (!isMember) throw new ForbiddenException('You are not a member of this chat');

    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const { items, nextCursor, hasMore, total } =
      await this.messageRepository.findByChatIdWithCursor(chatId, {
        cursor: query.cursor,
        limit,
      });

    const messageResponses = await Promise.all(
      items.map((msg) => this.buildMessageResponse(msg)),
    );

    return { items: messageResponses, nextCursor, hasMore, total };
  }

  // ─── Send Message (REST) ──────────────────────────────────────────────────

  async sendMessage(
    dto: SendMessageRequestDto,
    user: UserEntity,
  ): Promise<MessageResponseDto> {
    const isMember = await this.chatRepository.isMember(dto.chatId, user._id);
    if (!isMember) throw new ForbiddenException('You are not a member of this chat');

    const msg = await this.messageRepository.create({
      chatId: dto.chatId,
      senderId: user._id,
      content: dto.content,
      messageType: dto.messageType ?? 'text',
      mediaLinks: dto.mediaLinks,
      replyToId: dto.replyToId,
    });

    // Update latestMessage pointer on the chat
    await this.chatRepository.updateLatestMessage(dto.chatId, msg._id);

    this.logger.log(`Message ${msg._id} sent to chat ${dto.chatId} by ${user.email}`);
    return this.buildMessageResponse(msg);
  }

  // ─── Mark All Read ─────────────────────────────────────────────────────────

  async markAllRead(chatId: string, user: UserEntity): Promise<void> {
    const isMember = await this.chatRepository.isMember(chatId, user._id);
    if (!isMember) throw new ForbiddenException('You are not a member of this chat');
    await this.messageRepository.markAllAsRead(chatId, user._id);
  }

  // ─── Delete Message ────────────────────────────────────────────────────────

  async deleteMessage(messageId: string, user: UserEntity): Promise<void> {
    const msg = await this.messageRepository.findById(messageId);
    if (!msg) throw new NotFoundException('Message not found');
    if (msg._sender !== user._id) {
      throw new ForbiddenException('You can only delete your own messages');
    }
    await this.messageRepository.deleteById(messageId);
  }
}
