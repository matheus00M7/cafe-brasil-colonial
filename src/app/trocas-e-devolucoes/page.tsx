import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getSiteContent } from "@/lib/orders-db";

export const metadata: Metadata = {
  title: "Trocas e devoluções",
  description:
    "Orientações para troca, devolução, arrependimento e atendimento pós-venda do Café Brasil Colonial.",
};

export default async function ReturnsPage() {
  const content = await getSiteContent();
  const contact = content.brand.email || "os canais oficiais de atendimento";
  const sections = [
    [
      "Arrependimento",
      "Compras realizadas pelo site podem ser canceladas em até 7 dias corridos após o recebimento, desde que o produto esteja sem uso, em embalagem original e com todos os itens enviados.",
    ],
    [
      "Produto com avaria ou divergência",
      "Se o pedido chegar danificado, incompleto ou diferente do comprado, entre em contato assim que receber. Informe número do pedido, descrição do problema e imagens da embalagem e do produto.",
    ],
    [
      "Produtos alimentícios",
      "Por segurança e higiene, cafés e alimentos abertos, consumidos ou armazenados de forma inadequada não podem ser trocados por arrependimento. Casos de defeito ou divergência serão analisados pelo atendimento.",
    ],
    [
      "Custos de envio",
      "Quando a troca ou devolução ocorrer por erro da loja, avaria no transporte ou defeito confirmado, o custo de retorno será orientado pelo atendimento. Em outras situações, o cliente receberá as instruções aplicáveis ao caso.",
    ],
    [
      "Reembolso",
      "Após o recebimento e análise do produto devolvido, o reembolso será solicitado pelo mesmo meio de pagamento utilizado na compra, respeitando os prazos do provedor de pagamento e da instituição financeira.",
    ],
    [
      "Como solicitar",
      `Envie a solicitação por ${contact}, informando nome, e-mail, número do pedido e motivo do contato. O atendimento retornará com as próximas etapas.`,
    ],
  ];

  return (
    <section className="py-12 sm:py-20">
      <Container className="max-w-4xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green">
          Pós-venda
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-brand-brown sm:text-5xl">
          Trocas e devoluções
        </h1>
        <p className="mt-5 leading-7 text-brand-ink/60">
          Esta política resume como a {content.brand.name} trata solicitações de
          troca, devolução, arrependimento e reembolso. Última atualização: 5 de
          agosto de 2026.
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
          <h2 className="text-xl font-extrabold text-brand-cream">Contato</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Para solicitar atendimento, use{" "}
            {content.brand.email || "a página de contato da loja"}.
            {content.brand.cnpj ? ` CNPJ: ${content.brand.cnpj}.` : ""}
          </p>
        </div>
      </Container>
    </section>
  );
}
