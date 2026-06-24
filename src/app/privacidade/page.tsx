import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getSiteContent } from "@/lib/orders-db";

export const metadata: Metadata = {
  title: "Privacidade e segurança",
  description:
    "Entenda como os dados dos clientes são utilizados e protegidos.",
};

export default async function PrivacyPage() {
  const content = await getSiteContent();
  const sections = [
    [
      "Dados que utilizamos",
      "Nome, e-mail, telefone, CPF quando necessário, endereço, informações do pedido e registros técnicos de segurança. A loja não recebe nem armazena número completo, validade ou CVV do cartão.",
    ],
    [
      "Para que os dados são usados",
      "Criar e entregar pedidos, processar pagamentos, oferecer a área do cliente, prestar atendimento, prevenir fraude e cumprir obrigações comerciais e legais.",
    ],
    [
      "Pagamento",
      "Os dados do cartão são preenchidos em componentes protegidos do Mercado Pago. A loja recebe apenas identificadores e o resultado necessário para acompanhar a cobrança.",
    ],
    [
      "Proteção",
      "As senhas são transformadas por scrypt, os dados pessoais armazenados pela aplicação são criptografados e as sessões utilizam cookies HttpOnly. O acesso administrativo e as integrações utilizam credenciais mantidas somente no servidor.",
    ],
    [
      "Compartilhamento",
      "Os dados são compartilhados somente com serviços necessários à operação, como Mercado Pago, banco de dados, hospedagem, envio de e-mail e transportadora, dentro da finalidade do pedido.",
    ],
    [
      "Seus controles",
      "Na área do cliente você pode consultar pedidos, corrigir seus dados e alterar a senha. Solicitações de acesso, correção ou exclusão podem ser encaminhadas pelo canal de contato da loja.",
    ],
    [
      "Retenção",
      "Os dados são mantidos durante o período necessário para fornecer o serviço, proteger as contas e atender obrigações fiscais, contábeis e legais. Sessões e links de recuperação possuem prazo de expiração.",
    ],
  ];
  return (
    <section className="py-12 sm:py-20">
      <Container className="max-w-4xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green">
          Transparência
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-brand-brown sm:text-5xl">
          Privacidade e segurança
        </h1>
        <p className="mt-5 leading-7 text-brand-ink/60">
          Esta página explica de forma simples como {content.brand.name} trata
          os dados utilizados no site. Última atualização: 23 de junho de 2026.
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
            Para assuntos de privacidade, utilize{" "}
            {content.brand.email || "o formulário da página de contato"}.
            {content.brand.cnpj ? ` CNPJ: ${content.brand.cnpj}.` : ""}
          </p>
        </div>
      </Container>
    </section>
  );
}
