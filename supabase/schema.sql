create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null default '',
  business_name text not null,
  business_type text not null default 'Local Business',
  description text not null default '',
  domain text not null default '',
  city text not null,
  phone text not null,
  services text[] not null default '{}',
  menu_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.businesses
add column if not exists business_type text not null default 'Local Business';

alter table public.businesses
add column if not exists slug text not null default '';

alter table public.businesses
add column if not exists description text not null default '';

alter table public.businesses
add column if not exists domain text not null default '';

create unique index if not exists businesses_domain_unique_idx
on public.businesses (lower(domain))
where domain <> '';

create unique index if not exists businesses_slug_unique_idx
on public.businesses (slug)
where slug <> '';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;

create trigger businesses_set_updated_at
before update on public.businesses
for each row
execute function public.set_updated_at();
