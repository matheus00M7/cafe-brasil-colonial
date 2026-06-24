import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders-db";
import {
  fulfillmentStatusLabels,
  paymentStatusLabels,
} from "@/lib/order-labels";

const csvCell = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`;

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const orders = await listOrders({ limit: 500 });
  const header = [
    "Pedido",
    "Data",
    "Cliente",
    "E-mail",
    "WhatsApp",
    "CPF",
    "Pagamento",
    "Operação",
    "Forma de pagamento",
    "Subtotal",
    "Frete",
    "Total",
    "Cidade",
    "UF",
    "CEP",
    "Rastreio",
  ];
  const rows = orders.map((order) => [
    order.orderNumber,
    order.createdAt,
    order.customer.fullName,
    order.customer.email,
    order.customer.whatsapp,
    order.customer.cpf,
    paymentStatusLabels[order.status],
    fulfillmentStatusLabels[order.fulfillmentStatus],
    order.paymentMethod || "",
    order.subtotal.toFixed(2),
    order.shipping.toFixed(2),
    order.total.toFixed(2),
    order.address.city,
    order.address.state,
    order.address.cep,
    order.trackingCode,
  ]);
  const csv = `\uFEFF${[header, ...rows]
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-cafe-brasil-colonial.csv"`,
    },
  });
}
