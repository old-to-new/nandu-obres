-- Seed: Treballadors reals de Nandu
-- Data: 2026-04-18
-- Executar UNA vegada a producció un cop l'app estigui deployada
-- Substituir els noms placeholder per les dades reals que proporcioni Nandu

-- Verificar primer que no hi ha duplicats
-- SELECT nom FROM treballadors;

INSERT INTO treballadors (nom, tipus, actiu, telefon, notes)
VALUES
  ('[Treballador 1]', 'oficial', true, null, null),
  ('[Treballador 2]', 'oficial', true, null, null),
  ('[Treballador 3]', 'oficial_2a', true, null, null),
  ('[Treballador 4]', 'peo', true, null, null),
  ('[Treballador 5]', 'peo', true, null, null),
  ('[Treballador 6]', 'peo', true, null, null),
  ('[Treballador 7]', 'peo', true, null, null),
  ('[Treballador 8]', 'peo', true, null, null),
  ('[Treballador 9]', 'peo', true, null, null),
  ('[Treballador 10]', 'altre', true, null, null),
  ('[Treballador 11]', 'altre', true, null, null),
  ('[Treballador 12]', 'oficial', true, null, null);

-- Verificar
-- SELECT id, nom, tipus, actiu FROM treballadors ORDER BY nom;
