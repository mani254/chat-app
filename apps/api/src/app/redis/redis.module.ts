import { Global, Module } from '@nestjs/common';
import { UserRepository } from '@org/dal';
import { REDIS_CLIENT } from './redis.constants';
import { redisProvider } from './redis.provider';
import { RedisPresenceService } from './redis-presence.service';

@Global()
@Module({
  providers: [
    redisProvider,
    RedisPresenceService,
    {
      provide: UserRepository,
      useFactory: () => new UserRepository(),
    },
  ],
  exports: [REDIS_CLIENT, RedisPresenceService],
})
export class RedisModule {}
