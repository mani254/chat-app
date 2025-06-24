import clsx from "clsx";
import React from "react";

interface CheckboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  checked: boolean;
  wrapperClass?: string;
  inputClass?: string;
  labelClass?: string;
}

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  wrapperClass = "",
  inputClass = "",
  labelClass = "",
  id,
  label,
  checked,
  ...props
}) => {
  const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("input-wrapper flex items-center gap-2", wrapperClass)}>
      <input
        type="checkbox"
        id={inputId}
        checked={checked}
        className={clsx("checkbox-input", inputClass)}
        {...props}
      />
      <label htmlFor={inputId} className={clsx("text-sm", labelClass)}>
        {label}
      </label>
    </div>
  );
};