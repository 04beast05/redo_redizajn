-- =========================================================
-- AGENCY REDO – Supabase baza
-- Pokreni CIJELU ovu datoteku jednom: Supabase → SQL Editor → New query →
-- zalijepi sve → Run. (Sigurno ju je pokrenuti i više puta.)
-- =========================================================

-- ---------- ADMINI ----------
-- Samo mailovi iz ove tablice mogu mijenjati sadržaj kroz admin panel.
create table if not exists public.admins (
  email text primary key
);

-- >>> UPIŠI SVOJ MAIL (isti kojim ćeš se prijaviti u admin panel) <<<
insert into public.admins (email) values ('os.agency.redo@gmail.com')
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- KATEGORIJE PROJEKATA ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- PROJEKTI ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  subtitle text not null default '',      -- npr. "Ads", "Fashion", "Interview"
  year text not null default '',
  description text not null default '',
  cover_url text not null default '',
  gallery text[] not null default '{}',        -- glavne fotografije (do 6)
  gallery_extra text[] not null default '{}',  -- dodatne fotografije (do 4)
  client text not null default '',
  location text not null default '',
  website_url text not null default '',
  website_enabled boolean not null default false,
  goal text not null default '',               -- cilj i zadatak
  videos jsonb not null default '[]'::jsonb,   -- YouTube / Shorts / Vimeo linkovi
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ako je tablica projects već postojala (starija verzija), dodaj nova polja
alter table public.projects add column if not exists gallery_extra text[] not null default '{}';
alter table public.projects add column if not exists client text not null default '';
alter table public.projects add column if not exists location text not null default '';
alter table public.projects add column if not exists website_url text not null default '';
alter table public.projects add column if not exists website_enabled boolean not null default false;
alter table public.projects add column if not exists goal text not null default '';
alter table public.projects add column if not exists videos jsonb not null default '[]'::jsonb;

-- ---------- NASLOVNICA: slike u luku ----------
create table if not exists public.wheel_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- NASLOVNICA: 4 videa (0 = uvodni, 1–3 = kategorije) ----------
create table if not exists public.home_videos (
  slot int primary key check (slot between 0 and 3),
  video_url text not null default '',
  title text not null default '',
  category_slug text not null default ''
);

-- ---------- SADRŽAJ STRANICA (settings, home, about, services) ----------
create table if not exists public.page_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- PORUKE S KONTAKT FORME ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  service text not null default '',
  message text not null default '',
  created_at timestamptz not null default now()
);

-- =========================================================
-- PRAVA PRISTUPA (Row Level Security)
-- Svi mogu ČITATI sadržaj stranice, samo admini ga mogu MIJENJATI.
-- Poruke s forme upisuje samo Edge funkcija, a čitaju ih samo admini.
-- =========================================================
alter table public.admins           enable row level security;
alter table public.categories       enable row level security;
alter table public.projects         enable row level security;
alter table public.wheel_images     enable row level security;
alter table public.home_videos      enable row level security;
alter table public.page_content     enable row level security;
alter table public.contact_messages enable row level security;

do $$
declare t text;
begin
  foreach t in array array['categories','wheel_images','home_videos','page_content'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read" on public.projects;
create policy "public read" on public.projects
  for select using (published or public.is_admin());
drop policy if exists "admin write" on public.projects;
create policy "admin write" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read" on public.contact_messages;
create policy "admin read" on public.contact_messages
  for select to authenticated using (public.is_admin());
drop policy if exists "admin delete" on public.contact_messages;
create policy "admin delete" on public.contact_messages
  for delete to authenticated using (public.is_admin());

drop policy if exists "admin read" on public.admins;
create policy "admin read" on public.admins
  for select to authenticated using (public.is_admin());

-- =========================================================
-- SPREMIŠTE ZA SLIKE I VIDEE (Storage bucket "media")
-- =========================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- =========================================================
-- POČETNI PODACI (kategorije i videi – kasnije mijenjaš u adminu)
-- =========================================================
insert into public.categories (slug, name, sort) values
  ('advertising', 'Advertising', 1),
  ('cinema', 'Cinema', 2),
  ('experience-design', 'Experience design', 3)
on conflict (slug) do nothing;

insert into public.home_videos (slot, title, category_slug) values
  (0, '', ''),
  (1, 'Cinema', 'cinema'),
  (2, 'Social media', 'advertising'),
  (3, 'Software development', 'experience-design')
on conflict (slot) do nothing;
