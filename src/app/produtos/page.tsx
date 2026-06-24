import type { Metadata } from "next";
import { getStoreProducts } from "@/lib/orders-db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ProductCatalog } from "@/components/products/ProductCatalog";

export const metadata: Metadata = {
  title: "Nossos cafés",
  description:
    "Conheça a linha Tradicional, Extraforte, Gourmet, Especial e os kits do Café Brasil Colonial.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getStoreProducts();
  return (
    <>
      <section className="relative overflow-hidden bg-brand-brown py-16 text-white sm:py-24">
        <div
          className="absolute inset-y-0 right-0 w-2/3 bg-[url('/brand/pattern-official.png')] bg-[length:440px] opacity-[0.08]"
          aria-hidden="true"
        />
        <Container className="relative">
          <Badge tone="cream">Linha completa</Badge>
          <h1 className="mt-5 text-4xl font-extrabold sm:text-6xl">
            Nossos cafés
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
            Escolha entre perfis intensos, cafés de torra média e kits para
            experimentar diferentes momentos da linha Brasil Colonial.
          </p>
        </Container>
      </section>
      <section className="py-12 sm:py-20">
        <Container>
          <ProductCatalog products={products} />
        </Container>
      </section>
    </>
  );
}
