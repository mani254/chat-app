import { useMutation } from '@tanstack/react-query';
import type { SendOtpRequest, SendOtpResponse } from '@org/shared';
import { authApi } from '../api/auth.api';

export function useSendOtp() {
  return useMutation<SendOtpResponse, Error, SendOtpRequest>({
    mutationFn: (data: SendOtpRequest) => authApi.sendOtp(data),
  });
}

export function useResendOtp() {
  return useMutation<SendOtpResponse, Error, SendOtpRequest>({
    mutationFn: (data: SendOtpRequest) => authApi.resendOtp(data),
  });
}
