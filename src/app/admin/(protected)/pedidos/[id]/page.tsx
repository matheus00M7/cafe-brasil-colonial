import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { getOrderById } from "@/lib/orders-db";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  fulfillmentStatusLabels,
  paymentStatusLabels,
  paymentStatusTone,
} from "@/lib/order-labels";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { OrderAdminForm } from "@/components/admin/OrderAdminForm";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const customerWhatsApp = order.customer.whatsapp.replace(/\D/g, "");

  return (
    <div>
      <Link
        href="/admin/pedidos"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-brown hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos pedidos
      </Link>
      <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
            Pedido
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-brand-ink/50">
            Criado em {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminStatusBadge tone={paymentStatusTone[order.status]}>
            {paymentStatusLabels[order.status]}
          </AdminStatusBadge>
          <AdminStatusBadge tone="brown">
            {fulfillmentStatusLabels[order.fulfillmentStatus]}
          </AdminStatusBadge>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <ReceiptText className="h-6 w-6 text-brand-green" />
              <h2 className="text-xl font-extrabold text-brand-brown">
                Itens do pedido
              </h2>
            </div>
            <div className="mt-5 divide-y divide-brand-brown/8">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brand-mist">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-brand-brown">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-brand-ink/50">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-extrabold text-brand-brown">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-brand-brown/10 pt-5 text-sm">
              <div className="flex justify-between text-brand-ink/60">
                <span>Subtotal</span>
                <span className="font-bold text-brand-ink">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-brand-ink/60">
                <span>Entrega</span>
                <span className="font-bold text-brand-ink">
                  {order.shipping === 0
                    ? "Grátis"
                    : formatCurrency(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-brand-brown/10 pt-4 text-lg font-extrabold text-brand-brown">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">
                <UserRound className="h-6 w-6 text-brand-green" />
                <h2 className="text-xl font-extrabold text-brand-brown">
                  Cliente
                </h2>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <p className="font-extrabold text-brand-ink">
                  {order.customer.fullName}
                </p>
                <a
                  href={`mailto:${order.customer.email}`}
                  className="flex items-center gap-2 text-brand-ink/60 hover:text-brand-brown"
                >
                  <Mail className="h-4 w-4" />
                  {order.customer.email}
                </a>
                <a
                  href={`https://wa.me/${customerWhatsApp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-brand-ink/60 hover:text-brand-green"
                >
                  <MessageCircle className="h-4 w-4" />
                  {order.customer.whatsapp}
                </a>
                <p className="text-brand-ink/50">
                  CPF: {order.customer.cpf || "Não informado"}
                </p>
              </div>
            </section>
            <section className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-brand-green" />
                <h2 className="text-xl font-extrabold text-brand-brown">
                  Entrega
                </h2>
              </div>
              <div className="mt-5 text-sm leading-7 text-brand-ink/60">
                <p>
                  {order.address.street}, {order.address.number}
                </p>
                {order.address.complement && <p>{order.address.complement}</p>}
                <p>{order.address.neighborhood}</p>
                <p>
                  {order.address.city}/{order.address.state}
                </p>
                <p>CEP {order.address.cep}</p>
                <p className="mt-3 font-bold text-brand-brown">
                  {order.deliveryMethod === "retirada"
                    ? "Retirada"
                    : "Envio por transportadora/Correios"}
                </p>
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-brand-green" />
              <h2 className="text-xl font-extrabold text-brand-brown">
                Pagamento
              </h2>
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-brand-ink/45">Situação</dt>
                <dd className="mt-1 font-bold text-brand-ink">
                  {paymentStatusLabels[order.status]}
                </dd>
              </div>
              <div>
                <dt className="text-brand-ink/45">Forma</dt>
                <dd className="mt-1 font-bold text-brand-ink">
                  {order.paymentMethod || "Não informada"}
                </dd>
              </div>
              <div>
                <dt className="text-brand-ink/45">ID do pagamento</dt>
                <dd className="mt-1 break-all font-bold text-brand-ink">
                  {order.paymentId || "Ainda não gerado"}
                </dd>
              </div>
              <div>
                <dt className="text-brand-ink/45">Detalhe</dt>
                <dd className="mt-1 font-bold text-brand-ink">
                  {order.paymentStatusDetail || "Sem detalhe adicional"}
                </dd>
              </div>
            </dl>
          </section>

          {order.notes && (
            <section className="rounded-3xl border border-brand-brown/10 bg-brand-cream/25 p-6">
              <h2 className="font-extrabold text-brand-brown">
                Observação do cliente
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand-ink/65">
                {order.notes}
              </p>
            </section>
          )}
        </div>

        <aside className="sticky top-24 rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-6 w-6 text-brand-green" />
            <div>
              <h2 className="text-xl font-extrabold text-brand-brown">
                Operação
              </h2>
              <p className="mt-1 text-xs text-brand-ink/45">
                Atualize separação, envio e entrega.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <OrderAdminForm
              orderId={order.id}
              initialStatus={order.fulfillmentStatus}
              initialTrackingCode={order.trackingCode}
              initialNotes={order.adminNotes}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
