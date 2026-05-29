-- ============================================================
-- Migració 006: Categories dinàmiques
-- Data: 2026-05-29
--
-- Converteix les columnes ENUM a TEXT i crea la taula categories
-- perquè l'usuari pugui afegir/editar/eliminar valors des de l'app.
--
-- Executar al Supabase SQL Editor (requereix service_role).
-- ============================================================

-- 1. Convertir columnes ENUM a TEXT (mantenint les dades existents)
ALTER TABLE obres ALTER COLUMN linia TYPE TEXT USING linia::TEXT;
ALTER TABLE obres ALTER COLUMN estat TYPE TEXT USING estat::TEXT;
ALTER TABLE treballadors ALTER COLUMN tipus TYPE TEXT USING tipus::TEXT;

-- 2. Eliminar ENUMs antics (ja no calen)
DROP TYPE IF EXISTS linia_obra;
DROP TYPE IF EXISTS estat_obra;
DROP TYPE IF EXISTS tipus_treballador;

-- 3. Crear taula categories
CREATE TABLE categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipus       TEXT        NOT NULL,
  valor       TEXT        NOT NULL,
  etiqueta    TEXT        NOT NULL,
  ordre       INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tipus, valor)
);

-- 4. Seed amb els valors actuals
INSERT INTO categories (tipus, valor, etiqueta, ordre) VALUES
  ('linia_obra',        'obra_nova',     'Obra nova',     0),
  ('linia_obra',        'rehabilitacio', 'Rehabilitació', 1),
  ('linia_obra',        'ascensors',     'Ascensors',     2),
  ('linia_obra',        'altres',        'Altres',        3),
  ('estat_obra',        'activa',        'Activa',        0),
  ('estat_obra',        'pausada',       'Pausada',       1),
  ('estat_obra',        'finalitzada',   'Finalitzada',   2),
  ('tipus_treballador', 'oficial',       'Oficial 1a',    0),
  ('tipus_treballador', 'oficial_2a',    'Oficial 2a',    1),
  ('tipus_treballador', 'peo',           'Peó',           2),
  ('tipus_treballador', 'altre',         'Altre',         3);

-- 5. RLS per a categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Verificació (executar per confirmar)
-- ============================================================
-- SELECT tipus, count(*) FROM categories GROUP BY tipus ORDER BY tipus;
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name IN ('obres','treballadors') AND column_name IN ('linia','estat','tipus');
