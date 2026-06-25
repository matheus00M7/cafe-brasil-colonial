import type { MetadataRoute } from "next";
import { getStoreProducts } from "@/lib/orders-db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getStoreProducts();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pages = [
    "",
    "/produtos",
    "/nossa-historia",
    "/origem",
    "/atacado",
    "/contato",
    "/privacidade",
    "/carrinho",
    "/checkout",
  ];
  return [
    ...pages.map((path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/produtos/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
