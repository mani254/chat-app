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
  chat: string;
  sender: string;
  content: string;
  readBy: string[];
  messageType: "text" | "image" | "file";
  createdAt: string;
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
