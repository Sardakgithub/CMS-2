Render deployment guide for Chronos (API + Web)
===============================================

This project contains two deployable services:
- `apps/api` — NestJS API (Docker)
- `apps/web` — Next.js frontend (Node)

Overview — what I prepared
- `render.yaml` includes configuration for `chronos-api` (Docker) and `chronos-web` (Node).
- The `Dockerfile` for the API now runs `npx prisma migrate deploy` at container start so migrations are applied automatically.
- `.turbo/` is ignored and caches were removed from git history. Previously committed `apps/api/.env` was purged from history — rotate those secrets.

Quick checklist before deploying
- Rotate any secrets that were previously committed to the repo.
- Make sure `.turbo/` and `.env` files remain in `.gitignore`.
- Connect your GitHub repo to Render.

Required environment variables

chronos-api (API service)
- `DATABASE_URL` — Render Postgres connection string (or link to a managed DB)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (multiline supported)
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`
- `NODE_ENV` = production
- `PORT` (optional; Render provides `$PORT`)

chronos-web (Frontend service)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_API_BASE_URL` (set to your API’s public URL)

Deploying to Render (UI method)
1. Create a Render account and connect your GitHub repository.
2. Create a managed Postgres database in Render (optional):
	- Render → Databases → New Database → Postgres.
	- If you create a DB, name it `chronos-db` (the `render.yaml` references this name) OR copy the connection string and set `DATABASE_URL` manually.
3. Import the repository into Render. Render will detect `render.yaml` and can create both services automatically.
4. If Render asks for environment variables, provide the ones listed above. For secret values (Firebase private key, R2 secrets), use Render's UI to mark them as secret.
5. For `chronos-api` (Docker): the Dockerfile runs `npm install` and `npm run build` in the builder stage, then `npx prisma migrate deploy` on start. Confirm the service's health path `/health`.
6. For `chronos-web` (Node): ensure the build command runs `cd apps/web && npm ci && npm run build` and start command is `cd apps/web && npm run start -- -p $PORT` (this is already in `render.yaml`).

Deploying using Render CLI (optional)
1. Install Render CLI: `npm install -g @render/cli` (or follow Render docs).
2. Export your API key:
```bash
export RENDER_API_KEY=your_api_key_here
```
3. Create services from `render.yaml` (Render CLI supports reading `render.yaml` in repo when using the web UI import). Render's CLI also supports service creation via `render services create --type web --name ...` but UI import + `render.yaml` is the recommended route.

Local verification (test the API Docker image locally before pushing to Render)
1. Build the API image locally (run from repo root):
```powershell
cd C:\path\to\repo
docker build -t chronos-api:local .
```
2. Prepare an `.env` file for the API (`apps/api/.env`) with placeholder/real values (do not commit it).
3. Run the container (example):
```powershell
docker run --rm -p 10000:10000 --env-file apps/api/.env chronos-api:local
```
4. The container will run `npx prisma migrate deploy` on start and then `node dist/main.js`. Check `http://localhost:10000/health`.

Post-deploy steps
- Visit API health path `/health` and Web root.
- If you need to seed the DB, open the API service shell in Render and run `node seed-rooms.js` (or your seed script).
- Configure CORS and `NEXT_PUBLIC_API_BASE_URL` in Render to point to the API public URL.

Security and housekeeping (must do)
- Rotate all keys that may have been exposed by prior commits (Firebase service account, R2 keys, DB credentials).
- Ask collaborators to re-clone the repository after history rewrites:
```powershell
git clone https://github.com/Sardakgithub/CMS-2.git
```

Optional automation I can add
- GitHub Action to notify maintainers on secret findings (create issue or Slack notification).
- Configure Git LFS and migrate large files that must remain tracked.
- Add a `husky` + `lint-staged` setup to run pre-commit checks via npm.

If you want me to take any of these optional actions, tell me which and I'll proceed.

