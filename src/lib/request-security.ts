import "server-only";

export class RequestSecurityError extends Error {}

export const assertSameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  if (!origin) return;
  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new RequestSecurityError("Origem da solicitação inválida.");
  }
  const requestUrl = new URL(request.url);
  const expectedHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    requestUrl.host;
  if (originUrl.host !== expectedHost) {
    throw new RequestSecurityError("Solicitação bloqueada por segurança.");
  }
};

export const requestIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "local";
