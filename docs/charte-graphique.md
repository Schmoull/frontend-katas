# Charte graphique

> **Statut : provisoire.** Les valeurs actuelles reprennent les couleurs déjà
> utilisées dans l'app (indigo / gris). Elles seront remplacées par celles de
> la charte définitive dans `src/styles/tokens.css`.

## Organisation des fichiers

| Fichier                     | Rôle                                                                 |
| --------------------------- | -------------------------------------------------------------------- |
| `src/styles/tokens.css`     | Jetons de design (`@theme` Tailwind v4) : couleurs, polices, rayons. |
| `src/styles/base.css`       | Styles des éléments HTML (corps de page, titres, liens, focus).      |
| `src/styles/components.css` | Classes réutilisables : `btn`, `input`, `label`, `card`, `badge`.    |
| `src/index.css`             | Point d'entrée : importe Tailwind puis les trois fichiers ci-dessus. |

Tailwind v4 se configure en CSS : il n'y a plus de `tailwind.config.js`.

## Jetons

| Jeton                                | Utilitaires générés                   | Usage                           |
| ------------------------------------ | ------------------------------------- | ------------------------------- |
| `primary-50…950`                     | `bg-primary-600`, `text-primary-700`… | Actions, liens, éléments actifs |
| `secondary-*`                        | `bg-secondary-50`…                    | Accents (à définir)             |
| `neutral-50…950`                     | `text-neutral-600`…                   | Textes, fonds, bordures         |
| `success-*`, `warning-*`, `danger-*` | `bg-danger-600`…                      | Publié / brouillon / erreurs    |
| `surface`, `background`              | `bg-surface`, `bg-background`         | Fond des cartes / de la page    |
| `ink`, `ink-muted`                   | `text-ink`, `text-ink-muted`          | Texte principal / secondaire    |
| `line`                               | `border-line`                         | Bordures                        |
| `font-sans`, `font-display`          | `font-sans`, `font-display`           | Texte courant / titres          |
| `radius-control`, `radius-card`      | `rounded-control`, `rounded-card`     | Boutons et champs / cartes      |

## Règles d'usage

- Dans les composants, utiliser les jetons (`bg-primary-600`, `text-ink-muted`)
  plutôt que les couleurs Tailwind brutes (`bg-indigo-600`, `text-gray-600`).
- Préférer les classes `btn btn-primary`, `input`, `card`… aux longues listes
  d'utilitaires répétées.
- Toute nouvelle couleur passe par `tokens.css`, jamais en dur dans un composant.

## À compléter avec la charte définitive

- [ ] Couleur principale (nuancier 50 → 950)
- [ ] Couleur secondaire
- [ ] Neutres (gris chauds ou froids ?)
- [ ] Polices (titres et texte) et leur chargement (`index.html` ou `@font-face`)
- [ ] Logo et favicon (`public/`)
- [ ] Rayons et ombres
