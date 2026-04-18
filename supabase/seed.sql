-- TREBALLADORS (12 — 1 de baixa per provar el filtre d'actiu)
insert into treballadors (nom, tipus, actiu, telefon) values
  ('Joan Martí',    'oficial',    true,  '600111001'),
  ('Pau Ferrer',    'oficial',    true,  '600111002'),
  ('Marc Soler',    'oficial_2a', true,  '600111003'),
  ('Arnau Puig',    'oficial_2a', true,  '600111004'),
  ('David Vila',    'peo',        true,  '600111005'),
  ('Miquel Ros',    'peo',        true,  '600111006'),
  ('Oriol Serra',   'peo',        true,  '600111007'),
  ('Jordi Mas',     'oficial',    true,  '600111008'),
  ('Ramon Valls',   'oficial_2a', true,  '600111009'),
  ('Luc Torres',    'peo',        true,  '600111010'),
  ('Albert Font',   'peo',        true,  '600111011'),
  ('Sergi Llop',    'oficial',    false, '600111012');

-- VEHICLES (3)
insert into vehicles (nom, matricula, actiu) values
  ('Furgoneta blanca', '1234 ABC', true),
  ('Furgoneta gris',   '5678 DEF', true),
  ('Camioneta',        '9012 GHI', true);

-- OBRES (4 — una per línia de negoci)
insert into obres (nom, client_nom, linia, estat) values
  ('Casa Puigdomenech',            'Família Puigdomenech',              'obra_nova',      'activa'),
  ('Rehabilitació Pis Eixample',   'Comunitat Propietaris Balmes 42',   'rehabilitacio',  'activa'),
  ('Ascensor Edifici Rambla',      'Comunitat Propietaris Rambla 15',   'ascensors',      'activa'),
  ('Local Comercial Gràcia',       'Supermercat Gràcia SL',             'altres',         'pausada');
