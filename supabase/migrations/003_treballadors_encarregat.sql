-- Migration: 003_treballadors_encarregat
-- Afegeix l'assignació d'equip (Nandu / Pare) als treballadors.
-- La columna és nullable: NULL significa "sense assignar".

create type encarregat_treballador as enum ('nandu', 'pare');

alter table treballadors
  add column encarregat encarregat_treballador null;

comment on column treballadors.encarregat
  is 'Encarregat de l''equip al qual pertany el treballador. NULL = sense assignar.';
