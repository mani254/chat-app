import * as React from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

export function Logo({ size = 'md', subtitle, className, ...props }: LogoProps) {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)} {...props}>
      <div className="flex items-center justify-center p-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/20">
        <MessageSquare className={cn('fill-current', iconSizes[size])} />
      </div>
      <div>
        <span className={cn('font-extrabold tracking-tight text-slate-900 block', textSizes[size])}>
          ChatApp
        </span>
        {subtitle && (
          <span className="text-xs text-slate-500 block font-medium">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
