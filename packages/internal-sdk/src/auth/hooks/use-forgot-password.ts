import { useMutation } from '@tanstack/react-query';
import type { AuthMessageResponse, ForgotPasswordRequest } from '@org/shared';
import { authApi } from '../api/auth.api';

export function useForgotPassword() {
  return useMutation<AuthMessageResponse, Error, ForgotPasswordRequest>({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
}
