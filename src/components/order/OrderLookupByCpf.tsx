"use client";

import { useState, type FormEvent } from "react";
import { CalendarCheck, PackageSearch, ShieldCheck } from "lucide-react";
import type { PublicOrder } from "@/types/order";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderStatus } from "./OrderStatus";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function OrderLookupByCpf() {
  const [cpf, setCpf] = useState("");
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PublicOrder | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cpfDigits = onlyDigits(cpf);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSelectedOrder(null);
    setSearched(false);
    setError("");

    if (cpfDigits.length !== 11) {
      setError("Informe o CPF com 11 números.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfDigits }),
      });
      const payload = (await response.json()) as {
        orders?: PublicOrder[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "Não foi possível buscar pedidos.");
      }
      setOrders(payload.orders || []);
      setSearched(true);
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Não foi possível buscar pedidos.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (selectedOrder) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setSelectedOrder(null)}
          className="text-sm font-extrabold text-brand-brown hover:underline"
        >
          Voltar para os pedidos encontrados
        </button>
        <OrderStatus initialOrder={selectedOrder} accessCpf={cpfDigits} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-9">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
        <PackageSearch className="h-7 w-7" />
      </div>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
        Rastreio sem login
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
        Rastrear pedido pelo CPF
      </h1>
      <p className="mt-4 leading-7 text-brand-ink/60">
        Comprou sem criar conta? Digite o mesmo CPF usado na entrega para ver
        seus pedidos e acompanhar pagamento, preparo e envio.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <Input
          label="CPF usado na compra"
          value={cpf}
          onChange={(event) => setCpf(event.target.value)}
          placeholder="000.000.000-00"
          inputMode="numeric"
          error={error}
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          <PackageSearch className="h-5 w-5" />
          {loading ? "Buscando pedidos..." : "Buscar meus pedidos"}
        </Button>
      </form>

      <div className="mt-6 flex gap-3 rounded-3xl bg-brand-mist p-4 text-sm leading-6 text-brand-ink/60">
        <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-brand-green" />
        <p>
          O CPF serve para liberar apenas o acompanhamento do pedido. Dados
          completos de entrega e informações administrativas continuam
          protegidos.
        </p>
      </div>

      {searched && orders.length === 0 && (
        <div className="mt-7 rounded-3xl border border-dashed border-brand-brown/20 bg-brand-paper p-6 text-center">
          <p className="font-extrabold text-brand-brown">
            Nenhum pedido encontrado para este CPF.
          </p>
          <p className="mt-2 text-sm text-brand-ink/55">
            Confira o CPF digitado ou entre em contato pelo WhatsApp da loja.
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-xl font-extrabold text-brand-brown">
            Pedidos encontrados
          </h2>
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="flex w-full flex-col gap-3 rounded-3xl border border-brand-brown/10 bg-brand-paper p-5 text-left transition hover:border-brand-brown/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-brand-green">
                  {order.orderNumber}
                </span>
                <span className="mt-1 flex items-center gap-2 text-sm text-brand-ink/55">
                  <CalendarCheck className="h-4 w-4" />
                  {formatDate(order.createdAt)}
                </span>
              </span>
              <span className="text-lg font-extrabold text-brand-brown">
                {formatCurrency(order.total)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
