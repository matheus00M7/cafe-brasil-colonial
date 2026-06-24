import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  label,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block text-sm font-bold text-brand-ink">
      {label}
      <textarea
        className={cn(
          "mt-2 min-h-28 w-full resize-y rounded-2xl border border-brand-brown/15 bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/10",
          className,
        )}
        {...props}
      />
    </label>
  );
}
