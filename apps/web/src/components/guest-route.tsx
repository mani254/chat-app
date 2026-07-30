import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@org/internal-sdk';

interface GuestRouteProps {
  redirectTo?: string;
  children?: React.ReactNode;
}

export function GuestRoute({ redirectTo = '/chat', children }: GuestRouteProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
