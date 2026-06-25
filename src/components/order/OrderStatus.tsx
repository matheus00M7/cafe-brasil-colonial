"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  PackageCheck,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { PublicOrder } from "@/types/order";
import { formatCurrency } from "@/lib/formatCurrency";
import { fulfillmentStatusLabels } from "@/lib/order-labels";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const finalStatuses = new Set([
  "approved",
  "rejected",
  "cancelled",
  "refunded",
  "charged_back",
]);

const statusContent = {
  approved: {
    title: "Pagamento aprovado",
    description:
      "Recebemos o pagamento. O pedido agora segue para separação e envio.",
    icon: CheckCircle2,
    color: "text-brand-green",
    panel: "border-brand-green/20 bg-brand-green/5",
  },
  pending: {
    title: "Aguardando pagamento",
    description:
      "Conclua o Pix ou boleto. Esta página atualiza automaticamente após a confirmação.",
    icon: Clock3,
    color: "text-amber-700",
    panel: "border-amber-200 bg-amber-50",
  },
  in_process: {
    title: "Pagamento em análise",
    description:
      "O pagamento foi recebido e está sendo analisado pelo Mercado Pago.",
    icon: RefreshCw,
    color: "text-amber-700",
    panel: "border-amber-200 bg-amber-50",
  },
  pending_payment: {
    title: "Pagamento não concluído",
    description: "O pedido foi criado, mas ainda não há uma cobrança vinculada.",
    icon: Clock3,
    color: "text-amber-700",
    panel: "border-amber-200 bg-amber-50",
  },
  rejected: {
    title: "Pagamento recusado",
    description:
      "A cobrança não foi aprovada. Você pode voltar ao checkout e tentar outra forma de pagamento.",
    icon: XCircle,
    color: "text-red-700",
    panel: "border-red-200 bg-red-50",
  },
  cancelled: {
    title: "Pagamento cancelado",
    description: "A cobrança foi cancelada e o pedido não será processado.",
    icon: XCircle,
    color: "text-red-700",
    panel: "border-red-200 bg-red-50",
  },
  refunded: {
    title: "Pagamento devolvido",
    description: "O valor deste pedido foi devolvido.",
    icon: RefreshCw,
    color: "text-brand-brown",
    panel: "border-brand-brown/15 bg-brand-mist",
  },
  charged_back: {
    title: "Pagamento contestado",
    description: "O pagamento está associado a uma contestação.",
    icon: XCircle,
    color: "text-red-700",
    panel: "border-red-200 bg-red-50",
  },
} as const;

