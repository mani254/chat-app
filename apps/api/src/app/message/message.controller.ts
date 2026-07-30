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
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { UserEntity } from '@org/dal';
import type { MultipartFile } from '@fastify/multipart';
import type { FastifyRequest } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  GetMessagesQueryDto,
  MessageListResponseDto,
  MessageResponseDto,
  SendMessageRequestDto,
  UploadResponseDto,
} from './dto';
import { MessageService } from './message.service';

const pipeline = promisify(stream.pipeline);

@ApiTags('Messages')
@ApiBearerAuth()
@Controller({ path: 'messages', version: '1' })
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // ─── Get Messages for a Chat ───────────────────────────────────────────────

  @Get(':chatId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated messages for a chat (cursor-based, newest first)',
    description:
      'Returns messages sorted newest-first. For next page: pass cursor = _id of oldest message from current page.',
  })
  @ApiParam({ name: 'chatId', description: 'MongoDB ID of the chat' })
  @ApiResponse({ status: 200, type: MessageListResponseDto })
  @ApiResponse({ status: 403, description: 'Not a member of this chat' })
  async getMessages(
    @Param('chatId') chatId: string,
    @Query() query: GetMessagesQueryDto,
    @CurrentUser() user: UserEntity,
  ): Promise<MessageListResponseDto> {
    return this.messageService.getMessages(chatId, query, user);
  }

  // ─── Send Message (REST) ───────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a message via REST API',
    description:
      'For media messages: first upload files via POST /messages/upload to get mediaLinks[], then pass them here. The message will also be broadcast over Socket.IO via the message:new event.',
  })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  async sendMessage(
    @Body() dto: SendMessageRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<MessageResponseDto> {
    return this.messageService.sendMessage(dto, user);
  }

  // ─── Upload Media File(s) via Fastify Multipart ───────────────────────────

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload media files (images, video, audio, documents — up to 10 files, 50MB each)',
    description:
      'Returns mediaLinks[] URLs. Pass these to POST /messages (content field) or the message:send socket event. Detected messageType: "note" for audio, "media" for all others.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: UploadResponseDto })
  async uploadFiles(
    @Req() req: FastifyRequest,
  ): Promise<UploadResponseDto> {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const mediaLinks: string[] = [];
    let allAudio = true;

    // Process multipart files using @fastify/multipart
    const parts = (req as any).files?.() as AsyncIterable<MultipartFile> | undefined;

    if (parts) {
      for await (const part of parts) {
        if (!part.mimetype.startsWith('audio/')) {
          allAudio = false;
        }
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(part.filename ?? 'file');
        const filename = `${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        await pipeline(part.file, fs.createWriteStream(filePath));

        const baseUrl = process.env['API_BASE_URL'] || 'http://localhost:8080';
        mediaLinks.push(`${baseUrl}/uploads/${filename}`);
      }
    }

    const messageType: 'media' | 'note' =
      mediaLinks.length > 0 && allAudio ? 'note' : 'media';

    return { mediaLinks, messageType };
  }

  // ─── Mark All Read ─────────────────────────────────────────────────────────

  @Patch(':chatId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all unread messages in a chat as read for the current user' })
  @ApiParam({ name: 'chatId', description: 'MongoDB ID of the chat' })
  @ApiResponse({ status: 204, description: 'Messages marked as read' })
  async markAllRead(
    @Param('chatId') chatId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return this.messageService.markAllRead(chatId, user);
  }

  // ─── Delete Message ────────────────────────────────────────────────────────

  @Delete(':messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message (sender only)' })
  @ApiParam({ name: 'messageId', description: 'MongoDB ID of the message' })
  @ApiResponse({ status: 204, description: 'Message deleted' })
  @ApiResponse({ status: 403, description: 'You can only delete your own messages' })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return this.messageService.deleteMessage(messageId, user);
  }
}
