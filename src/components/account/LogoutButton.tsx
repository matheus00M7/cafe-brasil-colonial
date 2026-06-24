"use client";

import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/account/logout", { method: "POST" }).catch(() => {});
        window.location.href = "/";
      }}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-brand-brown/20 bg-white px-5 text-sm font-extrabold text-brand-brown"
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Sair
    </button>
  );
}
