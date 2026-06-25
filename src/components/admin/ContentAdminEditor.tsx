"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Eye,
  ImageIcon,
  LoaderCircle,
  Plus,
  Save,
  Store,
  Trash2,
} from "lucide-react";
import type { CarouselSlide, SiteContent } from "@/types/site-content";
import { ImageUploadField } from "./ImageUploadField";
import { subscriptionPlans } from "@/data/subscriptions";

const inputClass =
  "mt-2 min-h-11 w-full rounded-2xl border border-brand-brown/15 bg-white px-4 outline-none focus:border-brand-green";

function Field({
  label,
  value,
  onChange,
  type = "text",
  help,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  help?: string;
}) {
  return (
    <label className="text-sm font-bold text-brand-ink">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      {help && (
        <span className="mt-2 block text-xs font-medium text-brand-ink/45">
          {help}
        </span>
      )}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-bold text-brand-ink">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} min-h-28 py-3`}
      />
    </label>
  );
}

function Panel({
  title,
  description,
  icon: Icon,
  children,
  open,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details
      className="group overflow-hidden rounded-3xl border border-brand-brown/10 bg-white shadow-card"
      open={open}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-cream text-brand-brown">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-extrabold text-brand-brown">
            {title}
          </span>
          <span className="mt-1 block text-sm text-brand-ink/50">
            {description}
          </span>
        </span>
        <ChevronDown className="h-5 w-5 text-brand-brown transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-brand-brown/10 p-5 sm:p-6">
        {children}
      </div>
    </details>
  );
}

