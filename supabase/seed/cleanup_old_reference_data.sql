-- =====================================================================
-- Nettoyage des anciennes données de référence (à exécuter une seule fois)
-- =====================================================================
begin;

-- Activité de test (ses liaisons partent avec, ON DELETE CASCADE)
delete from public.activities where title = 'ggg';

-- Anciennes tranches d'âge (noms en minuscules, comparaison sensible à la casse)
delete from public.age_branches
where name in ('castors', 'louveteaux', 'eclaireurs', 'pionniers', 'routiers');

-- Anciens types d'activité
delete from public.activity_types
where name in ('grand_jeu', 'jeu_calme', 'jeu_sportif', 'jeu_eau', 'veillee',
               'activite_manuelle', 'activite_nature');

-- La branche 14-17 ans s'appelle Pionniers
update public.age_branches set name = 'Pionniers' where name = 'Picos';

commit;
