-- Afegir flag crear_acta_auto a planificacio
-- Quan planifiques un treballador, per defecte es generarà una acta automàtica al final del dia.
ALTER TABLE public.planificacio
  ADD COLUMN IF NOT EXISTS crear_acta_auto BOOLEAN NOT NULL DEFAULT TRUE;
