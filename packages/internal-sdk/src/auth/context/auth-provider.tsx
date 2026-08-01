import * as React from 'react';
import { configureApiClient } from '../../http/api-client';
import { getEnvConfig } from '../../config/env.config';

export interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const AuthContext = React.createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
}

export function AuthProvider({ children, apiBaseUrl }: AuthProviderProps) {
  const targetApiBaseUrl = apiBaseUrl || getEnvConfig().apiBaseUrl;

  const [token, setTokenState] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  });

  const setToken = React.useCallback((newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setTokenState(newToken);
  }, []);

  const clearToken = React.useCallback(() => {
    localStorage.removeItem('auth_token');
    setTokenState(null);
  }, []);

  React.useEffect(() => {
    configureApiClient({
      baseUrl: targetApiBaseUrl,
      getToken: () => localStorage.getItem('auth_token'),
    });
  }, [targetApiBaseUrl]);

  const value = React.useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      setToken,
      clearToken,
    }),
    [token, setToken, clearToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
