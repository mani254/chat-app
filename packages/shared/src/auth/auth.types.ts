import type { User } from '../user/user.types.js';

export type OtpPurpose = 'register' | 'forgot_password';

export interface SendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface ResendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface SendOtpResponse {
  message: string;
  expiresInSeconds: number;
  email: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  message: string;
  email: string;
  purpose: OtpPurpose;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface GoogleLoginRequest {
  idToken: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface AuthMessageResponse {
  message: string;
  success: boolean;
}
