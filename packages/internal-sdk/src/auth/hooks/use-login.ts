import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthResponse, LoginRequest } from '@org/shared';
import { authApi } from '../api/auth.api';
import { useAuth } from './use-auth';

export function useLogin() {
  const { setToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      if (res.token) {
        setToken(res.token);
      }
      if (res.user) {
        queryClient.setQueryData(['auth', 'me'], res.user);
      }
    },
  });
}
