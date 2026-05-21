# Pujada de documents (plànols, pressupost)

**Patró:** pujada directa des del navegador a Supabase Storage. **No** passa
per una Server Action de Next.

## Per què

Els PDFs de plànols superen típicament 5 MB. Una pujada via Server Action
de Next es topa amb dos límits:

1. **Next bodySizeLimit:** 1 MB per defecte (`experimental.serverActions.bodySizeLimit`).
2. **Vercel platform body limit:** 4.5 MB hard al pla Hobby — no es pot
   augmentar amb config del codi.

Quan se sobrepassa, l'usuari rep l'error genèric *"An unexpected response
was received from the server"* sense diagnòstic útil.

Pujant directament del client a Supabase Storage:

- L'arxiu no toca el servidor Next ni la plataforma Vercel.
- Sense límit pràctic més enllà del que defineixi el bucket de Supabase.
- L'error de Supabase Storage (si n'hi ha) arriba textualment al component
  i es mostra a l'usuari.

## Implementació actual

- **Client:** `src/components/obres/DocumentUpload.tsx`
  - Crea un `createBrowserClient()` de `@supabase/ssr`.
  - Crida `supabase.storage.from('obres-documents').upload(...)` amb
    `upsert: true` (path determinista `${obraId}/${tipus}.${ext}`).
  - Afegeix cache-busting `?t=<timestamp>` a la URL pública per evitar
    cache stale al navegador quan se substitueix.
- **Server Action mínima:** `setDocumentUrl(obraId, tipus, url)` a
  `src/app/(dashboard)/obres/actions.ts`. Només fa l'UPDATE a la taula
  `obres` i `revalidatePath`. Cos sempre < 1 KB.

## Requisits a Supabase

- Bucket `obres-documents` amb `public = true`.
- Policies a `storage.objects` per al bucket:
  - `SELECT` per `public` (per servir l'URL pública).
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE` per `authenticated`.

Aquestes policies ja estan aplicades. Si recrees un bucket des de zero,
recorda configurar-les o la pujada client-side fallarà amb error de
permisos (que ara almenys apareixerà al component, no com un error
genèric).

## No regressis a Server Action

Si trobes el patró client-side estrany i tens la temptació de "centralitzar"
la pujada al servidor:

- Tornaràs a topar amb el límit de 4.5 MB de Vercel.
- L'única manera d'aguantar plànols grans via servidor és:
  - Vercel Pro (4.5 MB cap a 250 MB, però **costa diners**).
  - Self-host del Next.
  - Generar `createSignedUploadUrl` al servidor i pujar des del client a
    aquesta URL signada (similar al patró actual però amb URL signada en
    lloc de policy pública).

Cap d'aquestes té avantatge real sobre el patró actual mentre el bucket
sigui públic. Si demà el bucket ha de ser privat, llavors sí val la pena
canviar a URLs signades (`createSignedUploadUrl` per pujar,
`createSignedUrl` per llegir).
