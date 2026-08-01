import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import type { MessageResponseDto } from '../message/dto';

@Injectable()
export class ChatEventsService extends EventEmitter {
  emitMessageCreated(message: MessageResponseDto): void {
    this.emit('message.created', message);
  }

  onMessageCreated(listener: (message: MessageResponseDto) => void): void {
    this.on('message.created', listener);
  }
}
