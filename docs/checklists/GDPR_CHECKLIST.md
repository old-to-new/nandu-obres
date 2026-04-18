# GDPR Checklist — Nandu Obres

Data revisió: 2026-04-18
Llei aplicable: LOPDGDD (Espanya) + GDPR
Revisió: manual (pendent `/ra-qm-team:gdpr-dsgvo-expert` formal pre-producció)

## Dades personals tractades

| Dada | Categoria | Taula | Obligatòria |
|------|-----------|-------|-------------|
| Nom treballador | Personal | `treballadors.nom` | Sí |
| Telèfon | Personal | `treballadors.telefon` | No |
| Hores treballades | Laboral | `acte_treballadors.hores` | Sí |
| Comentaris d'actes | Laboral | `acte_treballadors.comentari` | No |
| Fotos d'obra | Pot incloure persones | `acte_imatges` | No |

**Categoria:** cap dada especial (Art. 9 GDPR).

## Base jurídica

- **Contracte laboral** (Art. 6.1.b GDPR)
- **Interès legítim** (Art. 6.1.f GDPR) — certificació a clients

## Drets dels afectats

- [ ] **Informar 12 treballadors** del tractament de dades (acció Nandu)
- [ ] **Política de retenció** — conservar dades 4 anys (prescripció laboral ES)
- [x] **Accés** — Nandu pot exportar la fitxa del treballador des de l'app
- [x] **Supressió** — soft delete via `actiu = false`; hard delete via SQL

## Mesures tècniques

- [x] RLS actiu
- [x] HTTPS (TLS 1.3)
- [x] Xifrat en repòs (Supabase)
- [x] Autenticació obligatòria
- [ ] Bucket Storage privat (pas manual Supabase Dashboard)
- [ ] Signed URLs per fotos (recomanat — veure SECURITY_CHECKLIST.md)

## Hosting i transferència internacional

- **Supabase project ID actual:** `qmybcdgskfxitqroujoh`
- [ ] **Verificar regió `eu-central-1` (Frankfurt)** — Dashboard > Settings > General > Region
- **Vercel Edge:** acceptable (no emmagatzema dades d'usuari als edges)

## Accions pendents per al deploy

- [ ] Verificar regió Supabase EU
- [ ] Bucket Storage privat
- [ ] Informar treballadors (verbal/escrit)
- [ ] Documentar política de retenció

## Risc residual

**BAIX.** 12 treballadors, dades laborals bàsiques. No cal DPIA.
