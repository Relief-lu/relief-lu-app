-- Relief.lu — migration v2 : fondations façon Too Good To Go
-- (à exécuter après schema-app.sql, déjà en place)
-- comptes consommateurs (favoris/historique), géolocalisation, avis, notifications push

-- ---------- Géolocalisation des commerçants ----------
alter table merchants add column if not exists lat double precision;
alter table merchants add column if not exists lng double precision;

-- ---------- Réservations liées à un compte (fini l'anonyme) ----------
alter table reservations add column if not exists user_id uuid references auth.users(id) on delete cascade;

drop policy if exists "anyone can create a reservation" on reservations;

create policy "authenticated users can create their own reservation"
  on reservations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can read their own reservations"
  on reservations for select
  to authenticated
  using (auth.uid() = user_id);

-- ---------- reserve_bag : prend désormais l'utilisateur connecté, plus l'email libre ----------
create or replace function reserve_bag(p_bag_id uuid, p_quantity int)
returns table(reservation_id uuid, pickup_code text) as $$
declare
  v_left int;
  v_code text;
  v_res_id uuid;
  v_user_id uuid := auth.uid();
  v_email text;
begin
  if v_user_id is null then
    raise exception 'Connexion requise pour réserver.';
  end if;

  select email into v_email from auth.users where id = v_user_id;

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

  insert into reservations (bag_id, user_id, email, quantity, pickup_code)
  values (p_bag_id, v_user_id, v_email, p_quantity, v_code)
  returning id into v_res_id;

  return query select v_res_id, v_code;
end;
$$ language plpgsql security definer;

-- ---------- Favoris (suivre un commerçant) ----------
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant_id uuid not null references merchants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, merchant_id)
);

alter table favorites enable row level security;

create policy "users manage own favorites"
  on favorites for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- Avis (un seul avis par réservation, après retrait) ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade unique,
  merchant_id uuid not null references merchants(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

create policy "anyone can read reviews"
  on reviews for select
  to anon, authenticated
  using (true);

create policy "author can leave a review on their own reservation"
  on reviews for insert
  to authenticated
  with check (
    exists (
      select 1 from reservations
      where reservations.id = reservation_id
      and reservations.user_id = auth.uid()
    )
  );

-- ---------- Abonnements aux notifications push (Web Push) ----------
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "users manage own push subscriptions"
  on push_subscriptions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
