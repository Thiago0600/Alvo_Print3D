-- =====================================================================
-- ALVO PRINT 3D — ESQUEMA DA BASE DE DADOS (Supabase / PostgreSQL)
-- Executar uma vez em: Supabase → SQL Editor → New query → Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- CATEGORIAS ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- PRODUTOS (catálogo) ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  features    text[] not null default '{}',
  material    text,
  dimensions  text,
  price       numeric(10,2),            -- NULL = "Solicitar orçamento"
  images      text[] not null default '{}',
  published   boolean not null default true,
  featured    boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

-- ---------- GERAÇÕES 3D (Meshy) ----------
create table if not exists public.generations (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  parent_id        uuid references public.generations(id) on delete set null,
  meshy_task_id    text unique,
  status           text not null default 'PENDING',   -- PENDING | IN_PROGRESS | SUCCEEDED | FAILED | CANCELED
  progress         int not null default 0,
  task_error       text,
  customer_name    text,
  customer_phone   text,
  description      text,
  usage_type       text,
  image_path       text,                 -- caminho no bucket "media"
  image_url        text,                 -- URL pública da fotografia original
  meshy_model_urls jsonb,                -- URLs temporárias da Meshy (expiram)
  meshy_thumbnail  text,
  meshy_expires_at bigint,
  thumbnail_url    text,                 -- cópia permanente
  files            jsonb not null default '{}'::jsonb,  -- {"glb": url, "stl": url, ...} cópias permanentes
  archived         boolean not null default false,
  consumed_credits int,
  ip_hash          text,
  approved         boolean not null default false,
  order_requested_at timestamptz
);
create index if not exists generations_created_idx on public.generations(created_at desc);
create index if not exists generations_ip_idx on public.generations(ip_hash, created_at);

-- ---------- PEDIDOS (orçamentos, encomendas de peças, empresas) ----------
create table if not exists public.quote_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  kind            text not null default 'orcamento',  -- orcamento | empresa | produto | peca3d
  status          text not null default 'novo',       -- novo | em_contacto | concluido | arquivado
  name            text,
  phone           text,
  company         text,
  piece_type      text,
  dimensions      text,
  material        text,
  color           text,
  quantity        text,
  deadline        text,
  production_type text,                               -- individual | grandes_quantidades
  description     text,
  reference_urls  text[] not null default '{}',
  generation_id   uuid references public.generations(id) on delete set null,
  product_id      uuid references public.products(id) on delete set null,
  whatsapp_text   text
);
create index if not exists quotes_created_idx on public.quote_requests(created_at desc);

-- ---------- CONFIGURAÇÕES (empresa, Meshy) ----------
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- REGISTO DE UPLOADS (anti-abuso) ----------
create table if not exists public.upload_log (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  ip_hash    text not null,
  path       text not null
);
create index if not exists upload_log_ip_idx on public.upload_log(ip_hash, created_at);

-- =====================================================================
-- SEGURANÇA (Row Level Security)
-- O navegador só pode LER categorias, produtos publicados e configurações
-- públicas. Todas as escritas passam pelo backend (service role).
-- =====================================================================
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.generations    enable row level security;
alter table public.quote_requests enable row level security;
alter table public.settings       enable row level security;
alter table public.upload_log     enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);

drop policy if exists "public read published products" on public.products;
create policy "public read published products" on public.products for select using (published = true);

-- generations, quote_requests, settings, upload_log: sem políticas públicas
-- (só o servidor com a service role consegue aceder).

-- =====================================================================
-- ARMAZENAMENTO DE FICHEIROS
-- Bucket público "media": fotografias do catálogo, fotografias enviadas
-- pelos clientes e cópias permanentes dos modelos 3D gerados.
-- Os nomes dos ficheiros usam identificadores aleatórios (não adivinháveis).
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array[
    'image/jpeg','image/png','image/webp',
    'application/pdf',
    'model/gltf-binary','model/stl','model/3mf','model/obj','model/vnd.usdz+zip',
    'application/sla','application/vnd.ms-pki.stl','application/octet-stream','text/plain'
  ]
)
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- =====================================================================
-- DADOS INICIAIS
-- =====================================================================
insert into public.categories (slug, name, description, sort_order) values
  ('automovel',           'Automóvel',            'Peças, suportes e acessórios para automóveis.', 1),
  ('industrial',          'Industrial',           'Componentes e peças para manutenção industrial.', 2),
  ('decoracao',           'Decoração',            'Peças decorativas e artísticas.', 3),
  ('casa-e-utilidades',   'Casa e utilidades',    'Soluções práticas para o dia a dia.', 4),
  ('acessorios',          'Acessórios',           'Acessórios e pequenas peças personalizadas.', 5),
  ('prototipagem',        'Prototipagem',         'Protótipos para validação de produto.', 6),
  ('pecas-personalizadas','Peças personalizadas', 'Peças feitas à medida do cliente.', 7)
on conflict (slug) do nothing;

insert into public.settings (key, value) values
  ('company', '{
    "name": "Alvo Print 3D",
    "whatsapp": "351966381796",
    "city": "Évora",
    "region": "Évora, Portugal",
    "email": "",
    "instagram": "",
    "facebook": "",
    "islandsNote": "Para os Açores e a Madeira, as condições de envio são confirmadas caso a caso pelo WhatsApp.",
    "hours": ""
  }'::jsonb),
  ('meshy', '{
    "enabled": true,
    "ai_model": "latest",
    "should_texture": true,
    "enable_pbr": false,
    "should_remesh": true,
    "target_polycount": 30000,
    "moderation": true,
    "archive_formats": ["glb", "stl"],
    "ip_daily_limit": 3,
    "global_daily_limit": 25
  }'::jsonb)
on conflict (key) do nothing;
