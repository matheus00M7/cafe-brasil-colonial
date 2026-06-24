import type { BrandConfig } from "@/types/brand";

export const brand: BrandConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Café Brasil Colonial",
  slogan: "Tradição, aroma e qualidade desde 1998.",
  description:
    "Café 100% arábica com origem brasileira, tradição familiar e torra selecionada para diferentes momentos da rotina.",
  founded: 1998,
  product: "Café 100% arábica",
  origins: [
    "Mata Verde/MG",
    "Vale do Jequitinhonha",
    "Encruzilhada/Vila do Café",
  ],
  altitude: "850 a 900 metros",
  colors: {
    brown: "#632413",
    cream: "#FADAAD",
    green: "#046A38",
    yellow: "#FFCD00",
  },
  typography: {
    titles: "Montserrat ExtraBold",
    body: "Montserrat",
  },
  logos: {
    dark: "/brand/logo-dark.png",
    light: "/brand/logo-light.png",
    badgeDark: "/brand/logo-badge-dark.png",
    badgeLight: "/brand/logo-badge-light.png",
    markDark: "/brand/brand-mark-dark.png",
    markLight: "/brand/brand-mark-light.png",
  },
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5500000000000",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};
