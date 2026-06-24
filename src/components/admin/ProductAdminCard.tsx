"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, LoaderCircle, Save } from "lucide-react";
import type { AdminProduct } from "@/types/admin";
import { formatCurrency } from "@/lib/formatCurrency";
import { ImageUploadField } from "./ImageUploadField";

const inputClass =
  "mt-2 min-h-11 w-full rounded-2xl border border-brand-brown/15 bg-white px-4 outline-none focus:border-brand-green";

export function ProductAdminCard({ product }: { product: AdminProduct }) {
  const [name, setName] = useState(product.name);
  const [image, setImage] = useState(product.image);
  const [shortDescription, setShortDescription] = useState(
    product.shortDescription,
  );
  const [longDescription, setLongDescription] = useState(
    product.longDescription,
  );
  const [badge, setBadge] = useState(product.badge || "");
  const [price, setPrice] = useState(product.price.toFixed(2));
  const [stock, setStock] = useState(
    product.stock === null ? "" : String(product.stock),
  );
  const [active, setActive] = useState(product.active);
  const [featured, setFeatured] = useState(product.adminFeatured);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(price.replace(",", ".")),
          stock: stock.trim() === "" ? null : Number(stock),
          active,
          featured,
          name,
          image,
          shortDescription,
          longDescription,
          badge,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao salvar.");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
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
    <article className="overflow-hidden rounded-3xl border border-brand-brown/10 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-3xl border border-brand-brown/10 bg-[#f6ecdd] sm:w-44">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-3"
            sizes="176px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-brand-green">
                {product.category} · {product.weight}
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-brand-brown">
                {name}
              </h2>
              <p className="mt-1 text-xs text-brand-ink/45">
                Preço atual:{" "}
                {formatCurrency(Number(price.replace(",", ".")) || 0)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {active ? "À venda" : "Oculto"}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-brand-ink/55">
            {shortDescription}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-brand-ink sm:col-span-2">
          Nome do produto
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Preço
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputMode="decimal"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Estoque
          <input
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            inputMode="numeric"
            className={inputClass}
            placeholder="Vazio = sem controle"
          />
        </label>
        <label className="text-sm font-bold text-brand-ink sm:col-span-2">
          Selo do produto
          <input
            value={badge}
            onChange={(event) => setBadge(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Mais vendido"
          />
        </label>
        <label className="text-sm font-bold text-brand-ink sm:col-span-2">
          Descrição curta
          <textarea
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
            className={`${inputClass} min-h-24 py-3`}
          />
        </label>
        <label className="text-sm font-bold text-brand-ink sm:col-span-2">
          Descrição completa
          <textarea
            value={longDescription}
            onChange={(event) => setLongDescription(event.target.value)}
            className={`${inputClass} min-h-32 py-3`}
          />
        </label>
        <div className="sm:col-span-2">
          <ImageUploadField
            label="Imagem do produto"
            value={image}
            onChange={setImage}
            help="Use uma foto quadrada ou vertical, com fundo limpo."
            contain
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-brand-ink">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="h-5 w-5 accent-brand-green"
          />
          Disponível na loja
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-brand-ink">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
            className="h-5 w-5 accent-brand-green"
          />
          Destacar na home
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-brown px-5 text-sm font-extrabold text-white hover:bg-[#4d1a0e] disabled:opacity-60"
      >
        {saving ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Salvando..." : saved ? "Salvo" : "Salvar produto"}
      </button>
    </article>
  );
}
