# Deploy Manual — Nandu Obres

> [!IMPORTANT]
> **Document històric (abril 2026).** Aquest manual descriu el deploy
> original sota l'organització de Joan. Al maig de 2026 el projecte va
> ser migrat a l'org OTN Global Connect (Supabase + Vercel + GitHub).
> Per a l'estat actual veure:
>
> - [`docs/MIGRATION_2026_05.md`](docs/MIGRATION_2026_05.md)
> - [`docs/deploy/VERCEL_DEPLOY.md`](docs/deploy/VERCEL_DEPLOY.md)
>
> Conserveu aquest document com a referència de la primera engegada
> (RLS, buckets, usuaris, Auth redirect URLs — tot encara aplica perquè
> el project ref de Supabase no ha canviat). Però per a coses com paths
> locals o vincle amb Vercel, mireu els docs nous.

**Projecte:** Nandu Obres (app de gestió d'obres, actes, planificació)
**Data preparació:** 2026-04-18 (AUTO_MODE — Fase 7)
**Estat:** Preparat. Deploy manual pendent per Joan.

---

## Prerequisits

- [ ] Compte Vercel actiu (pla Hobby gratuït és suficient per MVP 2 usuaris)
- [ ] Vercel CLI instal·lat: `npm install -g vercel`
- [ ] Supabase project `qmybcdgskfxitqroujoh` accessible
- [ ] **Regió Supabase verificada:** Dashboard > Settings > General > Region ha de ser `eu-central-1` (Frankfurt)
- [ ] Credencials Supabase obtingudes (Dashboard > Settings > API):
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Pas 1 — Verificacions pre-deploy (local)

```bash
cd "/Users/joan/Projectes Joan Automate/_CLIENTS/06_nandu_construccio/nandu-obres"

# Tots els tests passen
npx vitest run

# Build net
npm run build

# TypeScript strict sense errors
npx tsc --noEmit

# .env.local NO està al repo
git ls-files | grep -E "^\.env" || echo "OK: cap .env committat"
```

Esperat: tests 131/131, build sense errors, `.env.local` NO al git.

---

## Pas 2 — Aplicar migració RLS a Supabase

Obrir **Supabase Dashboard > SQL Editor** → copiar i executar el contingut de:

`supabase/migrations/002_rls_audit.sql`

Després executar per verificar:

```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Esperat: cada taula (`treballadors`, `vehicles`, `obres`, `actes`, `acte_treballadors`, `acte_imatges`, `planificacio`) amb policy `authenticated_all`, cmd `ALL`, roles `{authenticated}`.

---

## Pas 3 — Configurar Storage privat

A **Supabase Dashboard > Storage**:

1. Buscar el bucket `acte-imatges` (si no existeix, crear-lo)
2. Edit bucket → **Public: OFF** (privat)
3. Policies del bucket:
   - `authenticated` pot SELECT, INSERT, UPDATE, DELETE

Verificar amb SQL:

```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'acte-imatges';
-- Expected: public = false
```

---

## Pas 4 — Activar Leaked Password Protection

**Supabase Dashboard > Authentication > Policies:**

- Activar "Leaked Password Protection" (check HaveIBeenPwned)
- Minimum password length: 8 (per defecte)

---

## Pas 5 — Primer deploy a Vercel

```bash
cd "/Users/joan/Projectes Joan Automate/_CLIENTS/06_nandu_construccio/nandu-obres"

vercel login    # un cop
vercel link     # connectar directori → projecte Vercel
# - Set up and deploy? Y
# - Scope: (compte Joan)
# - Link existing? N
# - Project name: nandu-obres
# - Framework: Next.js (auto)
# - Directory: ./ (per defecte)
```

El primer deploy fallarà per falta de variables d'entorn — és normal.

---

## Pas 6 — Configurar variables d'entorn

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# → introduir: https://qmybcdgskfxitqroujoh.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# → introduir la anon key del Dashboard

# Repetir per preview si vols branches de preview
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
```

Alternativa: Dashboard > Settings > Environment Variables.

---

## Pas 7 — Deploy de producció

```bash
vercel --prod
```

Esperar el missatge amb la URL final (`https://nandu-obres.vercel.app` o similar).

---

## Pas 8 — Configurar Auth Redirect URLs a Supabase

**IMPORTANT** — sense això el login redirigirà a `localhost`.

**Supabase Dashboard > Authentication > URL Configuration:**

- **Site URL:** `https://nandu-obres.vercel.app` (la URL real de Vercel)
- **Additional Redirect URLs:**
  - `https://nandu-obres.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

---

## Pas 9 — Crear usuaris a Supabase

**Dashboard > Authentication > Users > Add user:**

- `nandu@[email]` — contrasenya segura (compartir via canal segur)
- `pare@[email]` — contrasenya segura

---

## Pas 10 — Verificació post-deploy

Obrir `https://nandu-obres.vercel.app` i:

- [ ] La pàgina de login carrega (sense errors de consola)
- [ ] Login amb credencials funciona
- [ ] Dashboard carrega (obres, treballadors, planificació)
- [ ] Crear una obra de prova → es desa
- [ ] Crear una acta amb una foto → la foto es puja i es veu
- [ ] Vista certificació funciona i es pot imprimir

**Verificar headers de seguretat:**

```bash
curl -I https://nandu-obres.vercel.app
# Ha de contenir:
# strict-transport-security: max-age=63072000; includeSubDomains; preload
# x-frame-options: SAMEORIGIN
# x-content-type-options: nosniff
# referrer-policy: origin-when-cross-origin
```

**Verificar RLS des de fora (accés anònim ha de retornar buit):**

```bash
curl -s -H "apikey: [ANON_KEY]" \
  "https://qmybcdgskfxitqroujoh.supabase.co/rest/v1/treballadors?select=*"
# Expected: []
```

---

## Pas 11 — (Opcional) Inserir treballadors reals

Un cop Nandu proporcioni la llista real:

1. Editar `supabase/seeds/treballadors_reals.sql` amb els noms reals
2. Executar-lo a **Supabase SQL Editor**
3. Verificar: `SELECT nom, tipus FROM treballadors ORDER BY nom;`

---

## Pas 12 — (Opcional) Domini personalitzat

Si Nandu vol un domini propi:

```bash
vercel domains add obres.nandu.cat
```

Seguir instruccions per DNS (CNAME o A record).

Després actualitzar Supabase Auth Redirect URLs amb el nou domini.

---

## Rollback

Si el deploy de producció té un bug crític:

```bash
# Veure deploys recents
vercel ls

# Promoure un deploy anterior a producció
vercel promote [URL-deploy-anterior]
```

O via Dashboard: Deployments → triar deploy → "Promote to Production".

---

## Checklist final

- [ ] Tests passen localment (131/131)
- [ ] Build local sense errors
- [ ] Migració RLS aplicada
- [ ] Bucket Storage privat
- [ ] Leaked Password Protection activat
- [ ] Regió Supabase `eu-central-1`
- [ ] Vars d'entorn configurades a Vercel
- [ ] Deploy `vercel --prod` OK
- [ ] Redirect URLs Supabase configurades
- [ ] Usuaris creats
- [ ] Verificació `curl -I` mostra headers
- [ ] Verificació anon RLS retorna `[]`
- [ ] Login + flux bàsic funcionen a producció
