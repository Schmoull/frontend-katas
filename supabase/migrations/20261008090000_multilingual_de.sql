-- =====================================================================
-- Multilinguisme, étape 1 : l'allemand
--
--   - Données de référence : une colonne *_de par texte. NULL = pas
--     encore traduit, l'app retombe sur le français.
--   - Activités : chacune est écrite dans UNE langue (fr, de, it).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Colonnes allemandes des données de référence
-- ---------------------------------------------------------------------
alter table public.activity_types
  add column name_de text,
  add column description_de text;

alter table public.age_branches
  add column name_de text;

alter table public.characteristic_forms
  add column name_de text;

-- ---------------------------------------------------------------------
-- 2. Traductions
-- ---------------------------------------------------------------------

-- Formes caractéristiques : textes officiels J+S fournis
update public.characteristic_forms set name_de = 'Outdoor- und Lagerbautechniken wirksam anwenden' where position = 1;
update public.characteristic_forms set name_de = 'Die eigenen Bedürfnisse und Ideen bewusst einbringen' where position = 2;
update public.characteristic_forms set name_de = 'Sicher und vorausschauend unterwegs sein' where position = 3;
update public.characteristic_forms set name_de = 'Die Gemeinschaft wohlwollend stärken' where position = 4;
update public.characteristic_forms set name_de = 'Vielfältige Spiel- und Sportaktivitäten kreativ mitgestalten' where position = 5;
update public.characteristic_forms set name_de = 'Respektvoll mit der Natur und der Umwelt umgehen' where position = 6;

-- Branches : noms des stufen de la PBS (à vérifier)
update public.age_branches set name_de = 'Biber' where name = 'Castors';
update public.age_branches set name_de = 'Wölfe' where name = 'Louveteaux';
update public.age_branches set name_de = 'Pfadi' where name = 'Éclaireurs';
update public.age_branches set name_de = 'Pios' where name = 'Pionniers';
update public.age_branches set name_de = 'Rover' where name = 'Routiers';

-- Types d'activité : traductions proposées, modifiables depuis l'app
update public.activity_types set name_de = 'Grossspiel',
  description_de = 'Langes Spiel für die ganze Einheit, oft einen halben Tag oder länger, mit einer Geschichte.'
  where name = 'Grand jeu';
update public.activity_types set name_de = 'Spiel',
  description_de = 'Kurzes Spiel: Gruppen-, Kooperations- und Kennenlernspiele, Eisbrecher.'
  where name = 'Jeu';
update public.activity_types set name_de = 'Pfaditechnik',
  description_de = 'Knoten, Kartenlesen, Orientierung, Bauten, Feuer, Erste Hilfe…'
  where name = 'Technique scoute';
update public.activity_types set name_de = 'Sport',
  description_de = 'Bewegung und Sport: Orientierungslauf, Mannschaftssport, Wandern.'
  where name = 'Sport';
update public.activity_types set name_de = 'Naturerlebnis',
  description_de = 'Die Umwelt beobachten und verstehen: Tiere, Pflanzen, Wetter, Sterne.'
  where name = 'Découverte nature';
update public.activity_types set name_de = 'Kreativ',
  description_de = 'Basteln, Theater, Singen, Musik, künstlerischer Ausdruck.'
  where name = 'Créatif';
update public.activity_types set name_de = 'Abendprogramm',
  description_de = 'Aktivität am Abend: Lagerfeuer, Geschichten, Lieder, ruhige Spiele.'
  where name = 'Veillée';
update public.activity_types set name_de = 'Reflexion',
  description_de = 'Zeit für Austausch, persönliche oder spirituelle Besinnung, Rückblick.'
  where name = 'Réflexion';
update public.activity_types set name_de = 'Einsatz für andere',
  description_de = 'Nützliches für andere oder für den Ort: Mithelfen, Aufräumen, Solidaritätsprojekt.'
  where name = 'Service';
update public.activity_types set name_de = 'Unbekannt',
  description_de = 'Typ für Aktivitäten, deren Typ gelöscht wurde.'
  where is_fallback;

-- ---------------------------------------------------------------------
-- 3. Langue de chaque activité (les existantes sont en français)
-- ---------------------------------------------------------------------
alter table public.activities
  add column language text not null default 'fr'
    constraint activities_language_check check (language in ('fr', 'de', 'it'));

create index activities_status_language_idx
  on public.activities (status, language);

-- ---------------------------------------------------------------------
-- 4. save_activity enregistre aussi la langue (même signature)
-- ---------------------------------------------------------------------
create or replace function public.save_activity(
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
      status, language, created_by
    ) values (
      r.title, r.activity_type_id, r.description, r.pedagogical_objective,
      r.duration_minutes, r.min_participants, r.max_participants, r.location_type,
      r.material_needed, r.safety_notes, r.narrative_theme, r.theme_adaptation_notes,
      coalesce(r.status, 'draft'), coalesce(r.language, 'fr'), auth.uid()
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
      status = coalesce(r.status, status),
      language = coalesce(r.language, language)
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
