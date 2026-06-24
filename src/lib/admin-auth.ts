import "server-only";

import {
  createHmac,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "cbc_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 10;

type SessionPayload = {
  email: string;
  expiresAt: number;
};

const getAdminEmail = () =>
  (process.env.ADMIN_EMAIL || "admin@cafebrasilcolonial.com.br")
    .trim()
    .toLowerCase();

const getSessionSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET não foi configurado com segurança.");
  }
  return secret;
};

const sign = (value: string) =>
  createHmac("sha256", getSessionSecret()).update(value).digest("base64url");

export const verifyAdminCredentials = (email: string, password: string) => {
  const configured = process.env.ADMIN_PASSWORD_HASH;
  if (!configured) return false;
  if (email.trim().toLowerCase() !== getAdminEmail()) return false;

  const [salt, expectedHex] = configured.split(":");
  if (!salt || !expectedHex) return false;

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
};

export const createAdminSession = (email: string) => {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
};

export const verifyAdminSession = (token: string | undefined | null) => {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.expiresAt <= Date.now()) return null;
    if (payload.email !== getAdminEmail()) return null;
    return payload;
  } catch {
    return null;
  }
};

export const getAdminSession = async () => {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
};

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
