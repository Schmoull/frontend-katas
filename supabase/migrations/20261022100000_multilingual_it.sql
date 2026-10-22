-- =====================================================================
-- Multilinguisme, étape 2 : l'italien
--
--   - Données de référence : une colonne *_it par texte, comme *_de.
--     NULL = pas encore traduit, l'app retombe sur le français.
--   - Les activités acceptent déjà « it » (activities_language_check) :
--     rien à changer côté activités ni dans save_activity.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Colonnes italiennes des données de référence
-- ---------------------------------------------------------------------
alter table public.activity_types
  add column name_it text,
  add column description_it text;

alter table public.age_branches
  add column name_it text;

alter table public.characteristic_forms
  add column name_it text;

-- ---------------------------------------------------------------------
-- 2. Traductions
-- ---------------------------------------------------------------------

-- Formes caractéristiques G+S : traductions proposées (à remplacer par
-- les textes officiels G+S s'ils diffèrent)
update public.characteristic_forms set name_it = 'Applicare efficacemente le tecniche outdoor e di costruzione del campo' where position = 1;
update public.characteristic_forms set name_it = 'Esprimere consapevolmente i propri bisogni e le proprie idee' where position = 2;
update public.characteristic_forms set name_it = 'Muoversi in modo sicuro e previdente' where position = 3;
update public.characteristic_forms set name_it = 'Rafforzare la comunità con benevolenza' where position = 4;
update public.characteristic_forms set name_it = 'Contribuire in modo creativo a diverse attività di gioco e sport' where position = 5;
update public.characteristic_forms set name_it = 'Rispettare la natura e l''ambiente' where position = 6;

-- Branches : noms des branches du MSS en italien (à vérifier)
update public.age_branches set name_it = 'Castori' where name = 'Castors';
update public.age_branches set name_it = 'Lupetti' where name = 'Louveteaux';
update public.age_branches set name_it = 'Esploratori' where name = 'Éclaireurs';
update public.age_branches set name_it = 'Pionieri' where name = 'Pionniers';
update public.age_branches set name_it = 'Rover' where name = 'Routiers';

-- Types d'activité : traductions proposées, modifiables depuis l'app
update public.activity_types set name_it = 'Grande gioco',
  description_it = 'Gioco lungo per tutta l''unità, spesso di mezza giornata o più, con una storia.'
  where name = 'Grand jeu';
update public.activity_types set name_it = 'Gioco',
  description_it = 'Gioco breve: giochi di gruppo, cooperativi e per conoscersi, rompighiaccio.'
  where name = 'Jeu';
update public.activity_types set name_it = 'Tecnica scout',
  description_it = 'Nodi, lettura della carta, orientamento, costruzioni, fuoco, primi soccorsi…'
  where name = 'Technique scoute';
update public.activity_types set name_it = 'Sport',
  description_it = 'Movimento e sport: corsa d''orientamento, sport di squadra, escursionismo.'
  where name = 'Sport';
update public.activity_types set name_it = 'Scoperta della natura',
  description_it = 'Osservare e capire l''ambiente: animali, piante, meteo, stelle.'
  where name = 'Découverte nature';
update public.activity_types set name_it = 'Creatività',
  description_it = 'Lavori manuali, teatro, canto, musica, espressione artistica.'
  where name = 'Créatif';
update public.activity_types set name_it = 'Serata',
  description_it = 'Attività serale: fuoco di bivacco, storie, canzoni, giochi tranquilli.'
  where name = 'Veillée';
update public.activity_types set name_it = 'Riflessione',
  description_it = 'Momento di scambio, riflessione personale o spirituale, bilancio.'
  where name = 'Réflexion';
update public.activity_types set name_it = 'Servizio',
  description_it = 'Rendersi utili agli altri o al luogo: dare una mano, pulire, progetto di solidarietà.'
  where name = 'Service';
update public.activity_types set name_it = 'Sconosciuto',
  description_it = 'Tipo per le attività il cui tipo è stato eliminato.'
  where is_fallback;
