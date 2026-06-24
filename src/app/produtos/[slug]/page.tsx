import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { getStoreProducts } from "@/lib/orders-db";
import { ProductDetail } from "@/components/products/ProductDetail";
import { RelatedProducts } from "@/components/products/RelatedProducts";

export const dynamic = "force-dynamic";

export const generateStaticParams = () =>
  products.map((product) => ({ slug: product.slug }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getStoreProducts()).find(
    (item) => item.slug === slug,
  );
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = (await getStoreProducts()).find((item) => item.slug === slug);
  if (!product) notFound();

  const related = (await getStoreProducts())
    .filter((item) => item.id !== product.id)
    .sort((a, b) =>
      a.category === product.category ? -1 : b.category === product.category ? 1 : 0,
    );

  return (
    <>
      <ProductDetail product={product} />
      <RelatedProducts products={related} />
    </>
  );
}
