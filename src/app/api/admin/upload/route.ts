import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { assertSameOrigin } from "@/lib/request-security";
import {
  hasSupabaseUploadStorage,
  uploadImageToStorage,
} from "@/lib/upload-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const detectImageExtension = (buffer: Buffer) => {
  if (buffer.length < 12) return "";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return "";
};

export async function POST(request: Request) {
  assertSameOrigin(request);

  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecione uma imagem." },
        { status: 400 },
      );
    }

    const extension = allowedTypes[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Use uma imagem JPG, PNG ou WEBP." },
        { status: 400 },
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 8 MB." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const detectedExtension = detectImageExtension(bytes);
    if (!detectedExtension || detectedExtension !== extension) {
      return NextResponse.json(
        { error: "O arquivo enviado não parece ser uma imagem válida." },
        { status: 400 },
      );
    }

    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;

    if (hasSupabaseUploadStorage()) {
      const objectKey = await uploadImageToStorage(file, fileName);
      return NextResponse.json({
        ok: true,
        path: `/api/uploads/${objectKey}`,
      });
    }

    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        {
          error:
            "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel para enviar imagens.",
        },
        { status: 500 },
      );
    }

    const uploadsDirectory = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDirectory, { recursive: true });
    await writeFile(join(uploadsDirectory, fileName), bytes);

    return NextResponse.json({ ok: true, path: `/uploads/${fileName}` });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a imagem.",
      },
      { status: 500 },
    );
  }
}
