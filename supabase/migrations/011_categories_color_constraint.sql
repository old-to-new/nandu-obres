-- =============================================
-- 011: Categories — color + constraint per empresa
-- =============================================

-- 1. Corregir la constraint única: ha de ser per empresa, no global
ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS categories_tipus_valor_key;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_empresa_tipus_valor_key
  UNIQUE (empresa_id, tipus, valor);

-- 2. Afegir camp color (hex, ex: "#e53e3e")
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS color TEXT;
