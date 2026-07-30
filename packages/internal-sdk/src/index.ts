// HTTP & Errors
export * from './http/api-client';
export * from './http/api-error';

// Auth Context & API
export * from './auth/context/auth-provider';
export * from './auth/api/auth.api';

// TanStack Query Hooks
export * from './auth/hooks/use-auth';
export * from './auth/hooks/use-current-user';
export * from './auth/hooks/use-login';
export * from './auth/hooks/use-register';
export * from './auth/hooks/use-send-otp';
export * from './auth/hooks/use-verify-otp';
export * from './auth/hooks/use-forgot-password';
export * from './auth/hooks/use-logout';
export * from './auth/hooks/use-google-login';

// SDK Provider
export * from './providers/sdk-provider';

// Re-export @org/shared types for convenient consumption in apps
export type {
  User,
  AuthResponse,
  AuthMessageResponse,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  OtpPurpose,
} from '@org/shared';
