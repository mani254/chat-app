import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

const logger = new Logger('RedisProvider');

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Redis => {
    const host = configService.get<string>('redis.host') ?? 'localhost';
    const port = configService.get<number>('redis.port') ?? 6379;
    const password = configService.get<string>('redis.password');
    const db = configService.get<number>('redis.db') ?? 0;

    const redis = new Redis({
      host,
      port,
      password: password || undefined,
      db,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        logger.warn(`Redis connection attempt #${times}. Retrying in ${delay}ms...`);
        return delay;
      },
    });

    redis.on('connect', () => {
      logger.log(`✅ Connected to Redis instance at ${host}:${port} (db: ${db})`);
    });

    redis.on('error', (err) => {
      logger.error(`❌ Redis Client Error: ${err.message}`);
    });

    // Attempt non-blocking connection during bootstrap
    redis.connect().catch((err) => {
      logger.warn(`Initial Redis connection failed: ${err.message}. Retries active.`);
    });

    return redis;
  },
};
