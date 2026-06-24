"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Save } from "lucide-react";
import type { FulfillmentStatus } from "@/types/order";
import { fulfillmentStatusLabels } from "@/lib/order-labels";

export function OrderAdminForm({
  orderId,
  initialStatus,
  initialTrackingCode,
  initialNotes,
}: {
  orderId: string;
  initialStatus: FulfillmentStatus;
  initialTrackingCode: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const [fulfillmentStatus, setFulfillmentStatus] = useState(initialStatus);
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode);
  const [adminNotes, setAdminNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentStatus,
          trackingCode,
          adminNotes,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao salvar.");
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 2200);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <label className="block text-sm font-bold text-brand-ink">
        Andamento do pedido
        <select
          value={fulfillmentStatus}
          onChange={(event) =>
            setFulfillmentStatus(event.target.value as FulfillmentStatus)
          }
          className="mt-2 min-h-12 w-full rounded-2xl border border-brand-brown/15 bg-white px-4 outline-none focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
        >
          {Object.entries(fulfillmentStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-bold text-brand-ink">
        Código de rastreio
        <input
          value={trackingCode}
          onChange={(event) => setTrackingCode(event.target.value)}
          className="mt-2 min-h-12 w-full rounded-2xl border border-brand-brown/15 bg-white px-4 uppercase outline-none focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
          placeholder="Ex.: AA123456789BR"
        />
      </label>
      <label className="block text-sm font-bold text-brand-ink">
        Observações internas
        <textarea
          value={adminNotes}
          onChange={(event) => setAdminNotes(event.target.value)}
          className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-brand-brown/15 bg-white px-4 py-3 outline-none focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
          placeholder="Anotações que só aparecem no painel administrativo..."
        />
      </label>
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-5 font-extrabold text-white transition hover:bg-[#4d1a0e] disabled:opacity-60"
      >
        {saving ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : saved ? (
          <Check className="h-5 w-5" />
        ) : (
          <Save className="h-5 w-5" />
        )}
        {saving ? "Salvando..." : saved ? "Salvo" : "Salvar alterações"}
      </button>
    </div>
  );
}
