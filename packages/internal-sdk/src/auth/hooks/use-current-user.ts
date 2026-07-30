import { useQuery } from '@tanstack/react-query';
import type { User } from '@org/shared';
import { authApi } from '../api/auth.api';
import { useAuth } from './use-auth';

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();

  return useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getMe(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
