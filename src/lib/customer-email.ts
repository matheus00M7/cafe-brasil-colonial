import "server-only";

export const sendPasswordResetEmail = async (input: {
  email: string;
  name: string;
  resetUrl: string;
}) => {
  const safeName = input.name
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.CUSTOMER_EMAIL_FROM?.trim() ||
    "Café Brasil Colonial <contato@seudominio.com>";
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("O serviço de recuperação por e-mail não foi configurado.");
    }
    return false;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.email,
      subject: "Redefinição de senha — Café Brasil Colonial",
      html: `
        <div style="font-family:Arial,sans-serif;color:#2b211c;line-height:1.6">
          <h1 style="color:#632413">Redefinir sua senha</h1>
          <p>Olá, ${safeName}.</p>
          <p>Use o botão abaixo para criar uma nova senha. O link expira em 30 minutos.</p>
          <p><a href="${input.resetUrl}" style="display:inline-block;background:#632413;color:white;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Criar nova senha</a></p>
          <p>Se você não solicitou a alteração, ignore este e-mail.</p>
        </div>
      `,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Não foi possível enviar o e-mail de recuperação.");
  }
  return true;
};
