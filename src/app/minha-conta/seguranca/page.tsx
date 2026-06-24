import { ShieldCheck } from "lucide-react";
import { AccountPasswordForm } from "@/components/account/AccountPasswordForm";

export default function AccountSecurityPage() {
  return (
    <div className="space-y-7">
      <section className="rounded-4xl border border-brand-green/20 bg-brand-green/5 p-6 sm:p-8">
        <ShieldCheck className="h-8 w-8 text-brand-green" />
        <h2 className="mt-4 text-2xl font-extrabold text-brand-brown">
          Como seus dados são protegidos
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-brand-ink/65">
          <li>• A senha é transformada por scrypt e nunca pode ser lida.</li>
          <li>• Dados pessoais e endereço ficam criptografados no banco.</li>
          <li>• A sessão usa cookie HttpOnly e pode ser revogada.</li>
          <li>• A loja não armazena número, validade ou CVV do cartão.</li>
        </ul>
      </section>
      <AccountPasswordForm />
    </div>
  );
}
