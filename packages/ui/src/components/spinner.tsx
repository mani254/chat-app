import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div role="status" className={cn('flex items-center justify-center', className)} {...props}>
      <Loader2 className={cn('animate-spin text-zinc-400', sizes[size])} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
