// HTTP & Errors
export * from './http/api-client';
export * from './http/api-error';

// Auth Context & API
export * from './auth/context/auth-provider';
export * from './auth/api/auth.api';

// Auth TanStack Query Hooks
export * from './auth/hooks/use-auth';
export * from './auth/hooks/use-current-user';
export * from './auth/hooks/use-login';
export * from './auth/hooks/use-register';
export * from './auth/hooks/use-send-otp';
export * from './auth/hooks/use-verify-otp';
export * from './auth/hooks/use-forgot-password';
export * from './auth/hooks/use-logout';
export * from './auth/hooks/use-google-login';

// User API & TanStack Query Hooks
export * from './user/api/user.api';
export * from './user/hooks/use-users';

// Chat API & TanStack Query Hooks
export * from './chat/api/chat.api';
export * from './chat/hooks/use-chats';

// Message API & TanStack Query Hooks
export * from './message/api/message.api';
export * from './message/hooks/use-messages';

// Socket Context & Hooks
export * from './socket/socket-context';

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
  ChatResponse,
  ChatListResponse,
  CreateChatRequest,
  GetChatsQuery,
  UpdateGroupChatRequest,
  MessageResponse,
  MessageListResponse,
  MessageReplyResponse,
  SendMessageRequest,
  UserSummary,
  UploadResponse,
} from '@org/shared';
