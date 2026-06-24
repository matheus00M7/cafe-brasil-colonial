import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Redefinir senha",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return (
    <section className="py-12 sm:py-20">
      <Container className="max-w-xl">
        <div className="rounded-4xl border border-brand-brown/10 bg-white p-7 shadow-soft sm:p-10">
          <h1 className="text-3xl font-extrabold text-brand-brown">
            Criar nova senha
          </h1>
          <p className="mb-7 mt-3 text-sm text-brand-ink/55">
            O link é válido por 30 minutos e funciona apenas uma vez.
          </p>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              O link está incompleto.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
