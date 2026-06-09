-- =============================================
-- 010: Arquitectura SaaS multi-tenant
-- =============================================

-- 1. Taula empreses
CREATE TABLE public.empreses (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom       TEXT        NOT NULL,
  subtitol  TEXT,
  logo_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Taula empresa_membres (users ↔ empresa amb rol)
CREATE TABLE public.empresa_membres (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID    NOT NULL REFERENCES public.empreses(id) ON DELETE CASCADE,
  user_id     UUID    NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
  rol         TEXT    NOT NULL DEFAULT 'membre'
                      CHECK (rol IN ('admin', 'membre')),
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, user_id)
);

CREATE INDEX ON public.empresa_membres(user_id);
CREATE INDEX ON public.empresa_membres(empresa_id);

-- 3. Afegir empresa_id a les taules principals
ALTER TABLE public.obres       ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empreses(id);
ALTER TABLE public.treballadors ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empreses(id);
ALTER TABLE public.vehicles     ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empreses(id);
ALTER TABLE public.categories   ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empreses(id);

-- 4. Migrar dades existents → empresa Marc i Jou
DO $$
DECLARE
  eid UUID;
BEGIN
  INSERT INTO public.empreses (nom, subtitol)
  VALUES ('Marc i Jou', 'Construccions')
  RETURNING id INTO eid;

  -- Tots els usuaris actuals → admin de Marc i Jou
  INSERT INTO public.empresa_membres (empresa_id, user_id, rol, email)
  SELECT eid, u.id, 'admin', u.email
  FROM auth.users u
  ON CONFLICT (empresa_id, user_id) DO NOTHING;

  UPDATE public.obres       SET empresa_id = eid WHERE empresa_id IS NULL;
  UPDATE public.treballadors SET empresa_id = eid WHERE empresa_id IS NULL;
  UPDATE public.vehicles     SET empresa_id = eid WHERE empresa_id IS NULL;
  UPDATE public.categories   SET empresa_id = eid WHERE empresa_id IS NULL;
END $$;

-- 5. Restriccions NOT NULL
ALTER TABLE public.obres       ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.treballadors ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.vehicles     ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.categories   ALTER COLUMN empresa_id SET NOT NULL;

-- Índexos de rendiment
CREATE INDEX ON public.obres(empresa_id);
CREATE INDEX ON public.treballadors(empresa_id);
CREATE INDEX ON public.vehicles(empresa_id);
CREATE INDEX ON public.categories(empresa_id);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.empreses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obres           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treballadors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acte_treballadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acte_imatges    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planificacio    ENABLE ROW LEVEL SECURITY;

-- Funció helper per obtenir les empreses de l'usuari actual
CREATE OR REPLACE FUNCTION public.user_empresa_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id FROM empresa_membres WHERE user_id = auth.uid()
$$;

-- empreses: veure i editar la pròpia empresa
CREATE POLICY "veure_empresa" ON public.empreses
  FOR SELECT USING (id IN (SELECT user_empresa_ids()));

CREATE POLICY "editar_empresa" ON public.empreses
  FOR UPDATE
  USING    (id IN (SELECT em.empresa_id FROM empresa_membres em WHERE em.user_id = auth.uid() AND em.rol = 'admin'))
  WITH CHECK (id IN (SELECT em.empresa_id FROM empresa_membres em WHERE em.user_id = auth.uid() AND em.rol = 'admin'));

-- empresa_membres: veure membres de la teva empresa; admins gestionen
CREATE POLICY "veure_membres" ON public.empresa_membres
  FOR SELECT USING (empresa_id IN (SELECT user_empresa_ids()));

CREATE POLICY "inserir_membres" ON public.empresa_membres
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT em.empresa_id FROM empresa_membres em
      WHERE em.user_id = auth.uid() AND em.rol = 'admin'
    )
  );

CREATE POLICY "eliminar_membres" ON public.empresa_membres
  FOR DELETE USING (
    empresa_id IN (
      SELECT em.empresa_id FROM empresa_membres em
      WHERE em.user_id = auth.uid() AND em.rol = 'admin'
    )
  );

-- obres
CREATE POLICY "empresa_obres" ON public.obres FOR ALL
  USING    (empresa_id IN (SELECT user_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT user_empresa_ids()));

-- treballadors
CREATE POLICY "empresa_treballadors" ON public.treballadors FOR ALL
  USING    (empresa_id IN (SELECT user_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT user_empresa_ids()));

-- vehicles
CREATE POLICY "empresa_vehicles" ON public.vehicles FOR ALL
  USING    (empresa_id IN (SELECT user_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT user_empresa_ids()));

-- categories
CREATE POLICY "empresa_categories" ON public.categories FOR ALL
  USING    (empresa_id IN (SELECT user_empresa_ids()))
  WITH CHECK (empresa_id IN (SELECT user_empresa_ids()));

-- actes (via obra)
CREATE POLICY "empresa_actes" ON public.actes FOR ALL
  USING (obra_id IN (SELECT id FROM obres WHERE empresa_id IN (SELECT user_empresa_ids())))
  WITH CHECK (obra_id IN (SELECT id FROM obres WHERE empresa_id IN (SELECT user_empresa_ids())));

-- acte_treballadors (via acta → obra)
CREATE POLICY "empresa_acte_treballadors" ON public.acte_treballadors FOR ALL
  USING (acte_id IN (
    SELECT a.id FROM actes a
    JOIN obres o ON o.id = a.obra_id
    WHERE o.empresa_id IN (SELECT user_empresa_ids())
  ))
  WITH CHECK (acte_id IN (
    SELECT a.id FROM actes a
    JOIN obres o ON o.id = a.obra_id
    WHERE o.empresa_id IN (SELECT user_empresa_ids())
  ));

-- acte_imatges (via acta → obra)
CREATE POLICY "empresa_acte_imatges" ON public.acte_imatges FOR ALL
  USING (acte_id IN (
    SELECT a.id FROM actes a
    JOIN obres o ON o.id = a.obra_id
    WHERE o.empresa_id IN (SELECT user_empresa_ids())
  ))
  WITH CHECK (acte_id IN (
    SELECT a.id FROM actes a
    JOIN obres o ON o.id = a.obra_id
    WHERE o.empresa_id IN (SELECT user_empresa_ids())
  ));

-- planificacio (via obra)
CREATE POLICY "empresa_planificacio" ON public.planificacio FOR ALL
  USING (obra_id IN (SELECT id FROM obres WHERE empresa_id IN (SELECT user_empresa_ids())))
  WITH CHECK (obra_id IN (SELECT id FROM obres WHERE empresa_id IN (SELECT user_empresa_ids())));
