import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { getInputVariantStyles, InputVariant } from "./FormComponentTypes";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label?: string;
  error?: string;
  wrapperClass?: string;
  inputClass?: string;
  labelClass?: string;
  variant?: InputVariant;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({
    wrapperClass = "",
    inputClass = "",
    labelClass = "",
    variant = "outline",
    id,
    label,
    error,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx("input-wrapper", wrapperClass)}>
        {label && (
          <label htmlFor={inputId} className={clsx("block text-sm mb-2 font-medium", labelClass)}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            className={clsx(
              getInputVariantStyles(variant),
              error && "border-error focus:border-error focus:ring-error",
              inputClass
            )}
            {...props}
          />
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-foreground-accent" />
            ) : (
              <Eye className="h-5 w-5 text-foreground-accent" />
            )}
          </span>
        </div>
        {error && <p className="text-xs text-error mt-1" >{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";