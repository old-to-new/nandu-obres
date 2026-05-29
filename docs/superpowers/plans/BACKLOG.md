# Backlog de millores — Nandu Obres

_Última actualització: 2026-05-29_

---

## 🔍 Buscador d'obres
**Prioritat:** Alta  
Text lliure a la llista d'obres (filtra per nom d'obra, client, estat…). Implementació client-side amb `useState` + filtre sobre l'array d'obres ja carregades — sense nova crida a la BD.

---

## ⚙️ Gestió de categories (CRUD)
**Prioritat:** Alta  
Que l'usuari pugui afegir, editar i eliminar valors de les llistes desplegables:
- Tipus d'obra (linia)
- Estat d'obra
- Tipus de treballador

Requereix taules de lookup a la BD (`categories` o taules individuals) en lloc de valors hardcoded al codi. Panell d'administració senzill (pàgina `/ajustos` o modal).

---

## 🔒 Tancament automàtic d'actes
**Prioritat:** Mitjana  
Opció per marcar que una obra tanca l'acte automàticament en guardar (toggle per obra o global). **Important:** si ja existeix un acte manual per aquella data, no crear-ne un de nou ni sobreescriure'l — cal validació explícita abans d'inserir.

---

## 🏷️ Marc i Jou al títol / capçalera
**Prioritat:** Baixa  
Afegir els noms Marc i Jou (socis/propietaris?) al títol de l'app o a la capçalera del navbar. Canvi purament visual.

---

## 🖨️ Imprimir hores per treballador
**Prioritat:** Mitjana  
Vista/informe imprimible que mostri les hores treballades per un treballador en un rang de dates (per obra, per mes…). Pot ser una pàgina `/treballadors/[id]/hores` amb `@media print` o exportació a PDF.

---

## 🚗 Apartat Vehicles
**Prioritat:** Mitjana-Alta  
Nova entitat `vehicles` amb:
- Fitxa del vehicle (matrícula, tipus, descripció)
- Historial d'actes on ha aparegut el vehicle
- Planificació futura (assignació de vehicle a obra/data)

Requereix: nova taula `vehicles`, taula de relació `acte_vehicles`, i pàgina `/vehicles`.

---
