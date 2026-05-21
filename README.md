# Nandu Obres

App de gestió d'obres, actes diàries i planificació de treballadors per a
Nandu Construcció. Next.js 16 + Supabase + Vercel.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions).
- **Supabase** — Auth + Postgres + Storage. Project ref `qmybcdgskfxitqroujoh`
  a l'org OTN Global Connect.
- **Tailwind CSS v4** + Lucide icons.
- **Vitest** + Testing Library per a tests unitaris (183 actuals).
- **Playwright** per a e2e (a `e2e/`).

## Quickstart

```bash
git clone https://github.com/old-to-new/nandu-obres.git
cd nandu-obres
npm install
npx vercel link                                      # un cop, per vincular amb el projecte Vercel
npx vercel env pull --environment=development        # genera .env.local
npm run dev
```

Obre [http://localhost:3000](http://localhost:3000) i fes login amb un
usuari de Supabase Auth.

## Scripts

```bash
npm run dev         # Next dev server (port 3000)
npm run build       # Build de producció
npm run lint        # ESLint
npm test            # Vitest watch
npm run test:run    # Vitest una sola passada
```

## Documentació

- [`docs/MIGRATION_2026_05.md`](docs/MIGRATION_2026_05.md) — Migració de
  l'org de Joan a OTN, i estat actual de Supabase + GitHub + Vercel.
- [`docs/deploy/VERCEL_DEPLOY.md`](docs/deploy/VERCEL_DEPLOY.md) — Deploy
  i env vars actuals.
- [`docs/architecture/document-upload.md`](docs/architecture/document-upload.md)
  — Per què la pujada de plànols/pressupost va directa del client a
  Supabase Storage (no via Server Action).
- [`docs/checklists/SECURITY_CHECKLIST.md`](docs/checklists/SECURITY_CHECKLIST.md)
- [`docs/checklists/GDPR_CHECKLIST.md`](docs/checklists/GDPR_CHECKLIST.md)
- [`DEPLOY_MANUAL.md`](DEPLOY_MANUAL.md) — Manual de deploy original
  (2026-04, abans de migració OTN). Conserva valor com a referència
  però el `docs/deploy/VERCEL_DEPLOY.md` és el font de veritat actual.
- [`AGENTS.md`](AGENTS.md) — Instruccions per a agents que treballen al repo.

## Llicència

Proprietary — All Rights Reserved. Veure [`LICENSE`](LICENSE). El repo és
públic per raons de hosting (Vercel Hobby), però el codi **no** és open
source.
