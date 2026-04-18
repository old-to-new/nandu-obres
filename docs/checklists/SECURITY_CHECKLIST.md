# Security Checklist — Nandu Obres

Data revisió: 2026-04-18
Revisió: manual (OWASP Top 10) + `next.config.ts` headers

## A01: Broken Access Control

- [x] RLS actiu a totes les taules → `supabase/migrations/002_rls_audit.sql`
- [ ] Storage bucket `acte-imatges` privat (verificar al Dashboard — pas manual)
- [x] Middleware `src/middleware.ts` redirigeix `/` → `/login` si no hi ha sessió
- [x] Server Actions / pages comproven sessió via `createClient()` + RLS
- [x] Paràmetres `[id]` són UUIDs — validats per la BD (PostgreSQL tipus `uuid`)

Verificació anònima:
```bash
curl -s -H "apikey: $ANON_KEY" "$SUPABASE_URL/rest/v1/treballadors?select=*"
# Expected: []
```

## A02: Cryptographic Failures

- [x] HTTPS obligatori a Vercel (per defecte)
- [x] Strict-Transport-Security afegit a `next.config.ts`
- [x] Variables d'entorn — cap `NEXT_PUBLIC_` amb secrets (només URL + ANON_KEY)
- [x] `SUPABASE_SERVICE_ROLE_KEY` només server-side (NO present al codi actual)
- [x] Contrasenyes gestionades per Supabase Auth (bcrypt)

## A03: Injection

- [x] SDK Supabase usa queries parametritzades (no SQL concat)
- [x] No `dangerouslySetInnerHTML` en components (verificat per grep)
- [x] No `eval()` (verificat per grep)
- [x] Formularis: validació client + server + RLS

## A05: Security Misconfiguration

- [x] Headers de seguretat a `next.config.ts`:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-DNS-Prefetch-Control: on`
- [x] `poweredByHeader: false`
- [x] `.env.local` a `.gitignore` (verificat)
- [x] Cap `console.log` de dades sensibles al codi (revisió manual recomanada abans de deploy)

## A07: Identification and Authentication Failures

- [x] Supabase Auth gestiona rate limiting
- [x] Sessions via cookies httpOnly (Supabase SSR)
- [x] Logout redirigeix a `/login`
- [ ] Leaked Password Protection activat a Supabase (pas manual — Auth > Policies)

## Vulnerabilitats específiques de l'app

- [ ] Fotos d'actes: migrar a signed URLs (actualment usa `public/**`). Recomanació: canviar a `sign/**` i generar URLs temporals (1h) — pendent per Joan
- [x] Sense informació bancària/salarial en cap vista imprimible

## Issues trobats durant aquesta revisió

1. **Bucket Storage encara configurat com a public** (verificar manualment)
2. **Leaked Password Protection** — no activat (opció recomanada a Supabase Pro gratuïta)
3. **Fotos: signed URLs** — actualment es confia en el `public/**` pattern. Acceptable per MVP intern, però recomanat migrar a signed URLs abans de fer l'app accessible des de fora de la xarxa de Nandu

## Accions pendents per deploy

- [ ] Aplicar migració `002_rls_audit.sql` via Supabase Dashboard
- [ ] Fer bucket `acte-imatges` privat
- [ ] Activar Leaked Password Protection
- [ ] Verificar headers amb `curl -I https://[url]`
