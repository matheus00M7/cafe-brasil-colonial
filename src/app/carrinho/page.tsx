import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CartPage } from "@/components/cart/CartPage";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revise os cafés escolhidos antes de finalizar o pedido.",
};

export default function CartRoute() {
  return (
    <section className="py-12 sm:py-20">
      <Container>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green">
          Seu pedido
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-brand-brown sm:text-5xl">
          Carrinho
        </h1>
        <p className="mb-9 mt-4 max-w-2xl leading-7 text-brand-ink/60">
          Ajuste as quantidades e siga para o checkout. O pagamento é concluído
          com segurança dentro do site.
        </p>
        <CartPage />
      </Container>
    </section>
  );
}
