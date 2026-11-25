# Charte graphique Scoutoria

La référence est le design system **Scoutoria** dans les artefacts Claude
(https://claude.ai/artifact/CoALteUzL6LP8sjBmRpCET) : principes, règles
d'usage et aperçus des composants. Ce dépôt en reprend les valeurs ; en cas de
divergence, la charte fait foi et `src/styles/tokens.css` doit être mis à jour.

En bref : le **papier** occupe la majorité de l'écran, la couleur arrive en
aplats ponctuels, angles nets, ombres dures et courtes, titres en Barlow
Condensed capitales. Ni dégradé, ni flou, ni texture.

## Fichiers

| Fichier                        | Rôle                                                                 |
| ------------------------------ | -------------------------------------------------------------------- |
| `src/styles/tokens.css`        | Jetons (`@theme` Tailwind v4) : couleurs, polices, angles, ombres.   |
| `src/styles/base.css`          | Éléments HTML : fond papier, texte encre, liens, focus clavier.      |
| `src/styles/typography.css`    | Styles de texte : `affiche`, `titre-1…3`, `surtitre`, `donnee`, etc. |
| `src/styles/components.css`    | Boutons, champs, étiquettes, fiche d'activité, bandeaux.             |
| `src/index.css`                | Point d'entrée : Tailwind puis les fichiers ci-dessus.               |
| `src/lib/activityTypeStyle.ts` | Couleur et pictogramme d'un type d'activité.                         |
| `src/assets/scoutoria/`        | Logo complet, marque, pictogrammes de type.                          |
| `public/favicon.svg`           | La marque seule.                                                     |
| `public/scoutoria/relief.svg`  | Motif relief (fond de `bandeau-relief`).                             |
| `index.html`                   | Chargement de Barlow et Barlow Condensed (Google Fonts).             |

Tailwind v4 se configure en CSS : il n'y a pas de `tailwind.config.js`.

## Jetons → classes Tailwind

| Rôle             | Jetons                                                                                                               | Exemples de classes                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Fonds            | `papier`, `papier-clair`, `papier-fonce`                                                                             | `bg-papier`, `bg-papier-clair`        |
| Textes           | `encre`, `encre-douce`, `encre-discrete`                                                                             | `text-encre-douce`                    |
| Filets           | `filet`                                                                                                              | `border-filet` (décoratif uniquement) |
| Marque           | `signal`, `signal-fonce`                                                                                             | `bg-signal`                           |
| Accents          | `feu`, `foret`, `sapin`, `ecorce`, `lac`, `mousse`, `relief`                                                         | `bg-foret text-papier`                |
| États            | `danger`, `sapin` (réussite), `lac` (information)                                                                    | `text-danger`                         |
| Types d'activité | `type-grand-jeu`, `type-veillee`, `type-technique-scoute`, `type-bricolage`, `type-jeu`, `type-sport`, `type-nature` | via `activityTypeStyle()`             |
| Carte (futur)    | `carte-itineraire`, `carte-terrain`, `carte-eau`, `carte-zone`                                                       | `stroke-carte-itineraire`             |
| Polices          | `font-titre` (Barlow Condensed), `font-texte` (Barlow)                                                               | `font-titre`                          |
| Angles           | `angle-net` → `net`, `angle-doux` → `doux`, `pastille`                                                               | `rounded-net`, `rounded-pastille`     |
| Ombres           | `ombre-posee` → `posee`, `ombre-levee` → `levee`, `ombre-flottante` → `flottante`                                    | `shadow-posee`                        |
| Espacements      | `espace-N` = N × 4px = l'échelle Tailwind                                                                            | `espace-6` → `p-6`, `gap-6`           |

## Classes de composants

| Composant de la charte | Classes                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Bouton                 | `btn` + `btn-principal` / `btn-secondaire` / `btn-contour` / `btn-discret` / `btn-danger`, `btn-icone`           |
| ChampRecherche         | `recherche` (formulaire), `champ`, `libelle`, `aide`, `aide-erreur`                                              |
| Etiquette              | `etiquette-type` (+ `sur-sombre`), `pastille-branche`, `badge-js`, `puce-donnee`                                 |
| FicheActivite          | `fiche`, `fiche-tete`, `fiche-corps`, `fiche-titre`, `fiche-resume`, `fiche-pied`, `grille-fiches`, `btn-favori` |
| BandeauRelief          | `bandeau-relief` + `bandeau-relief-bloc`, `bandeau-foret`                                                        |

Exemple d'en-tête de fiche :

```tsx
const style = activityTypeStyle(activity.activity_type?.name);
<div className={`fiche-tete ${style.className}`}>
  <span className="etiquette-type">
    {style.pictogram && <img src={style.pictogram} alt="" />}
    {localizedName(activity.activity_type)}
  </span>
</div>;
```

## Règles d'usage

- Utiliser les jetons (`bg-papier`, `text-encre-douce`) et non les couleurs
  Tailwind brutes (`bg-white`, `text-gray-600`, `bg-indigo-600`).
- `signal` : une ou deux taches par écran ; texte posé dessus toujours `encre`.
- `feu` jamais en couleur de texte sur `papier` ; `encre-discrete` jamais sur
  `papier-fonce` ; contours de champs en `encre`, jamais en `filet`.
- `danger` uniquement pour les erreurs et suppressions.
- Un seul `affiche` par page ; capitales réservées aux titres et surtitres.
- Le type d'activité n'est jamais signalé par la couleur seule.
- Le panneau indicateur n'apparaît que dans le logo.
- Ton : tutoiement, phrases courtes, boutons-verbes (« Chercher », « Publier »).

## Écarts connus avec la base de données

La table `activity_types` a 9 types, la charte en prévoit 7 :

- `Créatif` → `type-bricolage` ; `Découverte nature` → `type-nature`.
- `Réflexion` et `Service` n'ont ni couleur ni pictogramme : aplat neutre
  `papier-fonce` en attendant que la charte les définisse.

## Reste à faire

- [x] Lot 1 : en-tête (`MainLayout`), catalogue, fiche d'activité, favori,
      statut, langue, déconnexion.
- [ ] Lot 2 : détail et formulaire d'une activité.
- [ ] Lot 3 : connexion, profil, administration, listes.
- [ ] Définir couleur et pictogramme pour Réflexion et Service.
