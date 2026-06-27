import "server-only";

const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const uploadsBucket = process.env.SUPABASE_UPLOADS_BUCKET || "site-uploads";

const normalizeSupabaseBaseUrl = (url: string) =>
  url.replace(/\/rest\/v1$/i, "");

const getSupabaseStorageBaseUrl = () => {
  if (!supabaseUrl || !supabaseKey) return null;
  return normalizeSupabaseBaseUrl(supabaseUrl);
};

const storageHeaders = () => {
  if (!supabaseKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };
};

const encodeObjectKey = (key: string) =>
  key
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");

const redactStorageError = (message: string) =>
  message
    .replace(/Bearer\s+[A-Za-z0-9._:-]{8,}/gi, "Bearer ***")
    .replace(/sb_secret_[A-Za-z0-9._:-]{8,}/g, "sb_secret_***")
    .slice(0, 500);

export const hasSupabaseUploadStorage = () =>
  Boolean(getSupabaseStorageBaseUrl() && supabaseKey);

const storageRequest = async (path: string, init?: RequestInit) => {
  const baseUrl = getSupabaseStorageBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para enviar imagens no site publicado.",
    );
  }

  return fetch(`${baseUrl}/storage/v1/${path}`, {
    ...init,
    headers: {
      ...storageHeaders(),
      ...init?.headers,
    },
    cache: "no-store",
  });
};

export const ensureUploadsBucket = async () => {
  const current = await storageRequest(`bucket/${uploadsBucket}`);
  if (current.ok) return;

  if (current.status !== 404) {
    throw new Error(
      `Não foi possível verificar o bucket de imagens: ${redactStorageError(
        await current.text(),
      )}`,
    );
  }

  const created = await storageRequest("bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: uploadsBucket,
      name: uploadsBucket,
      public: false,
      file_size_limit: 8 * 1024 * 1024,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
    }),
  });

  if (!created.ok && created.status !== 409) {
    throw new Error(
      `Não foi possível criar o bucket de imagens: ${redactStorageError(
        await created.text(),
      )}`,
    );
  }
};

export const uploadImageToStorage = async (
  file: File,
  fileName: string,
) => {
  await ensureUploadsBucket();

  const objectKey = `admin/${fileName}`;
  const response = await storageRequest(
    `object/${uploadsBucket}/${encodeObjectKey(objectKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "x-upsert": "true",
      },
      body: Buffer.from(await file.arrayBuffer()),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Não foi possível salvar a imagem no Supabase Storage: ${redactStorageError(
        await response.text(),
      )}`,
    );
  }

  return objectKey;
};

export const fetchImageFromStorage = async (objectKey: string) => {
  const cleanedKey = objectKey
    .split("/")
    .filter(Boolean)
    .join("/");

  if (!cleanedKey) throw new Error("Imagem não encontrada.");

  const response = await storageRequest(
    `object/${uploadsBucket}/${encodeObjectKey(cleanedKey)}`,
  );

  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar a imagem enviada: ${redactStorageError(
        await response.text(),
      )}`,
    );
  }

  return response;
};
