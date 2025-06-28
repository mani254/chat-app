export interface UserQueryParams {
  search?: string;
  sortBy?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
  fetchFields?: Record<string, number>;
  status?: "active" | "inactive";
  filterMain?: boolean;
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
  isGroupChat: boolean;
  users: string[];
  groupAdmin?: string;
  latestMessage?: string;
  createdAt: string;
}
