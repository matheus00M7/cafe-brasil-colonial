"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, PackagePlus, Plus, X } from "lucide-react";
import type { ProductCategory } from "@/types/product";
import { ImageUploadField } from "./ImageUploadField";

const inputClass =
  "mt-2 min-h-11 w-full rounded-2xl border border-brand-brown/15 bg-white px-4 outline-none focus:border-brand-green";

const categories: ProductCategory[] = [
  "Tradicional",
  "Extraforte",
  "Gourmet",
  "Especial",
  "Kits",
];

const initialImage = "/products/tradicional-500g.webp";

const notesToArray = (value: string) =>
  value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export function CreateProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState(initialImage);
  const [category, setCategory] = useState<ProductCategory>("Tradicional");
  const [type, setType] = useState("Torrado e moído");
  const [weight, setWeight] = useState("500g");
  const [roast, setRoast] = useState("Média");
  const [grind, setGrind] = useState("Moagem para coador");
  const [intensity, setIntensity] = useState("5");
  const [intensityLabel, setIntensityLabel] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [origin, setOrigin] = useState("Minas Gerais");
  const [preparation, setPreparation] = useState("Café coado");
  const [sensoryNotes, setSensoryNotes] = useState(
    "Encorpado, Aroma clássico",
  );
  const [contents, setContents] = useState("");
  const [badge, setBadge] = useState("");
  const [price, setPrice] = useState("1.00");
  const [stock, setStock] = useState("");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setImage(initialImage);
    setCategory("Tradicional");
    setType("Torrado e moído");
    setWeight("500g");
    setRoast("Média");
    setGrind("Moagem para coador");
    setIntensity("5");
    setIntensityLabel("");
    setShortDescription("");
    setLongDescription("");
    setOrigin("Minas Gerais");
    setPreparation("Café coado");
    setSensoryNotes("Encorpado, Aroma clássico");
    setContents("");
    setBadge("");
    setPrice("1.00");
    setStock("");
    setActive(true);
    setFeatured(false);
  };

  const create = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(price.replace(",", ".")),
          stock: stock.trim() === "" ? null : Number(stock),
          active,
          featured,
          name,
          image,
          category,
          type,
          weight,
          roast,
          grind,
          intensity: Number(intensity),
          intensityLabel,
          shortDescription,
          longDescription: longDescription || shortDescription,
          origin,
          preparation,
          sensoryNotes: notesToArray(sensoryNotes),
          contents,
          badge,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao criar.");

      setSaved(true);
      reset();
      router.refresh();
      window.setTimeout(() => setSaved(false), 2000);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível criar o produto.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-green px-6 text-sm font-extrabold text-white shadow-card hover:bg-[#005d3b]"
      >
        <PackagePlus className="h-5 w-5" />
        Adicionar produto
      </button>
    );
  }

  return (
    <section className="mt-8 rounded-3xl border border-brand-green/20 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
            Novo item da loja
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-brand-brown">
            Adicionar produto
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-ink/55">
            Cadastre nome, preço, imagem e detalhes. Depois de salvar, o produto
            aparece na loja, no carrinho e no painel.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-brown/10 text-brand-brown hover:bg-brand-cream"
          aria-label="Fechar formulário"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-brand-ink sm:col-span-2">
          Nome do produto
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Café Brasil Colonial Tradicional 250g"
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
        <label className="text-sm font-bold text-brand-ink">
          Categoria
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ProductCategory)
            }
            className={inputClass}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Tipo
          <input
            value={type}
            onChange={(event) => setType(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Peso / volume
          <input
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Torra
          <input
            value={roast}
            onChange={(event) => setRoast(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Moagem
          <input
            value={grind}
            onChange={(event) => setGrind(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Intensidade
          <input
            value={intensity}
            onChange={(event) => setIntensity(event.target.value)}
            inputMode="numeric"
            className={inputClass}
            placeholder="1 a 10"
          />
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Texto da intensidade
          <input
            value={intensityLabel}
            onChange={(event) => setIntensityLabel(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Alta, equilibrada"
          />
        </label>
        <label className="text-sm font-bold text-brand-ink sm:col-span-2">
          Selo do produto
          <input
            value={badge}
            onChange={(event) => setBadge(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Lançamento"
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
            placeholder="Se deixar vazio, uso a descrição curta."
          />
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Origem
          <input
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-bold text-brand-ink">
          Preparo indicado
          <input
            value={preparation}
            onChange={(event) => setPreparation(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-bold text-brand-ink sm:col-span-2">
          Notas sensoriais
          <textarea
            value={sensoryNotes}
            onChange={(event) => setSensoryNotes(event.target.value)}
            className={`${inputClass} min-h-20 py-3`}
            placeholder="Separe por vírgula. Ex.: Encorpado, Aroma clássico"
          />
        </label>
        <label className="text-sm font-bold text-brand-ink sm:col-span-2">
          Conteúdo do kit
          <input
            value={contents}
            onChange={(event) => setContents(event.target.value)}
            className={inputClass}
            placeholder="Use se for kit. Ex.: 1 Tradicional + 1 Extraforte"
          />
        </label>
        <div className="sm:col-span-2">
          <ImageUploadField
            label="Imagem do produto"
            value={image}
            onChange={setImage}
            help="Você pode trocar por uma imagem enviada pelo painel."
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
        onClick={create}
        disabled={saving}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-brown px-5 text-sm font-extrabold text-white hover:bg-[#4d1a0e] disabled:opacity-60"
      >
        {saving ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {saving ? "Criando..." : saved ? "Criado" : "Criar produto"}
      </button>
    </section>
  );
}
