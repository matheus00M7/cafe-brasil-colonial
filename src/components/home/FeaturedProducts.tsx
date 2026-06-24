import { getStoreProducts } from "@/lib/orders-db";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "@/components/products/ProductGrid";

export async function FeaturedProducts() {
  const products = await getStoreProducts();
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Nossos cafés"
            title="Perfis para diferentes momentos"
            description="Do café forte do dia a dia aos perfis de torra média, mais aromáticos e equilibrados."
          />
          <Button href="/produtos" variant="outline">
            Ver linha completa
          </Button>
        </div>
        <div className="mt-10">
          <ProductGrid
            products={products.filter((product) => product.featured)}
          />
        </div>
      </Container>
    </section>
  );
}
