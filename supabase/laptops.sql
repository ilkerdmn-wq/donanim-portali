-- Laptop kataloğu: masaüstü donanım tablolarından bağımsızdır.
create table if not exists public.laptop_processors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 120),
  performance_order integer check (performance_order between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.laptop_graphics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 120),
  performance_order integer check (performance_order between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.laptops (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (char_length(brand) between 2 and 80),
  model text not null unique check (char_length(model) between 2 and 180),
  image_url text not null default '',
  review_slug text not null default '',
  processor_id uuid references public.laptop_processors(id) on delete set null,
  graphics_id uuid references public.laptop_graphics(id) on delete set null,
  graphics_watts numeric(6,1),
  ram_gb integer,
  ram_speed_mhz integer,
  ram_upgradable text not null default '',
  screen_inches numeric(4,1),
  resolution text not null default '',
  panel text not null default '',
  refresh_hz integer,
  brightness_nits integer,
  color_gamut text not null default '',
  ssd_gb integer,
  ssd_type text not null default '',
  battery_wh numeric(5,1),
  weight_kg numeric(4,2),
  ports text not null default '',
  wireless text not null default '',
  notes text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (graphics_watts is null or graphics_watts between 1 and 500),
  check (ram_gb is null or ram_gb between 1 and 512),
  check (refresh_hz is null or refresh_hz between 1 and 500),
  check (ssd_gb is null or ssd_gb between 1 and 16384),
  check (battery_wh is null or battery_wh between 1 and 250),
  check (weight_kg is null or weight_kg between 0.5 and 10)
);

create index if not exists laptops_published_model_idx on public.laptops(published,model);

alter table public.laptop_processors enable row level security;
alter table public.laptop_graphics enable row level security;
alter table public.laptops enable row level security;

-- Yalnızca servis rolü yazar; yayınlanan katalog ziyaretçiye açıktır.
drop policy if exists "published laptops are readable" on public.laptops;
drop policy if exists "processors are readable" on public.laptop_processors;
drop policy if exists "graphics are readable" on public.laptop_graphics;
create policy "published laptops are readable" on public.laptops
  for select to anon using (published = true);
create policy "processors are readable" on public.laptop_processors
  for select to anon using (true);
create policy "graphics are readable" on public.laptop_graphics
  for select to anon using (true);
