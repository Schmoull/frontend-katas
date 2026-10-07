-- =====================================================================
-- Gestion des données de référence par les administrateurs
-- (types d'activité, tranches d'âge, formes caractéristiques)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Type de repli « Inconnu » : reçoit les activités d'un type supprimé.
--    Il ne peut être ni modifié ni supprimé.
-- ---------------------------------------------------------------------
alter table public.activity_types
  add column is_fallback boolean not null default false;

-- Un seul type de repli
create unique index activity_types_single_fallback_idx
  on public.activity_types (is_fallback)
  where is_fallback;

insert into public.activity_types (name, description, is_fallback)
values ('Inconnu', 'Type attribué aux activités dont le type a été supprimé.', true);

-- ---------------------------------------------------------------------
-- 2. Écriture réservée aux administrateurs
-- ---------------------------------------------------------------------
grant insert, update, delete on public.activity_types to authenticated;
grant insert, update, delete on public.age_branches to authenticated;
grant insert, update, delete on public.characteristic_forms to authenticated;

-- activity_types : on ne peut pas créer un second type de repli,
-- ni toucher à celui qui existe
create policy creation_types_admin on public.activity_types
  for insert to authenticated
  with check ((select public.has_role('administrateur')) and not is_fallback);

create policy modification_types_admin on public.activity_types
  for update to authenticated
  using ((select public.has_role('administrateur')) and not is_fallback)
  with check ((select public.has_role('administrateur')) and not is_fallback);

-- La suppression passe par delete_activity_type (réaffectation) : la clé
-- étrangère refuse un DELETE direct d'un type encore utilisé.
create policy suppression_types_admin on public.activity_types
  for delete to authenticated
  using ((select public.has_role('administrateur')) and not is_fallback);

create policy creation_tranches_admin on public.age_branches
  for insert to authenticated
  with check ((select public.has_role('administrateur')));

create policy modification_tranches_admin on public.age_branches
  for update to authenticated
  using ((select public.has_role('administrateur')))
  with check ((select public.has_role('administrateur')));

-- Supprimer une tranche la retire des activités (ON DELETE CASCADE)
create policy suppression_tranches_admin on public.age_branches
  for delete to authenticated
  using ((select public.has_role('administrateur')));

create policy creation_formes_admin on public.characteristic_forms
  for insert to authenticated
  with check ((select public.has_role('administrateur')));

create policy modification_formes_admin on public.characteristic_forms
  for update to authenticated
  using ((select public.has_role('administrateur')))
  with check ((select public.has_role('administrateur')));

create policy suppression_formes_admin on public.characteristic_forms
  for delete to authenticated
  using ((select public.has_role('administrateur')));

-- ---------------------------------------------------------------------
-- 3. Une forme utilisée ne peut pas être supprimée : une activité doit
--    toujours en avoir au moins une.
-- ---------------------------------------------------------------------
alter table public.activity_characteristic_forms
  drop constraint activity_characteristic_forms_characteristic_form_id_fkey,
  add constraint activity_characteristic_forms_characteristic_form_id_fkey
    foreign key (characteristic_form_id)
    references public.characteristic_forms (id)
    on delete restrict;

-- ---------------------------------------------------------------------
-- 4. Suppression d'un type avec réaffectation vers « Inconnu »
--    (une seule transaction). SECURITY INVOKER : la RLS s'applique,
--    un administrateur peut modifier toutes les activités.
-- ---------------------------------------------------------------------
create function public.delete_activity_type(p_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_fallback_id uuid;
begin
  if not public.has_role('administrateur') then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;

  select id into v_fallback_id
  from public.activity_types
  where is_fallback;

  if p_id = v_fallback_id then
    raise exception 'Le type « Inconnu » ne peut pas être supprimé'
      using errcode = '42501';
  end if;

  update public.activities
  set activity_type_id = v_fallback_id
  where activity_type_id = p_id;

  delete from public.activity_types where id = p_id;

  if not found then
    raise exception 'Type introuvable' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.delete_activity_type(uuid) from public, anon;
grant execute on function public.delete_activity_type(uuid) to authenticated;
