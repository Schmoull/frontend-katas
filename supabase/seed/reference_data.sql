-- =====================================================================
-- Données de référence : types d'activité et tranches d'âge
-- Rejouable sans risque (name est unique dans les deux tables).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tranches d'âge (branches du Mouvement Scout de Suisse)
-- Si le nom existe déjà, les âges sont mis à jour.
-- ---------------------------------------------------------------------
insert into public.age_branches (name, min_age, max_age) values
  ('Castors',     5,  6),
  ('Louveteaux',  6, 10),
  ('Éclaireurs', 10, 14),
  ('Pionniers',  14, 17),
  ('Routiers',   17, 99)
on conflict (name) do update
  set min_age = excluded.min_age,
      max_age = excluded.max_age;

-- ---------------------------------------------------------------------
-- Types d'activité
-- ---------------------------------------------------------------------
insert into public.activity_types (name, description) values
  ('Grand jeu',          'Jeu long à l''échelle de l''unité, souvent sur une demi-journée ou plus, avec un scénario.'),
  ('Jeu',                'Jeu court : jeu de groupe, de coopération, de connaissance, jeu brise-glace.'),
  ('Technique scoute',   'Nœuds, cartographie, orientation, construction, feu, premiers secours…'),
  ('Sport',              'Activité physique ou sportive : course d''orientation, sports collectifs, randonnée.'),
  ('Découverte nature',  'Observation et compréhension de l''environnement : faune, flore, météo, astronomie.'),
  ('Créatif',            'Bricolage, théâtre, chant, musique, expression artistique.'),
  ('Veillée',            'Activité du soir : feu de camp, contes, chants, jeux calmes.'),
  ('Réflexion',          'Temps d''échange, de réflexion personnelle ou spirituelle, bilan.'),
  ('Service',            'Action utile pour les autres ou pour le lieu : coup de main, nettoyage, projet solidaire.')
on conflict (name) do nothing;
