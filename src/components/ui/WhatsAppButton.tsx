"use client";

import { MessageCircle } from "lucide-react";
import { createWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "./Button";
import { useSiteContent } from "@/context/SiteContentContext";

export function WhatsAppButton({
  message,
  children = "Falar pelo WhatsApp",
  className,
}: {
  message: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const content = useSiteContent();
  return (
    <Button
      href={createWhatsAppUrl(message, content.brand.whatsapp)}
      external
      variant="green"
      className={className}
    >
      <MessageCircle className="h-5 w-5" />
      {children}
    </Button>
  );
}
