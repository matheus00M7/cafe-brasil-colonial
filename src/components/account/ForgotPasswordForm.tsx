"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { LoaderCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [developmentUrl, setDevelopmentUrl] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setDevelopmentUrl("");
    try {
      const response = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        developmentResetUrl?: string;
      };
      if (!response.ok) throw new Error(payload.error || "Falha na solicitação.");
      setMessage(payload.message || "Confira seu e-mail.");
      setDevelopmentUrl(payload.developmentResetUrl || "");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível solicitar a recuperação.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Input
        label="E-mail da conta"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />
      {message && (
        <p className="rounded-2xl border border-brand-green/20 bg-brand-green/5 p-4 text-sm font-bold text-brand-green">
          {message}
        </p>
      )}
      {developmentUrl && (
        <Link
          href={developmentUrl}
          className="block rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-950 hover:underline"
        >
          Ambiente local: abrir link de redefinição
        </Link>
      )}
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <Mail className="h-5 w-5" />
        )}
        Enviar instruções
      </Button>
      <Link
        href="/entrar"
        className="block text-center text-sm font-bold text-brand-brown hover:underline"
      >
        Voltar para o login
      </Link>
    </form>
  );
}
