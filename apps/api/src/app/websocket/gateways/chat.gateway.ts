import { Logger, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { UserEntity } from '@org/dal';
import { WS_EVENTS } from '@org/shared';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../../chat/chat.service';
import { MessageService } from '../../message/message.service';
import { MessageResponseDto } from '../../message/dto';
import { RedisPresenceService } from '../../redis/redis-presence.service';
import { WsAuthGuard } from '../guards/ws-auth.guard';
import { ChatEventsService } from '../chat-events.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly redisPresenceService: RedisPresenceService,
    private readonly wsAuthGuard: WsAuthGuard,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly chatEventsService: ChatEventsService,
  ) { }

  onModuleInit(): void {
    this.chatEventsService.onMessageCreated((msg) => {
      this.broadcastNewMessage(msg).catch((err: unknown) => {
        this.logger.warn(`Failed to broadcast new message: ${err}`);
      });
    });
  }

  // ─── Lifecycle: Connection ─────────────────────────────────────────────────

  /**
   * NestJS automatically calls this when a WebSocket client connects.
   * Validates auth token, registers presence in Redis, and broadcasts user:online.
   */
  async handleConnection(client: Socket): Promise<void> {
    const isAuthenticated = await this.wsAuthGuard.validateSocket(client);

    if (!isAuthenticated) {
      this.logger.warn(`Disconnecting unauthenticated socket ${client.id}`);
      client.emit(WS_EVENTS.WS_ERROR, { message: 'Authentication required' });
      client.disconnect(true);
      return;
    }

    const user: UserEntity = client.data.user;
    this.logger.log(`⚡ Connected: ${client.id} (User: ${user.email} [${user._id}])`);

    // Track socket in Redis + sync MongoDB isOnline=true
    await this.redisPresenceService.setUserOnline(user._id, client.id);

    // Join personal room for DM delivery
    await client.join(`user:${user._id}`);

    // Broadcast to all clients
    this.server.emit(WS_EVENTS.USER_ONLINE, {
      userId: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      color: user.color,
      timestamp: new Date().toISOString(),
    });
  }

  // ─── Lifecycle: Disconnection ──────────────────────────────────────────────

  /**
   * NestJS automatically calls this when a WebSocket client disconnects.
   * Decrements socket count in Redis. If last socket: marks user offline and broadcasts.
   */
  async handleDisconnect(client: Socket): Promise<void> {
    const user: UserEntity | undefined = client.data.user;
    if (!user) return;

    this.logger.log(`🔌 Disconnected: ${client.id} (User: ${user.email})`);

    await this.redisPresenceService.setUserOffline(user._id, client.id);

    const isStillOnline = await this.redisPresenceService.isUserOnline(user._id);
    if (!isStillOnline) {
      this.server.emit(WS_EVENTS.USER_OFFLINE, {
        userId: user._id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ─── Presence ──────────────────────────────────────────────────────────────

  /**
   * Heartbeat ping — refreshes 60s TTL in Redis.
   * Client should send this every ~30 seconds.
   */
  @SubscribeMessage(WS_EVENTS.PRESENCE_PING)
  async handleHeartbeat(@ConnectedSocket() client: Socket): Promise<void> {
    const user: UserEntity = client.data.user;
    if (user) {
      await this.redisPresenceService.heartbeat(user._id);
      client.emit(WS_EVENTS.PRESENCE_PONG, { timestamp: new Date().toISOString() });
    }
  }

  /**
   * Returns the set of all currently online user IDs from Redis.
   */
  @SubscribeMessage(WS_EVENTS.PRESENCE_GET_ONLINE)
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket): Promise<void> {
    const onlineUserIds = await this.redisPresenceService.getOnlineUserIds();
    client.emit(WS_EVENTS.PRESENCE_ONLINE_LIST, { onlineUserIds });
  }

  // ─── Chat Room ─────────────────────────────────────────────────────────────

  /**
   * Join a chat room. Room ID = chatId (same for DM and group chats).
   * Validates that the user is a member of the chat before joining.
   */
  @SubscribeMessage(WS_EVENTS.CHAT_JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): Promise<void> {
    const user: UserEntity = client.data.user;
    if (!data?.chatId || !user) return;

    // Validate membership before allowing room join
    try {
      await this.chatService.getChatById(data.chatId, user);
    } catch {
      client.emit(WS_EVENTS.WS_ERROR, {
        message: 'You are not a member of this chat or chat does not exist',
      });
      return;
    }

    await client.join(`room:${data.chatId}`);
    this.logger.debug(`Socket ${client.id} joined room:${data.chatId}`);
    client.emit(WS_EVENTS.CHAT_JOINED_ROOM, { chatId: data.chatId });
  }

  /**
   * Leave a chat room.
   */
  @SubscribeMessage(WS_EVENTS.CHAT_LEAVE_ROOM)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): Promise<void> {
    if (data?.chatId) {
      await client.leave(`room:${data.chatId}`);
      this.logger.debug(`Socket ${client.id} left room:${data.chatId}`);
      client.emit(WS_EVENTS.CHAT_LEFT_ROOM, { chatId: data.chatId });
    }
  }

  // ─── Real-Time Messaging ──────────────────────────────────────────────────

  /**
   * Send a chat message in real-time.
   * - Persists message to MongoDB via MessageService
   * - Updates chat's latestMessage pointer
   * - Broadcasts populated MessageResponse to the chat room
   * - ACKs to the sender with the persisted message
   *
   * Supports: text, media (pre-uploaded URLs), voice notes, replies.
   */
  @SubscribeMessage(WS_EVENTS.MESSAGE_SEND)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      chatId: string;
      content: string;
      messageType?: 'text' | 'media' | 'note';
      mediaLinks?: string[];
      replyToId?: string;
    },
  ): Promise<void> {
    const user: UserEntity = client.data.user;
    if (!user || !data?.chatId || !data?.content?.trim()) return;

    try {
      // Persist message to DB + update latestMessage on chat
      const messageResponse = await this.messageService.sendMessage(
        {
          chatId: data.chatId,
          content: data.content.trim(),
          messageType: data.messageType ?? 'text',
          mediaLinks: data.mediaLinks,
          replyToId: data.replyToId,
        },
        user,
      );

      // Collect target rooms: active conversation room + all participant user rooms
      const roomTargets: string[] = [`room:${data.chatId}`];
      try {
        const participantIds = await this.chatService.getChatParticipantIds(data.chatId);
        for (const participantId of participantIds) {
          roomTargets.push(`user:${participantId}`);
        }
      } catch (e) {
        this.logger.warn(`Failed to resolve participant rooms for chat ${data.chatId}: ${e}`);
      }

      // Socket.IO automatically deduplicates sockets present in multiple target rooms,
      // ensuring each connected client receives EXACTLY ONE message packet!
      this.server.to(roomTargets).emit(WS_EVENTS.MESSAGE_NEW, messageResponse);

      // ACK to sender in case they are not in the room yet
      const roomSockets = await this.server
        .in(`room:${data.chatId}`)
        .fetchSockets();
      const senderInRoom = roomSockets.some((s) => s.id === client.id);
      if (!senderInRoom) {
        client.emit(WS_EVENTS.MESSAGE_SENT, messageResponse);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      this.logger.error(`[message:send] Error: ${message}`);
      client.emit(WS_EVENTS.WS_ERROR, { message });
    }
  }

  /**
   * Broadcast a newly created message to all connected clients in the chat room
   * AND to individual user rooms for every chat participant.
   */
  async broadcastNewMessage(messageResponse: MessageResponseDto): Promise<void> {
    if (!this.server) {
      this.logger.warn('WebSocket server is not initialized yet');
      return;
    }

    const roomTargets: string[] = [`room:${messageResponse.chatId}`];
    try {
      const participantIds = await this.chatService.getChatParticipantIds(messageResponse.chatId);
      for (const participantId of participantIds) {
        roomTargets.push(`user:${participantId}`);
      }
    } catch (e) {
      this.logger.warn(`Failed to resolve participant rooms for chat ${messageResponse.chatId}: ${e}`);
    }

    this.logger.log(`📢 Broadcasting WS_EVENTS.MESSAGE_NEW to rooms: ${roomTargets.join(', ')}`);
    this.server.to(roomTargets).emit(WS_EVENTS.MESSAGE_NEW, messageResponse);
  }

  // ─── Read Receipts ─────────────────────────────────────────────────────────

  /**
   * Mark all messages in a chat as read.
   * Broadcasts read receipt to all other room members.
   */
  @SubscribeMessage(WS_EVENTS.MESSAGE_READ)
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): Promise<void> {
    const user: UserEntity = client.data.user;
    if (!user || !data?.chatId) return;

    try {
      await this.messageService.markAllRead(data.chatId, user);
      const readAt = new Date().toISOString();

      // Notify other members in the room
      client.to(`room:${data.chatId}`).emit(WS_EVENTS.MESSAGE_READ_ACK, {
        chatId: data.chatId,
        userId: user._id,
        readAt,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to mark messages as read';
      this.logger.error(`[message:read] Error: ${message}`);
      client.emit(WS_EVENTS.WS_ERROR, { message });
    }
  }

  // ─── Typing Indicators ─────────────────────────────────────────────────────

  /**
   * Broadcast typing start to all other users in a chat room.
   */
  @SubscribeMessage(WS_EVENTS.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): void {
    const user: UserEntity = client.data.user;
    if (!user || !data?.chatId) return;

    client.to(`room:${data.chatId}`).emit(WS_EVENTS.TYPING_START, {
      chatId: data.chatId,
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
      color: user.color,
    });
  }

  /**
   * Broadcast typing stop to all other users in a chat room.
   */
  @SubscribeMessage(WS_EVENTS.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): void {
    const user: UserEntity = client.data.user;
    if (!user || !data?.chatId) return;

    client.to(`room:${data.chatId}`).emit(WS_EVENTS.TYPING_STOP, {
      chatId: data.chatId,
      userId: user._id,
    });
  }
}
