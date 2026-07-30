import type { AuthResponse } from '@org/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuth } from './use-auth';

export function useGoogleLogin() {

  const { setToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, { idToken: string; name?: string; email?: string }>({
    mutationFn: (data) => authApi.googleLogin(data),
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
