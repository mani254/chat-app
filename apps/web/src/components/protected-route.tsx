import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@org/internal-sdk';

interface ProtectedRouteProps {
  redirectTo?: string;
  children?: React.ReactNode;
}

export function ProtectedRoute({ redirectTo = '/login', children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
