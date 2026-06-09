-- Matterport 3D floor plan integration
ALTER TABLE public.obres
  ADD COLUMN IF NOT EXISTS matterport_model_id TEXT,
  ADD COLUMN IF NOT EXISTS matterport_estat TEXT
    CHECK (matterport_estat IN ('pendent', 'en_estudi', 'actiu'))
    DEFAULT NULL;

COMMENT ON COLUMN public.obres.matterport_model_id IS 'ID del model Matterport (part de la URL ?m=ID)';
COMMENT ON COLUMN public.obres.matterport_estat IS 'Estat del plànol 3D: pendent | en_estudi | actiu';
