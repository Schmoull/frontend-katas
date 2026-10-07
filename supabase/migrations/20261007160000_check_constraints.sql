-- =====================================================================
-- Contraintes de cohérence sur les nombres
-- (les valeurs NULL restent autorisées : un CHECK sur NULL passe)
-- =====================================================================

alter table public.activities
  add constraint activities_participants_range_check
    check (min_participants <= max_participants),
  add constraint activities_participants_positive_check
    check (min_participants >= 1 and max_participants >= 1),
  add constraint activities_duration_positive_check
    check (duration_minutes > 0);

alter table public.age_branches
  add constraint age_branches_age_range_check
    check (min_age >= 0 and min_age <= max_age);
