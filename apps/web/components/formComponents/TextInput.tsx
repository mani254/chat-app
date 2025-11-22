import clsx from "clsx";
import React from "react";
import { getInputVariantStyles, InputVariant } from "./FormComponentTypes";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label?: string;
  error?: string;
  wrapperClass?: string;
  inputClass?: string;
  labelClass?: string;
  variant?: InputVariant;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
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

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx("input-wrapper", wrapperClass)}>
        {label && (
          <label htmlFor={inputId} className={clsx("block text-sm font-medium mb-[6px] ml-1", labelClass)}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(getInputVariantStyles(variant), error && "border-error focus:border-error focus:ring-error", inputClass)}
          {...props}
        />
        {error && <p className="text-xs mt-1 text-error">{error}</p>}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";