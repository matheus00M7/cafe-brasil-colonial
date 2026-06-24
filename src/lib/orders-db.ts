import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import type {
  AdminDashboardStats,
  FulfillmentStatus,
  OrderFilters,
  OrderStatus,
  PublicOrder,
  StoredAddress,
  StoredCustomer,
  StoredOrder,
  StoredOrderItem,
} from "@/types/order";
import type { DeliveryMethod } from "@/types/checkout";
import type { AdminProduct, ProductSettingsUpdate } from "@/types/admin";
import type { SiteContent } from "@/types/site-content";
import { products } from "@/data/products";
import { defaultSiteContent } from "@/data/site-content";

type OrderRow = {
  id: string;
  customer_account_id: string | null;
  order_number: string;
  status: string;
  payment_status: string | null;
  payment_status_detail: string | null;
  payment_id: string | null;
  payment_method: string | null;
  payment_type: string | null;
  fulfillment_status: string;
  tracking_code: string;
  admin_notes: string;
  customer_json: string | StoredCustomer;
  address_json: string | StoredAddress;
  delivery_method: string;
  notes: string;
  items_json: string | StoredOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  pix_qr_code: string | null;
  pix_qr_code_base64: string | null;
  ticket_url: string | null;
  created_at: string;
  updated_at: string;
};

type ProductSettingsRow = {
  product_id: string;
  price: number;
  active: boolean | number;
  stock: number | null;
  featured: boolean | number;
  content_json: string | Partial<AdminProduct> | null;
  updated_at: string;
};

type ContentSettingsRow = {
  setting_key: string;
  content_json: string | SiteContent;
  updated_at: string;
};

