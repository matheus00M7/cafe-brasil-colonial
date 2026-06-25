"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  customerAuthUrl,
  normalizeCustomerRedirect,
} from "@/lib/customer-redirect";

export function AccountAuthForm({
  mode,
  redirectTo = "/minha-conta",
}: {
  mode: "login" | "signup";
  redirectTo?: string;
}) {
  const isSignup = mode === "signup";
  const safeRedirect = normalizeCustomerRedirect(redirectTo);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    whatsapp: "",
    email: "",
    password: "",
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        isSignup ? "/api/account/signup" : "/api/account/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const payload = (await response.json()) as {
        error?: string;
        redirectUrl?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "Não foi possível continuar.");
      }
      window.location.href = safeRedirect || payload.redirectUrl || "/minha-conta";
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível continuar.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {isSignup && (
        <>
          <Input
            label="Nome completo"
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
            autoComplete="name"
            required
          />
          <Input
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                whatsapp: event.target.value,
              }))
            }
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </>
      )}
      <Input
        label="E-mail"
        type="email"
        value={form.email}
        onChange={(event) =>
          setForm((current) => ({ ...current, email: event.target.value }))
        }
        autoComplete="email"
        required
      />
      <div className="relative">
        <Input
          label="Senha"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? 10 : undefined}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-4 top-10 text-brand-brown/60"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {isSignup && (
        <p className="text-xs leading-5 text-brand-ink/50">
          Use pelo menos 10 caracteres, incluindo uma letra e um número.
        </p>
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
          <LockKeyhole className="h-5 w-5" />
        )}
        {loading
          ? "Aguarde..."
          : isSignup
            ? "Criar minha conta"
            : "Entrar na minha conta"}
      </Button>
      {!isSignup && (
        <Link
          href="/recuperar-senha"
          className="block text-center text-sm font-bold text-brand-green hover:underline"
        >
          Esqueci minha senha
        </Link>
      )}
      <p className="text-center text-sm text-brand-ink/55">
        {isSignup ? "Já possui uma conta?" : "Ainda não possui uma conta?"}{" "}
        <Link
          href={customerAuthUrl(isSignup ? "/entrar" : "/cadastro", safeRedirect)}
          className="font-extrabold text-brand-brown hover:underline"
        >
          {isSignup ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </form>
  );
}
