"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ExternalLink,
  FileText,
  LockKeyhole,
  QrCode,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { PaymentResult } from "@/types/checkout";

type PaymentPayer = {
  fullName: string;
  email: string;
  cpf: string;
};

type DirectPaymentMethod = "pix" | "ticket";

const onlyDigits = (value = "") => value.replace(/\D/g, "");

const buildPayerPayload = (payer?: PaymentPayer) => {
  if (!payer) return undefined;

  const cpf = onlyDigits(payer.cpf);

  return {
    email: payer.email.trim() || undefined,
    identification:
      cpf.length === 11
        ? {
            type: "CPF",
            number: cpf,
          }
        : undefined,
  };
};

export function PaymentBrick({
  orderId,
  amount,
  fallbackCheckoutUrl,
  payer,
}: {
  orderId: string;
  amount: number;
  preferenceId?: string;
  fallbackCheckoutUrl?: string;
  payer?: PaymentPayer;
}) {
  const router = useRouter();
  const { clearCart } = useCart();
  const [loadingMethod, setLoadingMethod] = useState<DirectPaymentMethod | null>(
    null,
  );
  const [error, setError] = useState("");
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || "";
  const isTestMode = publicKey.startsWith("TEST-");
  const cleanCpf = onlyDigits(payer?.cpf);

  const saveOrderAccess = () => {
    if (cleanCpf.length === 11) {
      window.sessionStorage.setItem(`cbc_order_access_${orderId}`, cleanCpf);
    }
  };

  const submitDirectPayment = async (method: DirectPaymentMethod) => {
    setLoadingMethod(method);
    setError("");

    try {
      const paymentAttemptId = window.crypto.randomUUID();
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentAttemptId,
          formData:
            method === "pix"
              ? {
                  payment_method_id: "pix",
                  payment_type_id: "bank_transfer",
                  transaction_amount: amount,
                  payer: buildPayerPayload(payer),
                }
              : {
                  payment_method_id: "bolbradesco",
                  payment_type_id: "ticket",
                  transaction_amount: amount,
                  payer: buildPayerPayload(payer),
                },
        }),
      });
      const payload = (await response.json()) as PaymentResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || "Não foi possível criar este pagamento.",
        );
      }

      if (payload.status !== "rejected") {
        saveOrderAccess();
        clearCart();
      }

      router.push(payload.redirectUrl);
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Não foi possível criar este pagamento.",
      );
    } finally {
      setLoadingMethod(null);
    }
  };

  const openCardCheckout = () => {
    if (!fallbackCheckoutUrl) return;
    saveOrderAccess();
    window.location.href = fallbackCheckoutUrl;
  };

  if (!publicKey) {
    return (
      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
        <h3 className="font-extrabold">Falta configurar o Mercado Pago</h3>
        <p className="mt-2 text-sm leading-6">
          Adicione a Public Key em{" "}
          <code className="rounded bg-amber-100 px-1.5 py-1">
            NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
          </code>{" "}
          e o Access Token no servidor.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-4xl border border-brand-brown/10 bg-white p-5 shadow-card sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-2xl bg-brand-cream p-3 text-brand-brown">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-brand-brown">
            Escolha o pagamento
          </h2>
          <p className="mt-1 text-sm leading-6 text-brand-ink/55">
            Gere Pix ou boleto direto no site, ou pague com cartão no ambiente
            seguro do Mercado Pago.
          </p>
        </div>
      </div>

      {isTestMode && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p className="font-extrabold">Mercado Pago em modo teste</p>
          <p>
            Pagamentos reais só vão funcionar depois que as credenciais de
            produção forem colocadas na Vercel.
          </p>
        </div>
      )}

      {error && (
        <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => void submitDirectPayment("pix")}
          disabled={Boolean(loadingMethod)}
          className="inline-flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-brand-green px-4 py-4 text-center text-sm font-extrabold text-white transition hover:bg-brand-green/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <QrCode className="h-6 w-6" />
          {loadingMethod === "pix" ? "Gerando Pix..." : "Pagar com Pix"}
        </button>

        <button
          type="button"
          onClick={() => void submitDirectPayment("ticket")}
          disabled={Boolean(loadingMethod)}
          className="inline-flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-brand-brown/15 bg-brand-cream/35 px-4 py-4 text-center text-sm font-extrabold text-brand-brown transition hover:bg-brand-mist disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FileText className="h-6 w-6" />
          {loadingMethod === "ticket" ? "Gerando boleto..." : "Pagar com boleto"}
        </button>

        <button
          type="button"
          onClick={openCardCheckout}
          disabled={!fallbackCheckoutUrl || Boolean(loadingMethod)}
          className="inline-flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-brand-brown/15 bg-white px-4 py-4 text-center text-sm font-extrabold text-brand-brown transition hover:bg-brand-mist disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ExternalLink className="h-6 w-6" />
          {fallbackCheckoutUrl ? "Pagar com cartão" : "Cartão indisponível"}
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-brand-ink/45">
        <LockKeyhole className="h-4 w-4 text-brand-green" />
        Ambiente protegido. A loja não armazena os dados do cartão.
      </div>
    </div>
  );
}