export function ContentAdminEditor({
  initialContent,
}: {
  initialContent: SiteContent;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const updateBrand = (
    key: keyof SiteContent["brand"],
    value: string,
  ) =>
    setContent((current) => ({
      ...current,
      brand: { ...current.brand, [key]: value },
    }));

  const updateHero = (key: keyof SiteContent["hero"], value: string) =>
    setContent((current) => ({
      ...current,
      hero: { ...current.hero, [key]: value },
    }));

  const updateSection = (
    key: keyof SiteContent["sections"],
    value: string | boolean,
  ) =>
    setContent((current) => ({
      ...current,
      sections: { ...current.sections, [key]: value },
    }));

  const updateSlide = (
    index: number,
    key: keyof CarouselSlide,
    value: string | boolean,
  ) =>
    setContent((current) => ({
      ...current,
      carousel: current.carousel.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, [key]: value } : slide,
      ),
    }));

  const addSlide = () =>
    setContent((current) => ({
      ...current,
      carousel: [
        ...current.carousel,
        {
          id: `slide-${Date.now()}`,
          enabled: true,
          eyebrow: "Novidade",
          title: "Novo destaque",
          text: "Escreva aqui a mensagem deste banner.",
          href: "/produtos",
          image: "/images/hero-manual.webp",
          tone: "brown",
        },
      ],
    }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const payload = (await response.json()) as {
        error?: string;
        content?: SiteContent;
      };
      if (!response.ok || !payload.content) {
        throw new Error(payload.error || "Falha ao salvar.");
      }
      setContent(payload.content);
      router.refresh();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
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
    <div>
      <div className="space-y-5">
        <Panel
          title="Identidade e contato"
          description="Logotipos, nome, aviso superior e canais de atendimento."
          icon={Store}
          open
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <ImageUploadField
              label="Logotipo para fundo claro"
              value={content.brand.logoDark}
              onChange={(value) => updateBrand("logoDark", value)}
              help="Usado no cabeçalho da loja."
              contain
            />
            <ImageUploadField
              label="Logotipo para fundo escuro"
              value={content.brand.logoLight}
              onChange={(value) => updateBrand("logoLight", value)}
              help="Usado no rodapé."
              contain
            />
            <Field
              label="Nome da marca"
              value={content.brand.name}
              onChange={(value) => updateBrand("name", value)}
            />
            <Field
              label="Frase da marca"
              value={content.brand.slogan}
              onChange={(value) => updateBrand("slogan", value)}
            />
            <div className="lg:col-span-2">
              <TextArea
                label="Descrição institucional"
                value={content.brand.description}
                onChange={(value) => updateBrand("description", value)}
              />
            </div>
            <div className="lg:col-span-2">
              <Field
                label="Aviso no topo do site"
                value={content.brand.announcement}
                onChange={(value) => updateBrand("announcement", value)}
              />
            </div>
            <Field
              label="WhatsApp"
              value={content.brand.whatsapp}
              onChange={(value) => updateBrand("whatsapp", value)}
              help="Somente números, incluindo 55 e DDD."
            />
            <Field
              label="E-mail"
              value={content.brand.email}
              type="email"
              onChange={(value) => updateBrand("email", value)}
            />
            <Field
              label="Instagram"
              value={content.brand.instagram}
              onChange={(value) => updateBrand("instagram", value)}
              help="Cole o endereço completo do perfil."
            />
            <Field
              label="CNPJ"
              value={content.brand.cnpj}
              onChange={(value) => updateBrand("cnpj", value)}
            />
          </div>
        </Panel>

        <Panel
          title="Capa da página inicial"
          description="Primeira imagem, título e botões que o cliente vê."
          icon={ImageIcon}
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <ImageUploadField
                label="Imagem principal"
                value={content.hero.image}
                onChange={(value) => updateHero("image", value)}
                help="Recomendado: imagem vertical ou quadrada."
              />
            </div>
            <Field
              label="Texto pequeno"
              value={content.hero.eyebrow}
              onChange={(value) => updateHero("eyebrow", value)}
            />
            <Field
              label="Origem destacada"
              value={content.hero.originLabel}
              onChange={(value) => updateHero("originLabel", value)}
            />
            <div className="lg:col-span-2">
              <Field
                label="Título principal"
                value={content.hero.title}
                onChange={(value) => updateHero("title", value)}
              />
            </div>
            <div className="lg:col-span-2">
              <TextArea
                label="Descrição"
                value={content.hero.description}
                onChange={(value) => updateHero("description", value)}
              />
            </div>
            <Field
              label="Texto do botão principal"
              value={content.hero.primaryLabel}
              onChange={(value) => updateHero("primaryLabel", value)}
            />
            <Field
              label="Destino do botão principal"
              value={content.hero.primaryHref}
              onChange={(value) => updateHero("primaryHref", value)}
            />
            <Field
              label="Texto do segundo botão"
              value={content.hero.secondaryLabel}
              onChange={(value) => updateHero("secondaryLabel", value)}
            />
            <Field
              label="Destino do segundo botão"
              value={content.hero.secondaryHref}
              onChange={(value) => updateHero("secondaryHref", value)}
            />
          </div>
        </Panel>

        <Panel
          title="Carrossel de destaques"
          description="Imagens e mensagens que alternam abaixo da capa."
          icon={ImageIcon}
        >
          <div className="space-y-5">
            {content.carousel.map((slide, index) => (
              <article
                key={slide.id}
                className="rounded-3xl border border-brand-brown/10 bg-brand-mist/45 p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-brand-green">
                      Banner {index + 1}
                    </p>
                    <p className="mt-1 font-extrabold text-brand-brown">
                      {slide.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={slide.enabled}
                        onChange={(event) =>
                          updateSlide(index, "enabled", event.target.checked)
                        }
                        className="h-5 w-5 accent-brand-green"
                      />
                      Visível
                    </label>
                    {content.carousel.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setContent((current) => ({
                            ...current,
                            carousel: current.carousel.filter(
                              (_, slideIndex) => slideIndex !== index,
                            ),
                          }))
                        }
                        className="rounded-full p-2 text-red-700 hover:bg-red-50"
                        aria-label={`Excluir banner ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <ImageUploadField
                      label="Imagem do banner"
                      value={slide.image}
                      onChange={(value) => updateSlide(index, "image", value)}
                      help="Recomendado: imagem horizontal."
                    />
                  </div>
                  <Field
                    label="Texto pequeno"
                    value={slide.eyebrow}
                    onChange={(value) => updateSlide(index, "eyebrow", value)}
                  />
                  <label className="text-sm font-bold text-brand-ink">
                    Cor do banner
                    <select
                      value={slide.tone}
                      onChange={(event) =>
                        updateSlide(index, "tone", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="green">Verde</option>
                      <option value="brown">Marrom</option>
                      <option value="olive">Oliva</option>
                    </select>
                  </label>
                  <div className="lg:col-span-2">
                    <Field
                      label="Título"
                      value={slide.title}
                      onChange={(value) => updateSlide(index, "title", value)}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <TextArea
                      label="Descrição"
                      value={slide.text}
                      onChange={(value) => updateSlide(index, "text", value)}
                    />
                  </div>
                  <Field
                    label="Destino do botão"
                    value={slide.href}
                    onChange={(value) => updateSlide(index, "href", value)}
                  />
                </div>
              </article>
            ))}
            {content.carousel.length < 8 && (
              <button
                type="button"
                onClick={addSlide}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-brown/20 bg-white px-5 text-sm font-extrabold text-brand-brown"
              >
                <Plus className="h-4 w-4" />
                Adicionar banner
              </button>
            )}
          </div>
        </Panel>

        <Panel
          title="Seções e imagens institucionais"
          description="Escolha o que aparece na home e troque imagens de história, origem e atacado."
          icon={Eye}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["featuredEnabled", "Produtos em destaque"],
              ["kitsEnabled", "Kits"],
              ["storyEnabled", "Nossa história"],
              ["originEnabled", "Origem e qualidade"],
              ["b2bEnabled", "Atacado"],
              ["testimonialsEnabled", "Depoimentos"],
              ["faqEnabled", "Dúvidas frequentes"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-brand-brown/10 bg-brand-mist/45 p-4 text-sm font-bold"
              >
                <input
                  type="checkbox"
                  checked={Boolean(
                    content.sections[key as keyof SiteContent["sections"]],
                  )}
                  onChange={(event) =>
                    updateSection(
                      key as keyof SiteContent["sections"],
                      event.target.checked,
                    )
                  }
                  className="h-5 w-5 accent-brand-green"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            <ImageUploadField
              label="Imagem da nossa história"
              value={content.sections.storyImage}
              onChange={(value) => updateSection("storyImage", value)}
            />
            <ImageUploadField
              label="Imagem de atacado"
              value={content.sections.b2bImage}
              onChange={(value) => updateSection("b2bImage", value)}
            />
            <div className="lg:col-span-2">
              <ImageUploadField
                label="Imagem de origem"
                value={content.sections.originImage}
                onChange={(value) => updateSection("originImage", value)}
              />
            </div>
            <div className="lg:col-span-2">
              <Field
                label="Título da seção Nossa história"
                value={content.sections.storyTitle}
                onChange={(value) => updateSection("storyTitle", value)}
              />
            </div>
            <div className="lg:col-span-2">
              <TextArea
                label="Texto da seção Nossa história"
                value={content.sections.storyDescription}
                onChange={(value) => updateSection("storyDescription", value)}
              />
            </div>
            <div className="lg:col-span-2">
              <Field
                label="Título da seção Atacado"
                value={content.sections.b2bTitle}
                onChange={(value) => updateSection("b2bTitle", value)}
              />
            </div>
            <div className="lg:col-span-2">
              <TextArea
                label="Texto da seção Atacado"
                value={content.sections.b2bDescription}
                onChange={(value) => updateSection("b2bDescription", value)}
              />
            </div>
          </div>
        </Panel>

        <Panel
          title="Frete e divulgação"
          description="Valores de entrega, frete grátis e dados usados ao compartilhar o site."
          icon={Store}
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Field
              label="Valor padrão do frete"
              value={content.commerce.standardShippingPrice}
              type="number"
              onChange={(value) =>
                setContent((current) => ({
                  ...current,
                  commerce: {
                    ...current.commerce,
                    standardShippingPrice: Number(value),
                  },
                }))
              }
            />
            <Field
              label="Frete grátis a partir de"
              value={content.commerce.freeShippingThreshold}
              type="number"
              onChange={(value) =>
                setContent((current) => ({
                  ...current,
                  commerce: {
                    ...current.commerce,
                    freeShippingThreshold: Number(value),
                  },
                }))
              }
            />
            <div className="hidden lg:col-span-2">
              <div className="rounded-3xl border border-brand-brown/10 bg-brand-mist/45 p-5">
                <h3 className="text-lg font-extrabold text-brand-brown">
                  Preços das assinaturas
                </h3>
                <p className="mt-2 text-sm text-brand-ink/50">
                  Esses valores são cobrados automaticamente na frequência
                  escolhida pelo cliente.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {subscriptionPlans.flatMap((plan) =>
                    plan.options.map((option) => (
                      <Field
                        key={option.id}
                        label={`${plan.name} · ${option.label}`}
                        value={
                          content.commerce.subscriptionPrices[option.id] ??
                          option.amount
                        }
                        type="number"
                        onChange={(value) =>
                          setContent((current) => ({
                            ...current,
                            commerce: {
                              ...current.commerce,
                              subscriptionPrices: {
                                ...current.commerce.subscriptionPrices,
                                [option.id]: Number(value),
                              },
                            },
                          }))
                        }
                      />
                    )),
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <Field
                label="Título para Google e compartilhamento"
                value={content.seo.title}
                onChange={(value) =>
                  setContent((current) => ({
                    ...current,
                    seo: { ...current.seo, title: value },
                  }))
                }
              />
            </div>
            <div className="lg:col-span-2">
              <TextArea
                label="Descrição para Google"
                value={content.seo.description}
                onChange={(value) =>
                  setContent((current) => ({
                    ...current,
                    seo: { ...current.seo, description: value },
                  }))
                }
              />
            </div>
            <div className="lg:col-span-2">
              <ImageUploadField
                label="Imagem de compartilhamento"
                value={content.seo.socialImage}
                onChange={(value) =>
                  setContent((current) => ({
                    ...current,
                    seo: { ...current.seo, socialImage: value },
                  }))
                }
              />
            </div>
          </div>
        </Panel>
      </div>

      {error && (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      )}
      <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex min-h-14 items-center gap-2 rounded-full bg-brand-green px-7 text-sm font-extrabold text-white shadow-xl shadow-brand-green/20 disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : saved ? (
            <Check className="h-5 w-5" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving
            ? "Salvando..."
            : saved
              ? "Alterações salvas"
              : "Salvar conteúdo"}
        </button>
      </div>
    </div>
  );
}
