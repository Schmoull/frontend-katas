# Frontend Katas (Vite + React + Tailwind + Docker)

Petit projet d’entraînement Frontend, basé sur Vite + React + TypeScript + Tailwind, isolé dans un environnement Docker.

---

## 🚀 Démarrer le projet sur une nouvelle machine

### 1. Pré-requis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et en cours d’exécution
- Git installé (`git --version` pour vérifier)

### 2. Cloner le projet
```bash
git clone https://github.com/tonpseudo/frontend-katas.git
cd frontend-katas

### 3. Lancer le projet
docker compose build
docker compose run --rm web sh -lc "npm i"
docker compose up
