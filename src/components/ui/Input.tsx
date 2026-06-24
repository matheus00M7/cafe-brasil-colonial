import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  label,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="block text-sm font-bold text-brand-ink">
      {label}
      <input
        className={cn(
          "mt-2 min-h-12 w-full rounded-2xl border bg-white px-4 text-base font-normal outline-none transition placeholder:text-brand-ink/35 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10",
          error ? "border-red-500" : "border-brand-brown/15",
          className,
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
