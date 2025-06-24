import clsx from "clsx";
import React from "react";
import { InputVariant, getInputVariantStyles } from "./FormComponentTypes";

interface Option {
  label: string;
  value: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id?: string;
  label?: string;
  options: Option[];
  wrapperClass?: string;
  inputClass?: string;
  labelClass?: string;
  variant?: InputVariant;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  wrapperClass = "",
  inputClass = "",
  labelClass = "",
  variant = "outline",
  id,
  label,
  options,
  ...props
}) => {
  const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("input-wrapper", wrapperClass)}>
      {label && (
        <label htmlFor={inputId} className={clsx("block text-sm mb-[6px] ml-1 font-medium", labelClass)}>
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={clsx(getInputVariantStyles(variant), inputClass)}
        {...props}
      >
        {options.map((option, i) => (
          <option key={i} value={option.value} className="text-sm">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};