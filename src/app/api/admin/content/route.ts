import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSiteContent, updateSiteContent } from "@/lib/orders-db";
import type { SiteContent } from "@/types/site-content";

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const imagePath = (value: unknown) => {
  const path = clean(value, 500);
  return path.startsWith("/") ? path : "";
};

const href = (value: unknown) => {
  const target = clean(value, 500);
  return target.startsWith("/") || target.startsWith("https://") ? target : "/";
};

const externalUrl = (value: unknown) => {
  const target = clean(value, 300);
  return target.startsWith("https://") ? target : "";
};

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return NextResponse.json(await getSiteContent());
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const input = (await request.json()) as SiteContent;
    const current = await getSiteContent();
    const content: SiteContent = {
      brand: {
        name: clean(input.brand?.name, 100) || current.brand.name,
        slogan: clean(input.brand?.slogan, 180),
        description: clean(input.brand?.description, 500),
        logoDark: imagePath(input.brand?.logoDark) || current.brand.logoDark,
        logoLight: imagePath(input.brand?.logoLight) || current.brand.logoLight,
        whatsapp: clean(input.brand?.whatsapp, 30).replace(/\D/g, ""),
        instagram: externalUrl(input.brand?.instagram),
        email: clean(input.brand?.email, 180).toLowerCase(),
        cnpj: clean(input.brand?.cnpj, 30),
        announcement: clean(input.brand?.announcement, 180),
      },
      hero: {
        eyebrow: clean(input.hero?.eyebrow, 100),
        title: clean(input.hero?.title, 220),
        description: clean(input.hero?.description, 600),
        image: imagePath(input.hero?.image) || current.hero.image,
        primaryLabel: clean(input.hero?.primaryLabel, 80),
        primaryHref: href(input.hero?.primaryHref),
        secondaryLabel: clean(input.hero?.secondaryLabel, 80),
        secondaryHref: href(input.hero?.secondaryHref),
        originLabel: clean(input.hero?.originLabel, 140),
      },
      carousel: (Array.isArray(input.carousel) ? input.carousel : [])
        .slice(0, 8)
        .map((slide, index) => ({
          id: clean(slide.id, 80) || `slide-${index + 1}`,
          enabled: Boolean(slide.enabled),
          eyebrow: clean(slide.eyebrow, 100),
          title: clean(slide.title, 220),
          text: clean(slide.text, 600),
          href: href(slide.href),
          image: imagePath(slide.image),
          tone: ["green", "brown", "olive"].includes(slide.tone)
            ? slide.tone
            : "brown",
        }))
        .filter((slide) => slide.title),
      sections: {
        featuredEnabled: Boolean(input.sections?.featuredEnabled),
        kitsEnabled: Boolean(input.sections?.kitsEnabled),
        storyEnabled: Boolean(input.sections?.storyEnabled),
        originEnabled: Boolean(input.sections?.originEnabled),
        b2bEnabled: Boolean(input.sections?.b2bEnabled),
        testimonialsEnabled: Boolean(input.sections?.testimonialsEnabled),
        faqEnabled: Boolean(input.sections?.faqEnabled),
        storyTitle: clean(input.sections?.storyTitle, 220),
        storyDescription: clean(input.sections?.storyDescription, 1200),
        storyImage:
          imagePath(input.sections?.storyImage) || current.sections.storyImage,
        b2bTitle: clean(input.sections?.b2bTitle, 220),
        b2bDescription: clean(input.sections?.b2bDescription, 1200),
        b2bImage:
          imagePath(input.sections?.b2bImage) || current.sections.b2bImage,
        originImage:
          imagePath(input.sections?.originImage) || current.sections.originImage,
      },
      commerce: {
        standardShippingPrice: Math.max(
          0,
          Number(input.commerce?.standardShippingPrice) || 0,
        ),
        freeShippingThreshold: Math.max(
          0,
          Number(input.commerce?.freeShippingThreshold) || 0,
        ),
        subscriptionPrices: Object.fromEntries(
          Object.entries(current.commerce.subscriptionPrices).map(
            ([id, currentPrice]) => [
              id,
              Math.max(
                0.01,
                Number(input.commerce?.subscriptionPrices?.[id]) ||
                  currentPrice,
              ),
            ],
          ),
        ),
      },
      seo: {
        title: clean(input.seo?.title, 180),
        description: clean(input.seo?.description, 500),
        socialImage:
          imagePath(input.seo?.socialImage) || current.seo.socialImage,
      },
      updatedAt: current.updatedAt,
    };

    if (!content.carousel.length) content.carousel = current.carousel;
    const saved = await updateSiteContent(content);
    return NextResponse.json({ ok: true, content: saved });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o conteúdo.",
      },
      { status: 400 },
    );
  }
}
