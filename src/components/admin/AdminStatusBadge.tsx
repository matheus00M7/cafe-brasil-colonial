import { cn } from "@/lib/utils";

const tones = {
  green: "bg-emerald-100 text-emerald-800",
  yellow: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  neutral: "bg-stone-100 text-stone-700",
  brown: "bg-brand-cream text-brand-brown",
  blue: "bg-blue-100 text-blue-800",
};

export function AdminStatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
