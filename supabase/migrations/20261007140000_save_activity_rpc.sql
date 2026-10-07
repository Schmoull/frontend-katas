-- =====================================================================
-- save_activity : crée ou modifie une activité et ses tranches d'âge
-- dans une seule transaction (tout passe ou rien ne change).
--
-- SECURITY INVOKER : les policies RLS de l'appelant s'appliquent comme
-- pour des requêtes directes.
-- =====================================================================

create or replace function public.save_activity(
  p_activity jsonb,
  p_age_branch_ids uuid[],
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
  end if;

  insert into public.activity_age_branches (activity_id, age_branch_id)
  select v_id, branch_id
  from unnest(coalesce(p_age_branch_ids, '{}')) as branch_id
  on conflict do nothing;

  return v_id;
end;
$$;

revoke execute on function public.save_activity(jsonb, uuid[], uuid) from public, anon;
grant execute on function public.save_activity(jsonb, uuid[], uuid) to authenticated;
