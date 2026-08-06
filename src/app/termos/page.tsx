import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getSiteContent } from "@/lib/orders-db";

export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "Condições gerais para navegação, cadastro, compra e atendimento no Café Brasil Colonial.",
};

export default async function TermsPage() {
  const content = await getSiteContent();
  const sections = [
    [
      "Uso do site",
      "Ao navegar, criar conta ou realizar uma compra, o cliente declara que leu e concorda com estes termos, com a política de privacidade e com as informações exibidas durante o pedido.",
    ],
    [
      "Produtos e disponibilidade",
      "As imagens são ilustrativas e podem variar conforme lote, embalagem e disponibilidade. A loja pode corrigir informações cadastrais, indisponibilizar produtos sem estoque e cancelar pedidos com erro evidente de preço ou cadastro.",
    ],
    [
      "Preços e pagamento",
      "Os preços são exibidos em reais e podem mudar sem aviso prévio. O pagamento é processado por provedor seguro, e a loja não armazena número completo, validade ou código de segurança do cartão.",
    ],
    [
      "Entrega",
      "O prazo de postagem começa após a confirmação do pagamento e pode variar conforme endereço, modalidade de envio, disponibilidade de estoque e eventos externos à operação da loja.",
    ],
    [
      "Conta do cliente",
      "O cliente é responsável por manter seus dados atualizados e por proteger suas credenciais de acesso. A loja pode bloquear acessos suspeitos para proteger contas, pedidos e dados pessoais.",
    ],
    [
      "Atendimento",
      "Dúvidas sobre pedidos, pagamento, entrega, trocas ou dados cadastrais devem ser encaminhadas pelos canais oficiais exibidos no site.",
    ],
  ];

  return (
    <section className="py-12 sm:py-20">
      <Container className="max-w-4xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green">
          Condições gerais
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-brand-brown sm:text-5xl">
          Termos de uso
        </h1>
        <p className="mt-5 leading-7 text-brand-ink/60">
          Estes termos organizam as condições de uso do site da{" "}
          {content.brand.name}. Última atualização: 5 de agosto de 2026.
        </p>
        <div className="mt-10 space-y-5">
          {sections.map(([title, description]) => (
            <article
              key={title}
              className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8"
            >
              <h2 className="text-xl font-extrabold text-brand-brown">
                {title}
              </h2>
              <p className="mt-3 leading-7 text-brand-ink/60">{description}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-brand-brown p-6 text-white sm:p-8">
          <h2 className="text-xl font-extrabold text-brand-cream">
            Políticas relacionadas
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Consulte também a{" "}
            <Link href="/privacidade" className="font-bold text-brand-cream">
              Política de Privacidade
            </Link>{" "}
            e a{" "}
            <Link
              href="/trocas-e-devolucoes"
              className="font-bold text-brand-cream"
            >
              Política de Trocas e Devoluções
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
