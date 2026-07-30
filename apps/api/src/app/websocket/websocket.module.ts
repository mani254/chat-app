import { Module } from '@nestjs/common';
import { UserRepository } from '@org/dal';
import { ChatModule } from '../chat/chat.module';
import { MessageModule } from '../message/message.module';
import { RedisModule } from '../redis/redis.module';
import { ChatGateway } from './gateways/chat.gateway';
import { WsAuthGuard } from './guards/ws-auth.guard';

@Module({
  imports: [RedisModule, ChatModule, MessageModule],
  providers: [
    ChatGateway,
    WsAuthGuard,
    {
      provide: UserRepository,
      useFactory: () => new UserRepository(),
    },
  ],
  exports: [ChatGateway],
})
export class WebSocketModule {}
