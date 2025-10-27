import {
  OtpGenerationRequest,
  OtpGenerationResult,
  OtpVerificationRequest,
  OtpVerificationResult,
} from '@workspace/database';
import { toast } from '@workspace/ui/components/sonner';
import api from './api';

export async function generateOtp(data: OtpGenerationRequest): Promise<OtpGenerationResult['data'] | null> {
  try {
    const response = await api.post<OtpGenerationResult>('/api/otp/generate', data);
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'Error while generation OTP');
    toast.error('Error while generation OTP', {
      description: errorMessage,
    });
    return null;
  }
}

export async function verfiyOtp(data: OtpVerificationRequest): Promise<OtpVerificationResult['data'] | null> {
  try {
    const response = await api.post<OtpVerificationResult>('/api/otp/verify', data);
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'Error while verifying OTP');
    toast.error('Error while verifying OTP', {
      description: errorMessage,
    });
    return null;
  }
}

export async function resendOtp(data: OtpGenerationRequest): Promise<OtpGenerationResult['data'] | null> {
  try {
    const response = await api.post<OtpGenerationResult>('/api/otp/resend', data);
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'Error while resending OTP');
    toast.error('Error while resending OTP', {
      description: errorMessage,
    });
    return null;
  }
}
