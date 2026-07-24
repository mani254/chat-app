import { Module } from '@nestjs/common';

/**
 * WebSocketModule — Foundation
 *
 * Prepares the architecture for future Socket.IO gateways.
 *
 * When ready to wire Socket.IO:
 *   1. npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
 *   2. npm install @socket.io/redis-adapter ioredis  (for Redis adapter)
 *   3. Create gateways/chat.gateway.ts using @WebSocketGateway()
 *   4. Register the Redis adapter in main.ts:
 *      const { createAdapter } = await import('@socket.io/redis-adapter');
 *      app.useWebSocketAdapter(new SocketIoAdapter(app, redisClient));
 *
 * This module is intentionally separate from REST modules to keep
 * HTTP and WebSocket concerns isolated.
 */
@Module({
  providers: [
    // TODO: Add Chat, Notification gateway providers here
  ],
})
export class WebSocketModule {}