export function OrderStatus({ initialOrder }: { initialOrder: PublicOrder }) {
  const [order, setOrder] = useState(initialOrder);
  const [copied, setCopied] = useState(false);
  const [trackingCopied, setTrackingCopied] = useState(false);
  const isTestPayment =
    process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY?.startsWith("TEST-");
  const status =
    statusContent[order.status] || statusContent.pending_payment;
  const StatusIcon = status.icon;

  useEffect(() => {
    if (finalStatuses.has(order.status)) return;

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${order.id}`, {
          cache: "no-store",
        });
        if (response.ok) setOrder((await response.json()) as PublicOrder);
      } catch {
        // A próxima tentativa automática mantém a página atualizada.
      }
    }, 10000);

    return () => window.clearInterval(timer);
  }, [order.id, order.status]);

  const copyPix = async () => {
    if (!order.pixQrCode) return;
    await navigator.clipboard.writeText(order.pixQrCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const copyTracking = async () => {
    if (!order.trackingCode) return;
    await navigator.clipboard.writeText(order.trackingCode);
    setTrackingCopied(true);
    window.setTimeout(() => setTrackingCopied(false), 2000);
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_390px]">
      <div className="space-y-6">
        <section
          className={cn(
            "rounded-4xl border p-7 shadow-card sm:p-9",
            status.panel,
          )}
        >
          <StatusIcon className={cn("h-12 w-12", status.color)} />
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-ink/45">
            Pedido {order.orderNumber}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
            {status.title}
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-brand-ink/65">
            {status.description}
          </p>
          {!finalStatuses.has(order.status) && (
            <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-brand-ink/45">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Verificando atualização do pagamento...
            </p>
          )}
        </section>

        <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-brand-green/10 p-3 text-brand-green">
              <PackageCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-green">
                Entrega
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-brand-brown">
                {fulfillmentStatusLabels[order.fulfillmentStatus]}
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-ink/55">
                Destino: {order.address.city}/{order.address.state}. Quando a
                loja atualizar o preparo ou envio, essa página também atualiza.
              </p>
            </div>
          </div>

          {order.trackingCode ? (
            <div className="mt-6 rounded-3xl border border-brand-green/20 bg-brand-green/5 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-green">
                Código de rastreio
              </p>
              <p className="mt-2 break-all text-lg font-extrabold text-brand-brown">
                {order.trackingCode}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={copyTracking}
              >
                <Copy className="h-4 w-4" />
                {trackingCopied ? "Rastreio copiado" : "Copiar rastreio"}
              </Button>
            </div>
          ) : (
            <p className="mt-6 rounded-3xl bg-brand-mist p-5 text-sm leading-6 text-brand-ink/55">
              O código de rastreio aparecerá aqui assim que a loja postar o
              pedido.
            </p>
          )}
        </section>

        {order.pixQrCode && order.status !== "approved" && (
          <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-2xl font-extrabold text-brand-brown">
              Pague com Pix
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-ink/55">
              Escaneie o QR Code pelo aplicativo do seu banco ou copie o código.
            </p>
            {order.pixQrCodeBase64 && (
              <div className="mx-auto mt-6 w-fit rounded-3xl border border-brand-brown/10 bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${order.pixQrCodeBase64}`}
                  alt="QR Code Pix do pedido"
                  className="h-56 w-56"
                />
              </div>
            )}
            <div className="mt-6 rounded-2xl bg-brand-mist p-4">
              <p className="break-all text-xs leading-5 text-brand-ink/55">
                {order.pixQrCode}
              </p>
            </div>
            <Button type="button" onClick={copyPix} className="mt-4 w-full">
              <Copy className="h-4 w-4" />
              {copied ? "Código copiado" : "Copiar código Pix"}
            </Button>
          </section>
        )}

        {order.ticketUrl && order.status !== "approved" && (
          <section className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
            <h2 className="text-xl font-extrabold text-brand-brown">
              Boleto disponível
            </h2>
            <p className="mt-2 text-sm text-brand-ink/55">
              Abra o boleto para consultar o vencimento e realizar o pagamento.
            </p>
            {isTestPayment && (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold leading-5 text-amber-900">
                Este é um boleto de teste. Se o Mercado Pago mostrar
                “pagamento indisponível”, abra o link em uma janela anônima e
                não use a conta vendedora como compradora.
              </p>
            )}
            <Button
              href={order.ticketUrl}
              external
              variant="outline"
              className="mt-5"
            >
              Abrir boleto <ExternalLink className="h-4 w-4" />
            </Button>
          </section>
        )}

        {(order.status === "rejected" ||
          order.status === "cancelled" ||
          order.status === "pending_payment") && (
          <Button href="/checkout" size="lg">
            Tentar novamente
          </Button>
        )}
      </div>

      <aside className="rounded-4xl bg-brand-brown p-6 text-white shadow-soft sm:p-8">
        <PackageCheck className="h-8 w-8 text-brand-cream" />
        <h2 className="mt-5 text-2xl font-extrabold">Resumo do pedido</h2>
        <p className="mt-2 text-sm text-white/55">
          Cliente: {order.customer.fullName}
        </p>
        <div className="mt-6 space-y-4">
          {order.items.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-cream">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold">{item.name}</p>
                <p className="mt-1 text-xs text-white/50">
                  {item.quantity}x {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <p className="text-sm font-extrabold">
                {formatCurrency(item.total)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t border-white/15 pt-6 text-sm">
          <div className="flex justify-between text-white/65">
            <span>Subtotal</span>
            <span className="font-bold text-white">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-white/65">
            <span>Entrega</span>
            <span className="font-bold text-brand-cream">
              {order.shipping === 0
                ? "Grátis"
                : formatCurrency(order.shipping)}
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-6">
          <span>Total</span>
          <span className="text-3xl font-extrabold">
            {formatCurrency(order.total)}
          </span>
        </div>
        <div className="mt-6 rounded-2xl bg-white/5 p-4 text-xs leading-5 text-white/55">
          Entrega: {order.address.city}/{order.address.state}
          <br />
          Pagamento: {order.paymentMethod || "ainda não escolhido"}
        </div>
      </aside>
    </div>
  );
}
