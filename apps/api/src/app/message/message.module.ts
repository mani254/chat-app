import { Module } from '@nestjs/common';
import { MessageRepository, UserRepository } from '@org/dal';
import { ChatModule } from '../chat/chat.module';
import { ChatEventsModule } from '../websocket/chat-events.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [ChatModule, ChatEventsModule],
  controllers: [MessageController],
  providers: [
    MessageService,
    { provide: MessageRepository, useFactory: () => new MessageRepository() },
    { provide: UserRepository, useFactory: () => new UserRepository() },
  ],
  exports: [MessageService],
})
export class MessageModule { }
