export type BrandConfig = {
  name: string;
  slogan: string;
  description: string;
  founded: number;
  product: string;
  origins: string[];
  altitude: string;
  colors: Record<string, string>;
  typography: {
    titles: string;
    body: string;
  };
  logos: {
    dark: string;
    light: string;
    badgeDark: string;
    badgeLight: string;
    markDark: string;
    markLight: string;
  };
  whatsapp: string;
  instagram: string;
  email: string;
};
