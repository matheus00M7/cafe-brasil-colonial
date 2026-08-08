"use client";

import { useState } from "react";
import { ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

type PaymentPayer = {
  fullName: string;
  email: string;
  cpf: string;
};

const onlyDigits = (value = "") => value.replace(/\D/g, "");

export function PaymentBrick({
  orderId,
  checkoutUrl,
  environment,
  payer,
}: {
  orderId: string;
  checkoutUrl: string;
  environment: "test" | "production";
  payer?: PaymentPayer;
}) {
  const { clearCart } = useCart();
  const [redirecting, setRedirecting] = useState(false);
  const cleanCpf = onlyDigits(payer?.cpf);

  const goToMercadoPago = () => {
    setRedirecting(true);
    if (cleanCpf.length === 11) {
      window.sessionStorage.setItem(`cbc_order_access_${orderId}`, cleanCpf);
    }
    clearCart();
    window.location.assign(checkoutUrl);
  };

  return (
    <div className="rounded-4xl border border-brand-brown/10 bg-white p-5 shadow-card sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-2xl bg-brand-cream p-3 text-brand-brown">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-brand-brown">
            Pagamento seguro
          </h2>
          <p className="mt-1 text-sm leading-6 text-brand-ink/55">
            Finalize no Mercado Pago e escolha Pix, cartão, boleto ou outros
            meios disponíveis para a sua conta.
          </p>
        </div>
      </div>

      {environment === "test" && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p className="font-extrabold">Mercado Pago em modo teste</p>
          <p>
            Esta compra usa ambiente de teste. Para receber pagamentos reais,
            coloque as credenciais de produção na Vercel.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={goToMercadoPago}
        disabled={redirecting}
        className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-brand-green px-5 py-4 text-center text-base font-extrabold text-white transition hover:bg-brand-green/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {redirecting ? "Abrindo Mercado Pago..." : "Pagar com Mercado Pago"}
        <ExternalLink className="h-5 w-5" />
      </button>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-brand-ink/45">
        <LockKeyhole className="h-4 w-4 text-brand-green" />
        A loja não armazena dados de cartão. A cobrança acontece no Mercado
        Pago.
      </div>
    </div>
  );
}
