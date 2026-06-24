import type { SiteContent } from "@/types/site-content";

export const defaultSiteContent: SiteContent = {
  brand: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || "Café Brasil Colonial",
    slogan: "Tradição, aroma e qualidade desde 1998.",
    description:
      "Café 100% arábica com origem brasileira, tradição familiar e cuidado em cada etapa, desde 1998.",
    logoDark: "/brand/logo-dark.png",
    logoLight: "/brand/logo-light.png",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5500000000000",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
    cnpj: "",
    announcement: "Envio para todo o Brasil · pagamento seguro no site",
  },
  hero: {
    eyebrow: "Café brasileiro desde 1998",
    title: "Café 100% arábica com tradição colonial brasileira",
    description:
      "Da origem em Minas Gerais à sua xícara: cafés com torra selecionada, cuidado familiar e perfis para o dia a dia ou para momentos mais especiais.",
    image: "/images/hero-manual.webp",
    primaryLabel: "Comprar agora",
    primaryHref: "/produtos",
    secondaryLabel: "Conheça nossa história",
    secondaryHref: "/nossa-historia",
    originLabel: "Vale do Jequitinhonha · Minas Gerais",
  },
  carousel: [
    {
      id: "origem",
      enabled: true,
      eyebrow: "Da lavoura à xícara",
      title: "Cafés selecionados direto da origem",
      text: "Café 100% arábica produzido em regiões de tradição cafeeira de Minas Gerais.",
      href: "/origem",
      image: "/images/origin-coffee.webp",
      tone: "green",
    },
    {
      id: "entrega",
      enabled: true,
      eyebrow: "Seu pedido, onde estiver",
      title: "Entrega para todo o Brasil",
      text: "Monte o carrinho, informe o endereço e conclua o pagamento com segurança no próprio site.",
      href: "/produtos",
      image: "/images/hero-manual.webp",
      tone: "brown",
    },
    {
      id: "kits",
      enabled: true,
      eyebrow: "Combinações para experimentar",
      title: "Kits especiais para a sua rotina",
      text: "Do tradicional ao especial, escolha perfis diferentes em um único pedido.",
      href: "/produtos",
      image: "/products/kit-cafe-colonial.webp",
      tone: "olive",
    },
  ],
  sections: {
    featuredEnabled: true,
    kitsEnabled: true,
    storyEnabled: true,
    originEnabled: true,
    b2bEnabled: true,
    testimonialsEnabled: true,
    faqEnabled: true,
    storyTitle: "Uma marca ligada ao campo e à mesa brasileira",
    storyDescription:
      "O Café Brasil Colonial nasceu da tradição familiar e do cuidado com cada etapa da produção. Desde 1998, carregamos uma história ligada ao campo, ao aroma do café fresco e ao compromisso de levar à mesa um café de origem, feito com respeito, trabalho e qualidade.",
    storyImage: "/images/origin-coffee.webp",
    b2bTitle: "Café para o seu negócio",
    b2bDescription:
      "Fornecemos cafés para restaurantes, hotéis, mercados, cafeterias e parceiros comerciais que buscam qualidade, tradição e fornecimento confiável.",
    b2bImage: "/images/b2b-coffee.webp",
    originImage: "/images/origin-coffee.webp",
  },
  commerce: {
    standardShippingPrice: Number(
      process.env.STANDARD_SHIPPING_PRICE || 18.9,
    ),
    freeShippingThreshold: Number(
      process.env.FREE_SHIPPING_THRESHOLD || 199,
    ),
    subscriptionPrices: {
      "tradicional-500g": 24.9,
      "extraforte-500g": 26.9,
      "tradicional-1kg": 49.8,
      "extraforte-1kg": 53.8,
      "gourmet-500g": 0.01,
      "especial-250g": 34.9,
      "especial-500g": 69.8,
    },
  },
  seo: {
    title: "Café Brasil Colonial | Café 100% Arábica desde 1998",
    description:
      "Tradição, aroma e qualidade em cafés 100% arábica com origem brasileira.",
    socialImage: "/images/hero-manual.webp",
  },
  updatedAt: null,
};
