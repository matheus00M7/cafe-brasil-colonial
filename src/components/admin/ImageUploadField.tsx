"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";

export function ImageUploadField({
  label,
  value,
  onChange,
  help,
  contain = false,
}: {
  label: string;
  value: string;
  onChange: (path: string) => void;
  help?: string;
  contain?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const payload = (await response.json()) as {
        path?: string;
        error?: string;
      };
      if (!response.ok || !payload.path) {
        throw new Error(payload.error || "Falha no envio.");
      }
      onChange(payload.path);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <p className="text-sm font-bold text-brand-ink">{label}</p>
      <div className="mt-2 overflow-hidden rounded-2xl border border-brand-brown/15 bg-brand-mist">
        <div className="relative aspect-[16/7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className={`h-full w-full ${
              contain ? "object-contain p-5" : "object-cover"
            }`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white p-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand-brown px-4 text-xs font-extrabold text-white disabled:opacity-60"
          >
            {uploading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {uploading ? "Enviando..." : "Trocar imagem"}
          </button>
          <p className="min-w-0 flex-1 truncate text-xs text-brand-ink/45">
            {value}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => void upload(event.target.files?.[0])}
          />
        </div>
      </div>
      {help && <p className="mt-2 text-xs text-brand-ink/45">{help}</p>}
      {error && <p className="mt-2 text-xs font-bold text-red-700">{error}</p>}
    </div>
  );
}
