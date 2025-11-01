import { UserDocument } from '../schemas';
import { MessageDocument } from '../schemas/message';

export interface MessageQueryParams {
  chatId?: string;
  senderId?: string;
  messageType?: 'text' | 'media' | 'note';
  search?: string;
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  orderBy?: 'asc' | 'desc';
  fetchFields?: Record<string, number>;
  includeChat?: boolean | string;
}

export type MessageWithSender = Omit<MessageDocument, 'sender' | 'replyTo'> & {
  sender: UserDocument;
  replyTo?: MessageWithSender;
};
