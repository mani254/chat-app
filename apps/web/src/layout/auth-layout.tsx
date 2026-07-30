import * as React from 'react';
import { Logo } from '@org/ui';

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Header Branding */}
      <div className="mb-8">
        <Logo size="lg" subtitle="Enterprise Real-Time Messaging" />
      </div>

      {/* Main Content Area */}
      <div className="w-full flex justify-center items-center z-10">{children}</div>

      {/* Minimal Footer */}
      <div className="mt-8 text-xs text-slate-400 text-center font-normal tracking-wide">
        &copy; {new Date().getFullYear()} ChatApp. All rights reserved.
      </div>
    </div>
  );
}
