import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthMessageResponse } from '@org/shared';
import { authApi } from '../api/auth.api';
import { useAuth } from './use-auth';

export function useLogout() {
  const { clearToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthMessageResponse, Error, void>({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearToken();
      queryClient.clear();
    },
  });
}
