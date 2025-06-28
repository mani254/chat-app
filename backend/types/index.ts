import { IUser } from "../models/User";

export interface UserQueryParams {
  search?: string;
  sortBy?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
  fetchFields?: Record<string, number>;
  status?: "online" | "offline";
  filterMain?: string;
}

export interface UserFetchResult {
  totalItems: number;
  users: IUser[];
}
