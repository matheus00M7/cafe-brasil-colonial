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

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function AccountAuthForm({
  mode,
  redirectTo = "/minha-conta",
  initialError = "",
}: {
  mode: "login" | "signup";
  redirectTo?: string;
  initialError?: string;
}) {
  const isSignup = mode === "signup";
  const safeRedirect = normalizeCustomerRedirect(redirectTo);
  const oauthRedirect = encodeURIComponent(safeRedirect);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
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
      <div className="space-y-3">
        <Button
          href={`/api/account/oauth/google?redirect=${oauthRedirect}`}
          variant="outline"
          size="lg"
          className="w-full border-brand-brown/15 bg-white text-brand-ink shadow-sm hover:border-brand-brown/30 hover:bg-brand-mist"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-brand-brown/10">
            <GoogleLogo />
          </span>
          Continuar com Google
        </Button>
      </div>
      <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-ink/35">
        <span className="h-px flex-1 bg-brand-brown/10" />
        ou use e-mail
        <span className="h-px flex-1 bg-brand-brown/10" />
      </div>
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
