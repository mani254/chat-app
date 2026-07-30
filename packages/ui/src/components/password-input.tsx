import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, InputProps } from './input';

export function PasswordInput(props: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input {...props} type={showPassword ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-[32px] -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        <span className="sr-only">
          {showPassword ? 'Hide password' : 'Show password'}
        </span>
      </button>
    </div>
  );
}
