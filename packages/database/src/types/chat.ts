import { ChatDocument, MessageDocument, UserDocument } from '../schemas';

export interface CreateChatPayload {
  users: string[];
  isGroupChat: boolean;
  name?: string;
  groupAdmin?: string;
}

export interface ChatQueryParams {
  search?: string;
  sortBy?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
  skip?: number;
  fetchFields?: Record<string, number>;
  userId?: string;
  isGroupChat?: boolean;
}

export interface ChatFetchResult {
  totalItems: number;
  chats: ChatDocument[];
}

export type PopulatedChatDocument = Omit<ChatDocument, 'latestMessage' | 'users'> & {
  latestMessage?: MessageDocument;
  users: UserDocument[];
};
