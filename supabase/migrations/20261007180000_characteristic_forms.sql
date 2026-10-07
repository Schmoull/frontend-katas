-- =====================================================================
-- Formes caractéristiques J+S « Sport de camp/Trekking »
-- Une activité en a au moins une (vérifié dans save_activity).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table de référence (lecture seule pour l'app)
-- ---------------------------------------------------------------------
create table public.characteristic_forms (
  id uuid primary key default gen_random_uuid(),
  position smallint not null unique check (position >= 1),
  name text not null unique
);

alter table public.characteristic_forms enable row level security;

revoke all on public.characteristic_forms from anon, authenticated;
grant select on public.characteristic_forms to anon, authenticated;

create policy lecture_publique_formes on public.characteristic_forms
  for select to anon, authenticated
  using (true);

insert into public.characteristic_forms (position, name) values
  (1, 'Utiliser efficacement les techniques de vie en plein air et de construction de camp'),
  (2, 'Prendre conscience de ses propres besoins et idées et les faire valoir consciemment'),
  (3, 'Pratiquer des activités itinérantes de manière sûre et prévoyante'),
  (4, 'Renforcer la cohésion du groupe avec bienveillance'),
  (5, 'Participer avec créativité à la conception de jeux et d''activités sportives variées'),
  (6, 'Adopter une attitude respectueuse envers la nature et l''environnement');

-- ---------------------------------------------------------------------
-- 2. Liaison activité ↔ forme (mêmes règles que activity_age_branches)
-- ---------------------------------------------------------------------
create table public.activity_characteristic_forms (
  activity_id uuid not null references public.activities (id) on delete cascade,
  characteristic_form_id uuid not null references public.characteristic_forms (id) on delete cascade,
  primary key (activity_id, characteristic_form_id)
);

create index activity_characteristic_forms_form_id_idx
  on public.activity_characteristic_forms (characteristic_form_id);

alter table public.activity_characteristic_forms enable row level security;

revoke all on public.activity_characteristic_forms from anon, authenticated;
grant select on public.activity_characteristic_forms to anon, authenticated;
grant insert, delete on public.activity_characteristic_forms to authenticated;

-- La sous-requête sur activities est elle-même soumise à sa RLS.
create policy lecture_liaisons_formes on public.activity_characteristic_forms
  for select to anon, authenticated
  using (exists (select 1 from public.activities a where a.id = activity_id));

create policy creation_liaisons_formes on public.activity_characteristic_forms
  for insert to authenticated
  with check (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and (a.created_by = (select auth.uid()) or (select public.is_moderator()))
    )
  );

create policy suppression_liaisons_formes on public.activity_characteristic_forms
  for delete to authenticated
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and (a.created_by = (select auth.uid()) or (select public.is_moderator()))
    )
  );

-- ---------------------------------------------------------------------
-- 3. save_activity enregistre aussi les formes caractéristiques
--    (nouvelle signature : l'ancienne version est supprimée)
-- ---------------------------------------------------------------------
drop function public.save_activity(jsonb, uuid[], uuid);

create function public.save_activity(
  p_activity jsonb,
  p_age_branch_ids uuid[],
  p_characteristic_form_ids uuid[],
  p_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  -- Convertit le JSON en ligne typée (les clés inconnues sont ignorées)
  r public.activities := jsonb_populate_record(null::public.activities, p_activity);
  v_id uuid;
begin
  if coalesce(cardinality(p_characteristic_form_ids), 0) = 0 then
    raise exception 'Au moins une forme caractéristique est obligatoire'
      using errcode = '23514';
  end if;

  if p_id is null then
    insert into public.activities (
      title, activity_type_id, description, pedagogical_objective,
      duration_minutes, min_participants, max_participants, location_type,
      material_needed, safety_notes, narrative_theme, theme_adaptation_notes,
      status, created_by
    ) values (
      r.title, r.activity_type_id, r.description, r.pedagogical_objective,
      r.duration_minutes, r.min_participants, r.max_participants, r.location_type,
      r.material_needed, r.safety_notes, r.narrative_theme, r.theme_adaptation_notes,
      coalesce(r.status, 'draft'), auth.uid()
    )
    returning id into v_id;
  else
    update public.activities set
      title = r.title,
      activity_type_id = r.activity_type_id,
      description = r.description,
      pedagogical_objective = r.pedagogical_objective,
      duration_minutes = r.duration_minutes,
      min_participants = r.min_participants,
      max_participants = r.max_participants,
      location_type = r.location_type,
      material_needed = r.material_needed,
      safety_notes = r.safety_notes,
      narrative_theme = r.narrative_theme,
      theme_adaptation_notes = r.theme_adaptation_notes,
      status = coalesce(r.status, status)
    where id = p_id
    returning id into v_id;

    -- Activité inexistante ou non modifiable par l'appelant (RLS)
    if v_id is null then
      raise exception 'Activité introuvable ou non modifiable'
        using errcode = 'P0002';
    end if;

    delete from public.activity_age_branches where activity_id = v_id;
    delete from public.activity_characteristic_forms where activity_id = v_id;
  end if;

  insert into public.activity_age_branches (activity_id, age_branch_id)
  select v_id, branch_id
  from unnest(coalesce(p_age_branch_ids, '{}')) as branch_id
  on conflict do nothing;

  insert into public.activity_characteristic_forms (activity_id, characteristic_form_id)
  select v_id, form_id
  from unnest(p_characteristic_form_ids) as form_id
  on conflict do nothing;

  return v_id;
end;
$$;

revoke execute on function public.save_activity(jsonb, uuid[], uuid[], uuid) from public, anon;
grant execute on function public.save_activity(jsonb, uuid[], uuid[], uuid) to authenticated;
