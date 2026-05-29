-- ============================================================
-- Migració 004: Polítiques RLS Storage per upload des del client
-- Data: 2026-05-29
--
-- Permet que usuaris autenticats pugin fitxers directament des
-- del navegador (sense passar per Vercel serverless). Necessari
-- per a ActaFotosUpload.tsx que ara usa createBrowserClient().
--
-- Executar al Supabase SQL Editor (requereix service_role).
-- ============================================================

-- BUCKET: actes-imatges
-- Eliminar policies antigues si existien
DROP POLICY IF EXISTS "authenticated_select" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete" ON storage.objects;

-- Permet llegir qualsevol fitxer del bucket a usuaris autenticats
CREATE POLICY "actes_imatges_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'actes-imatges');

-- Permet pujar fitxers al bucket a usuaris autenticats
CREATE POLICY "actes_imatges_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'actes-imatges');

-- Permet actualitzar fitxers del bucket a usuaris autenticats
CREATE POLICY "actes_imatges_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'actes-imatges');

-- Permet eliminar fitxers del bucket a usuaris autenticats
CREATE POLICY "actes_imatges_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'actes-imatges');
