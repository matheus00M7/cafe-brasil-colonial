"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { CreditCard, LockKeyhole, RefreshCw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { PaymentResult } from "@/types/checkout";

type BrickController = {
  unmount: () => void;
};

type MercadoPagoInstance = {
  bricks: () => {
    create: (
      type: "payment" | "cardPayment",
      containerId: string,
      settings: Record<string, unknown>,
    ) => Promise<BrickController>;
  };
};

declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options: { locale: string },
    ) => MercadoPagoInstance;
  }
}

export function PaymentBrick({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  const router = useRouter();
  const { clearCart } = useCart();
  const controllerRef = useRef<BrickController | null>(null);
  const mountedRef = useRef(false);
  const brickReadyRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [brickReady, setBrickReady] = useState(false);
  const [brickVersion, setBrickVersion] = useState(0);
  const [error, setError] = useState("");
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || "";

  useEffect(() => {
    if (
      !scriptReady ||
      !publicKey ||
      !window.MercadoPago ||
      mountedRef.current
    ) {
      return;
    }

    mountedRef.current = true;
    const mercadoPago = new window.MercadoPago(publicKey, { locale: "pt-BR" });

    const mountBrick = async () => {
      try {
        controllerRef.current = await mercadoPago.bricks().create(
          "payment",
          "mercado-pago-payment-brick",
          {
            initialization: { amount },
            customization: {
              visual: {
                style: {
                  theme: "default",
                  customVariables: {
                    baseColor: "#632413",
                    baseColorFirstVariant: "#4d1a0e",
                    baseColorSecondVariant: "#FADAAD",
                    borderRadiusSmall: "12px",
                    borderRadiusMedium: "16px",
                    borderRadiusLarge: "22px",
                    fontSizeExtraSmall: "12px",
                    fontSizeSmall: "14px",
                    fontSizeMedium: "16px",
                    fontSizeLarge: "20px",
                    fontSizeExtraLarge: "24px",
                    fontWeightNormal: "500",
                    fontWeightSemiBold: "700",
                    formBackgroundColor: "#ffffff",
                    inputBackgroundColor: "#ffffff",
                  },
                },
              },
              paymentMethods: {
                creditCard: "all",
                debitCard: "all",
                bankTransfer: "all",
                ticket: "all",
                maxInstallments: 12,
              },
            },
            callbacks: {
              onReady: () => {
                brickReadyRef.current = true;
                setBrickReady(true);
                setError("");
              },
              onSubmit: async ({
                formData,
              }: {
                formData: Record<string, unknown>;
              }) => {
                setError("");
                const paymentAttemptId = window.crypto.randomUUID();
                const response = await fetch("/api/payments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId,
                    paymentAttemptId,
                    formData,
                  }),
                });
                const payload = (await response.json()) as PaymentResult & {
                  error?: string;
                };

                if (!response.ok) {
                  const message =
                    payload.error || "Não foi possível processar o pagamento.";
                  setError(message);
                  throw new Error(message);
                }

                if (payload.status !== "rejected") clearCart();
                router.push(payload.redirectUrl);
              },
              onError: (brickError: unknown) => {
                // O Brick também usa este callback para avisos recuperáveis de
                // validação. Não use console.error aqui: o Next transforma isso
                // em uma tela de erro durante o desenvolvimento.
                console.warn("Aviso do formulário do Mercado Pago:", brickError);
                if (!brickReadyRef.current) {
                  setError(
                    "O Mercado Pago demorou para carregar. Recarregue as formas de pagamento.",
                  );
                }
              },
            },
          },
        );
      } catch (mountError) {
        console.warn("Não foi possível montar o Payment Brick:", mountError);
        setError(
          "Não foi possível iniciar o pagamento. Recarregue as formas de pagamento.",
        );
      }
    };

    void mountBrick();
    return () => {
      controllerRef.current?.unmount();
      controllerRef.current = null;
      mountedRef.current = false;
      brickReadyRef.current = false;
    };
  }, [
    amount,
    brickVersion,
    clearCart,
    orderId,
    publicKey,
    router,
    scriptReady,
  ]);

  const reloadBrick = () => {
    setError("");
    setBrickReady(false);
    brickReadyRef.current = false;
    setBrickVersion((version) => version + 1);
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
          e o Access Token no servidor. Use primeiro as credenciais de teste.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div className="rounded-4xl border border-brand-brown/10 bg-white p-5 shadow-card sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-2xl bg-brand-cream p-3 text-brand-brown">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-brand-brown">
              Pagamento seguro
            </h2>
            <p className="mt-1 text-sm leading-6 text-brand-ink/55">
              Escolha Pix, cartão ou boleto. Os dados sensíveis são protegidos
              pelo Mercado Pago.
            </p>
          </div>
        </div>

        {!brickReady && !error && (
          <div className="mb-4 animate-pulse rounded-2xl bg-brand-mist p-5 text-sm font-bold text-brand-brown/60">
            Carregando formas de pagamento...
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={reloadBrick}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-extrabold transition hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar pagamento
            </button>
          </div>
        )}
        <div id="mercado-pago-payment-brick" />
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-brand-ink/45">
          <LockKeyhole className="h-4 w-4 text-brand-green" />
          Ambiente protegido. A loja não armazena os dados do cartão.
        </div>
      </div>
    </>
  );
}
