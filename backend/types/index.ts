import { IChat } from "../models/Chat";
import { IUser } from "../models/User";

export interface UserQueryParams {
  search?: string;
  sortBy?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
  fetchFields?: Record<string, number>;
  filterMain?: string;
  isOnline?: boolean;
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
  fetchFields?: Record<string, number>;
  userId?: string;
  isGroupChat?: boolean;
}

export interface ChatFetchResult {
  totalItems: number;
  chats: IChat[];
}