type CreateOrderInput = {
  id: string;
  customerAccountId?: string | null;
  orderNumber: string;
  customer: StoredCustomer;
  address: StoredAddress;
  deliveryMethod: DeliveryMethod;
  notes: string;
  items: StoredOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

type PaymentUpdate = {
  status: OrderStatus;
  paymentStatus: string;
  paymentStatusDetail: string | null;
  paymentId: string;
  paymentMethod: string | null;
  paymentType: string | null;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  ticketUrl?: string | null;
};

const databasePath = (() => {
  const configured = process.env.ORDER_DATABASE_PATH || "./data/orders.db";
  return isAbsolute(configured) ? configured : resolve(process.cwd(), configured);
})();

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(supabaseUrl && supabaseKey);
const isVercelRuntime = process.env.VERCEL === "1";
const localDatabaseUnavailable = !useSupabase && isVercelRuntime;

type SQLiteDatabase = InstanceType<typeof import("node:sqlite").DatabaseSync>;

const globalDatabase = globalThis as typeof globalThis & {
  cafeOrdersDatabase?: SQLiteDatabase;
};

const databaseConfigurationError = () =>
  new Error(
    "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel para salvar pedidos e configuraÃ§Ãµes.",
  );

const getLocalDatabase = async () => {
  if (localDatabaseUnavailable) {
    throw databaseConfigurationError();
  }
  if (globalDatabase.cafeOrdersDatabase) {
    return globalDatabase.cafeOrdersDatabase;
  }

  const { DatabaseSync } = await import("node:sqlite");
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_account_id TEXT,
      order_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      payment_status TEXT,
      payment_status_detail TEXT,
      payment_id TEXT UNIQUE,
      payment_method TEXT,
      payment_type TEXT,
      fulfillment_status TEXT NOT NULL DEFAULT 'new',
      tracking_code TEXT NOT NULL DEFAULT '',
      admin_notes TEXT NOT NULL DEFAULT '',
      customer_json TEXT NOT NULL,
      address_json TEXT NOT NULL,
      delivery_method TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL,
      total REAL NOT NULL,
      pix_qr_code TEXT,
      pix_qr_code_base64 TEXT,
      ticket_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE TABLE IF NOT EXISTS product_settings (
      product_id TEXT PRIMARY KEY,
      price REAL NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      stock INTEGER,
      featured INTEGER NOT NULL DEFAULT 0,
      content_json TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS content_settings (
      setting_key TEXT PRIMARY KEY,
      content_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const orderColumns = database
    .prepare("PRAGMA table_info(orders)")
    .all() as Array<{ name: string }>;
  const columnNames = new Set(orderColumns.map((column) => column.name));
  if (!columnNames.has("fulfillment_status")) {
    database.exec(
      "ALTER TABLE orders ADD COLUMN fulfillment_status TEXT NOT NULL DEFAULT 'new'",
    );
  }
  if (!columnNames.has("tracking_code")) {
    database.exec(
      "ALTER TABLE orders ADD COLUMN tracking_code TEXT NOT NULL DEFAULT ''",
    );
  }
  if (!columnNames.has("admin_notes")) {
    database.exec(
      "ALTER TABLE orders ADD COLUMN admin_notes TEXT NOT NULL DEFAULT ''",
    );
  }
  if (!columnNames.has("customer_account_id")) {
    database.exec(
      "ALTER TABLE orders ADD COLUMN customer_account_id TEXT",
    );
  }
  const productColumns = database
    .prepare("PRAGMA table_info(product_settings)")
    .all() as Array<{ name: string }>;
  if (!productColumns.some((column) => column.name === "content_json")) {
    database.exec("ALTER TABLE product_settings ADD COLUMN content_json TEXT");
  }
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status
      ON orders(fulfillment_status);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_account
      ON orders(customer_account_id);
  `);
  globalDatabase.cafeOrdersDatabase = database;
  return database;
};

const parseJson = <T>(value: string | T): T =>
  typeof value === "string" ? (JSON.parse(value) as T) : value;

const parseOrder = (row: OrderRow | undefined): StoredOrder | null => {
  if (!row) return null;
  return {
    id: row.id,
    customerAccountId: row.customer_account_id,
    orderNumber: row.order_number,
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status,
    paymentStatusDetail: row.payment_status_detail,
    paymentId: row.payment_id,
    paymentMethod: row.payment_method,
    paymentType: row.payment_type,
    fulfillmentStatus: row.fulfillment_status as FulfillmentStatus,
    trackingCode: row.tracking_code,
    adminNotes: row.admin_notes,
    customer: parseJson<StoredCustomer>(row.customer_json),
    address: parseJson<StoredAddress>(row.address_json),
    deliveryMethod: row.delivery_method as DeliveryMethod,
    notes: row.notes,
    items: parseJson<StoredOrderItem[]>(row.items_json),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    pixQrCode: row.pix_qr_code,
    pixQrCodeBase64: row.pix_qr_code_base64,
    ticketUrl: row.ticket_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const supabaseRequest = async <T>(path: string, init?: RequestInit) => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("O banco online não está configurado.");
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Falha no banco de pedidos: ${detail}`);
  }
  return (await response.json()) as T;
};

const rowForCreate = (input: CreateOrderInput): OrderRow => {
  const now = new Date().toISOString();
  return {
    id: input.id,
    customer_account_id: input.customerAccountId || null,
    order_number: input.orderNumber,
    status: "pending_payment",
    payment_status: null,
    payment_status_detail: null,
    payment_id: null,
    payment_method: null,
    payment_type: null,
    fulfillment_status: "new",
    tracking_code: "",
    admin_notes: "",
    customer_json: input.customer,
    address_json: input.address,
    delivery_method: input.deliveryMethod,
    notes: input.notes,
    items_json: input.items,
    subtotal: input.subtotal,
    shipping: input.shipping,
    total: input.total,
    pix_qr_code: null,
    pix_qr_code_base64: null,
    ticket_url: null,
    created_at: now,
    updated_at: now,
  };
};

export const createOrder = async (input: CreateOrderInput) => {
  const row = rowForCreate(input);

  if (useSupabase) {
    const rows = await supabaseRequest<OrderRow[]>("orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    return parseOrder(rows[0]);
  }

  const database = await getLocalDatabase();
  database
    .prepare(
      `INSERT INTO orders (
        id, customer_account_id, order_number, status, customer_json, address_json,
        delivery_method, notes, items_json, subtotal, shipping, total,
        created_at, updated_at
      ) VALUES (?, ?, ?, 'pending_payment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      row.customer_account_id,
      row.order_number,
      JSON.stringify(row.customer_json),
      JSON.stringify(row.address_json),
      row.delivery_method,
      row.notes,
      JSON.stringify(row.items_json),
      row.subtotal,
      row.shipping,
      row.total,
      row.created_at,
      row.updated_at,
    );

  return getOrderById(input.id);
};

export const getOrderById = async (id: string) => {
  if (useSupabase) {
    const rows = await supabaseRequest<OrderRow[]>(
      `orders?id=eq.${encodeURIComponent(id)}&limit=1`,
    );
    return parseOrder(rows[0]);
  }
  return parseOrder(
    (await getLocalDatabase()).prepare("SELECT * FROM orders WHERE id = ?").get(id) as
      | OrderRow
      | undefined,
  );
};

export const getOrderByPaymentId = async (paymentId: string) => {
  if (useSupabase) {
    const rows = await supabaseRequest<OrderRow[]>(
      `orders?payment_id=eq.${encodeURIComponent(paymentId)}&limit=1`,
    );
    return parseOrder(rows[0]);
  }
  return parseOrder(
    (await getLocalDatabase())
      .prepare("SELECT * FROM orders WHERE payment_id = ?")
      .get(paymentId) as OrderRow | undefined,
  );
};

export const listOrdersByCustomerAccountId = async (accountId: string) => {
  let rows: OrderRow[];
  if (useSupabase) {
    rows = await supabaseRequest<OrderRow[]>(
      `orders?customer_account_id=eq.${encodeURIComponent(
        accountId,
      )}&order=created_at.desc&limit=200`,
    );
  } else {
    rows = (await getLocalDatabase())
      .prepare(
        `SELECT * FROM orders
         WHERE customer_account_id = ?
         ORDER BY datetime(created_at) DESC`,
      )
      .all(accountId) as unknown as OrderRow[];
  }
  return rows.map(parseOrder).filter(Boolean) as StoredOrder[];
};

export const getOrderForCustomer = async (
  id: string,
  accountId: string,
) => {
  const order = await getOrderById(id);
  return order?.customerAccountId === accountId ? order : null;
};

export const updateOrderPayment = async (
  id: string,
  update: PaymentUpdate,
) => {
  const now = new Date().toISOString();
  const patch = {
    status: update.status,
    payment_status: update.paymentStatus,
    payment_status_detail: update.paymentStatusDetail,
    payment_id: update.paymentId,
    payment_method: update.paymentMethod,
    payment_type: update.paymentType,
    pix_qr_code: update.pixQrCode || null,
    pix_qr_code_base64: update.pixQrCodeBase64 || null,
    ticket_url: update.ticketUrl || null,
    updated_at: now,
  };

  if (useSupabase) {
    const rows = await supabaseRequest<OrderRow[]>(
      `orders?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      },
    );
    return parseOrder(rows[0]);
  }

  const database = await getLocalDatabase();
  database
    .prepare(
      `UPDATE orders SET
        status = ?,
        payment_status = ?,
        payment_status_detail = ?,
        payment_id = ?,
        payment_method = ?,
        payment_type = ?,
        pix_qr_code = ?,
        pix_qr_code_base64 = ?,
        ticket_url = ?,
        updated_at = ?
      WHERE id = ?`,
    )
    .run(
      patch.status,
      patch.payment_status,
      patch.payment_status_detail,
      patch.payment_id,
      patch.payment_method,
      patch.payment_type,
      patch.pix_qr_code,
      patch.pix_qr_code_base64,
      patch.ticket_url,
      patch.updated_at,
      id,
    );

  return getOrderById(id);
};

