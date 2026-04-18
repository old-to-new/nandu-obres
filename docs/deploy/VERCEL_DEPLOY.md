# Vercel Deploy — Nandu Obres

Data preparació: 2026-04-18
Estat: **Preparat — deploy manual pendent per Joan** (AUTO_MODE no pot fer deploy real)

## URLs (pendent)

- Producció: `https://nandu-obres.vercel.app` (o domini personalitzat)
- Supabase: `https://qmybcdgskfxitqroujoh.supabase.co`
- Supabase Dashboard: https://supabase.com/dashboard/project/qmybcdgskfxitqroujoh

## Variables d'entorn (configurar a Vercel)

| Variable | Valor | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qmybcdgskfxitqroujoh.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | _(Dashboard > API > anon public)_ | Production, Preview, Development |

**NO configurar `SUPABASE_SERVICE_ROLE_KEY`** llevat que s'hi afegeixi lògica server-only que ho requereixi explícitament.

## Supabase Auth Redirect URLs

Configurar a **Authentication > URL Configuration**:

- **Site URL:** `https://nandu-obres.vercel.app`
- **Additional Redirect URLs:**
  - `https://nandu-obres.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (per dev)

## Redeploy

- Git push a `main` → redeploy automàtic (un cop connectat el repo a Vercel)
- O manual: `vercel --prod` des del directori `nandu-obres/`

## Veure `DEPLOY_MANUAL.md` a l'arrel del projecte

per les instruccions pas-a-pas completes.
