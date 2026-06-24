import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCustomerSession } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Finalizar pedido",
  description:
    "Preencha os dados de entrega e pague seu pedido do Café Brasil Colonial com segurança.",
};

export default async function CheckoutPage() {
  const session = await getCustomerSession();
  const account = session?.account;
  return (
    <section className="py-12 sm:py-20">
      <Container>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green">
          Checkout
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-brand-brown sm:text-5xl">
          Finalizar pedido
        </h1>
        <p className="mb-9 mt-4 max-w-2xl leading-7 text-brand-ink/60">
          Preencha seus dados, escolha a entrega e conclua o pagamento por Pix,
          cartão ou boleto sem sair do site.
        </p>
        <CheckoutForm
          signedIn={Boolean(account)}
          initialData={
            account
              ? {
                  fullName: account.profile.fullName,
                  whatsapp: account.profile.whatsapp,
                  email: account.email,
                  cpf: account.profile.cpf,
                  cep: account.address.cep,
                  street: account.address.street,
                  number: account.address.number,
                  complement: account.address.complement,
                  neighborhood: account.address.neighborhood,
                  city: account.address.city,
                  state: account.address.state,
                  deliveryMethod: "correios",
                  notes: "",
                }
              : undefined
          }
        />
      </Container>
    </section>
  );
}
