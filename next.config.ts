import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://*.mercadopago.com https://*.mercadopago.com.br",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com https://*.mercadopago.com.br",
  "frame-src https://*.mercadopago.com https://*.mercadopago.com.br",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const noStoreHeaders = [{ key: "Cache-Control", value: "private, no-store" }];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
      { key: "Content-Security-Policy", value: csp },
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : []),
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/api/admin/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/checkout/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/minha-conta/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/pedido/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/rastrear/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/api/account/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/api/orders/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/api/checkout/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/api/payments/:path*",
        headers: noStoreHeaders,
      },
    ];
  },
};

export default nextConfig;
