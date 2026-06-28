"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Save, Trash2 } from "lucide-react";
import type { AdminProduct } from "@/types/admin";
import type { ProductCategory, ProductKind, ProductOption } from "@/types/product";
import { formatCurrency } from "@/lib/formatCurrency";
import { ImageUploadField } from "./ImageUploadField";

const inputClass =
  "mt-2 min-h-11 w-full rounded-2xl border border-brand-brown/15 bg-white px-4 outline-none focus:border-brand-green focus:ring-4 focus:ring-brand-green/10";

const panelClass =
  "rounded-3xl border border-brand-brown/10 bg-brand-paper/70 p-5";

const categories: ProductCategory[] = [
  "Tradicional",
  "Extraforte",
  "Gourmet",
  "Especial",
  "Kits",
  "Fardos",
  "Canecas",
  "Camisetas",
  "Acessórios",
  "Outros",
];

const productKinds: Array<{
  value: ProductKind;
  label: string;
  description: string;
  emoji: string;
  category: ProductCategory;
  type: string;
  options: string;
}> = [
  {
    value: "coffee",
    label: "Café",
    description: "Pacote comum de café.",
    emoji: "☕",
    category: "Tradicional",
    type: "Torrado e moído",
    options: "",
  },
  {
    value: "coffee_bale",
    label: "Fardo",
    description: "Venda em quantidade maior.",
    emoji: "📦",
    category: "Fardos",
    type: "Fardo",
    options: "",
  },
  {
    value: "coffee_bundle",
    label: "Kit",
    description: "Combinação de produtos.",
    emoji: "🎁",
    category: "Kits",
    type: "Kit promocional",
    options: "",
  },
  {
    value: "mug",
    label: "Caneca",
    description: "Produto com cor/modelo.",
    emoji: "🥤",
    category: "Canecas",
    type: "Caneca personalizada",
    options: "Cor: Branca, Preta",
  },
  {
    value: "shirt",
    label: "Camiseta",
    description: "Roupa com tamanho.",
    emoji: "👕",
    category: "Camisetas",
    type: "Camiseta",
    options: "Tamanho: P, M, G, GG, XG",
  },
  {
    value: "accessory",
    label: "Acessório",
    description: "Brindes e itens extras.",
    emoji: "✨",
    category: "Acessórios",
    type: "Acessório",
    options: "",
  },
  {
    value: "other",
    label: "Outro",
    description: "Produto diferente da lista.",
    emoji: "🛍️",
    category: "Outros",
    type: "Produto",
    options: "",
  },
];

const productKindLabels: Record<ProductKind, string> = {
  coffee: "Café",
  coffee_bundle: "Kit",
  coffee_bale: "Fardo",
  mug: "Caneca",
  shirt: "Camiseta",
  accessory: "Acessório",
  other: "Outro",
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "opcao";

const optionsToText = (options?: ProductOption[]) =>
  (options || [])
    .map((option) => `${option.name}: ${option.values.join(", ")}`)
    .join("\n");

const parseProductOptions = (value: string): ProductOption[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawName, rawValues] = line.includes(":")
        ? line.split(/:(.*)/).filter(Boolean)
        : ["Opção", line];
      const name = rawName.trim();
      const values = rawValues
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return values.length
        ? { id: slugify(name), name, values, required: true }
        : null;
    })
    .filter(Boolean) as ProductOption[];

