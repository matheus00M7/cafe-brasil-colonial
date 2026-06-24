"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
  RefreshCw,
} from "lucide-react";
import type {
  SubscriptionAddress,
  SubscriptionCustomer,
  SubscriptionGrind,
  SubscriptionOption,
  SubscriptionPlan,
} from "@/types/subscription";
import { formatCurrency } from "@/lib/formatCurrency";

type MercadoPagoCardFormData = {
  token?: string;
  paymentMethodId?: string;
};

type MercadoPagoCardForm = {
  getCardFormData: () => MercadoPagoCardFormData;
  unmount?: () => void;
};

type MercadoPagoInstance = {
  cardForm: (options: {
    amount: string;
    iframe: boolean;
    form: {
      id: string;
      cardNumber: { id: string; placeholder: string };
      expirationDate: { id: string; placeholder: string };
      securityCode: { id: string; placeholder: string };
      cardholderName: { id: string; placeholder: string };
      issuer: { id: string; placeholder: string };
      installments: { id: string; placeholder: string };
      identificationType: { id: string; placeholder: string };
      identificationNumber: { id: string; placeholder: string };
      cardholderEmail: { id: string; placeholder: string };
    };
    callbacks: {
      onFormMounted: (error?: unknown) => void;
      onSubmit: (event: SubmitEvent) => void;
      onCardTokenReceived: (error?: unknown) => void;
    };
  }) => MercadoPagoCardForm;
};

type MercadoPagoConstructor = new (
  publicKey: string,
  options: { locale: string },
) => MercadoPagoInstance;

const emptyCustomer: SubscriptionCustomer = {
  fullName: "",
  email: "",
  cpf: "",
  whatsapp: "",
};

const emptyAddress: SubscriptionAddress = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-brand-brown/15 bg-white px-4 outline-none focus:border-brand-green";

const secureFieldClass =
  "mt-2 h-12 overflow-hidden rounded-2xl border border-brand-brown/15 bg-white px-4 py-3 focus-within:border-brand-green";

const mercadoPagoErrorText = (paymentError: unknown) =>
  String(
    paymentError instanceof Error
      ? paymentError.message
      : typeof paymentError === "string"
        ? paymentError
        : JSON.stringify(paymentError) || "",
  ).toLowerCase();

const mercadoPagoErrorDetail = (paymentError: unknown) => {
  if (paymentError instanceof Error) return paymentError.message;
  if (typeof paymentError === "string") return paymentError;
  if (paymentError && typeof paymentError === "object") {
    const payload = paymentError as {
      message?: string;
      error?: string;
      cause?: Array<{ description?: string; code?: string | number }>;
    };
    const cause = payload.cause?.[0];
    return [
      cause?.code ? `Código ${cause.code}` : "",
      cause?.description || payload.message || payload.error || "",
    ]
      .filter(Boolean)
      .join(": ");
  }
  return "";
};

const mercadoPagoErrorMessage = (paymentError: unknown) => {
  const normalized = mercadoPagoErrorText(paymentError);
  if (
    normalized.includes("unauthorized") ||
    normalized.includes("not authorized") ||
    normalized.includes("não autorizou") ||
    normalized.includes("policy")
  ) {
    return "O Mercado Pago não autorizou a aplicação a criar esta assinatura. Confirme as credenciais da mesma aplicação, reinicie o site e tente novamente.";
  }
  if (
    normalized.includes("card token") ||
    normalized.includes("token service") ||
    normalized.includes("serviço de token") ||
    normalized.includes("service not found")
  ) {
    return "O token do cartão foi criado em um ambiente diferente do usado pela assinatura. Reinicie o site e confirme que a Public Key e o Access Token são ambos de teste e pertencem à mesma aplicação.";
  }
  if (
    normalized.includes("identification") ||
    normalized.includes("document")
  ) {
    return "O Mercado Pago recusou o CPF do titular. No teste aprovado use o titular APRO e o CPF 12345678909.";
  }
  if (normalized.includes("expiration")) {
    return "A validade do cartão foi recusada. Para o cartão oficial de teste use 11/30.";
  }
  if (
    normalized.includes("security") ||
    normalized.includes("cvv")
  ) {
    return "O código de segurança foi recusado. Para o cartão oficial de teste use CVV 123.";
  }

  return "Não foi possível validar o cartão. Confira número, validade, CVV, titular e CPF.";
};

