"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  Bug,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  PanelsTopLeft,
  Repeat2,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/context/SiteContentContext";

const navigation = [
  { label: "Visão geral", href: "/admin", icon: LayoutDashboard },
  { label: "Pedidos", href: "/admin/pedidos", icon: PackageCheck },
  { label: "Assinaturas", href: "/admin/assinaturas", icon: Repeat2 },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Logs", href: "/admin/logs", icon: Bug },
  { label: "Produtos", href: "/admin/produtos", icon: Boxes },
  { label: "Conteúdo da loja", href: "/admin/conteudo", icon: PanelsTopLeft },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const content = useSiteContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-6">
        <Link href="/admin" className="relative h-16 w-40">
          <Image
            src={content.brand.logoLight}
            alt={content.brand.name}
            fill
            className="object-contain object-left"
            sizes="160px"
          />
        </Link>
        <button
          type="button"
          className="rounded-full border border-white/15 p-2 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-cream/60">
          Administração
        </p>
      </div>
      <nav className="mt-4 space-y-1 px-3">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition",
                active
                  ? "bg-brand-cream text-brand-brown"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-5 w-5" />
          Abrir loja
        </Link>
      </nav>
      <div className="mt-auto border-t border-white/10 p-4">
        <p className="truncate px-2 text-xs text-white/45">{email}</p>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          {loggingOut ? "Saindo..." : "Sair"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f1e9]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 bg-brand-brown text-white lg:block">
        {sidebar}
      </aside>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          />
          <aside className="relative h-full w-[86%] max-w-80 bg-brand-brown text-white shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-18 items-center justify-between border-b border-brand-brown/10 bg-[#fffaf3]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-full border border-brand-brown/15 bg-white p-2.5 text-brand-brown lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-green">
                Café Brasil Colonial
              </p>
              <p className="font-extrabold text-brand-brown">Painel da loja</p>
            </div>
          </div>
          <div className="hidden rounded-full bg-brand-cream/55 px-4 py-2 text-xs font-bold text-brand-brown sm:block">
            Ambiente administrativo
          </div>
        </header>
        <div className="p-5 sm:p-8 lg:p-10">{children}</div>
      </div>
    </div>
  );
}