export const listOrders = async (filters: OrderFilters = {}) => {
  const limit = Math.min(Math.max(filters.limit || 100, 1), 500);
  const offset = Math.max(filters.offset || 0, 0);

  let rows: OrderRow[];
  if (useSupabase) {
    rows = await supabaseRequest<OrderRow[]>(
      `orders?order=created_at.desc&limit=${limit}&offset=${offset}`,
    );
  } else if (localDatabaseUnavailable) {
    rows = [];
  } else {
    rows = (await getLocalDatabase())
      .prepare(
        "SELECT * FROM orders ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?",
      )
      .all(limit, offset) as unknown as OrderRow[];
  }

  let result = rows.map(parseOrder).filter(Boolean) as StoredOrder[];
  const query = filters.query?.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.fullName.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query) ||
        order.customer.whatsapp.replace(/\D/g, "").includes(query.replace(/\D/g, "")),
    );
  }
  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    result = result.filter((order) => order.status === filters.paymentStatus);
  }
  if (filters.fulfillmentStatus && filters.fulfillmentStatus !== "all") {
    result = result.filter(
      (order) => order.fulfillmentStatus === filters.fulfillmentStatus,
    );
  }
  return result;
};

export const getDashboardStats = async (): Promise<AdminDashboardStats> => {
  const orders = await listOrders({ limit: 500 });
  const approved = orders.filter((order) => order.status === "approved");
  const approvedRevenue = approved.reduce((sum, order) => sum + order.total, 0);
  return {
    totalOrders: orders.length,
    approvedOrders: approved.length,
    pendingOrders: orders.filter((order) =>
      ["pending_payment", "pending", "in_process"].includes(order.status),
    ).length,
    openFulfillment: orders.filter(
      (order) =>
        order.status === "approved" &&
        !["delivered", "cancelled"].includes(order.fulfillmentStatus),
    ).length,
    approvedRevenue,
    averageTicket: approved.length ? approvedRevenue / approved.length : 0,
  };
};

