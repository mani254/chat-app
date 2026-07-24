import { Module } from '@nestjs/common';

/**
 * RedisModule — Foundation
 *
 * Prepares the Redis integration architecture. Not yet connected.
 *
 * When ready to wire Redis:
 *   1. npm install ioredis
 *   2. Create redis.provider.ts:
 *      const redisProvider = {
 *        provide: REDIS_CLIENT,
 *        inject: [ConfigService],
 *        useFactory: (config: ConfigService) =>
 *          new Redis({ host: config.get('redis.host'), ... }),
 *      };
 *   3. Add to providers/exports below.
 *   4. Future uses: rate limiting, caching, Socket.IO Redis Adapter, job queues.
 */
@Module({
  providers: [
    // TODO: Add RedisProvider when ioredis is installed
  ],
  exports: [
    // TODO: Export REDIS_CLIENT token
  ],
})
export class RedisModule {}
