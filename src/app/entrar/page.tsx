import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AccountAuthForm } from "@/components/account/AccountAuthForm";
import { Container } from "@/components/ui/Container";
import { getCustomerSession } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta e acompanhe seus pedidos.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getCustomerSession()) redirect("/minha-conta");
  return (
    <section className="py-12 sm:py-20">
      <Container className="grid items-start gap-8 lg:grid-cols-[1fr_520px]">
        <div className="max-w-xl pt-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green">
            Área do cliente
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-brand-brown sm:text-6xl">
            Seus pedidos em um só lugar
          </h1>
          <p className="mt-5 leading-7 text-brand-ink/60">
            Acompanhe pagamentos e entregas, consulte compras anteriores e
            reutilize seus dados nos próximos pedidos.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-3xl border border-brand-green/20 bg-brand-green/5 p-5">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-brand-green" />
            <p className="text-sm leading-6 text-brand-ink/65">
              Senhas protegidas, sessão segura e dados pessoais criptografados.
              Os números do cartão nunca são armazenados pela loja.
            </p>
          </div>
        </div>
        <div className="rounded-4xl border border-brand-brown/10 bg-white p-7 shadow-soft sm:p-10">
          <h2 className="text-3xl font-extrabold text-brand-brown">Entrar</h2>
          <p className="mb-7 mt-2 text-sm text-brand-ink/55">
            Use o e-mail e a senha cadastrados.
          </p>
          <AccountAuthForm mode="login" />
        </div>
      </Container>
    </section>
  );
}
