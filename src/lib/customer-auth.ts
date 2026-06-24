import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import {
  createCustomerAccount,
  createCustomerSessionRecord,
  createPasswordResetRecord,
  deleteCustomerSessionRecord,
  getCustomerAccountByEmail,
  getCustomerPasswordHash,
  getCustomerSessionRecord,
  consumePasswordResetRecord,
  updateCustomerPassword,
} from "@/lib/customer-db";
import {
  createOpaqueToken,
  hashOpaqueToken,
  hashPassword,
  verifyPassword,
} from "@/lib/customer-crypto";
import type { CustomerProfile } from "@/types/customer";

export const CUSTOMER_SESSION_COOKIE = "cbc_customer_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const RESET_SECONDS = 60 * 30;

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const validateNewPassword = (password: string) => {
  if (password.length < 10) {
    throw new Error("A senha precisa ter pelo menos 10 caracteres.");
  }
  if (password.length > 128) {
    throw new Error("A senha ultrapassou o limite permitido.");
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Use pelo menos uma letra e um número na senha.");
  }
};

export const registerCustomer = async (input: {
  email: string;
  password: string;
  fullName: string;
  whatsapp: string;
}) => {
  const email = normalizeEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Informe um e-mail válido.");
  }
  validateNewPassword(input.password);
  const fullName = input.fullName.trim().slice(0, 160);
  const whatsapp = input.whatsapp.replace(/\D/g, "").slice(0, 15);
  if (fullName.length < 3 || whatsapp.length < 10) {
    throw new Error("Confira seu nome e WhatsApp.");
  }
  if (await getCustomerAccountByEmail(email)) {
    throw new Error("Já existe uma conta com este e-mail.");
  }
  const profile: CustomerProfile = { fullName, whatsapp, cpf: "" };
  const account = await createCustomerAccount({
    id: randomUUID(),
    email,
    passwordHash: await hashPassword(input.password),
    profile,
  });
  if (!account) throw new Error("Não foi possível criar a conta.");
  return account;
};

export const authenticateCustomer = async (
  emailInput: string,
  password: string,
) => {
  const email = normalizeEmail(emailInput);
  const passwordHash = await getCustomerPasswordHash(email);
  if (!passwordHash || !(await verifyPassword(password, passwordHash))) {
    return null;
  }
  return getCustomerAccountByEmail(email);
};

export const createCustomerSession = async (accountId: string) => {
  const token = createOpaqueToken();
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + SESSION_SECONDS * 1000,
  ).toISOString();
  await createCustomerSessionRecord({
    token_hash: hashOpaqueToken(token),
    account_id: accountId,
    expires_at: expiresAt,
    created_at: now.toISOString(),
  });
  return { token, expiresAt };
};

export const getCustomerSession = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
    return token
      ? getCustomerSessionRecord(hashOpaqueToken(token))
      : null;
  } catch {
    return null;
  }
};

export const deleteCustomerSession = async (token?: string) => {
  if (token) await deleteCustomerSessionRecord(hashOpaqueToken(token));
};

export const customerSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
};

export const createPasswordReset = async (emailInput: string) => {
  const account = await getCustomerAccountByEmail(normalizeEmail(emailInput));
  if (!account) return null;
  const token = createOpaqueToken();
  const now = new Date();
  await createPasswordResetRecord({
    token_hash: hashOpaqueToken(token),
    account_id: account.id,
    expires_at: new Date(now.getTime() + RESET_SECONDS * 1000).toISOString(),
    used_at: null,
    created_at: now.toISOString(),
  });
  return { token, account };
};

export const resetCustomerPassword = async (
  token: string,
  password: string,
) => {
  validateNewPassword(password);
  const accountId = await consumePasswordResetRecord(hashOpaqueToken(token));
  if (!accountId) throw new Error("O link expirou ou já foi utilizado.");
  await updateCustomerPassword(accountId, await hashPassword(password));
  return accountId;
};

export const changeCustomerPassword = async (
  accountId: string,
  email: string,
  currentPassword: string,
  newPassword: string,
) => {
  const account = await authenticateCustomer(email, currentPassword);
  if (!account || account.id !== accountId) {
    throw new Error("A senha atual está incorreta.");
  }
  validateNewPassword(newPassword);
  await updateCustomerPassword(accountId, await hashPassword(newPassword));
};
