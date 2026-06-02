-- Soft delete per a actes: el registre queda a la BD però s'oculta a tots els llocs normals.
-- L'administrador pot consultar actes esborrades amb: SELECT * FROM actes WHERE deleted_at IS NOT NULL;
ALTER TABLE public.actes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
