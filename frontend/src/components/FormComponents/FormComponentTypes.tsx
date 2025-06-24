export type InputVariant = "outline" | "filled" | "underline" | "unstyled";

export const getInputVariantStyles = (variant: InputVariant = "outline") => {
  const base = "w-full px-2 py-[6px] rounded-md transition duration-150 focus:outline-none text-sm";

  const variants: Record<InputVariant, string> = {
    outline: "border border-gray-300 focus:border-blue-200 focus:ring-1 focus:ring-blue-100",
    filled: "bg-gray-100 border border-gray-200 focus:bg-white focus:border-blue-200 focus:ring-1 focus:ring-blue-200",
    underline: "border-b border-gray-300 focus:border-blue-200 focus:ring-0 rounded-none",
    unstyled: "border-none focus:outline-none focus:ring-0 bg-transparent",
  };

  return `${base} ${variants[variant]}`;
};