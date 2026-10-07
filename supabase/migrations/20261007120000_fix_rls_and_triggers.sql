-- =====================================================================
-- Correctifs RLS, droits et triggers
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles : empêcher un utilisateur de s'attribuer un rôle
--    (UPDATE était accordé sur toute la table → role modifiable)
-- ---------------------------------------------------------------------
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

-- Le profil est créé par le trigger on_auth_user_created : pas besoin
-- d'INSERT côté client (qui permettait d'insérer role = 'moderateur').
drop policy if exists creation_propre_profil on public.profiles;
revoke insert on public.profiles from authenticated;

drop policy if exists modification_propre_profil on public.profiles;
create policy modification_propre_profil on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 2. activities : (select ...) pour éviter la réévaluation par ligne
-- ---------------------------------------------------------------------
drop policy if exists lecture_activites on public.activities;
create policy lecture_activites on public.activities
  for select to anon, authenticated
  using (
    status = 'published'
    or created_by = (select auth.uid())
    or (select public.is_moderator())
  );

drop policy if exists creation_activite on public.activities;
create policy creation_activite on public.activities
  for insert to authenticated
  with check (created_by = (select auth.uid()));

drop policy if exists modification_activite on public.activities;
create policy modification_activite on public.activities
  for update to authenticated
  using (created_by = (select auth.uid()) or (select public.is_moderator()))
  with check (created_by = (select auth.uid()) or (select public.is_moderator()));

drop policy if exists suppression_activite on public.activities;
create policy suppression_activite on public.activities
  for delete to authenticated
  using (created_by = (select auth.uid()) or (select public.is_moderator()));

-- ---------------------------------------------------------------------
-- 3. activity_age_branches : la lecture suit la visibilité de l'activité
--    (avant : tout le monde voyait les liaisons des brouillons) et une
--    seule policy SELECT au lieu de deux.
-- ---------------------------------------------------------------------
drop policy if exists lecture_liaisons_ages on public.activity_age_branches;
drop policy if exists gestion_liaisons_ages on public.activity_age_branches;

-- La sous-requête sur activities est elle-même soumise à sa RLS.
create policy lecture_liaisons_ages on public.activity_age_branches
  for select to anon, authenticated
  using (exists (select 1 from public.activities a where a.id = activity_id));

create policy creation_liaisons_ages on public.activity_age_branches
  for insert to authenticated
  with check (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and (a.created_by = (select auth.uid()) or (select public.is_moderator()))
    )
  );

create policy suppression_liaisons_ages on public.activity_age_branches
  for delete to authenticated
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and (a.created_by = (select auth.uid()) or (select public.is_moderator()))
    )
  );

-- Pas de policy UPDATE : on modifie les liaisons par suppression + insertion.
revoke update on public.activity_age_branches from authenticated;

-- ---------------------------------------------------------------------
-- 4. Fonctions SECURITY DEFINER exposées via /rest/v1/rpc
--    (is_moderator reste exécutable : utilisée par les policies, y compris anon)
-- ---------------------------------------------------------------------
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. Trigger activities : updated_at, published_at, champs immuables
-- ---------------------------------------------------------------------
create or replace function public.set_activity_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
  else
    new.created_at := old.created_at;
    new.created_by := old.created_by;
  end if;

  new.updated_at := now();

  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := now();
  elsif new.status <> 'published' then
    new.published_at := null;
  else
    new.published_at := old.published_at;
  end if;

  return new;
end;
$$;

revoke execute on function public.set_activity_timestamps() from public, anon, authenticated;

drop trigger if exists activities_set_timestamps on public.activities;
create trigger activities_set_timestamps
  before insert or update on public.activities
  for each row execute function public.set_activity_timestamps();

-- ---------------------------------------------------------------------
-- 6. Index sur les clés étrangères
-- ---------------------------------------------------------------------
create index if not exists activities_activity_type_id_idx on public.activities (activity_type_id);
create index if not exists activities_created_by_idx on public.activities (created_by);
create index if not exists activity_age_branches_age_branch_id_idx on public.activity_age_branches (age_branch_id);
