import * as React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export function Card({
  title,
  description,
  footer,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/60 text-slate-900',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="mb-6 space-y-1">
          {title && <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>}
          {description && <p className="text-sm text-slate-500 font-normal">{description}</p>}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-6 pt-5 border-t border-slate-100">{footer}</div>}
    </div>
  );
}
