export interface UserQueryParams {
  search?: string;
  sortBy?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
  skip?: number;
  fetchFields?: Record<string, number>;
  filterMain?: boolean;
  isOnline?: boolean;
}
