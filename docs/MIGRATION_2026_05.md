# Migració maig 2026 — Joan → OTN

Resum de la migració del projecte de l'organització de Joan (gestió inicial)
a l'organització **OTN Global Connect**, juntament amb el fix d'un bug que
impedia pujar plànols grans.

## Què s'ha mogut

### Supabase

- **Project ref:** `qmybcdgskfxitqroujoh` (no canvia — transferència d'org neta).
- **Schema, dades, usuaris d'Auth, buckets de Storage:** intactes.
- **API key:** rotada al nou format `sb_publishable_*` (publishable key).
  La variable d'entorn segueix dient-se `NEXT_PUBLIC_SUPABASE_ANON_KEY` per
  compatibilitat amb el codi; Supabase accepta el nou format igual.
- **Auth redirect URLs i Site URL:** no calen canvis (URL del projecte
  inalterada).

### GitHub

- **Repo original (eliminat):** `github.com/old-to-new/nandu-obres` (privat,
  org de Joan, ja no existeix).
- **Repo nou:** [`github.com/old-to-new/nandu-obres`](https://github.com/old-to-new/nandu-obres)
  (públic, mateixa org `old-to-new` però recreat).
- **Visibilitat:** públic. Vercel Hobby no accepta repos privats propietat
  d'orgs. El codi *NO* és open source — vegeu `LICENSE` (proprietary,
  all rights reserved).
- **Topics:** `apps-web`, `nextjs`, `supabase`.

### Vercel

- **Equip:** OTN Global Connect (Hobby plan).
- **Projecte:** `nandu-obres` (mantingut, només reconnectat al repo nou).
- **Env vars actualitzades a Production + Preview + Development:**
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → nova publishable key.
  - `NEXT_PUBLIC_SUPABASE_URL` → mateix valor (verificar que estigui als 3
    entorns).
- **Git integration:** reconnectada al repo nou.

## Què cal saber si vens nou al projecte

1. Per al dev local, copia `.env.production.example` a `.env.local` i omple
   el valor de `NEXT_PUBLIC_SUPABASE_ANON_KEY` (demana'l a l'equip o agafa'l
   amb `npx vercel env pull --environment=development`).
2. El bucket de Storage `obres-documents` és **públic** (flag `public=true`)
   amb policies que permeten INSERT/UPDATE/DELETE per `authenticated` i
   SELECT per `public`. No el toquis sense actualitzar `DocumentUpload.tsx`.
3. La pujada de documents (plànols/pressupost) **no passa pel servidor de
   Next**. Veure [`architecture/document-upload.md`](architecture/document-upload.md).

## Vercel Hobby — límits que has de tenir presents

- **Repos privats d'orgs no suportats** → el repo ha de ser públic
  (o privat però d'un compte personal de GitHub).
- **Body size de Server Actions:** 4.5 MB hard. No reverteixis la pujada
  client-side de plànols a una Server Action: tornaràs a trencar el cas
  de PDFs grans.
- **Build time:** suficient per a aquest projecte.
- **Bandwidth:** atenció si Storage creix molt.

Si en algun moment cal passar a Vercel Pro o mantenir el repo privat per
ip-sensible, vegeu `LICENSE` per al text proprietary actual i contacteu
amb el copyright holder.
