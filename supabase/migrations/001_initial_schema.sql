-- Habilitar extensió per UUIDs
create extension if not exists "uuid-ossp";

-- ENUMS
create type tipus_treballador as enum ('oficial', 'oficial_2a', 'peo', 'altre');
create type linia_obra as enum ('obra_nova', 'rehabilitacio', 'ascensors', 'altres');
create type estat_obra as enum ('activa', 'pausada', 'finalitzada');

-- TREBALLADORS
create table treballadors (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  tipus tipus_treballador not null default 'oficial',
  actiu boolean not null default true,
  telefon text,
  notes text,
  created_at timestamptz not null default now()
);

-- VEHICLES
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  matricula text not null,
  actiu boolean not null default true,
  created_at timestamptz not null default now()
);

-- OBRES
create table obres (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  client_nom text not null,
  linia linia_obra not null,
  estat estat_obra not null default 'activa',
  pressupost_pdf_url text,
  projecte_pdf_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- ACTES (una per obra per dia)
create table actes (
  id uuid primary key default uuid_generate_v4(),
  obra_id uuid not null references obres(id) on delete cascade,
  data date not null,
  comentari_general text,
  created_at timestamptz not null default now(),
  unique(obra_id, data)
);

-- ACTE_TREBALLADORS
create table acte_treballadors (
  id uuid primary key default uuid_generate_v4(),
  acte_id uuid not null references actes(id) on delete cascade,
  treballador_id uuid not null references treballadors(id),
  hores decimal(4,2) not null default 9.0,
  comentari text,
  planificat boolean not null default false,
  created_at timestamptz not null default now()
);

-- ACTE_IMATGES
create table acte_imatges (
  id uuid primary key default uuid_generate_v4(),
  acte_id uuid not null references actes(id) on delete cascade,
  url text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- PLANIFICACIO
create table planificacio (
  id uuid primary key default uuid_generate_v4(),
  data date not null,
  obra_id uuid not null references obres(id) on delete cascade,
  treballador_id uuid not null references treballadors(id),
  vehicle_id uuid references vehicles(id),
  tasca text,
  created_at timestamptz not null default now()
);

-- RLS: habilitar a totes les taules
alter table treballadors enable row level security;
alter table vehicles enable row level security;
alter table obres enable row level security;
alter table actes enable row level security;
alter table acte_treballadors enable row level security;
alter table acte_imatges enable row level security;
alter table planificacio enable row level security;

-- POLICIES: usuaris autenticats veuen i gestionen tot (MVP — 2 usuaris coneguts)
create policy "auth_select_treballadors" on treballadors for select to authenticated using (true);
create policy "auth_insert_treballadors" on treballadors for insert to authenticated with check (true);
create policy "auth_update_treballadors" on treballadors for update to authenticated using (true);

create policy "auth_select_vehicles" on vehicles for select to authenticated using (true);
create policy "auth_insert_vehicles" on vehicles for insert to authenticated with check (true);
create policy "auth_update_vehicles" on vehicles for update to authenticated using (true);

create policy "auth_select_obres" on obres for select to authenticated using (true);
create policy "auth_insert_obres" on obres for insert to authenticated with check (true);
create policy "auth_update_obres" on obres for update to authenticated using (true);

create policy "auth_select_actes" on actes for select to authenticated using (true);
create policy "auth_insert_actes" on actes for insert to authenticated with check (true);
create policy "auth_update_actes" on actes for update to authenticated using (true);
create policy "auth_delete_actes" on actes for delete to authenticated using (true);

create policy "auth_select_acte_treballadors" on acte_treballadors for select to authenticated using (true);
create policy "auth_insert_acte_treballadors" on acte_treballadors for insert to authenticated with check (true);
create policy "auth_update_acte_treballadors" on acte_treballadors for update to authenticated using (true);
create policy "auth_delete_acte_treballadors" on acte_treballadors for delete to authenticated using (true);

create policy "auth_select_acte_imatges" on acte_imatges for select to authenticated using (true);
create policy "auth_insert_acte_imatges" on acte_imatges for insert to authenticated with check (true);
create policy "auth_delete_acte_imatges" on acte_imatges for delete to authenticated using (true);

create policy "auth_select_planificacio" on planificacio for select to authenticated using (true);
create policy "auth_insert_planificacio" on planificacio for insert to authenticated with check (true);
create policy "auth_update_planificacio" on planificacio for update to authenticated using (true);
create policy "auth_delete_planificacio" on planificacio for delete to authenticated using (true);
