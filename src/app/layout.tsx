import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SiteContentProvider } from "@/context/SiteContentContext";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { getSiteContent } from "@/lib/orders-db";
import { getCustomerSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    title: {
      default: content.seo.title,
      template: `%s | ${content.brand.name}`,
    },
    description: content.seo.description,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: content.seo.socialImage,
          width: 1200,
          height: 630,
          alt: content.brand.name,
        },
      ],
    },
    icons: {
      icon: "/brand/icon.png",
      apple: "/brand/apple-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const content = await getSiteContent();
  const customerSession = await getCustomerSession();
  return (
    <html lang="pt-BR">
      <body>
        <SiteContentProvider content={content}>
          <CartProvider>
            <SiteChrome
              customer={
                customerSession
                  ? {
                      fullName: customerSession.account.profile.fullName,
                    }
                  : null
              }
            >
              {children}
            </SiteChrome>
          </CartProvider>
        </SiteContentProvider>
      </body>
    </html>
  );
}
