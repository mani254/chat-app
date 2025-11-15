import clsx from "clsx";
import React from "react";
import { getInputVariantStyles, InputVariant } from "./FormComponentTypes";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  label?: string;
  error?: string;
  wrapperClass?: string;
  textareaClass?: string;
  labelClass?: string;
  variant?: InputVariant;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { wrapperClass = "", textareaClass = "", labelClass = "", variant = "outline", id, label, error, ...props },
    ref,
  ) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx("input-wrapper", wrapperClass)}>
        {label && (
          <label htmlFor={inputId} className={clsx("block text-sm font-medium mb-[6px] ml-1", labelClass)}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(getInputVariantStyles(variant), error && "border-red-200 focus:border-red-200 focus:ring-red-200", textareaClass)}
          {...props}
        />
        {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";