export const updateOrderAdmin = async (
  id: string,
  input: {
    fulfillmentStatus: FulfillmentStatus;
    trackingCode: string;
    adminNotes: string;
  },
) => {
  const patch = {
    fulfillment_status: input.fulfillmentStatus,
    tracking_code: input.trackingCode.trim().slice(0, 120),
    admin_notes: input.adminNotes.trim().slice(0, 4000),
    updated_at: new Date().toISOString(),
  };

  if (useSupabase) {
    const rows = await supabaseRequest<OrderRow[]>(
      `orders?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      },
    );
    return parseOrder(rows[0]);
  }

  const database = await getLocalDatabase();
  database
    .prepare(
      `UPDATE orders SET
        fulfillment_status = ?,
        tracking_code = ?,
        admin_notes = ?,
        updated_at = ?
      WHERE id = ?`,
    )
    .run(
      patch.fulfillment_status,
      patch.tracking_code,
      patch.admin_notes,
      patch.updated_at,
      id,
    );
  return getOrderById(id);
};

const getProductSettingsRows = async (): Promise<ProductSettingsRow[]> => {
  if (useSupabase) {
    return supabaseRequest<ProductSettingsRow[]>("product_settings?select=*");
  }
  if (localDatabaseUnavailable) return [];
  return (await getLocalDatabase())
    .prepare("SELECT * FROM product_settings")
    .all() as unknown as ProductSettingsRow[];
};

export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  const rows = await getProductSettingsRows();
  const settings = new Map(rows.map((row) => [row.product_id, row]));
  return products.map((product) => {
    const saved = settings.get(product.id);
    const savedContent = saved?.content_json
      ? parseJson<Partial<AdminProduct>>(saved.content_json)
      : {};
    return {
      ...product,
      ...savedContent,
      id: product.id,
      slug: product.slug,
      price: saved ? Number(saved.price) : product.price,
      active: saved ? Boolean(saved.active) : true,
      stock: saved?.stock ?? null,
      adminFeatured: saved ? Boolean(saved.featured) : Boolean(product.featured),
      featured: saved ? Boolean(saved.featured) : product.featured,
      updatedAt: saved?.updated_at || null,
    };
  });
};

export const getStoreProducts = async () =>
  (await getAdminProducts())
    .filter((product) => product.active && product.stock !== 0)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      type: product.type,
      weight: product.weight,
      roast: product.roast,
      grind: product.grind,
      intensity: product.intensity,
      intensityLabel: product.intensityLabel,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      origin: product.origin,
      preparation: product.preparation,
      sensoryNotes: product.sensoryNotes,
      price: product.price,
      image: product.image,
      contents: product.contents,
      badge: product.badge,
      featured: product.adminFeatured,
    }));

export const updateProductSettings = async (
  productId: string,
  input: ProductSettingsUpdate,
) => {
  const product = products.find((candidate) => candidate.id === productId);
  if (!product) throw new Error("Produto não encontrado.");
  if (!Number.isFinite(input.price) || input.price <= 0) {
    throw new Error("Preço inválido.");
  }
  if (
    input.stock !== null &&
    (!Number.isInteger(input.stock) || input.stock < 0)
  ) {
    throw new Error("Estoque inválido.");
  }

  const contentJson = {
    name: input.name.trim().slice(0, 140),
    image: input.image.trim().slice(0, 500),
    shortDescription: input.shortDescription.trim().slice(0, 400),
    longDescription: input.longDescription.trim().slice(0, 3000),
    badge: input.badge.trim().slice(0, 60),
  };
  if (!contentJson.name) throw new Error("Informe o nome do produto.");
  if (!contentJson.image.startsWith("/")) {
    throw new Error("Escolha uma imagem enviada para o site.");
  }

  const row: ProductSettingsRow = {
    product_id: productId,
    price: Number(input.price.toFixed(2)),
    active: input.active,
    stock: input.stock,
    featured: input.featured,
    content_json: contentJson,
    updated_at: new Date().toISOString(),
  };

  if (useSupabase) {
    await supabaseRequest<ProductSettingsRow[]>(
      "product_settings?on_conflict=product_id",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(row),
      },
    );
  } else {
    const database = await getLocalDatabase();
    database
      .prepare(
        `INSERT INTO product_settings (
          product_id, price, active, stock, featured, content_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET
          price = excluded.price,
          active = excluded.active,
          stock = excluded.stock,
          featured = excluded.featured,
          content_json = excluded.content_json,
          updated_at = excluded.updated_at`,
      )
      .run(
        row.product_id,
        row.price,
        row.active ? 1 : 0,
        row.stock,
        row.featured ? 1 : 0,
        JSON.stringify(row.content_json),
        row.updated_at,
      );
  }

  return (await getAdminProducts()).find((item) => item.id === productId);
};

const mergeSiteContent = (
  saved?: Partial<SiteContent> | null,
): SiteContent => ({
  ...defaultSiteContent,
  ...saved,
  brand: {
    ...defaultSiteContent.brand,
    ...(saved?.brand || {}),
  },
  hero: {
    ...defaultSiteContent.hero,
    ...(saved?.hero || {}),
  },
  carousel:
    Array.isArray(saved?.carousel) && saved.carousel.length
      ? saved.carousel
      : defaultSiteContent.carousel,
  sections: {
    ...defaultSiteContent.sections,
    ...(saved?.sections || {}),
  },
  commerce: {
    ...defaultSiteContent.commerce,
    ...(saved?.commerce || {}),
    subscriptionPrices: {
      ...defaultSiteContent.commerce.subscriptionPrices,
      ...(saved?.commerce?.subscriptionPrices || {}),
    },
  },
  seo: {
    ...defaultSiteContent.seo,
    ...(saved?.seo || {}),
  },
  updatedAt: saved?.updatedAt || null,
});

export const getSiteContent = async (): Promise<SiteContent> => {
  let row: ContentSettingsRow | undefined;
  if (useSupabase) {
    const rows = await supabaseRequest<ContentSettingsRow[]>(
      "content_settings?setting_key=eq.main&limit=1",
    );
    row = rows[0];
  } else {
    if (localDatabaseUnavailable) return defaultSiteContent;
    row = (await getLocalDatabase())
      .prepare(
        "SELECT setting_key, content_json, updated_at FROM content_settings WHERE setting_key = 'main'",
      )
      .get() as ContentSettingsRow | undefined;
  }
  if (!row) return defaultSiteContent;
  const saved = parseJson<Partial<SiteContent>>(row.content_json);
  return mergeSiteContent({ ...saved, updatedAt: row.updated_at });
};

export const updateSiteContent = async (
  content: SiteContent,
): Promise<SiteContent> => {
  const updatedAt = new Date().toISOString();
  const normalized = mergeSiteContent({ ...content, updatedAt });
  const row: ContentSettingsRow = {
    setting_key: "main",
    content_json: normalized,
    updated_at: updatedAt,
  };

  if (useSupabase) {
    await supabaseRequest<ContentSettingsRow[]>(
      "content_settings?on_conflict=setting_key",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(row),
      },
    );
  } else {
    const database = await getLocalDatabase();
    database
      .prepare(
        `INSERT INTO content_settings (setting_key, content_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(setting_key) DO UPDATE SET
           content_json = excluded.content_json,
           updated_at = excluded.updated_at`,
      )
      .run("main", JSON.stringify(normalized), updatedAt);
  }
  return normalized;
};

export const toPublicOrder = (order: StoredOrder): PublicOrder => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  paymentStatus: order.paymentStatus,
  paymentStatusDetail: order.paymentStatusDetail,
  paymentId: order.paymentId,
  paymentMethod: order.paymentMethod,
  paymentType: order.paymentType,
  fulfillmentStatus: order.fulfillmentStatus,
  trackingCode: order.trackingCode,
  customer: { fullName: order.customer.fullName },
  address: {
    city: order.address.city,
    state: order.address.state,
  },
  deliveryMethod: order.deliveryMethod,
  notes: order.notes,
  items: order.items,
  subtotal: order.subtotal,
  shipping: order.shipping,
  total: order.total,
  pixQrCode: order.pixQrCode,
  pixQrCodeBase64: order.pixQrCodeBase64,
  ticketUrl: order.ticketUrl,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});
