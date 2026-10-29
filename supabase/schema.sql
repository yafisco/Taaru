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

-- =====================================================================
-- Offre Gratuit / Pro (migration « offre_pro »)
-- =====================================================================
alter table public.ateliers add column pro_jusqu_au date;  -- null = Gratuit ; Pro tant que >= aujourd'hui

-- Le tailleur ne peut modifier que ses réglages : ni pro_jusqu_au, ni son numéro de connexion
revoke insert, update on public.ateliers from anon, authenticated;
grant update (nom, ville, capacite_semaine, fete_nom, fete_date, langue_messages) on public.ateliers to authenticated;

-- Limite Gratuit : 30 commandes en cours (ni livrées ni annulées). Même valeur que LIMITE_GRATUIT (lib/offre.ts).
create or replace function public.verifier_limite_gratuite() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.statut in ('livree', 'annulee') then return new; end if;
  -- Une commande déjà en cours qui change d'étape ne compte pas en plus
  if tg_op = 'UPDATE' and old.statut not in ('livree', 'annulee') then return new; end if;
  if exists (select 1 from public.ateliers a where a.id = new.atelier_id and a.pro_jusqu_au >= current_date) then
    return new;
  end if;
  if (select count(*) from public.commandes c
      where c.atelier_id = new.atelier_id and c.statut not in ('livree', 'annulee') and c.id <> new.id) >= 30 then
    raise exception 'limite_gratuite';
  end if;
  return new;
end; $$;

create trigger trg_commandes_limite before insert or update of statut on public.commandes
  for each row execute function public.verifier_limite_gratuite();
revoke execute on function public.verifier_limite_gratuite() from public, anon, authenticated;

-- ---------- Administration (activation de Pro après paiement Wave) ----------
-- Pas de policy : tables invisibles par l'API, lues seulement par les fonctions ci-dessous.
-- Ajouter un admin :
--   insert into public.admins (user_id) select id from public.ateliers where telephone = '221XXXXXXXXX';
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- Historique des activations : sert de comptabilité
create table public.abonnements (
  id          uuid primary key default gen_random_uuid(),
  atelier_id  uuid not null references public.ateliers(id) on delete cascade,
  mois        int  not null check (mois between 1 and 12),
  montant     int  not null check (montant >= 0),   -- FCFA reçus
  fin         date not null,                        -- pro_jusqu_au après cette activation
  cree_le     timestamptz not null default now(),
  cree_par    uuid references auth.users(id) on delete set null
);
create index on public.abonnements (atelier_id, cree_le desc);
alter table public.abonnements enable row level security;
revoke all on public.abonnements from anon, authenticated;

create or replace function public.est_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Numéro de Taaru (Wave + WhatsApp) affiché aux tailleurs sur l'écran « Taaru Pro » : celui du 1er admin
create or replace function public.contact_taaru() returns text
language sql stable security definer set search_path = '' as $$
  select a.telephone from public.admins ad join public.ateliers a on a.id = ad.user_id
  order by a.created_at limit 1;
$$;

create or replace function public.admin_ateliers()
returns table (
  id uuid, nom text, telephone text, ville text, created_at timestamptz, pro_jusqu_au date,
  commandes_en_cours int, commandes_total int, total_paye int
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.est_admin() then raise exception 'acces_refuse' using errcode = '42501'; end if;
  return query
    select a.id, a.nom, a.telephone, a.ville, a.created_at, a.pro_jusqu_au,
      (select count(*)::int from public.commandes c where c.atelier_id = a.id and c.statut not in ('livree', 'annulee')),
      (select count(*)::int from public.commandes c where c.atelier_id = a.id),
      (select coalesce(sum(b.montant), 0)::int from public.abonnements b where b.atelier_id = a.id)
    from public.ateliers a
    order by a.created_at desc;
end; $$;

-- Prolonge Pro de p_mois à partir de la fin actuelle (ou d'aujourd'hui si Pro a expiré)
create or replace function public.admin_prolonger_pro(p_atelier uuid, p_mois int, p_montant int) returns date
language plpgsql security definer set search_path = '' as $$
declare v_fin date;
begin
  if not public.est_admin() then raise exception 'acces_refuse' using errcode = '42501'; end if;
  update public.ateliers
    set pro_jusqu_au = (greatest(coalesce(pro_jusqu_au, current_date), current_date) + make_interval(months => p_mois))::date
    where id = p_atelier
    returning pro_jusqu_au into v_fin;
  if v_fin is null then raise exception 'atelier_introuvable'; end if;
  insert into public.abonnements (atelier_id, mois, montant, fin, cree_par)
    values (p_atelier, p_mois, p_montant, v_fin, auth.uid());
  return v_fin;
end; $$;

-- En cas d'erreur de saisie : Pro s'arrête tout de suite (l'historique est gardé)
create or replace function public.admin_retirer_pro(p_atelier uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.est_admin() then raise exception 'acces_refuse' using errcode = '42501'; end if;
  update public.ateliers set pro_jusqu_au = null where id = p_atelier;
end; $$;

-- Appelables connecté uniquement ; le contrôle admin est fait dans chaque fonction
revoke execute on function public.est_admin(), public.contact_taaru(), public.admin_ateliers(),
  public.admin_prolonger_pro(uuid, int, int), public.admin_retirer_pro(uuid) from public, anon;
grant execute on function public.est_admin(), public.contact_taaru(), public.admin_ateliers(),
  public.admin_prolonger_pro(uuid, int, int), public.admin_retirer_pro(uuid) to authenticated;
