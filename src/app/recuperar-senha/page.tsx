import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ForgotPasswordForm } from "@/components/account/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar senha",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <section className="py-12 sm:py-20">
      <Container className="max-w-xl">
        <div className="rounded-4xl border border-brand-brown/10 bg-white p-7 shadow-soft sm:p-10">
          <h1 className="text-3xl font-extrabold text-brand-brown">
            Recuperar senha
          </h1>
          <p className="mb-7 mt-3 text-sm leading-6 text-brand-ink/55">
            Enviaremos um link temporário para o e-mail da conta.
          </p>
          <ForgotPasswordForm />
        </div>
      </Container>
    </section>
  );
}
