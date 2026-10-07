-- =====================================================================
-- Rôles hiérarchiques et favoris
--
--   visiteur < contributeur < moderateur < administrateur
--   Chaque rôle a les droits des rôles inférieurs.
--
--   visiteur       lit les activités publiées, gère ses favoris
--   contributeur   crée des activités, tous les droits sur les siennes
--   moderateur     modifie / archive celles des autres (hors brouillons)
--   administrateur voit et supprime tout, change les rôles
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Nouveaux rôles sur profiles
-- ---------------------------------------------------------------------
alter table public.profiles drop constraint profiles_role_check;

-- Les anciens rôles gardent le droit de créer des activités
update public.profiles
set role = 'contributeur'
where role in ('animateur', 'responsable_unite');

-- Premier administrateur : Gecko
update public.profiles
set role = 'administrateur'
where id = 'e5a14985-5dc0-4e1a-81d7-40e3c62e94a9';

alter table public.profiles
  alter column role set default 'visiteur',
  add constraint profiles_role_check
    check (role in ('visiteur', 'contributeur', 'moderateur', 'administrateur'));

-- Un nouveau compte reçoit le rôle par défaut (visiteur)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Fonctions de droits
-- ---------------------------------------------------------------------

-- L'utilisateur courant a-t-il au moins ce rôle ? (false si non connecté)
-- SECURITY DEFINER : utilisée dans les policies, lit profiles sans RLS.
create function public.has_role(p_min_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select
        case p.role
          when 'visiteur' then 1
          when 'contributeur' then 2
          when 'moderateur' then 3
          when 'administrateur' then 4
        end
        >=
        case p_min_role
          when 'visiteur' then 1
          when 'contributeur' then 2
          when 'moderateur' then 3
          when 'administrateur' then 4
        end
      from public.profiles p
      where p.id = auth.uid()
    ),
    false
  );
$$;

-- L'utilisateur courant peut-il modifier une activité (auteur, statut) ?
create function public.can_edit_activity(p_created_by uuid, p_status text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select
    (p_created_by = auth.uid() and public.has_role('contributeur'))
    or (p_status <> 'draft' and public.has_role('moderateur'))
    or public.has_role('administrateur');
$$;

-- ---------------------------------------------------------------------
-- 3. Policies activities
-- ---------------------------------------------------------------------
drop policy lecture_activites on public.activities;
create policy lecture_activites on public.activities
  for select to anon, authenticated
  using (
    status = 'published'
    or created_by = (select auth.uid())
    or (status <> 'draft' and (select public.has_role('moderateur')))
    or (select public.has_role('administrateur'))
  );

drop policy creation_activite on public.activities;
create policy creation_activite on public.activities
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (select public.has_role('contributeur'))
  );

-- WITH CHECK empêche un modérateur de repasser l'activité d'un autre en brouillon
drop policy modification_activite on public.activities;
create policy modification_activite on public.activities
  for update to authenticated
  using (public.can_edit_activity(created_by, status))
  with check (public.can_edit_activity(created_by, status));

drop policy suppression_activite on public.activities;
create policy suppression_activite on public.activities
  for delete to authenticated
  using (
    (created_by = (select auth.uid()) and (select public.has_role('contributeur')))
    or (select public.has_role('administrateur'))
  );

-- ---------------------------------------------------------------------
-- 4. Policies des tables de liaison : mêmes droits que la modification
-- ---------------------------------------------------------------------
drop policy creation_liaisons_ages on public.activity_age_branches;
create policy creation_liaisons_ages on public.activity_age_branches
  for insert to authenticated
  with check (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and public.can_edit_activity(a.created_by, a.status)
    )
  );

drop policy suppression_liaisons_ages on public.activity_age_branches;
create policy suppression_liaisons_ages on public.activity_age_branches
  for delete to authenticated
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and public.can_edit_activity(a.created_by, a.status)
    )
  );

drop policy creation_liaisons_formes on public.activity_characteristic_forms;
create policy creation_liaisons_formes on public.activity_characteristic_forms
  for insert to authenticated
  with check (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and public.can_edit_activity(a.created_by, a.status)
    )
  );

drop policy suppression_liaisons_formes on public.activity_characteristic_forms;
create policy suppression_liaisons_formes on public.activity_characteristic_forms
  for delete to authenticated
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and public.can_edit_activity(a.created_by, a.status)
    )
  );

-- is_moderator n'est plus utilisée nulle part
drop function public.is_moderator();

-- ---------------------------------------------------------------------
-- 5. Administration des utilisateurs (administrateur uniquement)
-- ---------------------------------------------------------------------

-- Liste des comptes avec leur email (auth.users n'est pas exposé à l'API)
create function public.list_users()
returns table (
  id uuid,
  display_name text,
  email text,
  role text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_role('administrateur') then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;

  return query
    select p.id, p.display_name, u.email::text, p.role, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at;
end;
$$;

-- Change le rôle d'un autre utilisateur (jamais le sien : il reste
-- toujours au moins l'administrateur qui fait la modification)
create function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_role('administrateur') then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Tu ne peux pas changer ton propre rôle' using errcode = '42501';
  end if;

  update public.profiles set role = p_role where id = p_user_id;

  if not found then
    raise exception 'Utilisateur introuvable' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.list_users() from public, anon;
revoke execute on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.list_users() to authenticated;
grant execute on function public.set_user_role(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- 6. Favoris (tout utilisateur connecté)
-- ---------------------------------------------------------------------
create table public.favorites (
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  activity_id uuid not null
    references public.activities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, activity_id)
);

create index favorites_activity_id_idx on public.favorites (activity_id);

alter table public.favorites enable row level security;

revoke all on public.favorites from anon, authenticated;
grant select, insert, delete on public.favorites to authenticated;

create policy lecture_propres_favoris on public.favorites
  for select to authenticated
  using (user_id = (select auth.uid()));

-- On ne peut mettre en favori qu'une activité qu'on peut lire (RLS activities)
create policy creation_propres_favoris on public.favorites
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.activities a where a.id = activity_id)
  );

create policy suppression_propres_favoris on public.favorites
  for delete to authenticated
  using (user_id = (select auth.uid()));
