import "server-only";

export class RequestSecurityError extends Error {}

const expectedHostFor = (request: Request) => {
  const requestUrl = new URL(request.url);
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    requestUrl.host
  );
};

const assertHostMatches = (url: string, expectedHost: string) => {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new RequestSecurityError("Origem da solicitação inválida.");
  }

  if (parsedUrl.host !== expectedHost) {
    throw new RequestSecurityError("Solicitação bloqueada por segurança.");
  }
};

export const assertSameOrigin = (request: Request) => {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    throw new RequestSecurityError("Solicitação bloqueada por segurança.");
  }

  const expectedHost = expectedHostFor(request);
  const origin = request.headers.get("origin");
  if (origin) {
    assertHostMatches(origin, expectedHost);
    return;
  }

  const referer = request.headers.get("referer");
  if (referer) assertHostMatches(referer, expectedHost);
};

export const requestIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "local";
