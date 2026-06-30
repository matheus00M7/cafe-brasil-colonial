"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";
import type { PublicOrder } from "@/types/order";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderStatus } from "./OrderStatus";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export function OrderCpfAccess({ orderId }: { orderId: string }) {
  const [cpf, setCpf] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unlockWithCpf = useCallback(
    async (cpfValue: string, options?: { silent?: boolean }) => {
      const cpfDigits = onlyDigits(cpfValue);
      if (cpfDigits.length !== 11) {
        if (!options?.silent) setError("Informe o CPF com 11 números.");
        return;
      }

      setLoading(true);
      if (!options?.silent) setError("");
      try {
        const response = await fetch(`/api/orders/${orderId}/access`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpf: cpfDigits }),
        });
        const payload = (await response.json()) as PublicOrder & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(
            payload.error || "Não foi possível localizar o pedido.",
          );
        }
        window.sessionStorage.setItem(`cbc_order_access_${orderId}`, cpfDigits);
        setCpf(cpfDigits);
        setOrder(payload);
      } catch (accessError) {
        if (!options?.silent) {
          setError(
            accessError instanceof Error
              ? accessError.message
              : "Não foi possível liberar o rastreio.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    const savedCpf = window.sessionStorage.getItem(
      `cbc_order_access_${orderId}`,
    );

    if (savedCpf && onlyDigits(savedCpf).length === 11) {
      void unlockWithCpf(savedCpf, { silent: true });
    }
  }, [orderId, unlockWithCpf]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cpfDigits = onlyDigits(cpf);
    if (cpfDigits.length !== 11) {
      setError("Informe o CPF com 11 números.");
      return;
    }

    await unlockWithCpf(cpfDigits);
  };

  if (order) {
    return <OrderStatus initialOrder={order} accessCpf={onlyDigits(cpf)} />;
  }

  return (
    <div className="mx-auto max-w-2xl rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-9">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
        <PackageCheck className="h-7 w-7" />
      </div>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
        Acompanhar pedido
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
        Informe o CPF da compra
      </h1>
      <p className="mt-4 leading-7 text-brand-ink/60">
        Para proteger os dados do pedido, digite o mesmo CPF informado na compra.
        Se você acabou de pagar neste aparelho, o rastreio abre automaticamente.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <Input
          label="CPF usado no pedido"
          value={cpf}
          onChange={(event) => setCpf(event.target.value)}
          placeholder="000.000.000-00"
          inputMode="numeric"
          error={error}
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          <LockKeyhole className="h-5 w-5" />
          {loading ? "Verificando..." : "Liberar rastreio"}
        </Button>
      </form>

      <div className="mt-6 flex gap-3 rounded-3xl bg-brand-mist p-4 text-sm leading-6 text-brand-ink/60">
        <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-brand-green" />
        <p>
          O CPF é usado apenas para confirmar que você tem acesso a esse pedido.
          Os dados completos continuam protegidos.
        </p>
      </div>
    </div>
  );
}
