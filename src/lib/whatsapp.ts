import { brand } from "@/data/brand";

export const createWhatsAppUrl = (message: string, configuredPhone?: string) => {
  const phone = (configuredPhone || brand.whatsapp).replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
