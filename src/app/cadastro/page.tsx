import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Database, ShieldCheck, ShoppingBag } from "lucide-react";
import { AccountAuthForm } from "@/components/account/AccountAuthForm";
import { Container } from "@/components/ui/Container";
import { getCustomerSession } from "@/lib/customer-auth";
import { normalizeCustomerRedirect } from "@/lib/customer-redirect";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta para acompanhar pedidos e salvar seus dados.",
  robots: { index: false, follow: false },
};

const oauthErrorMessage = (value?: string | string[]) => {
  const code = Array.isArray(value) ? value[0] : value;
  if (!code) return "";
  if (code === "oauth_config") {
    return "Login com Google/Apple ainda não foi configurado na Vercel.";
  }
  if (code === "oauth_email") {
    return "Não foi possível confirmar o e-mail dessa conta.";
  }
  if (code === "oauth_denied") {
    return "Cadastro cancelado. Tente novamente quando quiser.";
  }
  return "Não foi possível criar a conta com esse provedor. Tente novamente.";
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{
    redirect?: string | string[];
    oauth_error?: string | string[];
  }>;
}) {
  const { redirect: redirectParam, oauth_error: oauthError } =
    await searchParams;
  const redirectTo = normalizeCustomerRedirect(redirectParam);

  if (await getCustomerSession()) redirect(redirectTo);
  return (
    <section className="py-12 sm:py-20">
      <Container className="grid items-start gap-8 lg:grid-cols-[1fr_540px]">
        <div className="max-w-xl pt-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green">
            Cadastro seguro
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-brand-brown sm:text-6xl">
            Crie sua conta
          </h1>
          <div className="mt-8 space-y-4">
            {[
              [ShoppingBag, "Acompanhe todos os pedidos e entregas."],
              [Database, "Salve seus dados para os próximos checkouts."],
              [
                ShieldCheck,
                "Dados criptografados e cartão protegido pelo Mercado Pago.",
              ],
            ].map(([Icon, text]) => (
              <div
                key={String(text)}
                className="flex items-center gap-3 rounded-2xl bg-white/70 p-4"
              >
                <Icon className="h-5 w-5 text-brand-green" />
                <p className="text-sm font-bold text-brand-ink/65">
                  {String(text)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-4xl border border-brand-brown/10 bg-white p-7 shadow-soft sm:p-10">
          <h2 className="text-3xl font-extrabold text-brand-brown">
            Seus dados de acesso
          </h2>
          <p className="mb-7 mt-2 text-sm text-brand-ink/55">
            O cadastro leva menos de um minuto.
          </p>
          <AccountAuthForm
            mode="signup"
            redirectTo={redirectTo}
            initialError={oauthErrorMessage(oauthError)}
          />
        </div>
      </Container>
    </section>
  );
}
