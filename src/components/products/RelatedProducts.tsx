import type { Product } from "@/types/product";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "./ProductGrid";

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <section className="bg-brand-mist/55 py-16 sm:py-20">
      <Container>
        <SectionTitle
          eyebrow="Continue conhecendo"
          title="Outros cafés para a sua rotina"
        />
        <div className="mt-9">
          <ProductGrid products={products.slice(0, 3)} />
        </div>
      </Container>
    </section>
  );
}
