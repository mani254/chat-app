import { IChat } from "../models/Chat";
import { IMessage } from "../models/Message";
import { IUser } from "../models/User";

export interface UserQueryParams {
  search?: string;
  sortBy?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
  skip?: number;
  fetchFields?: Record<string, number>;
  filterMain?: string;
  isOnline?: boolean | string;
}

export interface UserFetchResult {
  totalItems: number;
  users: IUser[];
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
  isGroupChat?: boolean | string;
}

export interface ChatFetchResult {
  totalItems: number;
  chats: IChat[];
}

export interface MessageQueryParams {
  chatId?: string;
  senderId?: string;
  messageType?: "text" | "media" | "note";
  search?: string;
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: "createdAt" | "updatedAt";
  orderBy?: "asc" | "desc";
  fetchFields?: Record<string, number>;
  includeChat?: boolean | string;
}

export interface MessageFetchResult {
  totalItems: number;
  messages: IMessage[];
}

export interface CreateChatPayload {
  users: string[];
  isGroupChat: boolean;
  name?: string;
  groupAdmin?: string;
}
