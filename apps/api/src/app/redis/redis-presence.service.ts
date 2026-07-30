import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '@org/dal';
import { Redis } from 'ioredis';
import { REDIS_CLIENT, REDIS_KEY_PREFIX } from './redis.constants';

@Injectable()
export class RedisPresenceService {
  private readonly logger = new Logger(RedisPresenceService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Set user status to ONLINE when a socket or REST auth occurs.
   * Supports multi-device tracking (increments active socket count).
   */
  async setUserOnline(userId: string, socketId?: string): Promise<void> {
    try {
      const userSocketsKey = `${REDIS_KEY_PREFIX.USER_SOCKETS_PREFIX}${userId}:sockets`;
      const heartbeatKey = `${REDIS_KEY_PREFIX.HEARTBEAT_PREFIX}${userId}`;

      // Track active socket connection if socketId is provided
      if (socketId) {
        await this.redis.sadd(userSocketsKey, socketId);
      }

      // Add to global online users Redis set
      await this.redis.sadd(REDIS_KEY_PREFIX.ONLINE_USERS_SET, userId);

      // Refresh 60s TTL heartbeat key in Redis
      await this.redis.set(heartbeatKey, 'active', 'EX', 60);

      // Update MongoDB isOnline status asynchronously
      await this.userRepository.setOnlineStatus(userId, true);

      this.logger.debug(`User [${userId}] marked ONLINE in Redis & MongoDB`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error setting user [${userId}] online: ${msg}`);
    }
  }

  /**
   * Set user status to OFFLINE when socket disconnects or REST logout occurs.
   * Decrements multi-device socket count.
   */
  async setUserOffline(userId: string, socketId?: string): Promise<void> {
    try {
      const userSocketsKey = `${REDIS_KEY_PREFIX.USER_SOCKETS_PREFIX}${userId}:sockets`;
      const heartbeatKey = `${REDIS_KEY_PREFIX.HEARTBEAT_PREFIX}${userId}`;

      if (socketId) {
        await this.redis.srem(userSocketsKey, socketId);
      }

      // Check remaining active sockets for this user
      const remainingSockets = await this.redis.scard(userSocketsKey);

      if (remainingSockets === 0) {
        // Remove from global online users set
        await this.redis.srem(REDIS_KEY_PREFIX.ONLINE_USERS_SET, userId);
        await this.redis.del(heartbeatKey);
        await this.redis.del(userSocketsKey);

        // Update MongoDB status asynchronously
        await this.userRepository.setOnlineStatus(userId, false);

        this.logger.debug(`User [${userId}] marked OFFLINE (0 active sockets remaining)`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error setting user [${userId}] offline: ${msg}`);
    }
  }

  /**
   * Refresh presence heartbeat TTL
   */
  async heartbeat(userId: string): Promise<void> {
    try {
      const heartbeatKey = `${REDIS_KEY_PREFIX.HEARTBEAT_PREFIX}${userId}`;
      await this.redis.set(heartbeatKey, 'active', 'EX', 60);
      await this.redis.sadd(REDIS_KEY_PREFIX.ONLINE_USERS_SET, userId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error refreshing heartbeat for [${userId}]: ${msg}`);
    }
  }

  /**
   * Fast O(1) check if user is online in Redis
   */
  async isUserOnline(userId: string): Promise<boolean> {
    try {
      const isMember = await this.redis.sismember(
        REDIS_KEY_PREFIX.ONLINE_USERS_SET,
        userId,
      );
      return isMember === 1;
    } catch {
      return false;
    }
  }

  /**
   * Instant lookup of all currently online user IDs from Redis
   */
  async getOnlineUserIds(): Promise<string[]> {
    try {
      return await this.redis.smembers(REDIS_KEY_PREFIX.ONLINE_USERS_SET);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error fetching online user IDs from Redis: ${msg}`);
      return [];
    }
  }
}
