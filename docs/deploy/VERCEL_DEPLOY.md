# Vercel Deploy — Nandu Obres

**Estat actual** (2026-05): desplegat a l'equip Vercel d'OTN Global Connect
(pla Hobby), connectat al repo públic
[`old-to-new/nandu-obres`](https://github.com/old-to-new/nandu-obres).

## URLs

- Producció: `https://nandu-obres.vercel.app` (o el domini que es configuri)
- Supabase: `https://qmybcdgskfxitqroujoh.supabase.co`
- Supabase Dashboard: https://supabase.com/dashboard/project/qmybcdgskfxitqroujoh
- GitHub: https://github.com/old-to-new/nandu-obres

## Variables d'entorn

Els valors viuen a Vercel. Per al dev local, fes `npx vercel link` un cop i
després `npx vercel env pull --environment=development` per obtenir un
`.env.local` actualitzat.

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview + Development | `https://qmybcdgskfxitqroujoh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview + Development | Publishable key `sb_publishable_*` (no JWT) |

**No configurar `SUPABASE_SERVICE_ROLE_KEY`** llevat que s'hi afegeixi
lògica server-only que ho requereixi explícitament.

## Supabase Auth Redirect URLs

Configurat a **Authentication > URL Configuration**:

- **Site URL:** `https://nandu-obres.vercel.app`
- **Additional Redirect URLs:**
  - `https://nandu-obres.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (per dev)

Cal actualitzar-los si es canvia el domini de producció.

## Deploy

- **Automàtic:** push a `main` → deploy a producció.
- **Preview:** qualsevol branch o PR → deploy preview amb env vars de Preview.
- **Manual:** `npx vercel --prod` des del directori arrel del projecte.

## Workflow de GitHub Actions

Hi ha `.github/workflows/deploy.yml` que també desplega via CLI. Actualment
la integració Git nativa de Vercel ja desplega sola; el workflow pot causar
deploys duplicats. Decisió pendent:

- Eliminar el workflow i confiar només en Vercel native Git (recomanat).
- O mantenir-lo i desactivar el deploy automàtic de Vercel (Settings > Git
  > "Ignored Build Step"), reconfigurant els secrets `VERCEL_ORG_ID`,
  `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` al nou repo.

## Restriccions del pla Hobby

- **Body de Server Actions:** 4.5 MB. La pujada de documents evita aquest
  límit pujant directament del client a Supabase Storage. Veure
  [`../architecture/document-upload.md`](../architecture/document-upload.md).
- **Repos privats d'org no suportats** — el repo ha de ser públic o,
  alternativament, sota un compte personal. Si demà es vol privatitzar
  l'org-repo, cal Vercel Pro (~$20/mes per usuari) o canviar de host
  (Cloudflare Pages, Render, self-host).

## Rollback

```bash
npx vercel ls           # llista deploys recents
npx vercel promote <url-deploy-anterior>
```

O via dashboard: Deployments → triar deploy → "Promote to Production".
