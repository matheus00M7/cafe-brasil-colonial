"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, LockKeyhole, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type {
  CheckoutData,
  CheckoutSessionResponse,
} from "@/types/checkout";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { DeliveryOptions } from "./DeliveryOptions";
import { OrderSummary } from "./OrderSummary";
import { PaymentBrick } from "./PaymentBrick";
import Link from "next/link";

const initialData: CheckoutData = {
  fullName: "",
  whatsapp: "",
  email: "",
  cpf: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  deliveryMethod: "correios",
  notes: "",
};

const required: Array<keyof CheckoutData> = [
  "fullName",
  "whatsapp",
  "email",
  "cep",
  "street",
  "number",
  "neighborhood",
  "city",
  "state",
];

export function CheckoutForm({
  initialData: suppliedInitialData,
  signedIn = false,
}: {
  initialData?: CheckoutData;
  signedIn?: boolean;
}) {
  const { items, subtotal, hydrated } = useCart();
  const [data, setData] = useState(suppliedInitialData || initialData);
  const [session, setSession] = useState<CheckoutSessionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutData, string>>
  >({});

  const setField = <K extends keyof CheckoutData>(
    field: K,
    value: CheckoutData[K],
  ) => {
    setData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof CheckoutData, string>> = {};
    required.forEach((field) => {
      if (!String(data[field]).trim()) {
        nextErrors[field] = "Preencha este campo.";
      }
    });
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }
    if (data.cep && data.cep.replace(/\D/g, "").length !== 8) {
      nextErrors.cep = "Informe um CEP válido.";
    }
    if (data.cpf && data.cpf.replace(/\D/g, "").length !== 11) {
      nextErrors.cpf = "Informe um CPF válido.";
    }
    if (data.state && data.state.length !== 2) {
      nextErrors.state = "Use a sigla com 2 letras.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!items.length || !validate()) return;

    setSubmitting(true);
    setServerError("");
    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: data,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
      const payload = (await response.json()) as CheckoutSessionResponse & {
        error?: string;
        redirectUrl?: string;
      };

      if (response.status === 401 && payload.redirectUrl) {
        window.location.href = payload.redirectUrl;
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Não foi possível criar o pedido.");
      }
      setSession(payload);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return <div className="h-80 animate-pulse rounded-4xl bg-brand-mist" />;
  }

  if (!items.length) {
    return (
      <div className="rounded-4xl border border-dashed border-brand-brown/20 bg-white p-12 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-brand-brown/30" />
        <h2 className="mt-5 text-2xl font-extrabold text-brand-brown">
          Adicione produtos antes de finalizar
        </h2>
        <p className="mt-3 text-brand-ink/60">
          Seu pedido aparecerá aqui com quantidades e valores.
        </p>
        <Button href="/produtos" className="mt-7">
          Ver cafés
        </Button>
      </div>
    );
  }

  if (session) {
    return (
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_390px]">
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setSession(null)}
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-brown hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Corrigir dados de entrega
          </button>
          <div className="rounded-3xl border border-brand-green/20 bg-brand-green/5 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-green">
              Pedido {session.orderNumber}
            </p>
            <p className="mt-2 text-sm leading-6 text-brand-ink/65">
              Dados conferidos. Agora escolha a forma de pagamento e conclua a
              compra sem sair do site.
            </p>
          </div>
          <PaymentBrick orderId={session.orderId} amount={session.total} />
        </div>
        <OrderSummary
          items={items}
          subtotal={session.subtotal}
          shipping={session.shipping}
          total={session.total}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid items-start gap-8 lg:grid-cols-[1fr_390px]"
    >
      <div className="space-y-7">
        <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-extrabold text-brand-brown">
            Dados do cliente
          </h2>
          {signedIn ? (
            <p className="mt-2 text-sm font-bold text-brand-green">
              Seus dados salvos foram preenchidos automaticamente.
            </p>
          ) : (
            <p className="mt-2 text-sm text-brand-ink/55">
              <Link
                href="/entrar"
                className="font-extrabold text-brand-green hover:underline"
              >
                Entre na sua conta
              </Link>{" "}
              para salvar os dados e acompanhar o pedido pelo painel.
            </p>
          )}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Input
              label="Nome completo *"
              value={data.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
              error={errors.fullName}
              placeholder="Seu nome"
            />
            <Input
              label="WhatsApp *"
              value={data.whatsapp}
              onChange={(event) => setField("whatsapp", event.target.value)}
              error={errors.whatsapp}
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
            <Input
              label="E-mail *"
              value={data.email}
              onChange={(event) => setField("email", event.target.value)}
              error={errors.email}
              placeholder="voce@email.com"
              type="email"
              readOnly={signedIn}
            />
            <Input
              label="CPF"
              value={data.cpf}
              onChange={(event) => setField("cpf", event.target.value)}
              error={errors.cpf}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </div>
        </section>

        <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-extrabold text-brand-brown">
            Endereço
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-6">
            <Input
              label="CEP *"
              value={data.cep}
              onChange={(event) => setField("cep", event.target.value)}
              error={errors.cep}
              className="sm:col-span-2"
              placeholder="00000-000"
              inputMode="numeric"
            />
            <Input
              label="Rua *"
              value={data.street}
              onChange={(event) => setField("street", event.target.value)}
              error={errors.street}
              className="sm:col-span-4"
              placeholder="Nome da rua"
            />
            <Input
              label="Número *"
              value={data.number}
              onChange={(event) => setField("number", event.target.value)}
              error={errors.number}
              className="sm:col-span-2"
              placeholder="123"
            />
            <Input
              label="Complemento"
              value={data.complement}
              onChange={(event) => setField("complement", event.target.value)}
              className="sm:col-span-4"
              placeholder="Apto, bloco, referência"
            />
            <Input
              label="Bairro *"
              value={data.neighborhood}
              onChange={(event) => setField("neighborhood", event.target.value)}
              error={errors.neighborhood}
              className="sm:col-span-3"
            />
            <Input
              label="Cidade *"
              value={data.city}
              onChange={(event) => setField("city", event.target.value)}
              error={errors.city}
              className="sm:col-span-2"
            />
            <Input
              label="UF *"
              value={data.state}
              onChange={(event) =>
                setField("state", event.target.value.toUpperCase().slice(0, 2))
              }
              error={errors.state}
              className="sm:col-span-1"
              maxLength={2}
              placeholder="MG"
            />
          </div>
        </section>

        <section className="space-y-8 rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
          <DeliveryOptions
            value={data.deliveryMethod}
            onChange={(value) => setField("deliveryMethod", value)}
          />
          <Textarea
            label="Observações"
            value={data.notes}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="Ex.: referência de entrega, instruções para o endereço..."
          />
        </section>

        {Object.keys(errors).length > 0 && (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            Revise os campos destacados antes de continuar.
          </p>
        )}
        {serverError && (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {serverError}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          variant="green"
          className="w-full"
          disabled={submitting}
        >
          <LockKeyhole className="h-5 w-5" />
          {submitting ? "Preparando pagamento..." : "Continuar para pagamento"}
        </Button>
        <p className="text-center text-xs leading-5 text-brand-ink/50">
          O servidor confere produtos, preços e entrega antes de abrir as formas
          de pagamento. Dados de cartão não são armazenados pela loja.
        </p>
      </div>
      <OrderSummary items={items} subtotal={subtotal} />
    </form>
  );
}
