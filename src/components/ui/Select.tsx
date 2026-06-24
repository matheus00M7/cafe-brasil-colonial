import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({
  label,
  error,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="block text-sm font-bold text-brand-ink">
      {label}
      <select
        className={cn(
          "mt-2 min-h-12 w-full rounded-2xl border bg-white px-4 text-base font-normal outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/10",
          error ? "border-red-500" : "border-brand-brown/15",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