const notesToArray = (value: string) =>
  value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export function ProductAdminCard({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [image, setImage] = useState(product.image);
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [productKind, setProductKind] = useState<ProductKind>(
    product.productKind || "coffee",
  );
  const [productOptionsDraft, setProductOptionsDraft] = useState(
    optionsToText(product.productOptions),
  );
  const [type, setType] = useState(product.type);
  const [weight, setWeight] = useState(product.weight);
  const [roast, setRoast] = useState(product.roast);
  const [grind, setGrind] = useState(product.grind);
  const [intensity, setIntensity] = useState(String(product.intensity));
  const [intensityLabel, setIntensityLabel] = useState(
    product.intensityLabel || "",
  );
  const [shortDescription, setShortDescription] = useState(
    product.shortDescription,
  );
  const [longDescription, setLongDescription] = useState(
    product.longDescription,
  );
  const [origin, setOrigin] = useState(product.origin);
  const [preparation, setPreparation] = useState(product.preparation);
  const [sensoryNotes, setSensoryNotes] = useState(
    product.sensoryNotes.join(", "),
  );
  const [contents, setContents] = useState(product.contents || "");
  const [badge, setBadge] = useState(product.badge || "");
  const [price, setPrice] = useState(product.price.toFixed(2));
  const [stock, setStock] = useState(
    product.stock === null ? "" : String(product.stock),
  );
  const [active, setActive] = useState(product.active);
  const [featured, setFeatured] = useState(product.adminFeatured);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");

  const applyProductKind = (kind: (typeof productKinds)[number]) => {
    setProductKind(kind.value);
    setCategory(kind.category);
    setType(kind.type);
    if (kind.options) setProductOptionsDraft(kind.options);
  };

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
          category,
          productKind,
          productOptions: parseProductOptions(productOptionsDraft),
          type,
          weight,
          roast,
          grind,
          intensity: Number(intensity),
          intensityLabel,
          shortDescription,
          longDescription,
          origin,
          preparation,
          sensoryNotes: notesToArray(sensoryNotes),
          contents,
          badge,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao salvar.");
      setSaved(true);
      router.refresh();
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

  const remove = async () => {
    const confirmed = window.confirm(
      `Excluir "${name}" da loja? Essa ação remove o produto da vitrine.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Falha ao excluir.");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-brand-brown/10 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-3xl border border-brand-brown/10 bg-[#f6ecdd] lg:w-48">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-3"
            sizes="192px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-brand-green">
                {productKindLabels[productKind]} · {category} · {weight}
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-brand-brown">
                {name}
              </h2>
              <p className="mt-1 text-xs text-brand-ink/45">
                Preço atual:{" "}
                {formatCurrency(Number(price.replace(",", ".")) || 0)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                  active
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {active ? "À venda" : "Oculto"}
              </span>
              {parseProductOptions(productOptionsDraft).length > 0 && (
                <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-extrabold text-brand-brown">
                  Com opções
                </span>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-brand-ink/55">
            {shortDescription}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-brand-brown/15 px-4 text-xs font-extrabold text-brand-brown hover:bg-brand-cream"
            >
              {expanded ? "Recolher edição" : "Editar detalhes"}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || deleting}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand-brown px-4 text-xs font-extrabold text-white hover:bg-[#4d1a0e] disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : saved ? "Salvo" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={saving || deleting}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 text-xs font-extrabold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {deleting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {deleting ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      {expanded && (
        <div className="mt-6 space-y-5">
          <div className={panelClass}>
            <h3 className="text-lg font-extrabold text-brand-brown">
              Tipo de produto
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {productKinds.map((kind) => (
                <button
                  key={kind.value}
                  type="button"
                  onClick={() => applyProductKind(kind)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    productKind === kind.value
                      ? "border-brand-green bg-brand-green/10"
                      : "border-brand-brown/10 bg-white hover:border-brand-green/50"
                  }`}
                >
                  <span className="text-2xl">{kind.emoji}</span>
                  <span className="mt-2 block font-extrabold text-brand-brown">
                    {kind.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-brand-ink/55">
                    {kind.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div className={`${panelClass} grid gap-4 sm:grid-cols-2`}>
                <label className="text-sm font-bold text-brand-ink sm:col-span-2">
                  Nome do produto
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
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
                  Peso / volume
                  <input
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    className={inputClass}
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
              </div>

              <div className={`${panelClass} grid gap-4 sm:grid-cols-2`}>
                <label className="text-sm font-bold text-brand-ink">
                  Tipo técnico
                  <input
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm font-bold text-brand-ink">
                  Selo
                  <input
                    value={badge}
                    onChange={(event) => setBadge(event.target.value)}
                    className={inputClass}
                    placeholder="Ex.: Mais vendido"
                  />
                </label>
                <label className="text-sm font-bold text-brand-ink">
                  Torra / acabamento
                  <input
                    value={roast}
                    onChange={(event) => setRoast(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm font-bold text-brand-ink">
                  Moagem / modelo
                  <input
                    value={grind}
                    onChange={(event) => setGrind(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm font-bold text-brand-ink">
                  Intensidade / destaque
                  <input
                    value={intensity}
                    onChange={(event) => setIntensity(event.target.value)}
                    inputMode="numeric"
                    className={inputClass}
                    placeholder="1 a 10"
                  />
                </label>
                <label className="text-sm font-bold text-brand-ink">
                  Texto do destaque
                  <input
                    value={intensityLabel}
                    onChange={(event) => setIntensityLabel(event.target.value)}
                    className={inputClass}
                    placeholder="Ex.: Alta, premium"
                  />
                </label>
              </div>

              <div className={panelClass}>
                <h3 className="font-extrabold text-brand-brown">
                  Opções que o cliente escolhe
                </h3>
                <p className="mt-1 text-sm leading-6 text-brand-ink/55">
                  Uma opção por linha. Exemplo:{" "}
                  <strong>Tamanho: P, M, G, GG</strong>. Se deixar vazio, o
                  cliente compra sem variação.
                </p>
                <textarea
                  value={productOptionsDraft}
                  onChange={(event) =>
                    setProductOptionsDraft(event.target.value)
                  }
                  className={`${inputClass} min-h-24 py-3`}
                  placeholder="Tamanho: P, M, G, GG"
                />
              </div>

              <div className={`${panelClass} grid gap-4 sm:grid-cols-2`}>
                <label className="text-sm font-bold text-brand-ink sm:col-span-2">
                  Descrição completa
                  <textarea
                    value={longDescription}
                    onChange={(event) => setLongDescription(event.target.value)}
                    className={`${inputClass} min-h-32 py-3`}
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
                  Preparo / uso indicado
                  <input
                    value={preparation}
                    onChange={(event) => setPreparation(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm font-bold text-brand-ink sm:col-span-2">
                  Notas / características
                  <textarea
                    value={sensoryNotes}
                    onChange={(event) => setSensoryNotes(event.target.value)}
                    className={`${inputClass} min-h-20 py-3`}
                  />
                </label>
                <label className="text-sm font-bold text-brand-ink sm:col-span-2">
                  Conteúdo do kit/fardo
                  <input
                    value={contents}
                    onChange={(event) => setContents(event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>

            <aside className="space-y-5">
              <div className={panelClass}>
                <ImageUploadField
                  label="Imagem do produto"
                  value={image}
                  onChange={setImage}
                  help="Use uma foto quadrada ou vertical, com fundo limpo."
                  contain
                />
              </div>
              <div className={panelClass}>
                <h3 className="font-extrabold text-brand-brown">Publicação</h3>
                <div className="mt-4 space-y-4">
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
              </div>
            </aside>
          </div>
        </div>
      )}
    </article>
  );
}
