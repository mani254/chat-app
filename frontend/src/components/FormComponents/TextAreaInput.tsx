import clsx from "clsx";
import React from "react";
import { InputVariant, getInputVariantStyles } from "./FormComponentTypes";

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  label?: string;
  error?: string;
  wrapperClass?: string;
  inputClass?: string;
  labelClass?: string;
  variant?: InputVariant;
}

export const TextareaInput: React.FC<TextareaInputProps> = ({
  wrapperClass = "",
  inputClass = "",
  labelClass = "",
  variant = "outline",
  id,
  label,
  error,
  ...props
}) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("input-wrapper", wrapperClass)}>
      {label && (
        <label htmlFor={inputId} className={clsx("block text-sm mb-[6px] ml-1 font-medium", labelClass)}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(getInputVariantStyles(variant), error && "border-red-500 focus:border-red-500 focus:ring-red-500", inputClass)}
        {...props}
      />
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
};