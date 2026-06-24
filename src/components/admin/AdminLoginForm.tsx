"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao entrar.");
      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block text-sm font-bold text-brand-ink">
        E-mail
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
          className="mt-2 min-h-12 w-full rounded-2xl border border-brand-brown/15 bg-white px-4 outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
          placeholder="admin@cafebrasilcolonial.com.br"
        />
      </label>
      <label className="block text-sm font-bold text-brand-ink">
        Senha
        <span className="relative mt-2 block">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="min-h-12 w-full rounded-2xl border border-brand-brown/15 bg-white px-4 pr-12 outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
            placeholder="Sua senha administrativa"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-brand-ink/45 hover:bg-brand-mist"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </span>
      </label>
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-5 font-extrabold text-white transition hover:bg-[#4d1a0e] disabled:opacity-60"
      >
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <LockKeyhole className="h-5 w-5" />
        )}
        {loading ? "Entrando..." : "Entrar no painel"}
      </button>
    </form>
  );
}
