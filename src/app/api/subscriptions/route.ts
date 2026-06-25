import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Assinaturas estão temporariamente pausadas. Finalize a compra pelos produtos avulsos.",
      code: "SUBSCRIPTIONS_PAUSED",
    },
    { status: 410 },
  );
}
