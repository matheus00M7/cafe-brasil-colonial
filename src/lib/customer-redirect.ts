const allowedCustomerRedirectPrefixes = [
  "/checkout",
  "/carrinho",
  "/minha-conta",
  "/pedido",
  "/produtos",
];

export function normalizeCustomerRedirect(
  value?: string | string[] | null,
  fallback = "/minha-conta",
) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return fallback;

  let decoded = candidate;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    decoded = candidate;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    decoded.startsWith("/api") ||
    decoded.startsWith("/admin") ||
    decoded.startsWith("/assinatura")
  ) {
    return fallback;
  }

  const isAllowed = allowedCustomerRedirectPrefixes.some(
    (prefix) => decoded === prefix || decoded.startsWith(`${prefix}/`),
  );

  return isAllowed ? decoded : fallback;
}

export function customerAuthUrl(
  path: "/entrar" | "/cadastro",
  redirectTo?: string,
) {
  const safeRedirect = normalizeCustomerRedirect(redirectTo);
  if (safeRedirect === "/minha-conta") return path;
  return `${path}?redirect=${encodeURIComponent(safeRedirect)}`;
}
