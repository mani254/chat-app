import { UserDocument, UserQueryParams } from '@workspace/database';
import { toast } from '@workspace/ui/components/sonner';
import api from './api';

// --- API Helpers ---
export async function registerUser(user: Partial<UserDocument>): Promise<UserDocument | null> {
  try {
    const response = await api.post<{ message: string; data: UserDocument }>('/api/auth/register', user);
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'error while registering user');
    toast.error('Error registring user', {
      description: errorMessage,
    });
    return null;
  }
}

export async function fetchUsers(params: UserQueryParams): Promise<{ users: UserDocument[]; totalItems: number }> {
  try {
    const response = await api.get<{
      message: string;
      users: UserDocument[];
      totalItems: number;
    }>('/api/users', { params });
    return response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'error while fetching users');
    toast.error('Error fetching user', {
      description: errorMessage,
    });
    return { users: [], totalItems: 0 };
  }
}

export async function loginUser(credentials: { email: string; password: string }): Promise<UserDocument | null> {
  try {
    const response = await api.post<{
      message: string;
      data: UserDocument;
    }>('/api/auth/login', credentials);
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'error while logging in user');
    toast.error('Error loging user', {
      description: errorMessage,
    });
    return null;
  }
}

export const signOut = async (): Promise<{ message: string } | null> => {
  try {
    const response = await api.post<{ message: string }>('/api/auth/logout');
    return response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'error while logging out');
    toast.error('Error while logout', {
      description: errorMessage,
    });
    return null;
  }
};

// OTP functions
export async function generateOtp(email: string, type: string = 'email_verification'): Promise<boolean> {
  try {
    const response = await api.post<{ message: string }>('/api/otp/generate', {
      email,
      type,
    });
    console.log(response);
    return true;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'error while generating OTP');
    toast.error('Failed to send verification code', {
      description: errorMessage,
    });
    return false;
  }
}

export async function verifyOtp(email: string, otp: string, type: string = 'email_verification'): Promise<boolean> {
  try {
    const response = await api.post<{
      message: string;
      data: { verified: boolean };
    }>('/api/otp/verify', {
      email,
      otp,
      type,
    });
    return response.data.data.verified;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'error while verifying OTP');
    toast.error('Verification failed', {
      description: errorMessage,
    });
    return false;
  }
}

export async function resendOtp(email: string, type: string = 'email_verification'): Promise<boolean> {
  try {
    await api.post<{ message: string }>('/api/otp/resend', {
      email,
      type,
    });
    return true;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'error while resending OTP');
    toast.error('Failed to resend verification code', {
      description: errorMessage,
    });
    return false;
  }
}

// Google OAuth functions
export async function initiateGoogleLogin(): Promise<string | null> {
  try {
    const response = await api.get<{ authUrl: string }>('/api/auth/google');
    return response.data.authUrl;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, 'error while initiating Google login');
    toast.error('Error initiating Google login', {
      description: errorMessage,
    });
    return null;
  }
}
