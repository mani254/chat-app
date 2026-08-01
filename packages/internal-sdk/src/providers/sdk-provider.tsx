import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { AuthProvider } from '../auth/context/auth-provider';
import { SocketProvider } from '../socket/socket-context';
import { getEnvConfig } from '../config/env.config';

export interface SdkProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
  socketUrl?: string;
  queryClient?: QueryClient;
}

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

export function SdkProvider({
  children,
  apiBaseUrl,
  socketUrl,
  queryClient = defaultQueryClient,
}: SdkProviderProps) {
  const envConfig = getEnvConfig();
  const targetApiBaseUrl = apiBaseUrl || envConfig.apiBaseUrl;
  const targetSocketUrl = socketUrl || envConfig.socketUrl;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider apiBaseUrl={targetApiBaseUrl}>
        <SocketProvider url={targetSocketUrl}>{children}</SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
