import { NextResponse } from "next/server";
import { fetchImageFromStorage } from "@/lib/upload-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const response = await fetchImageFromStorage(path.join("/"));
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const cacheControl = response.headers.get("cache-control");

    if (contentType) headers.set("Content-Type", contentType);
    headers.set(
      "Cache-Control",
      cacheControl || "public, max-age=31536000, immutable",
    );

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch {
    return NextResponse.json(
      { error: "Imagem não encontrada." },
      { status: 404 },
    );
  }
}
