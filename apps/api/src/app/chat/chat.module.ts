import { Module } from '@nestjs/common';
import { ChatRepository, MessageRepository, UserRepository } from '@org/dal';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    { provide: ChatRepository, useFactory: () => new ChatRepository() },
    { provide: MessageRepository, useFactory: () => new MessageRepository() },
    { provide: UserRepository, useFactory: () => new UserRepository() },
  ],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}
