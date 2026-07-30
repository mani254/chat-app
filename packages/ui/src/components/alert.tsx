import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-slate-50 border-slate-200 text-slate-800',
  };

  const icons = {
    error: XCircle,
    success: CheckCircle2,
    warning: AlertCircle,
    info: Info,
  };

  const IconComponent = icons[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-lg border text-xs leading-relaxed',
        styles[variant],
        className
      )}
      {...props}
    >
      <IconComponent className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="space-y-0.5">
        {title && <h5 className="font-semibold tracking-tight">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
}
