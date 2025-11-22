export type InputVariant = "outline" | "filled" | "underline" | "unstyled";

export const getInputVariantStyles = (variant: InputVariant = "outline") => {
  const base = "w-full px-2 py-[6px] rounded-md transition duration-150 focus:outline-none text-sm";

  const variants: Record<InputVariant, string> = {
    outline: "border focus:ring ring-focus-ring",
    filled: "border focus:ring-1 ring-focus-ring",
    underline: "border-b focus:ring-0 ring-focus-ring rounded-none border-focus-ring",
    unstyled: "border-none focus:outline-none focus:ring-0 bg-transparent",
  };

  return `${base} ${variants[variant]}`;
};