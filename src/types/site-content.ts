export type CarouselSlide = {
  id: string;
  enabled: boolean;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  image: string;
  tone: "green" | "brown" | "olive";
};

export type SiteContent = {
  brand: {
    name: string;
    slogan: string;
    description: string;
    logoDark: string;
    logoLight: string;
    whatsapp: string;
    instagram: string;
    email: string;
    cnpj: string;
    announcement: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    originLabel: string;
  };
  carousel: CarouselSlide[];
  sections: {
    featuredEnabled: boolean;
    kitsEnabled: boolean;
    storyEnabled: boolean;
    originEnabled: boolean;
    b2bEnabled: boolean;
    testimonialsEnabled: boolean;
    faqEnabled: boolean;
    storyTitle: string;
    storyDescription: string;
    storyImage: string;
    b2bTitle: string;
    b2bDescription: string;
    b2bImage: string;
    originImage: string;
  };
  commerce: {
    standardShippingPrice: number;
    freeShippingThreshold: number;
    subscriptionPrices: Record<string, number>;
  };
  seo: {
    title: string;
    description: string;
    socialImage: string;
  };
  updatedAt: string | null;
};
