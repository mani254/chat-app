import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { UserEntity } from '@org/dal';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import {
  AddMemberRequestDto,
  ChatListResponseDto,
  ChatResponseDto,
  CreateChatRequestDto,
  GetChatsQueryDto,
  UpdateGroupChatRequestDto,
} from './dto';

@ApiTags('Chats')
@ApiBearerAuth()
@Controller({ path: 'chats', version: '1' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ─── List Chats ────────────────────────────────────────────────────────────

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated chat list for current user',
    description:
      'Returns chats the authenticated user is a member of. Supports cursor-based pagination and filtering by type (all/group/direct).',
  })
  @ApiResponse({ status: 200, type: ChatListResponseDto })
  async getChats(
    @CurrentUser() user: UserEntity,
    @Query() query: GetChatsQueryDto,
  ): Promise<ChatListResponseDto> {
    return this.chatService.getChats(user, query);
  }

  // ─── Get Single Chat ───────────────────────────────────────────────────────

  @Get(':chatId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single chat by ID (with populated users & latest message)' })
  @ApiParam({ name: 'chatId', description: 'MongoDB ID of the chat', example: '60d5ecb8b392d511f8b1c412' })
  @ApiResponse({ status: 200, type: ChatResponseDto })
  @ApiResponse({ status: 403, description: 'Not a member of this chat' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async getChat(
    @Param('chatId') chatId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<ChatResponseDto> {
    return this.chatService.getChatById(chatId, user);
  }

  // ─── Create Chat ───────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new direct message or group chat',
    description:
      'For DM: set isGroupChat=false and provide recipientId. For group: set isGroupChat=true, provide name and userIds array.',
  })
  @ApiResponse({ status: 201, type: ChatResponseDto })
  async createChat(
    @Body() dto: CreateChatRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<ChatResponseDto> {
    return this.chatService.createChat(dto, user);
  }

  // ─── Update Group Chat ─────────────────────────────────────────────────────

  @Patch(':chatId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update group chat name/description/avatar (admin only)' })
  @ApiParam({ name: 'chatId', description: 'MongoDB ID of the group chat' })
  @ApiResponse({ status: 200, type: ChatResponseDto })
  @ApiResponse({ status: 403, description: 'Only the group admin can update this chat' })
  async updateChat(
    @Param('chatId') chatId: string,
    @Body() dto: UpdateGroupChatRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<ChatResponseDto> {
    return this.chatService.updateChat(chatId, dto, user);
  }

  // ─── Delete Chat ───────────────────────────────────────────────────────────

  @Delete(':chatId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a chat and all its messages (admin only for groups)' })
  @ApiParam({ name: 'chatId', description: 'MongoDB ID of the chat' })
  @ApiResponse({ status: 204, description: 'Chat deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async deleteChat(
    @Param('chatId') chatId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return this.chatService.deleteChat(chatId, user);
  }

  // ─── Group Member Management ───────────────────────────────────────────────

  @Post(':chatId/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a member to a group chat (admin only)' })
  @ApiParam({ name: 'chatId', description: 'MongoDB ID of the group chat' })
  @ApiResponse({ status: 200, type: ChatResponseDto })
  async addMember(
    @Param('chatId') chatId: string,
    @Body() dto: AddMemberRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<ChatResponseDto> {
    return this.chatService.addMember(chatId, dto.userId, user);
  }

  @Delete(':chatId/members/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a member from a group chat (admin, or self-leave)' })
  @ApiParam({ name: 'chatId', description: 'MongoDB ID of the group chat' })
  @ApiParam({ name: 'userId', description: 'MongoDB ID of the user to remove' })
  @ApiResponse({ status: 200, type: ChatResponseDto })
  async removeMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<ChatResponseDto> {
    return this.chatService.removeMember(chatId, userId, user);
  }
}
