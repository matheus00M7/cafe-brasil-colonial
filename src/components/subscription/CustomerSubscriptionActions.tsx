"use client";

import { useState } from "react";
import { LoaderCircle, Pause, Play, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function CustomerSubscriptionActions({
  id,
  token,
  status,
}: {
  id: string;
  token?: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const update = async (action: "pause" | "resume" | "cancel") => {
    setLoading(action);
    setError("");
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(token ? { token } : {}), action }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao atualizar.");
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível atualizar.",
      );
    } finally {
      setLoading("");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {status === "authorized" && (
          <button
            type="button"
            onClick={() => void update("pause")}
            disabled={Boolean(loading)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-extrabold text-amber-900"
          >
            {loading === "pause" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
            Pausar assinatura
          </button>
        )}
        {status === "paused" && (
          <button
            type="button"
            onClick={() => void update("resume")}
            disabled={Boolean(loading)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-green px-5 text-sm font-extrabold text-white"
          >
            {loading === "resume" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Reativar assinatura
          </button>
        )}
        {!["cancelled", "canceled"].includes(status) && (
          <button
            type="button"
            onClick={() => void update("cancel")}
            disabled={Boolean(loading)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-extrabold text-red-700"
          >
            {loading === "cancel" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Cancelar assinatura
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}
    </div>
  );
}
