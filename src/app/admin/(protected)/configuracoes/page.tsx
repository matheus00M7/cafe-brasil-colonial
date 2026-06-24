import Link from "next/link";
import {
  CheckCircle2,
  CircleAlert,
  Database,
  ExternalLink,
  KeyRound,
  Link2,
  LockKeyhole,
  MessageCircle,
} from "lucide-react";

const configured = (value: string | undefined) => Boolean(value?.trim());

export default function AdminSettingsPage() {
  const checks = [
    {
      label: "Public Key do Mercado Pago",
      ok: configured(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY),
      detail: "Carrega o formulário seguro no navegador.",
    },
    {
      label: "Access Token do Mercado Pago",
      ok: configured(process.env.MERCADO_PAGO_ACCESS_TOKEN),
      detail: "Permite ao servidor criar cobranças.",
    },
    {
      label: "Assinatura do webhook",
      ok: configured(process.env.MERCADO_PAGO_WEBHOOK_SECRET),
      detail: "Protege as notificações de pagamento em produção.",
    },
    {
      label: "Banco online Supabase",
      ok:
        configured(process.env.SUPABASE_URL) &&
        configured(process.env.SUPABASE_SERVICE_ROLE_KEY),
      detail: "Em branco, o projeto usa o banco SQLite local.",
    },
    {
      label: "Endereço público do site",
      ok:
        configured(process.env.NEXT_PUBLIC_SITE_URL) &&
        process.env.NEXT_PUBLIC_SITE_URL !== "http://localhost:3000",
      detail: process.env.NEXT_PUBLIC_SITE_URL || "Não informado",
    },
  ];

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
        Saúde da integração
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
        Configurações
      </h1>
      <p className="mt-2 max-w-2xl text-brand-ink/55">
        Verifique o que já está pronto e o que ainda precisa ser configurado
        antes de publicar a loja.
      </p>

      <section className="mt-8 overflow-hidden rounded-3xl border border-brand-brown/10 bg-white shadow-card">
        <div className="border-b border-brand-brown/10 p-6">
          <h2 className="text-xl font-extrabold text-brand-brown">
            Checklist técnico
          </h2>
          <p className="mt-1 text-sm text-brand-ink/45">
            Nenhuma chave secreta é exibida nesta tela.
          </p>
        </div>
        <div className="divide-y divide-brand-brown/8">
          {checks.map((check) => (
            <div
              key={check.label}
              className="flex items-start gap-4 px-6 py-5"
            >
              {check.ok ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-green" />
              ) : (
                <CircleAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
              )}
              <div>
                <p className="font-extrabold text-brand-ink">{check.label}</p>
                <p className="mt-1 text-sm leading-6 text-brand-ink/50">
                  {check.detail}
                </p>
              </div>
              <span
                className={`ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${
                  check.ok
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {check.ok ? "Configurado" : "Pendente"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            icon: KeyRound,
            title: "Mercado Pago",
            text: "Gerencie credenciais, pagamentos e webhooks.",
            href: "https://www.mercadopago.com.br/developers/panel/app",
            external: true,
          },
          {
            icon: Database,
            title: "Banco de pedidos",
            text: configured(process.env.SUPABASE_URL)
              ? "A loja está configurada para usar Supabase."
              : "A loja está usando SQLite local neste ambiente.",
            href: "/admin/pedidos",
            external: false,
          },
          {
            icon: MessageCircle,
            title: "Contato da loja",
            text: "WhatsApp permanece disponível para suporte e atacado.",
            href: "/contato",
            external: true,
          },
        ].map(({ icon: Icon, title, text, href, external }) => (
          <Link
            key={title}
            href={href}
            target={external ? "_blank" : undefined}
            className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <Icon className="h-7 w-7 text-brand-green" />
            <h2 className="mt-5 text-xl font-extrabold text-brand-brown">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-ink/50">{text}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand-brown">
              Abrir <ExternalLink className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-6 rounded-3xl bg-brand-brown p-6 text-white shadow-soft sm:p-8">
        <div className="flex items-start gap-4">
          <LockKeyhole className="mt-1 h-7 w-7 shrink-0 text-brand-cream" />
          <div>
            <h2 className="text-xl font-extrabold">Segurança do painel</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
              O acesso usa cookie protegido, senha armazenada como hash e
              bloqueio temporário após várias tentativas. Para trocar a senha,
              gere um novo ADMIN_PASSWORD_HASH e altere o arquivo de ambiente.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-brand-cream">
              <Link2 className="h-4 w-4" />
              Nunca publique o arquivo .env.local.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
