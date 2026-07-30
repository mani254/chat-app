import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthResponse, RegisterRequest } from '@org/shared';
import { authApi } from '../api/auth.api';
import { useAuth } from './use-auth';

export function useRegister() {
  const { setToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
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
