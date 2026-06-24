import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <div className="grid min-h-screen bg-[#fffaf3] lg:grid-cols-[1fr_1.05fr]">
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="relative h-24 w-52">
            <Image
              src="/brand/logo-dark.png"
              alt="Café Brasil Colonial"
              fill
              className="object-contain object-left"
              sizes="208px"
              priority
            />
          </div>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-green/10 px-3 py-2 text-xs font-extrabold text-brand-green">
            <ShieldCheck className="h-4 w-4" />
            Área exclusiva do proprietário
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-brand-brown">
            Entre para administrar a loja
          </h1>
          <p className="mt-4 leading-7 text-brand-ink/60">
            Consulte pedidos, pagamentos, clientes, envios, rastreamento,
            produtos e estoque em um só lugar.
          </p>
          <AdminLoginForm />
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-brand-brown lg:block">
        <div
          className="absolute inset-0 bg-[url('/brand/pattern-official.png')] bg-[length:420px] opacity-[0.09]"
          aria-hidden="true"
        />
        <div className="absolute inset-x-12 bottom-12 rounded-4xl border border-white/10 bg-white/5 p-8 text-white backdrop-blur-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-cream">
            Gestão simples
          </p>
          <p className="mt-4 text-3xl font-extrabold leading-tight">
            Da confirmação do pagamento até a entrega.
          </p>
          <p className="mt-4 leading-7 text-white/65">
            O painel separa a situação financeira do andamento operacional para
            você saber exatamente o que precisa fazer em cada pedido.
          </p>
        </div>
      </section>
    </div>
  );
}
