# Catalogue d'activités (Vite + React + Tailwind + Supabase)

Catalogue partagé d'activités pour animateurs et animatrices : chaque activité
a un type, des tranches d'âge, une durée, un nombre de participants, du matériel,
des consignes de sécurité et un thème narratif.

- Tout le monde peut consulter les activités publiées, même sans compte.
- Rôles hiérarchiques (chacun a les droits des rôles précédents) :
  - **Visiteur** (rôle à l'inscription) : met des activités en favoris.
  - **Contributeur** : crée des activités, tous les droits sur les siennes (brouillon → publiée → archivée).
  - **Modérateur** : modifie et archive les activités des autres (hors brouillons).
  - **Administrateur** : voit et supprime tout, change le rôle des utilisateurs.
- Les administrateurs gèrent les types d'activité, tranches d'âge et formes caractéristiques J+S depuis la page « Données de référence ».

## Structure

```
src/
  pages/        Catalog, ActivityDetail, ActivityForm, MyActivities, Profile, Login, Register
  services/     accès Supabase (activités, profil, données de référence)
  contexts/     session + profil de l'utilisateur connecté
  types/        database.ts (généré depuis Supabase) + types métier
supabase/migrations/  SQL appliqué sur la base (RLS, triggers, index)
```

## 🚀 Démarrer le projet sur une nouvelle machine

```bash
# 1. Pré-requis
# - Installer Node.js (v22 recommandé) : https://nodejs.org/
# - Vérifier que Git est installé : git --version

# 2. Cloner le projet
git clone https://github.com/tonpseudo/frontend-katas.git
cd frontend-katas

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# puis renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY (dashboard Supabase → Settings → API)

# 4. Lancer le projet
npm install
npm run dev
```

## Tests

```bash
npm test            # lance les tests une fois (Vitest)
npm run test:watch  # relance les tests à chaque modification
```

Les tests sont à côté du code testé (`src/lib/*.test.ts`).
