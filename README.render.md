Render deployment guide for Chronos (API + Web)
===============================================

This project contains two deployable services:
- `apps/api` — NestJS API (Docker)
- `apps/web` — Next.js frontend (Node)

Quick checklist before deploying
- Rotate any secrets that were previously committed to the repo.
- Ensure `.turbo/` and all `.env` files are listed in `.gitignore` (already done).
- Connect your GitHub repo to Render.

Required environment variables

chronos-api (API service)
- `DATABASE_URL` — Render Postgres connection string (or link to managed DB)
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
- `NEXT_PUBLIC_API_BASE_URL` (set to your deployed API URL)

Render setup (high level)
1. Create a Render account and connect your GitHub repository.
2. Create a Postgres database in Render (name it `chronos-db` or copy the connection string).
3. Import the repo to Render. Render will read `render.yaml` and can create two services: `chronos-api` (Docker) and `chronos-web` (Node).
4. For `chronos-api`: ensure the Dockerfile is used (the Dockerfile now runs `npx prisma migrate deploy` on start). Supply the env vars listed above in the Render UI under Environment.
5. For `chronos-web`: create a Node service (or let `render.yaml` create it) and set the public firebase vars and `NEXT_PUBLIC_API_BASE_URL` to the API's public URL.
6. After deployment, check service logs and run any seeds if needed (e.g., via API service shell run `node seed-rooms.js` if required).

Security notes
- Do not commit secrets to git. If secrets were committed, rotate them immediately.
- I removed `.turbo/` caches from the repo and added `.turbo/` to `.gitignore`.

If you want me to automate anything else (create DNS, add health-checks, add a GitHub Action to scan pushes), tell me and I will prepare it.
