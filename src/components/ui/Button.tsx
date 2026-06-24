import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "green";
  size?: "sm" | "md" | "lg";
  className?: string;
  external?: boolean;
};

const variants = {
  primary:
    "bg-brand-brown text-white hover:bg-[#4d1a0e] shadow-lg shadow-brand-brown/15",
  secondary:
    "bg-brand-cream text-brand-brown hover:bg-[#f5ca91] shadow-lg shadow-brand-brown/10",
  outline:
    "border border-brand-brown/25 bg-white/70 text-brand-brown hover:border-brand-brown hover:bg-white",
  ghost: "text-brand-brown hover:bg-brand-cream/45",
  green: "bg-brand-green text-white hover:bg-[#03552e]",
};

const sizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-7 text-base",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-extrabold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (href && (external || href.startsWith("http"))) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
