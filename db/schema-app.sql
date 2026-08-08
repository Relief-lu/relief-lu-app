-- Relief.lu — schéma complet (à exécuter dans le même projet Supabase que waitlist)

-- Marchands (comptes commerçants)
create table if not exists merchants (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  address text,
  city text,
  created_at timestamptz not null default now()
);

alter table merchants enable row level security;

create policy "merchants can read own row"
  on merchants for select
  to authenticated
  using (auth.uid() = id);

create policy "merchants can insert own row"
  on merchants for insert
  to authenticated
  with check (auth.uid() = id);

create policy "merchants can update own row"
  on merchants for update
  to authenticated
  using (auth.uid() = id);

create policy "anyone can read basic merchant info"
  on merchants for select
  to anon
  using (true);

-- Sachets (listings)
create table if not exists bags (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'autre',
  price_cents integer not null default 300,
  quantity_total integer not null default 1,
  quantity_left integer not null default 1,
  pickup_start timestamptz not null,
  pickup_end timestamptz not null,
  image_url text,
  status text not null default 'active', -- active | sold_out | expired | cancelled
  created_at timestamptz not null default now()
);

alter table bags enable row level security;

create policy "anyone can read active bags"
  on bags for select
  to anon, authenticated
  using (true);

create policy "merchants can insert their own bags"
  on bags for insert
  to authenticated
  with check (auth.uid() = merchant_id);

create policy "merchants can update their own bags"
  on bags for update
  to authenticated
  using (auth.uid() = merchant_id);

-- Réservations
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  bag_id uuid not null references bags(id) on delete cascade,
  email text not null,
  quantity integer not null default 1,
  pickup_code text not null,
  status text not null default 'confirmed', -- confirmed | picked_up | cancelled | no_show
  created_at timestamptz not null default now()
);

alter table reservations enable row level security;

create policy "anyone can create a reservation"
  on reservations for insert
  to anon, authenticated
  with check (true);

create policy "merchants can read reservations on their own bags"
  on reservations for select
  to authenticated
  using (
    exists (
      select 1 from bags
      where bags.id = reservations.bag_id
      and bags.merchant_id = auth.uid()
    )
  );

create policy "merchants can update reservations on their own bags"
  on reservations for update
  to authenticated
  using (
    exists (
      select 1 from bags
      where bags.id = reservations.bag_id
      and bags.merchant_id = auth.uid()
    )
  );

-- Fonction atomique : réserver sans jamais survendre (protège contre les accès concurrents)
create or replace function reserve_bag(p_bag_id uuid, p_email text, p_quantity int)
returns table(reservation_id uuid, pickup_code text) as $$
declare
  v_left int;
  v_code text;
  v_res_id uuid;
begin
  select quantity_left into v_left from bags where id = p_bag_id for update;

  if v_left is null then
    raise exception 'Ce sachet n''existe plus.';
  end if;

  if v_left < p_quantity then
    raise exception 'Il ne reste plus assez de sachets disponibles.';
  end if;

  update bags
    set quantity_left = quantity_left - p_quantity,
        status = case when quantity_left - p_quantity = 0 then 'sold_out' else status end
    where id = p_bag_id;

  v_code := upper(substr(md5(random()::text), 1, 6));

  insert into reservations (bag_id, email, quantity, pickup_code)
  values (p_bag_id, p_email, p_quantity, v_code)
  returning id into v_res_id;

  return query select v_res_id, v_code;
end;
$$ language plpgsql security definer;

-- Storage : bucket public pour les photos de sachets
insert into storage.buckets (id, name, public)
values ('bag-photos', 'bag-photos', true)
on conflict (id) do nothing;

create policy "anyone can view bag photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'bag-photos');

create policy "authenticated merchants can upload bag photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'bag-photos');
