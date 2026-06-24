create table if not exists public.customer_accounts (
  id uuid primary key,
  email text not null unique,
  password_hash text not null,
  profile_cipher text not null,
  address_cipher text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customer_accounts_email_idx
  on public.customer_accounts (email);

create table if not exists public.customer_sessions (
  token_hash text primary key,
  account_id uuid not null references public.customer_accounts(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists customer_sessions_account_idx
  on public.customer_sessions (account_id);
create index if not exists customer_sessions_expiry_idx
  on public.customer_sessions (expires_at);

create table if not exists public.customer_password_resets (
  token_hash text primary key,
  account_id uuid not null references public.customer_accounts(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists customer_password_resets_account_idx
  on public.customer_password_resets (account_id);

create table if not exists public.orders (
  id uuid primary key,
  customer_account_id uuid references public.customer_accounts(id) on delete set null,
  order_number text not null unique,
  status text not null,
  payment_status text,
  payment_status_detail text,
  payment_id text unique,
  payment_method text,
  payment_type text,
  fulfillment_status text not null default 'new',
  tracking_code text not null default '',
  admin_notes text not null default '',
  customer_json jsonb not null,
  address_json jsonb not null,
  delivery_method text not null,
  notes text not null default '',
  items_json jsonb not null,
  subtotal numeric(12, 2) not null,
  shipping numeric(12, 2) not null,
  total numeric(12, 2) not null,
  pix_qr_code text,
  pix_qr_code_base64 text,
  ticket_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_payment_id_idx
  on public.orders (payment_id);

create index if not exists orders_status_idx
  on public.orders (status);

alter table public.orders
  add column if not exists fulfillment_status text not null default 'new';
alter table public.orders
  add column if not exists tracking_code text not null default '';
alter table public.orders
  add column if not exists admin_notes text not null default '';
alter table public.orders
  add column if not exists customer_account_id uuid;

create index if not exists orders_fulfillment_status_idx
  on public.orders (fulfillment_status);
create index if not exists orders_customer_account_idx
  on public.orders (customer_account_id);

alter table public.orders enable row level security;
alter table public.customer_accounts enable row level security;
alter table public.customer_sessions enable row level security;
alter table public.customer_password_resets enable row level security;

create table if not exists public.product_settings (
  product_id text primary key,
  price numeric(12, 2) not null,
  active boolean not null default true,
  stock integer,
  featured boolean not null default false,
  content_json jsonb,
  updated_at timestamptz not null default now()
);

alter table public.product_settings
  add column if not exists content_json jsonb;

alter table public.product_settings enable row level security;

create table if not exists public.content_settings (
  setting_key text primary key,
  content_json jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.content_settings enable row level security;

create table if not exists public.subscriptions (
  id uuid primary key,
  customer_account_id uuid references public.customer_accounts(id) on delete set null,
  subscription_number text not null unique,
  mercado_pago_id text unique,
  status text not null,
  customer_json jsonb not null,
  address_json jsonb not null,
  plan_id text not null,
  plan_name text not null,
  option_id text not null,
  coffee text not null,
  quantity text not null,
  grind text not null,
  frequency_months integer not null,
  amount numeric(12, 2) not null,
  payment_method text,
  next_payment_date timestamptz,
  last_error text not null default '',
  management_token_hash text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions
  add column if not exists management_token_hash text not null default '';
alter table public.subscriptions
  add column if not exists customer_account_id uuid;

create index if not exists subscriptions_status_idx
  on public.subscriptions(status);
create index if not exists subscriptions_mp_idx
  on public.subscriptions(mercado_pago_id);
create index if not exists subscriptions_customer_account_idx
  on public.subscriptions(customer_account_id);

alter table public.subscriptions enable row level security;

-- Nenhuma política pública é criada. O projeto acessa esta tabela somente no
-- servidor com a SUPABASE_SERVICE_ROLE_KEY, que nunca deve ir para o navegador.