export function SubscriptionCheckout({
  plan,
  option,
  frequencyMonths,
  grind,
  initialCustomer,
  initialAddress,
  signedIn = false,
}: {
  plan: SubscriptionPlan;
  option: SubscriptionOption;
  frequencyMonths: number;
  grind: SubscriptionGrind;
  initialCustomer?: SubscriptionCustomer;
  initialAddress?: SubscriptionAddress;
  signedIn?: boolean;
}) {
  const router = useRouter();
  const [customer, setCustomer] = useState(initialCustomer || emptyCustomer);
  const [address, setAddress] = useState(initialAddress || emptyAddress);
  const [cardholderName, setCardholderName] = useState("");
  const [cardholderCpf, setCardholderCpf] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [fieldsReady, setFieldsReady] = useState(false);
  const [fieldsVersion, setFieldsVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const cardForm = useRef<MercadoPagoCardForm | null>(null);
  const submitSubscriptionRef = useRef<
    (cardTokenId: string, paymentMethodId?: string) => Promise<void>
  >(async () => {});
  const mounted = useRef(false);
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || "";
  const isTestMode = publicKey.startsWith("TEST-");

  useEffect(() => {
    const MercadoPago = (
      window as unknown as {
        MercadoPago?: MercadoPagoConstructor;
      }
    ).MercadoPago;
    if (!scriptReady || !publicKey || !MercadoPago || mounted.current) {
      return;
    }
    mounted.current = true;
    const mp = new MercadoPago(publicKey, { locale: "pt-BR" });
    let currentCardForm: MercadoPagoCardForm | null = null;
    try {
      currentCardForm = mp.cardForm({
        amount: option.amount.toFixed(2),
        iframe: true,
        form: {
          id: "subscription-card-form",
          cardNumber: {
            id: "subscription-card-number",
            placeholder: "Número do cartão",
          },
          expirationDate: {
            id: "subscription-expiration-date",
            placeholder: "MM/AA",
          },
          securityCode: {
            id: "subscription-security-code",
            placeholder: "CVV",
          },
          cardholderName: {
            id: "subscription-cardholder-name",
            placeholder: "Nome impresso no cartão",
          },
          issuer: {
            id: "subscription-card-issuer",
            placeholder: "Banco emissor",
          },
          installments: {
            id: "subscription-card-installments",
            placeholder: "1",
          },
          identificationType: {
            id: "subscription-identification-type",
            placeholder: "CPF",
          },
          identificationNumber: {
            id: "subscription-cardholder-cpf",
            placeholder: "Somente números",
          },
          cardholderEmail: {
            id: "subscription-cardholder-email",
            placeholder: "E-mail",
          },
        },
        callbacks: {
          onFormMounted: (mountError) => {
            if (mountError) {
              console.warn(
                "Não foi possível montar o formulário seguro do cartão:",
                mountError,
              );
              setError(mercadoPagoErrorMessage(mountError));
              setErrorDetail(mercadoPagoErrorDetail(mountError));
              return;
            }
            setFieldsReady(true);
          },
          onCardTokenReceived: (tokenError) => {
            if (!tokenError) return;
            console.warn(
              "Não foi possível gerar o token do cartão:",
              tokenError,
            );
            setError(
              `Falha na validação do cartão: ${mercadoPagoErrorMessage(
                tokenError,
              )}`,
            );
            setErrorDetail(mercadoPagoErrorDetail(tokenError));
            setSubmitting(false);
          },
          onSubmit: (event) => {
            event.preventDefault();
            const data = currentCardForm?.getCardFormData();
            if (!data?.token) {
              setError(
                "O Mercado Pago não devolveu o token do cartão. Confira os dados e recarregue o formulário.",
              );
              setSubmitting(false);
              return;
            }
            void submitSubscriptionRef.current(
              data.token,
              data.paymentMethodId,
            );
          },
        },
      });
      cardForm.current = currentCardForm;
    } catch (mountError) {
      console.warn(
        "Não foi possível iniciar o formulário seguro do cartão:",
        mountError,
      );
      setError(mercadoPagoErrorMessage(mountError));
      setErrorDetail(mercadoPagoErrorDetail(mountError));
    }

    return () => {
      currentCardForm?.unmount?.();
      cardForm.current = null;
      mounted.current = false;
    };
  }, [fieldsVersion, option.amount, publicKey, scriptReady]);

  const reloadFields = () => {
    cardForm.current?.unmount?.();
    cardForm.current = null;
    mounted.current = false;
    setFieldsReady(false);
    setError("");
    setErrorDetail("");
    setFieldsVersion((version) => version + 1);
  };

  const validateSubscription = () => {
    setError("");
    setErrorDetail("");
    const required = [
      customer.fullName,
      customer.email,
      customer.cpf,
      customer.whatsapp,
      address.cep,
      address.street,
      address.number,
      address.neighborhood,
      address.city,
      address.state,
      cardholderName,
      cardholderCpf,
    ];
    if (required.some((value) => !value.trim())) {
      setError(
        "Preencha seus dados, o endereço e o titular do cartão antes de assinar.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    if (!cardForm.current || !fieldsReady) {
      setError("O cartão seguro ainda não terminou de carregar.");
      return false;
    }
    if (cardholderCpf.replace(/\D/g, "").length !== 11) {
      setError("Informe um CPF válido com 11 números para o titular do cartão.");
      return false;
    }
    setSubmitting(true);
    return true;
  };

  const submitSubscription = async (
    cardTokenId: string,
    paymentMethodId?: string,
  ) => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          optionId: option.id,
          frequencyMonths,
          grind,
          customer,
          address,
          cardTokenId,
          paymentMethodId,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        code?: string;
        detail?: string;
        redirectUrl?: string;
      };
      if (!response.ok || !payload.redirectUrl) {
        const message =
          payload.error || "Não foi possível criar a assinatura.";
        throw new Error(
          payload.detail ? `${message} (${payload.detail})` : message,
        );
      }
      router.push(payload.redirectUrl);
    } catch (subscriptionError) {
      console.warn("Não foi possível criar a assinatura:", subscriptionError);
      setError(
        `O cartão foi validado, mas a assinatura foi recusada: ${mercadoPagoErrorMessage(
          subscriptionError,
        )}`,
      );
      setErrorDetail(mercadoPagoErrorDetail(subscriptionError));
    } finally {
      setSubmitting(false);
    }
  };
  submitSubscriptionRef.current = submitSubscription;

  const updateCustomer = (
    key: keyof SubscriptionCustomer,
    value: string,
  ) => setCustomer((current) => ({ ...current, [key]: value }));

  const updateAddress = (
    key: keyof SubscriptionAddress,
    value: string,
  ) => setAddress((current) => ({ ...current, [key]: value }));

  if (!publicKey) {
    return (
      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
        <h3 className="font-extrabold">Falta configurar o Mercado Pago</h3>
        <p className="mt-2 text-sm leading-6">
          Adicione a Public Key de teste e o Access Token da mesma aplicação,
          depois reinicie o site.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() =>
          setError(
            "Não foi possível carregar a conexão segura do Mercado Pago. Verifique a internet e recarregue a página.",
          )
        }
      />
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <form
          key={fieldsVersion}
          id="subscription-card-form"
          className="space-y-6"
          onSubmitCapture={(event) => {
            if (!validateSubscription()) event.preventDefault();
          }}
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              <p>{error}</p>
              {errorDetail && errorDetail !== error && (
                <p className="mt-2 break-words text-xs font-semibold text-red-600">
                  Detalhe do Mercado Pago: {errorDetail}
                </p>
              )}
              <button
                type="button"
                onClick={reloadFields}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-extrabold transition hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar cartão
              </button>
            </div>
          )}

          <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-2xl font-extrabold text-brand-brown">
              Seus dados
            </h2>
            <p className="mt-2 text-sm text-brand-ink/55">
              Usaremos essas informações para identificar a assinatura e
              preparar as entregas.
            </p>
            {signedIn && (
              <p className="mt-3 text-sm font-bold text-brand-green">
                Seus dados salvos foram preenchidos automaticamente.
              </p>
            )}
            {isTestMode && (
              <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
                Modo de teste: você pode informar seu e-mail normalmente. O
                servidor usa automaticamente o pagador fictício exigido pelo
                Mercado Pago. O código TESTUSER da conta de teste é apenas para
                entrar no Mercado Pago e não deve ser colocado neste campo.
              </div>
            )}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold sm:col-span-2">
                Nome completo
                <input
                  value={customer.fullName}
                  onChange={(event) =>
                    updateCustomer("fullName", event.target.value)
                  }
                  className={inputClass}
                  autoComplete="name"
                />
              </label>
              <label className="text-sm font-bold">
                E-mail
                <input
                  id="subscription-cardholder-email"
                  type="email"
                  value={customer.email}
                  onChange={(event) =>
                    updateCustomer("email", event.target.value)
                  }
                  className={inputClass}
                  autoComplete="email"
                  readOnly={signedIn}
                />
              </label>
              <label className="text-sm font-bold">
                CPF
                <input
                  value={customer.cpf}
                  onChange={(event) =>
                    updateCustomer("cpf", event.target.value)
                  }
                  className={inputClass}
                  inputMode="numeric"
                />
              </label>
              <label className="text-sm font-bold sm:col-span-2">
                WhatsApp
                <input
                  value={customer.whatsapp}
                  onChange={(event) =>
                    updateCustomer("whatsapp", event.target.value)
                  }
                  className={inputClass}
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>
            </div>
          </section>

          <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-2xl font-extrabold text-brand-brown">
              Endereço de entrega
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["cep", "CEP"],
                ["street", "Rua"],
                ["number", "Número"],
                ["complement", "Complemento"],
                ["neighborhood", "Bairro"],
                ["city", "Cidade"],
                ["state", "UF"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className={`text-sm font-bold ${
                    key === "street" ? "sm:col-span-2" : ""
                  }`}
                >
                  {label}
                  <input
                    value={address[key as keyof SubscriptionAddress]}
                    onChange={(event) =>
                      updateAddress(
                        key as keyof SubscriptionAddress,
                        event.target.value,
                      )
                    }
                    className={inputClass}
                    maxLength={key === "state" ? 2 : undefined}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-brand-cream p-3 text-brand-brown">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-brand-brown">
                  Cartão da assinatura
                </h2>
                <p className="mt-1 text-sm leading-6 text-brand-ink/55">
                  Uma cobrança por ciclo. Não existe parcelamento da
                  assinatura.
                </p>
              </div>
            </div>

            {!fieldsReady && !error && (
              <div className="mt-6 animate-pulse rounded-2xl bg-brand-mist p-5 text-sm font-bold text-brand-brown/60">
                Carregando cartão seguro...
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold sm:col-span-2">
                Número do cartão
                <div
                  id="subscription-card-number"
                  className={secureFieldClass}
                />
              </label>
              <label className="text-sm font-bold">
                Validade
                <div
                  id="subscription-expiration-date"
                  className={secureFieldClass}
                />
              </label>
              <label className="text-sm font-bold">
                CVV
                <div
                  id="subscription-security-code"
                  className={secureFieldClass}
                />
              </label>
              <label className="text-sm font-bold sm:col-span-2">
                Nome impresso no cartão
                <input
                  id="subscription-cardholder-name"
                  value={cardholderName}
                  onChange={(event) =>
                    setCardholderName(event.target.value.toUpperCase())
                  }
                  className={inputClass}
                  autoComplete="cc-name"
                />
              </label>
              <label className="text-sm font-bold sm:col-span-2">
                CPF do titular do cartão
                <input
                  id="subscription-cardholder-cpf"
                  value={cardholderCpf}
                  onChange={(event) =>
                    setCardholderCpf(
                      event.target.value.replace(/\D/g, "").slice(0, 11),
                    )
                  }
                  className={inputClass}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Somente números"
                />
              </label>
              <select
                id="subscription-card-issuer"
                aria-hidden="true"
                className="hidden"
                tabIndex={-1}
              />
              <select
                id="subscription-card-installments"
                aria-hidden="true"
                className="hidden"
                tabIndex={-1}
                defaultValue="1"
              >
                <option value="1">1</option>
              </select>
              <select
                id="subscription-identification-type"
                aria-hidden="true"
                className="hidden"
                tabIndex={-1}
                defaultValue="CPF"
              >
                <option value="CPF">CPF</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!fieldsReady || submitting}
              className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-7 text-base font-extrabold text-white shadow-lg shadow-brand-brown/15 transition hover:bg-[#4d1a0e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Autorizando assinatura...
                </>
              ) : (
                "Assinar com cobrança recorrente"
              )}
            </button>

            {isTestMode && (
              <details className="mt-5 rounded-2xl border border-brand-green/15 bg-brand-green/5 p-4 text-sm">
                <summary className="cursor-pointer font-extrabold text-brand-green">
                  Cartão oficial para testar
                </summary>
                <div className="mt-3 grid gap-1 text-brand-ink/65 sm:grid-cols-2">
                  <p>Número: 5031 4332 1540 6351</p>
                  <p>Validade: 11/30</p>
                  <p>CVV: 123</p>
                  <p>Titular: APRO</p>
                  <p>CPF: 12345678909</p>
                  <p className="sm:col-span-2">
                    O pagador fictício da API é aplicado automaticamente no
                    modo de teste.
                  </p>
                </div>
              </details>
            )}
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-brand-ink/45">
              <LockKeyhole className="h-4 w-4 text-brand-green" />
              Os campos do cartão são protegidos pelo Mercado Pago.
            </p>
          </section>
        </form>

        <aside className="sticky top-28 rounded-4xl bg-brand-brown p-6 text-white shadow-soft sm:p-8">
          <PackageCheck className="h-8 w-8 text-brand-cream" />
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-cream">
            Sua assinatura
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">{plan.name}</h1>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
              <span className="text-white/55">Café</span>
              <span className="text-right font-bold">{option.coffee}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
              <span className="text-white/55">Quantidade</span>
              <span className="font-bold">{option.quantity}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
              <span className="text-white/55">Moagem</span>
              <span className="text-right font-bold">{grind}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/55">Frequência</span>
              <span className="font-bold">
                {frequencyMonths === 1 ? "Mensal" : "Bimestral"}
              </span>
            </div>
          </div>
          <div className="mt-7 border-t border-white/15 pt-6">
            <p className="text-sm text-white/55">Cobrança recorrente</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-cream">
              {formatCurrency(option.amount)}
            </p>
            <p className="mt-1 text-xs text-white/45">
              a cada {frequencyMonths === 1 ? "mês" : "2 meses"}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
