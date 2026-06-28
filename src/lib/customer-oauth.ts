import "server-only";

import { randomUUID, createSign } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createCustomerSession,
  customerSessionCookieOptions,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer-auth";
import { createCustomerAccount, getCustomerAccountByEmail } from "@/lib/customer-db";
import { createOpaqueToken, hashPassword } from "@/lib/customer-crypto";
import { normalizeCustomerRedirect } from "@/lib/customer-redirect";
import type { CustomerAccount } from "@/types/customer";

export type CustomerOAuthProvider = "google" | "apple";

type OAuthProfile = {
  email: string;
  emailVerified: boolean;
  fullName: string;
};

const OAUTH_STATE_COOKIE = "cbc_customer_oauth_state";
const OAUTH_STATE_SECONDS = 10 * 60;

const oauthStateCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: OAUTH_STATE_SECONDS,
};

const providerLabels: Record<CustomerOAuthProvider, string> = {
  google: "Google",
  apple: "Apple",
};

const base64UrlJson = (value: unknown) =>
  Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

const decodeBase64UrlJson = <T>(value: string): T | null => {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
};

const decodeJwtPayload = (jwt: string) => {
  const [, payload] = jwt.split(".");
  return payload ? decodeBase64UrlJson<Record<string, unknown>>(payload) : null;
};

const getSiteOrigin = (request: Request) => {
  const configured =
    process.env.CUSTOMER_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(request.url).origin;
  return configured.replace(/\/$/, "");
};

const callbackUrl = (request: Request, provider: CustomerOAuthProvider) =>
  `${getSiteOrigin(request)}/api/account/oauth/${provider}/callback`;

export const isCustomerOAuthProvider = (
  value: string,
): value is CustomerOAuthProvider => value === "google" || value === "apple";

const getGoogleConfig = () => {
  const clientId =
    process.env.CUSTOMER_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret =
    process.env.CUSTOMER_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("oauth_config");
  }
  return { clientId, clientSecret };
};

const getAppleConfig = () => {
  const clientId =
    process.env.CUSTOMER_APPLE_CLIENT_ID || process.env.APPLE_CLIENT_ID;
  const teamId = process.env.CUSTOMER_APPLE_TEAM_ID || process.env.APPLE_TEAM_ID;
  const keyId = process.env.CUSTOMER_APPLE_KEY_ID || process.env.APPLE_KEY_ID;
  const privateKey =
    process.env.CUSTOMER_APPLE_PRIVATE_KEY || process.env.APPLE_PRIVATE_KEY;
  if (!clientId || !teamId || !keyId || !privateKey) {
    throw new Error("oauth_config");
  }
  return {
    clientId,
    teamId,
    keyId,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
};

const createState = (redirectTo: string) => {
  const token = createOpaqueToken();
  const payload = base64UrlJson({ redirectTo });
  return { token, state: `${token}.${payload}` };
};

const readState = async (state: string | null) => {
  const cookieStore = await cookies();
  const expectedToken = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const [token, payload] = state?.split(".") || [];
  if (!expectedToken || !token || token !== expectedToken || !payload) {
    throw new Error("oauth_state");
  }
  const decoded = decodeBase64UrlJson<{ redirectTo?: string }>(payload);
  return normalizeCustomerRedirect(decoded?.redirectTo);
};

const redirectWithOAuthError = (
  request: Request,
  error: unknown,
  redirectTo = "/minha-conta",
) => {
  const code =
    error instanceof Error && error.message
      ? error.message
      : "oauth_failed";
  const destination = new URL("/entrar", getSiteOrigin(request));
  destination.searchParams.set("redirect", redirectTo);
  destination.searchParams.set("oauth_error", code);
  const response = NextResponse.redirect(destination);
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    ...oauthStateCookieOptions,
    maxAge: 0,
  });
  return response;
};

export const startCustomerOAuth = async (
  request: Request,
  provider: CustomerOAuthProvider,
) => {
  try {
    const url = new URL(request.url);
    const redirectTo = normalizeCustomerRedirect(url.searchParams.get("redirect"));
    const { token, state } = createState(redirectTo);
    let destination: URL;

    if (provider === "google") {
      const { clientId } = getGoogleConfig();
      destination = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      destination.searchParams.set("client_id", clientId);
      destination.searchParams.set("redirect_uri", callbackUrl(request, provider));
      destination.searchParams.set("response_type", "code");
      destination.searchParams.set("scope", "openid email profile");
      destination.searchParams.set("state", state);
      destination.searchParams.set("prompt", "select_account");
    } else {
      const { clientId } = getAppleConfig();
      destination = new URL("https://appleid.apple.com/auth/authorize");
      destination.searchParams.set("client_id", clientId);
      destination.searchParams.set("redirect_uri", callbackUrl(request, provider));
      destination.searchParams.set("response_type", "code");
      destination.searchParams.set("response_mode", "form_post");
      destination.searchParams.set("scope", "name email");
      destination.searchParams.set("state", state);
    }

    const response = NextResponse.redirect(destination);
    response.cookies.set(OAUTH_STATE_COOKIE, token, oauthStateCookieOptions);
    return response;
  } catch (error) {
    return redirectWithOAuthError(request, error);
  }
};

const postForm = async <T>(url: string, body: URLSearchParams) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail.includes("invalid_grant") ? "oauth_denied" : "oauth_failed");
  }
  return (await response.json()) as T;
};

