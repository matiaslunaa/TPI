import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
type ButtonSize = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "bg-secondary text-white hover:opacity-90",
  outline: "border border-brand text-brand hover:bg-brand/10",
  danger: "bg-error text-white hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-2.5 py-1 text-xs",
};

export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-lg font-semibold transition active:scale-95
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
        disabled:cursor-not-allowed disabled:opacity-50
        ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
