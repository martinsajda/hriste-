# Architektonické TODO — otevřené otázky

Tento backlog eviduje odložená architektonická témata. Nejde o schválený implementační návrh. Související dokumenty: [ARCHITECTURE.md](ARCHITECTURE.md), [METADATA_MODEL.md](METADATA_MODEL.md), [GRID_TODO.md](GRID_TODO.md).

## A01 — Netransakční / vícetransakční zápis přes více datových zdrojů

- **Stav:** [ ] Otevřeno, záměrně odloženo.
- **Zadáno:** 21. 10. 2026.
- **Kontext:** Jeden logický `Entity` může být složen z atributů získaných z více systémů prostřednictvím composite provideru za jednotným REST API. Při aktualizaci takové entity může provider zapisovat do několika samostatných databází, Dataverse organizací nebo externích API.
- **Problém:** Jednotná atomická transakce napříč zdroji nemusí existovat. Část zápisů může uspět a jiná selhat; vznikne částečně potvrzený stav.
- **K budoucímu návrhu:** handling chyb a timeoutů; rozlišení částečného úspěchu; evidence stavu jednotlivých zápisů; idempotence a retry; kompenzační/nápravné operace a jejich limity; konzistence, souběh a audit; vhodný REST kontrakt a informace pro UI/uživatele.
- **Výslovně mimo aktuální rozsah:** výběr konkrétního mechanismu (např. saga, outbox, kompenzační workflow), implementace transakčního koordinátoru, změna současných API kontraktů.
- **Podmínka návratu:** Před implementací zápisového composite provideru, který mění více nezávislých zdrojů.

**Architektonické rozhodnutí, které již platí:** Složená logická entita je možná a frontend neřeší fyzický původ atributů. Způsob bezpečného zápisu do více zdrojů však zatím **není vyřešen ani schválen**.
