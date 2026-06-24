"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CustomerAccount } from "@/types/customer";

export function AccountProfileForm({
  account,
}: {
  account: CustomerAccount;
}) {
  const [profile, setProfile] = useState(account.profile);
  const [address, setAddress] = useState(account.address);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, address }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao salvar.");
      setSaved(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-7">
      <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-2xl font-extrabold text-brand-brown">
          Dados pessoais
        </h2>
        <p className="mt-2 text-sm text-brand-ink/55">
          O e-mail da conta é {account.email}.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Input
            label="Nome completo"
            value={profile.fullName}
            onChange={(event) =>
              setProfile((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
            className="sm:col-span-2"
            required
          />
          <Input
            label="WhatsApp"
            value={profile.whatsapp}
            onChange={(event) =>
              setProfile((current) => ({
                ...current,
                whatsapp: event.target.value,
              }))
            }
            inputMode="tel"
            required
          />
          <Input
            label="CPF"
            value={profile.cpf}
            onChange={(event) =>
              setProfile((current) => ({
                ...current,
                cpf: event.target.value,
              }))
            }
            inputMode="numeric"
          />
        </div>
      </section>

      <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-2xl font-extrabold text-brand-brown">
          Endereço padrão
        </h2>
        <p className="mt-2 text-sm text-brand-ink/55">
          Este endereço será preenchido automaticamente nos próximos pedidos.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-6">
          <Input
            label="CEP"
            value={address.cep}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                cep: event.target.value,
              }))
            }
            className="sm:col-span-2"
          />
          <Input
            label="Rua"
            value={address.street}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                street: event.target.value,
              }))
            }
            className="sm:col-span-4"
          />
          <Input
            label="Número"
            value={address.number}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                number: event.target.value,
              }))
            }
            className="sm:col-span-2"
          />
          <Input
            label="Complemento"
            value={address.complement}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                complement: event.target.value,
              }))
            }
            className="sm:col-span-4"
          />
          <Input
            label="Bairro"
            value={address.neighborhood}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                neighborhood: event.target.value,
              }))
            }
            className="sm:col-span-3"
          />
          <Input
            label="Cidade"
            value={address.city}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                city: event.target.value,
              }))
            }
            className="sm:col-span-2"
          />
          <Input
            label="UF"
            value={address.state}
            onChange={(event) =>
              setAddress((current) => ({
                ...current,
                state: event.target.value.toUpperCase().slice(0, 2),
              }))
            }
            className="sm:col-span-1"
            maxLength={2}
          />
        </div>
      </section>

      {saved && (
        <p className="flex items-center gap-2 rounded-2xl border border-brand-green/20 bg-brand-green/5 p-4 text-sm font-bold text-brand-green">
          <CheckCircle2 className="h-5 w-5" /> Dados salvos.
        </p>
      )}
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : (
          <Save className="h-5 w-5" />
        )}
        Salvar meus dados
      </Button>
    </form>
  );
}
