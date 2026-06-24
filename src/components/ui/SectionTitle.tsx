import { cn } from "@/lib/utils";
import { Badge } from "./Badge";

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <Badge>{eyebrow}</Badge>}
      <h2 className="mt-4 text-3xl font-extrabold leading-tight text-brand-brown sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-brand-ink/70 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
