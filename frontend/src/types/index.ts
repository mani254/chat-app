export interface UserQueryParams {
  search?: string;
  sortBy?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
  fetchFields?: Record<string, number>;
  filterMain?: boolean;
  isOnline?: boolean;
}

export interface ChatQueryParams {
  search?: string;
  sortBy?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
  fetchFields?: Record<string, number>;
  userId?: string;
  isGroupChat?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
}

export interface Message {
  _id: string;
  chat: string | Chat;
  sender: User;
  content: string;
  readBy: string[];
  messageType: "text" | "image" | "file" | "note";
  createdAt: string;
  midText: boolean;
}

export interface Chat {
  _id: string;
  name?: string;
  avatar?: string;
  isGroupChat: boolean;
  users: User[];
  groupAdmin?: string;
  latestMessage?: Message;
  createdAt: string;
}

export interface MessageQueryParams {
  chatId?: string;
  senderId?: string;
  messageType?: "text" | "image" | "file" | "note";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt";
  orderBy?: "asc" | "desc";
  fetchFields?: Record<string, number>;
  includeChat?: boolean | string;
}

export interface MessageFetchResult {
  totalItems: number;
  messages: Message[];
}

export interface CreateChatPayload {
  users: string[];
  isGroupChat: boolean;
  name?: string;
  groupAdmin?: string;
}
