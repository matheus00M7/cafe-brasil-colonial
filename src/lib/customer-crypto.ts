import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

const SCRYPT_N = 131_072;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 256 * 1024 * 1024;

const deriveScrypt = (
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number; maxmem: number },
) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });

const getEncryptionKey = () => {
  const configured = process.env.CUSTOMER_DATA_ENCRYPTION_KEY?.trim();
  if (configured) {
    const key = Buffer.from(configured, "base64");
    if (key.length !== 32) {
      throw new Error(
        "CUSTOMER_DATA_ENCRYPTION_KEY precisa conter 32 bytes em Base64.",
      );
    }
    return key;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CUSTOMER_DATA_ENCRYPTION_KEY não foi configurada em produção.",
    );
  }
  return createHash("sha256")
    .update("cafe-brasil-colonial-local-development-only")
    .digest();
};

export const encryptCustomerData = (value: unknown) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
};

export const decryptCustomerData = <T>(value: string): T => {
  const [version, ivText, tagText, encryptedText] = value.split(".");
  if (
    version !== "v1" ||
    !ivText ||
    !tagText ||
    !encryptedText
  ) {
    throw new Error("Dados de cliente inválidos.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivText, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8")) as T;
};

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16);
  const derived = await deriveScrypt(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAX_MEMORY,
  });
  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
};

export const verifyPassword = async (
  password: string,
  encodedHash: string,
) => {
  const [algorithm, nText, rText, pText, saltText, hashText] =
    encodedHash.split("$");
  if (
    algorithm !== "scrypt" ||
    !nText ||
    !rText ||
    !pText ||
    !saltText ||
    !hashText
  ) {
    return false;
  }
  const expected = Buffer.from(hashText, "base64url");
  const actual = await deriveScrypt(
    password,
    Buffer.from(saltText, "base64url"),
    expected.length,
    {
      N: Number(nText),
      r: Number(rText),
      p: Number(pText),
      maxmem: SCRYPT_MAX_MEMORY,
    },
  );
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
};

export const createOpaqueToken = () => randomBytes(32).toString("base64url");

export const hashOpaqueToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
