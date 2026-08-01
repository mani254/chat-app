import { getApiClient } from '../../http/api-client';
import type { UserSummary } from '@org/shared';

export interface UserListResponse {
  items: UserSummary[];
  nextCursor?: string;
  hasMore?: boolean;
}

export async function fetchUsersApi(params?: {
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<UserListResponse> {
  const client = getApiClient();
  const response = await client.get<unknown, UserListResponse>('/users', {
    params,
  });
  return response;
}
