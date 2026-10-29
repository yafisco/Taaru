-- =====================================================================
-- Taaru — schéma Supabase (MVP)
-- À coller dans Supabase > SQL Editor > Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Types ----------
create type public.statut_commande as enum ('recue','coupe','couture','prete','livree','annulee');
create type public.mode_paiement   as enum ('especes','wave','orange_money','autre');

-- ---------- Ateliers (1 compte = 1 atelier) ----------
create table public.ateliers (
  id               uuid primary key references auth.users(id) on delete cascade,
  nom              text not null,
  telephone        text not null,
  ville            text default 'Thiès',
  capacite_semaine int  not null default 15,          -- tenues max par semaine (mode fête)
  fete_nom         text,                              -- ex : 'Tabaski 2027'
  fete_date        date,                              -- date de la fête configurée par le tailleur
  langue_messages  text not null default 'fr' check (langue_messages in ('fr','wo')),
  created_at       timestamptz not null default now()
);

-- ---------- Clients ----------
create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  atelier_id  uuid not null default auth.uid() references public.ateliers(id) on delete cascade,
  nom         text not null,
  telephone   text,                                    -- format 221XXXXXXXXX
  quartier    text,
  genre       text check (genre in ('homme','femme')),
  notes       text,
  created_at  timestamptz not null default now(),
  unique (atelier_id, telephone)
);

-- ---------- Mesures (une fiche par client) ----------
create table public.mesures (
  client_id   uuid primary key references public.clients(id) on delete cascade,
  atelier_id  uuid not null default auth.uid() references public.ateliers(id) on delete cascade,
  valeurs     jsonb not null default '{}'::jsonb,      -- { "tour_poitrine": 104, "epaule": 46, ... } en cm
  remarques   text,
  updated_at  timestamptz not null default now()
);

-- ---------- Commandes ----------
create table public.commandes (
  id                 uuid primary key default gen_random_uuid(),
  atelier_id         uuid not null default auth.uid() references public.ateliers(id) on delete cascade,
  client_id          uuid not null references public.clients(id) on delete restrict,
  code               text not null default upper(substr(md5(gen_random_uuid()::text), 1, 5)),
  modele             text not null,                    -- ex : 'Grand boubou', 'Taille basse'
  description        text,
  photo_tissu_path   text,
  photo_modele_path  text,
  prix_total         integer not null check (prix_total >= 0),   -- FCFA
  date_depot         date not null default current_date,
  date_livraison     date,
  evenement          text,                             -- tabaski, korite, magal, gamou, mariage, bapteme, autre
  statut             public.statut_commande not null default 'recue',
  pret_le            timestamptz,
  livre_le           timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- Paiements (acompte = 1er paiement) ----------
create table public.paiements (
  id           uuid primary key default gen_random_uuid(),
  atelier_id   uuid not null default auth.uid() references public.ateliers(id) on delete cascade,
  commande_id  uuid not null references public.commandes(id) on delete cascade,
  montant      integer not null check (montant > 0),  -- FCFA
  mode         public.mode_paiement not null default 'especes',
  paye_le      timestamptz not null default now(),
  note         text
);

-- ---------- Index ----------
create index on public.clients   (atelier_id, nom);
create index on public.commandes (atelier_id, statut, date_livraison);
create index on public.commandes (client_id);
create index on public.paiements (commande_id);

-- ---------- Vue : commandes avec total payé et reste ----------
create view public.v_commandes with (security_invoker = true) as
select
  c.*,
  cl.nom        as client_nom,
  cl.telephone  as client_telephone,
  coalesce(sum(p.montant), 0)::int                  as total_paye,
  (c.prix_total - coalesce(sum(p.montant), 0))::int as reste,
  (c.date_livraison < current_date
     and c.statut not in ('prete','livree','annulee')) as en_retard
from public.commandes c
join public.clients cl on cl.id = c.client_id
left join public.paiements p on p.commande_id = c.id
group by c.id, cl.id;

-- ---------- updated_at automatique ----------
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_commandes_updated before update on public.commandes
  for each row execute function public.set_updated_at();
create trigger trg_mesures_updated before update on public.mesures
  for each row execute function public.set_updated_at();

-- ---------- Création auto de l'atelier à l'inscription ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.ateliers (id, nom, telephone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom_atelier', 'Mon atelier'),
    coalesce(new.raw_user_meta_data->>'telephone', '')
  );
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fonction de trigger uniquement : pas d'appel via /rest/v1/rpc
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- RLS : chaque atelier ne voit que ses données ----------
alter table public.ateliers  enable row level security;
alter table public.clients   enable row level security;
alter table public.mesures   enable row level security;
alter table public.commandes enable row level security;
alter table public.paiements enable row level security;

create policy ateliers_own  on public.ateliers  for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy clients_own   on public.clients   for all to authenticated
  using (atelier_id = auth.uid()) with check (atelier_id = auth.uid());
-- En écriture, la ligne référencée (client, commande) doit aussi appartenir à l'atelier :
-- sinon un atelier pourrait créer chez lui une commande ou des mesures pointant vers le client d'un autre.
create policy mesures_own   on public.mesures   for all to authenticated
  using (atelier_id = auth.uid())
  with check (atelier_id = auth.uid()
    and exists (select 1 from public.clients c where c.id = client_id and c.atelier_id = auth.uid()));
create policy commandes_own on public.commandes for all to authenticated
  using (atelier_id = auth.uid())
  with check (atelier_id = auth.uid()
    and exists (select 1 from public.clients c where c.id = client_id and c.atelier_id = auth.uid()));
create policy paiements_own on public.paiements for all to authenticated
  using (atelier_id = auth.uid())
  with check (atelier_id = auth.uid()
    and exists (select 1 from public.commandes c where c.id = commande_id and c.atelier_id = auth.uid()));

-- ---------- Storage : bucket privé « photos » ----------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy photos_select on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy photos_update on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
