-- ============================================================
-- Migració 005: Límit de mida i policies Storage (tots els buckets)
-- Data: 2026-05-29
--
-- Problema: PDFs >1-2MB fallaven en upload des del navegador.
-- Causa A: file_size_limit massa baix al crear el bucket manualment.
-- Causa B: policies RLS d'upload inexistents a obres-documents.
--
-- Executar al Supabase SQL Editor (requereix service_role).
-- ============================================================

-- ============================================================
-- 1. Pujar el límit de mida dels buckets a 50 MB
-- ============================================================
UPDATE storage.buckets
  SET file_size_limit = 10485760  -- 10 MB en bytes
WHERE id IN ('obres-documents', 'actes-imatges');

-- ============================================================
-- 2. Policies RLS per al bucket obres-documents
--    (permet upload directe des del browser autenticat)
-- ============================================================
DROP POLICY IF EXISTS "obres_documents_select" ON storage.objects;
DROP POLICY IF EXISTS "obres_documents_insert" ON storage.objects;
DROP POLICY IF EXISTS "obres_documents_update" ON storage.objects;
DROP POLICY IF EXISTS "obres_documents_delete" ON storage.objects;

CREATE POLICY "obres_documents_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'obres-documents');

CREATE POLICY "obres_documents_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'obres-documents');

CREATE POLICY "obres_documents_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'obres-documents');

CREATE POLICY "obres_documents_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'obres-documents');

-- ============================================================
-- Verificació (executar per confirmar)
-- ============================================================
-- SELECT id, file_size_limit, public FROM storage.buckets
-- WHERE id IN ('obres-documents', 'actes-imatges');
