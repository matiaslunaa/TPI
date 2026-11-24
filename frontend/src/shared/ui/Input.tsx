import type { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm
        focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30
        disabled:bg-stone-100 ${className}`}
      {...props}
    />
  );
}
