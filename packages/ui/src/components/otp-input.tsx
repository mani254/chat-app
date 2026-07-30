import * as React from 'react';
import { cn } from '../lib/utils';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  error,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value.slice(-1);
    if (!/^[0-9]$/.test(char) && char !== '') return;

    const newValueArray = value.padEnd(length, ' ').split('');
    newValueArray[index] = char || ' ';
    const newValue = newValueArray.join('').trimEnd();

    onChange(newValue);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'w-11 h-12 text-center text-lg font-bold rounded-xl border bg-white text-slate-900',
              'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100',
              error
                ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-600'
                : value[index]
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30'
                : 'border-slate-200 hover:border-slate-300'
            )}
          />
        ))}
      </div>
      {error && <p className="text-xs text-rose-400 text-center font-normal">{error}</p>}
    </div>
  );
}
