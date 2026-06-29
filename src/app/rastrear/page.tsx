import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { OrderLookupByCpf } from "@/components/order/OrderLookupByCpf";

export const metadata: Metadata = {
  title: "Rastrear pedido",
  description:
    "Acompanhe seu pedido do Café Brasil Colonial usando o CPF informado na compra.",
  robots: { index: false, follow: false },
};

export default function TrackingPage() {
  return (
    <section className="py-12 sm:py-20">
      <Container>
        <OrderLookupByCpf />
      </Container>
    </section>
  );
}
