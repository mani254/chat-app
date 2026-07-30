import { useMutation } from '@tanstack/react-query';
import type { VerifyOtpRequest, VerifyOtpResponse } from '@org/shared';
import { authApi } from '../api/auth.api';

export function useVerifyOtp() {
  return useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({
    mutationFn: (data: VerifyOtpRequest) => authApi.verifyOtp(data),
  });
}
