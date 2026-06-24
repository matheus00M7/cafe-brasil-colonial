import { Boxes } from "lucide-react";
import { getAdminProducts } from "@/lib/orders-db";
import { ProductAdminCard } from "@/components/admin/ProductAdminCard";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-brown">
          <Boxes className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
            Catálogo
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
            Produtos
          </h1>
          <p className="mt-2 max-w-2xl text-brand-ink/55">
            Altere nome, descrição, imagem, preço, estoque, destaque e
            disponibilidade. As mudanças passam a valer na loja e no cálculo
            seguro do checkout.
          </p>
        </div>
      </div>
      <div className="mt-8 space-y-5">
        {products.map((product) => (
          <ProductAdminCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
