import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { ChatEntity, UserEntity } from '@org/dal';
import { ChatRepository, MessageRepository, UserRepository } from '@org/dal';
import type { MessageSummary, UserSummary } from '@org/shared';
import type {
  ChatListResponseDto,
  ChatResponseDto,
  CreateChatRequestDto,
  GetChatsQueryDto,
  UpdateGroupChatRequestDto,
} from './dto';

// ─── Internal Mappers ─────────────────────────────────────────────────────────

function toUserSummary(user: UserEntity): UserSummary {
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
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Build a fully populated ChatResponseDto from a raw ChatEntity.
   * Resolves users, groupAdmin, latestMessage, and unreadCount.
   */
  async buildChatResponse(
    chat: ChatEntity,
    requestingUserId: string,
  ): Promise<ChatResponseDto> {
    // Resolve all participant users in parallel
    const [usersArr, latestMsg, unreadCount] = await Promise.all([
      Promise.all(
        chat._users.map((uid) => this.userRepository.findById(uid)),
      ),
      chat._latestMessage
        ? this.messageRepository.findById(chat._latestMessage)
        : Promise.resolve(null),
      this.messageRepository.countUnread(chat._id, requestingUserId),
    ]);

    const users: UserSummary[] = usersArr
      .filter((u): u is UserEntity => u !== null)
      .map(toUserSummary);

    let groupAdmin: UserSummary | undefined;
    if (chat._groupAdmin) {
      const adminEntity = await this.userRepository.findById(chat._groupAdmin);
      if (adminEntity) groupAdmin = toUserSummary(adminEntity);
    }

    let latestMessage: MessageSummary | undefined;
    if (latestMsg) {
      const senderEntity = await this.userRepository.findById(latestMsg._sender);
      if (senderEntity) {
        latestMessage = {
          _id: latestMsg._id,
          content: latestMsg.content,
          messageType: latestMsg.messageType as 'text' | 'media' | 'note',
          sender: toUserSummary(senderEntity),
          createdAt: (latestMsg.createdAt as Date).toISOString(),
        };
      }
    }

    return {
      _id: chat._id,
      name: chat.name ?? undefined,
      description: chat.description ?? undefined,
      isGroupChat: chat.isGroupChat ?? false,
      users,
      groupAdmin,
      latestMessage,
      avatar: chat.avatar ?? undefined,
      unreadCount,
      createdAt: (chat.createdAt as Date).toISOString(),
      updatedAt: (chat.updatedAt as Date).toISOString(),
    };
  }

  // ─── Get All Chats (Cursor Paginated) ─────────────────────────────────────

  async getChats(
    user: UserEntity,
    query: GetChatsQueryDto,
  ): Promise<ChatListResponseDto> {
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const { items, nextCursor, hasMore } =
      await this.chatRepository.findByUserIdWithCursor(user._id, {
        cursor: query.cursor,
        limit,
        type: query.type,
        search: query.search,
      });

    const chatResponses = await Promise.all(
      items.map((chat) => this.buildChatResponse(chat, user._id)),
    );

    return { items: chatResponses, nextCursor, hasMore };
  }

  // ─── Get Single Chat ───────────────────────────────────────────────────────

  async getChatById(chatId: string, user: UserEntity): Promise<ChatResponseDto> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');

    const isMember = chat._users.includes(user._id);
    if (!isMember) throw new ForbiddenException('You are not a member of this chat');

    return this.buildChatResponse(chat, user._id);
  }

  /**
   * Fast participant user ID lookup for socket broadcasting.
   */
  async getChatParticipantIds(chatId: string): Promise<string[]> {
    const chat = await this.chatRepository.findById(chatId);
    return chat ? chat._users : [];
  }

  // ─── Create Chat ───────────────────────────────────────────────────────────

  async createChat(
    dto: CreateChatRequestDto,
    user: UserEntity,
  ): Promise<ChatResponseDto> {
    if (!dto.isGroupChat) {
      // ─── Direct Message ────────────────────────────────────────────
      if (!dto.recipientId) {
        throw new BadRequestException('recipientId is required for DM chats');
      }
      if (dto.recipientId === user._id) {
        throw new BadRequestException('You cannot create a chat with yourself');
      }

      const recipient = await this.userRepository.findById(dto.recipientId);
      if (!recipient) throw new NotFoundException('Recipient user not found');

      // Return existing DM if it already exists
      const existing = await this.chatRepository.findDirectChat(
        user._id,
        dto.recipientId,
      );
      if (existing) {
        this.logger.log(`Returning existing DM chat ${existing._id}`);
        return this.buildChatResponse(existing, user._id);
      }

      const chat = await this.chatRepository.create({
        isGroupChat: false,
        userIds: [user._id, dto.recipientId],
      });
      return this.buildChatResponse(chat, user._id);
    } else {
      // ─── Group Chat ────────────────────────────────────────────────
      if (!dto.name) throw new BadRequestException('name is required for group chats');

      const userIds: string[] = [user._id, ...(dto.userIds ?? [])];
      // Deduplicate
      const uniqueUserIds = [...new Set(userIds)];

      if (uniqueUserIds.length < 2) {
        throw new BadRequestException('Group chats require at least 2 members');
      }

      const chat = await this.chatRepository.create({
        name: dto.name,
        description: dto.description,
        isGroupChat: true,
        userIds: uniqueUserIds,
        groupAdminId: user._id,
        avatar: dto.avatar,
      });
      return this.buildChatResponse(chat, user._id);
    }
  }

  // ─── Update Group Chat ─────────────────────────────────────────────────────

  async updateChat(
    chatId: string,
    dto: UpdateGroupChatRequestDto,
    user: UserEntity,
  ): Promise<ChatResponseDto> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (!chat.isGroupChat) throw new BadRequestException('Cannot update a DM chat');
    if (chat._groupAdmin !== user._id) {
      throw new ForbiddenException('Only the group admin can update this chat');
    }

    const updated = await this.chatRepository.updateById(chatId, {
      name: dto.name,
      description: dto.description,
      avatar: dto.avatar,
    });
    if (!updated) throw new NotFoundException('Chat not found after update');

    return this.buildChatResponse(updated, user._id);
  }

  // ─── Delete Chat ───────────────────────────────────────────────────────────

  async deleteChat(chatId: string, user: UserEntity): Promise<void> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');

    const isAdmin = chat.isGroupChat
      ? chat._groupAdmin === user._id
      : chat._users.includes(user._id);

    if (!isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this chat');
    }

    await Promise.all([
      this.chatRepository.deleteById(chatId),
      this.messageRepository.deleteByChatId(chatId),
    ]);
  }

  // ─── Group Member Management ───────────────────────────────────────────────

  async addMember(
    chatId: string,
    memberId: string,
    user: UserEntity,
  ): Promise<ChatResponseDto> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (!chat.isGroupChat) throw new BadRequestException('Cannot add members to a DM chat');
    if (chat._groupAdmin !== user._id) {
      throw new ForbiddenException('Only the group admin can add members');
    }

    const memberUser = await this.userRepository.findById(memberId);
    if (!memberUser) throw new NotFoundException('User to add not found');

    if (chat._users.includes(memberId)) {
      throw new BadRequestException('User is already a member of this chat');
    }

    const updated = await this.chatRepository.addUser(chatId, memberId);
    if (!updated) throw new NotFoundException('Chat not found after update');
    return this.buildChatResponse(updated, user._id);
  }

  async removeMember(
    chatId: string,
    memberId: string,
    user: UserEntity,
  ): Promise<ChatResponseDto> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (!chat.isGroupChat) throw new BadRequestException('Cannot remove members from a DM chat');
    if (chat._groupAdmin !== user._id && memberId !== user._id) {
      throw new ForbiddenException('Only the admin can remove other members');
    }
    if (chat._groupAdmin === memberId) {
      throw new BadRequestException('Cannot remove the group admin');
    }

    const updated = await this.chatRepository.removeUser(chatId, memberId);
    if (!updated) throw new NotFoundException('Chat not found after update');
    return this.buildChatResponse(updated, user._id);
  }
}
