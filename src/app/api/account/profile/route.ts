import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { updateCustomerDetails } from "@/lib/customer-db";
import { assertSameOrigin } from "@/lib/request-security";
import type { CustomerProfile } from "@/types/customer";
import type { StoredAddress } from "@/types/order";

const clean = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
    }
    const payload = (await request.json()) as {
      profile?: Partial<CustomerProfile>;
      address?: Partial<StoredAddress>;
    };
    const profile: CustomerProfile = {
      fullName: clean(payload.profile?.fullName, 160),
      whatsapp: clean(payload.profile?.whatsapp, 30).replace(/\D/g, ""),
      cpf: clean(payload.profile?.cpf, 30).replace(/\D/g, ""),
    };
    const address: StoredAddress = {
      cep: clean(payload.address?.cep, 20).replace(/\D/g, ""),
      street: clean(payload.address?.street),
      number: clean(payload.address?.number, 40),
      complement: clean(payload.address?.complement),
      neighborhood: clean(payload.address?.neighborhood),
      city: clean(payload.address?.city),
      state: clean(payload.address?.state, 2).toUpperCase(),
    };
    if (profile.fullName.length < 3 || profile.whatsapp.length < 10) {
      throw new Error("Confira o nome e o WhatsApp.");
    }
    if (profile.cpf && profile.cpf.length !== 11) {
      throw new Error("Informe um CPF válido.");
    }
    if (
      address.cep &&
      (address.cep.length !== 8 ||
        !address.street ||
        !address.number ||
        !address.neighborhood ||
        !address.city ||
        !/^[A-Z]{2}$/.test(address.state))
    ) {
      throw new Error("Preencha o endereço completo ou deixe-o vazio.");
    }
    const account = await updateCustomerDetails(
      session.account.id,
      profile,
      address,
    );
    return NextResponse.json({ ok: true, account });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Não foi possível salvar.",
      },
      { status: 400 },
    );
  }
}
