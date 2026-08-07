"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, PackagePlus, Plus, X } from "lucide-react";
import type { ProductCategory, ProductKind, ProductOption } from "@/types/product";
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
    label: "Fardo de café",
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
    description: "Produto físico com cor/modelo.",
    emoji: "🥤",
    category: "Canecas",
    type: "Caneca personalizada",
    options: "Cor: Branca, Preta",
  },
  {
    value: "shirt",
    label: "Camiseta",
    description: "Roupa com tamanho obrigatório.",
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

const initialImage = "/products/tradicional-500g.webp";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "opcao";

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

export function CreateProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState(initialImage);
  const [category, setCategory] = useState<ProductCategory>("Tradicional");
  const [productKind, setProductKind] = useState<ProductKind>("coffee");
  const [productOptionsDraft, setProductOptionsDraft] = useState("");
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
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const applyProductKind = (kind: (typeof productKinds)[number]) => {
    setProductKind(kind.value);
    setCategory(kind.category);
    setType(kind.type);
    if (kind.options) setProductOptionsDraft(kind.options);
  };

  const reset = () => {
    setName("");
    setImage(initialImage);
    setCategory("Tradicional");
    setProductKind("coffee");
    setProductOptionsDraft("");
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
    setPrice("");
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
          productKind,
          productOptions: parseProductOptions(productOptionsDraft),
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
            Escolha o tipo do produto primeiro. Se for camiseta, caneca ou outro
            item com variação, cadastre as opções que o cliente deve escolher.
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

      <div className="mt-6 space-y-5">
        <div className={panelClass}>
          <h3 className="text-lg font-extrabold text-brand-brown">
            Tipo de produto
          </h3>
          <p className="mt-1 text-sm text-brand-ink/55">
            Isso muda como o produto se comporta na loja. Camiseta, por exemplo,
            pode exigir tamanho.
          </p>
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
                  placeholder="Ex.: Camisa da Seleção Brasileira"
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
                  placeholder="Ex.: 39,90"
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
                  placeholder="Ex.: 500g, unidade, fardo"
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
                  placeholder="Ex.: Torrado e moído, camiseta algodão"
                />
              </label>
              <label className="text-sm font-bold text-brand-ink">
                Selo
                <input
                  value={badge}
                  onChange={(event) => setBadge(event.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Lançamento"
                />
              </label>
              <label className="text-sm font-bold text-brand-ink">
                Torra / acabamento
                <input
                  value={roast}
                  onChange={(event) => setRoast(event.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Média ou Algodão"
                />
              </label>
              <label className="text-sm font-bold text-brand-ink">
                Moagem / modelo
                <input
                  value={grind}
                  onChange={(event) => setGrind(event.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Moagem para coador ou Masculina"
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
                  placeholder="Ex.: Premium, alta"
                />
              </label>
            </div>

            <div className={panelClass}>
              <h3 className="font-extrabold text-brand-brown">
                Opções que o cliente escolhe
              </h3>
              <p className="mt-1 text-sm leading-6 text-brand-ink/55">
                Use uma opção por linha. Exemplo:{" "}
                <strong>Tamanho: P, M, G, GG</strong>. Se deixar vazio, o
                cliente compra direto sem escolher variação.
              </p>
              <textarea
                value={productOptionsDraft}
                onChange={(event) => setProductOptionsDraft(event.target.value)}
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
                  placeholder="Separe por vírgula. Ex.: Encorpado, 100% algodão"
                />
              </label>
              <label className="text-sm font-bold text-brand-ink sm:col-span-2">
                Conteúdo do kit/fardo
                <input
                  value={contents}
                  onChange={(event) => setContents(event.target.value)}
                  className={inputClass}
                  placeholder="Ex.: 12 unidades de 500g"
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
                help="Imagem quadrada ou vertical funciona melhor."
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
              {error && (
                <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={create}
                disabled={saving}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-5 text-sm font-extrabold text-white hover:bg-[#4d1a0e] disabled:opacity-60"
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
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
