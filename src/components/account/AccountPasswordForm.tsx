"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AccountPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao alterar.");
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Senha alterada. As outras sessões foram encerradas.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível alterar a senha.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8"
    >
      <h2 className="text-2xl font-extrabold text-brand-brown">
        Alterar senha
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Input
          label="Senha atual"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        <Input
          label="Nova senha"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          minLength={10}
          required
        />
      </div>
      {message && (
        <p className="mt-5 flex items-center gap-2 text-sm font-bold text-brand-green">
          <CheckCircle2 className="h-5 w-5" /> {message}
        </p>
      )}
      {error && <p className="mt-5 text-sm font-bold text-red-700">{error}</p>}
      <Button type="submit" className="mt-6" disabled={loading}>
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <KeyRound className="h-5 w-5" />
        )}
        Alterar senha
      </Button>
    </form>
  );
}
