import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../auth/context/auth-provider';

export interface SdkProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
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
  apiBaseUrl = '/api/v1',
  queryClient = defaultQueryClient,
}: SdkProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider apiBaseUrl={apiBaseUrl}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