const exchangeGoogleCode = async (
  request: Request,
  code: string,
): Promise<OAuthProfile> => {
  const { clientId, clientSecret } = getGoogleConfig();
  const token = await postForm<{
    access_token?: string;
  }>(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: callbackUrl(request, "google"),
    }),
  );

  if (!token.access_token) throw new Error("oauth_failed");
  const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (!userResponse.ok) throw new Error("oauth_failed");
  const user = (await userResponse.json()) as {
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
  return {
    email: user.email || "",
    emailVerified: Boolean(user.email_verified),
    fullName: user.name || "",
  };
};

const derToJoseSignature = (signature: Buffer) => {
  let offset = 0;
  const readLength = () => {
    const first = signature[offset++];
    if (first < 0x80) return first;
    const bytes = first & 0x7f;
    let length = 0;
    for (let index = 0; index < bytes; index += 1) {
      length = (length << 8) + signature[offset++];
    }
    return length;
  };
  const readInteger = () => {
    if (signature[offset++] !== 0x02) throw new Error("oauth_config");
    const length = readLength();
    return signature.subarray(offset, (offset += length));
  };
  const normalizeInteger = (value: Buffer) => {
    let normalized = value;
    while (normalized.length > 0 && normalized[0] === 0) {
      normalized = normalized.subarray(1);
    }
    if (normalized.length > 32) normalized = normalized.subarray(-32);
    return Buffer.concat([Buffer.alloc(32 - normalized.length), normalized]);
  };

  if (signature[offset++] !== 0x30) throw new Error("oauth_config");
  readLength();
  const r = normalizeInteger(readInteger());
  const s = normalizeInteger(readInteger());
  return Buffer.concat([r, s]).toString("base64url");
};

const appleClientSecret = () => {
  const { clientId, teamId, keyId, privateKey } = getAppleConfig();
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: "ES256", kid: keyId, typ: "JWT" });
  const payload = base64UrlJson({
    iss: teamId,
    iat: now,
    exp: now + 5 * 60,
    aud: "https://appleid.apple.com",
    sub: clientId,
  });
  const unsigned = `${header}.${payload}`;
  const signer = createSign("SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = derToJoseSignature(signer.sign(privateKey));
  return { clientId, clientSecret: `${unsigned}.${signature}` };
};

const appleNameFromUser = (userPayload?: string | null) => {
  if (!userPayload) return "";
  const parsed = decodeBase64UrlJson<{
    name?: { firstName?: string; lastName?: string };
  }>(Buffer.from(userPayload, "utf8").toString("base64url"));
  const firstName = parsed?.name?.firstName || "";
  const lastName = parsed?.name?.lastName || "";
  return `${firstName} ${lastName}`.trim();
};

const exchangeAppleCode = async (
  request: Request,
  code: string,
  userPayload?: string | null,
): Promise<OAuthProfile> => {
  const { clientId, clientSecret } = appleClientSecret();
  const token = await postForm<{
    id_token?: string;
  }>(
    "https://appleid.apple.com/auth/token",
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: callbackUrl(request, "apple"),
    }),
  );
  const payload = token.id_token ? decodeJwtPayload(token.id_token) : null;
  const email = typeof payload?.email === "string" ? payload.email : "";
  const verified = payload?.email_verified;
  return {
    email,
    emailVerified: verified === true || verified === "true",
    fullName: appleNameFromUser(userPayload),
  };
};

const getOrCreateOAuthAccount = async (
  profile: OAuthProfile,
  provider: CustomerOAuthProvider,
): Promise<CustomerAccount> => {
  const email = profile.email.trim().toLowerCase();
  if (!email || !profile.emailVerified) {
    throw new Error("oauth_email");
  }

  const existing = await getCustomerAccountByEmail(email);
  if (existing) return existing;

  const fullName =
    profile.fullName.trim().slice(0, 160) ||
    `Cliente ${providerLabels[provider]}`;
  const account = await createCustomerAccount({
    id: randomUUID(),
    email,
    passwordHash: await hashPassword(createOpaqueToken()),
    profile: {
      fullName,
      whatsapp: "",
      cpf: "",
    },
  });
  if (!account) throw new Error("oauth_failed");
  return account;
};

export const finishCustomerOAuth = async (
  request: Request,
  provider: CustomerOAuthProvider,
  input: {
    code?: string | null;
    state?: string | null;
    user?: string | null;
    error?: string | null;
  },
) => {
  let redirectTo = "/minha-conta";
  try {
    if (input.error) throw new Error("oauth_denied");
    redirectTo = await readState(input.state || null);
    if (!input.code) throw new Error("oauth_denied");
    const profile =
      provider === "google"
        ? await exchangeGoogleCode(request, input.code)
        : await exchangeAppleCode(request, input.code, input.user);
    const account = await getOrCreateOAuthAccount(profile, provider);
    const session = await createCustomerSession(account.id);
    const response = NextResponse.redirect(new URL(redirectTo, getSiteOrigin(request)));
    response.cookies.set(
      CUSTOMER_SESSION_COOKIE,
      session.token,
      customerSessionCookieOptions,
    );
    response.cookies.set(OAUTH_STATE_COOKIE, "", {
      ...oauthStateCookieOptions,
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return redirectWithOAuthError(request, error, redirectTo);
  }
};
