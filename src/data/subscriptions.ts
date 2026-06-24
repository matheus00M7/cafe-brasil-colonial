import type { SubscriptionPlan } from "@/types/subscription";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "essencial-colonial",
    name: "Essencial Colonial",
    description:
      "Para quem toma café todos os dias e quer praticidade na rotina.",
    product: "Café tradicional ou extraforte",
    options: [
      {
        id: "tradicional-500g",
        label: "Tradicional · 500g",
        coffee: "Café Tradicional",
        quantity: "500g",
        amount: 24.9,
      },
      {
        id: "extraforte-500g",
        label: "Extraforte · 500g",
        coffee: "Café Extraforte",
        quantity: "500g",
        amount: 26.9,
      },
      {
        id: "tradicional-1kg",
        label: "Tradicional · 1kg",
        coffee: "Café Tradicional",
        quantity: "1kg",
        amount: 49.8,
      },
      {
        id: "extraforte-1kg",
        label: "Extraforte · 1kg",
        coffee: "Café Extraforte",
        quantity: "1kg",
        amount: 53.8,
      },
    ],
    idealFor: "Consumo diário em casa",
    benefits: [
      "Entrega recorrente",
      "Café para o dia a dia",
      "Opção em grãos ou moído",
      "Possibilidade de alterar o plano",
    ],
    badge: "Para o dia a dia",
  },
  {
    id: "gourmet-fazenda",
    name: "Gourmet da Fazenda",
    description:
      "Para quem busca um café mais equilibrado, aromático e ligado à origem.",
    product: "Café gourmet",
    options: [
      {
        id: "gourmet-500g",
        label: "Gourmet · 500g",
        coffee: "Café Gourmet",
        quantity: "500g",
        amount: 0.01,
      },
    ],
    idealFor: "Quem quer sair do café comum e experimentar algo superior",
    benefits: [
      "Café de origem",
      "Torra selecionada",
      "Perfil mais equilibrado",
      "Experiência melhor no café diário",
    ],
    badge: "Mais escolhido",
    featured: true,
  },
  {
    id: "experiencia-especial",
    name: "Experiência Especial",
    description:
      "Uma experiência mais completa com cafés de qualidade superior e lotes selecionados.",
    product: "Café especial ou seleção limitada",
    options: [
      {
        id: "especial-250g",
        label: "Especial · 250g",
        coffee: "Café Especial",
        quantity: "250g",
        amount: 34.9,
      },
      {
        id: "especial-500g",
        label: "Especial · 500g",
        coffee: "Café Especial",
        quantity: "500g",
        amount: 69.8,
      },
    ],
    idealFor:
      "Quem gosta de apreciar café, testar métodos e conhecer melhor a origem",
    benefits: [
      "Café especial ou lote selecionado",
      "Ficha simples de origem e notas sensoriais",
      "Sugestão de preparo",
      "Experiência premium",
    ],
    badge: "Seleção premium",
  },
];

export const getSubscriptionPlans = (
  prices?: Record<string, number>,
): SubscriptionPlan[] =>
  subscriptionPlans.map((plan) => ({
    ...plan,
    options: plan.options.map((option) => ({
      ...option,
      amount:
        prices && Number.isFinite(prices[option.id])
          ? Number(prices[option.id])
          : option.amount,
    })),
  }));

export const subscriptionFaq = [
  {
    question: "Como funciona a assinatura?",
    answer:
      "Você escolhe o plano, a quantidade, a moagem e a frequência, preenche seus dados e autoriza a cobrança recorrente com cartão diretamente no site.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. A assinatura pode ser pausada ou cancelada pelo gerenciamento da loja. A alteração passa a valer para as próximas cobranças.",
  },
  {
    question: "Posso trocar o tipo de café?",
    answer:
      "Sim. O plano pode ser alterado para as próximas entregas pelo gerenciamento da assinatura.",
  },
  {
    question: "Posso escolher café moído ou em grãos?",
    answer:
      "Sim. Você pode escolher café em grãos ou moído para coador e filtro. As opções disponíveis variam conforme o café selecionado.",
  },
  {
    question: "A entrega é mensal?",
    answer:
      "A frequência principal é mensal. Também existe a opção bimestral para quem consome menos café ou deseja receber com maior intervalo.",
  },
  {
    question: "Posso comprar café avulso mesmo sendo assinante?",
    answer:
      "Sim. A loja avulsa continua funcionando normalmente e pode ser usada sempre que você quiser testar produtos ou fazer uma compra extra.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "O cartão é autorizado com segurança pelo Mercado Pago. Depois disso, as cobranças são realizadas automaticamente conforme a frequência escolhida.",
  },
  {
    question: "A assinatura está disponível para todo o Brasil?",
    answer:
      "A assinatura pode ser contratada diretamente no site. A entrega usa o endereço informado durante a contratação.",
  },
];
