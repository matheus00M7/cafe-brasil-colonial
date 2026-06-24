import { NextResponse } from "next/server";
import { createPasswordReset } from "@/lib/customer-auth";
import { sendPasswordResetEmail } from "@/lib/customer-email";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, requestIp } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (
      !checkRateLimit(
        `account:forgot:${requestIp(request)}`,
        5,
        30 * 60_000,
      )
    ) {
      return NextResponse.json(
        { error: "Aguarde antes de solicitar outro link." },
        { status: 429 },
      );
    }
    const payload = (await request.json()) as { email?: string };
    const reset = await createPasswordReset(payload.email || "");
    let developmentResetUrl: string | undefined;
    if (reset) {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      const resetUrl = `${siteUrl}/redefinir-senha?token=${encodeURIComponent(
        reset.token,
      )}`;
      try {
        const sent = await sendPasswordResetEmail({
          email: reset.account.email,
          name: reset.account.profile.fullName,
          resetUrl,
        });
        if (!sent && process.env.NODE_ENV !== "production") {
          developmentResetUrl = resetUrl;
        }
      } catch (emailError) {
        console.error("Falha ao enviar recuperação de senha:", emailError);
      }
    }
    return NextResponse.json({
      ok: true,
      message:
        "Se existir uma conta com esse e-mail, você receberá as instruções.",
      ...(developmentResetUrl ? { developmentResetUrl } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível solicitar a recuperação.",
      },
      { status: 400 },
    );
  }
}
