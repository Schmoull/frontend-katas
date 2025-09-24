# Frontend Katas (Vite + React + Tailwind + Docker)

Petit projet d’entraînement Frontend, basé sur Vite + React + TypeScript + Tailwind, isolé dans un environnement Docker.

---

## 🚀 Démarrer le projet sur une nouvelle machine

```bash
# 1. Pré-requis
# - Installer Docker Desktop : https://www.docker.com/products/docker-desktop/
# - Vérifier que Git est installé : git --version

# 2. Cloner le projet
git clone https://github.com/tonpseudo/frontend-katas.git
cd frontend-katas

# 3. Lancer le projet
docker compose build
docker compose run --rm web sh -lc "npm i"
docker compose up
