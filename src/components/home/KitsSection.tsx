import { getStoreProducts } from "@/lib/orders-db";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/products/ProductGrid";

export async function KitsSection() {
  const products = await getStoreProducts();
  const kits = products.filter((product) => product.category === "Kits");
  return (
    <section className="bg-brand-mist/70 py-16 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Kits e combinações"
          title="Mais de um perfil para conhecer"
          description="Kits pensados para experimentar a linha, presentear ou manter o café da casa sempre em dia."
          align="center"
        />
        <div className="mt-10">
          <ProductGrid products={kits} />
        </div>
      </Container>
    </section>
  );
}
