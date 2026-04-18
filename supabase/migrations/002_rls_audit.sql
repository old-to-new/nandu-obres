-- ============================================================
-- Migració 002: Auditoria i enfortiment RLS
-- Data: 2026-04-18
-- Totes les taules han de tenir RLS amb policy "authenticated only"
-- ============================================================

-- Assegurar RLS activat a totes les taules
ALTER TABLE public.treballadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acte_treballadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acte_imatges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planificacio ENABLE ROW LEVEL SECURITY;

-- Eliminar policies genèriques si existeixen (netejar)
DROP POLICY IF EXISTS "Allow all" ON public.treballadors;
DROP POLICY IF EXISTS "Allow all" ON public.vehicles;
DROP POLICY IF EXISTS "Allow all" ON public.obres;
DROP POLICY IF EXISTS "Allow all" ON public.actes;
DROP POLICY IF EXISTS "Allow all" ON public.acte_treballadors;
DROP POLICY IF EXISTS "Allow all" ON public.acte_imatges;
DROP POLICY IF EXISTS "Allow all" ON public.planificacio;

-- TREBALLADORS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'treballadors' AND policyname = 'authenticated_all'
  ) THEN
    CREATE POLICY authenticated_all ON public.treballadors
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- VEHICLES
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'vehicles' AND policyname = 'authenticated_all'
  ) THEN
    CREATE POLICY authenticated_all ON public.vehicles
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- OBRES
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'obres' AND policyname = 'authenticated_all'
  ) THEN
    CREATE POLICY authenticated_all ON public.obres
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ACTES
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'actes' AND policyname = 'authenticated_all'
  ) THEN
    CREATE POLICY authenticated_all ON public.actes
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ACTE_TREBALLADORS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'acte_treballadors' AND policyname = 'authenticated_all'
  ) THEN
    CREATE POLICY authenticated_all ON public.acte_treballadors
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ACTE_IMATGES
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'acte_imatges' AND policyname = 'authenticated_all'
  ) THEN
    CREATE POLICY authenticated_all ON public.acte_imatges
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- PLANIFICACIO
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'planificacio' AND policyname = 'authenticated_all'
  ) THEN
    CREATE POLICY authenticated_all ON public.planificacio
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- Supabase Storage: Bucket d'imatges — ha de ser PRIVAT
-- ============================================================
-- Aquesta actualització s'ha d'executar manualment al Dashboard
-- o descomentar si s'executa amb service_role:
--
-- UPDATE storage.buckets SET public = false WHERE id = 'acte-imatges';
--
-- Policies Storage (per si no existeixen):
-- CREATE POLICY "authenticated_read" ON storage.objects
--   FOR SELECT TO authenticated USING (bucket_id = 'acte-imatges');
-- CREATE POLICY "authenticated_insert" ON storage.objects
--   FOR INSERT TO authenticated WITH CHECK (bucket_id = 'acte-imatges');
-- CREATE POLICY "authenticated_update" ON storage.objects
--   FOR UPDATE TO authenticated USING (bucket_id = 'acte-imatges');
-- CREATE POLICY "authenticated_delete" ON storage.objects
--   FOR DELETE TO authenticated USING (bucket_id = 'acte-imatges');

-- ============================================================
-- Verificació post-migració (executar al SQL Editor)
-- ============================================================
-- SELECT tablename, policyname, cmd, roles
-- FROM pg_policies WHERE schemaname = 'public'
-- ORDER BY tablename;
