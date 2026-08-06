import { getAdminProducts } from "@/lib/orders-db";
import { calculateShipping } from "@/data/commerce";
import type { CheckoutCartItem, CheckoutData } from "@/types/checkout";
import type { StoredOrderItem } from "@/types/order";

const clean = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export const validateCheckoutData = (value: unknown): CheckoutData => {
  if (!value || typeof value !== "object") {
    throw new Error("Dados do cliente inválidos.");
  }

  const input = value as Record<string, unknown>;
  const data: CheckoutData = {
    fullName: clean(input.fullName, 160),
    whatsapp: clean(input.whatsapp, 30),
    email: clean(input.email, 180).toLowerCase(),
    cpf: clean(input.cpf, 30).replace(/\D/g, ""),
    cep: clean(input.cep, 20).replace(/\D/g, ""),
    street: clean(input.street, 200),
    number: clean(input.number, 40),
    complement: clean(input.complement, 120),
    neighborhood: clean(input.neighborhood, 120),
    city: clean(input.city, 120),
    state: clean(input.state, 2).toUpperCase(),
    deliveryMethod:
      input.deliveryMethod === "retirada" ? "retirada" : "correios",
    notes: clean(input.notes).slice(0, 500),
  };

  const required: Array<keyof CheckoutData> = [
    "fullName",
    "whatsapp",
    "email",
    "cpf",
    "cep",
    "street",
    "number",
    "neighborhood",
    "city",
    "state",
  ];

  for (const field of required) {
    if (!data[field]) throw new Error(`Campo obrigatório ausente: ${field}.`);
  }

  if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    throw new Error("Informe um e-mail válido.");
  }
  if (data.cpf.length !== 11) throw new Error("Informe um CPF válido.");
  if (data.cep.length !== 8) throw new Error("Informe um CEP válido.");
  if (data.state.length !== 2) throw new Error("Informe uma UF válida.");

  return data;
};

export const buildOrderItems = async (
  value: unknown,
): Promise<StoredOrderItem[]> => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("O carrinho está vazio.");
  }

  if (value.length > 50) {
    throw new Error("O carrinho tem itens demais. Revise a compra.");
  }

  const products = await getAdminProducts();
  const requested = value as CheckoutCartItem[];
  return requested.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    const quantity = Math.floor(Number(item.quantity));

    if (!product || !product.active) {
      throw new Error("Um produto do carrinho não está mais disponível.");
    }
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      throw new Error("Quantidade de produto inválida.");
    }
    if (product.stock !== null && quantity > product.stock) {
      throw new Error(
        `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}.`,
      );
    }

    const selectedOptions = Array.isArray(item.selectedOptions)
      ? item.selectedOptions
          .map((option) => ({
            optionId: clean(option.optionId).slice(0, 80),
            name: clean(option.name).slice(0, 60),
            value: clean(option.value).slice(0, 60),
          }))
          .filter((option) => option.optionId && option.name && option.value)
      : [];
    const productOptions = product.productOptions || [];

    for (const option of productOptions) {
      const selected = selectedOptions.find(
        (candidate) => candidate.optionId === option.id,
      );
      if (option.required !== false && !selected) {
        throw new Error(`Escolha ${option.name} para ${product.name}.`);
      }
      if (selected && !option.values.includes(selected.value)) {
        throw new Error(`Opção inválida para ${product.name}.`);
      }
    }

    const validOptionIds = new Set(productOptions.map((option) => option.id));
    const safeSelectedOptions = selectedOptions.filter((option) =>
      validOptionIds.has(option.optionId),
    );
    const optionSummary = safeSelectedOptions
      .map((option) => `${option.name}: ${option.value}`)
      .join(" · ");

    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      selectedOptions: safeSelectedOptions,
      optionSummary,
      quantity,
      unitPrice: product.price,
      total: Number((product.price * quantity).toFixed(2)),
    };
  });
};

export const calculateOrderTotals = async (
  items: StoredOrderItem[],
  deliveryMethod: CheckoutData["deliveryMethod"],
) => {
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.total, 0).toFixed(2),
  );
  const shipping = Number(calculateShipping(subtotal, deliveryMethod).toFixed(2));
  const total = Number((subtotal + shipping).toFixed(2));
  return { subtotal, shipping, total };
};
