import { PanelsTopLeft } from "lucide-react";
import { getSiteContent } from "@/lib/orders-db";
import { ContentAdminEditor } from "@/components/admin/ContentAdminEditor";

export default async function AdminContentPage() {
  const content = await getSiteContent();
  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-brown">
          <PanelsTopLeft className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
            Aparência e informações
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
            Conteúdo da loja
          </h1>
          <p className="mt-2 max-w-3xl text-brand-ink/55">
            Troque logotipos, imagens, banners, textos, contatos, frete e as
            seções exibidas na página inicial sem editar o código.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <ContentAdminEditor initialContent={content} />
      </div>
    </div>
  );
}
