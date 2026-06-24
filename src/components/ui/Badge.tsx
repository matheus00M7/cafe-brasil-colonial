import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "cream",
}: {
  children: ReactNode;
  className?: string;
  tone?: "cream" | "green" | "yellow" | "brown";
}) {
  const tones = {
    cream: "bg-brand-cream text-brand-brown",
    green: "bg-brand-green text-white",
    yellow: "bg-brand-yellow text-brand-ink",
    brown: "bg-brand-brown text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
