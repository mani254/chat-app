import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchUsersApi, type UserListResponse } from '../api/user.api';

export const USER_KEYS = {
  all: ['users'] as const,
  list: (search?: string) => [...USER_KEYS.all, { search }] as const,
  infinite: (search?: string) => [...USER_KEYS.all, 'infinite', { search }] as const,
};

export function useUsersQuery(search?: string) {
  const trimmed = search?.trim() || '';
  const isSearchAllowed = trimmed.length === 0 || trimmed.length > 2;

  return useQuery<UserListResponse>({
    queryKey: USER_KEYS.list(trimmed),
    queryFn: () => fetchUsersApi({ search: trimmed, limit: 10 }),
    enabled: isSearchAllowed,
  });
}

export function useInfiniteUsersQuery(search?: string) {
  const trimmed = search?.trim() || '';
  const isSearchAllowed = trimmed.length === 0 || trimmed.length > 2;

  return useInfiniteQuery<UserListResponse>({
    queryKey: USER_KEYS.infinite(trimmed),
    queryFn: ({ pageParam }) =>
      fetchUsersApi({
        search: trimmed,
        cursor: pageParam as string | undefined,
        limit: 10,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isSearchAllowed,
  });
}
