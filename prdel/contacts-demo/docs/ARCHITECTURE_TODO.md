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


## A02 — PowerX: autentizace, session cookie a ochrana proti převzetí relace

- **Stav:** [ ] Otevřeno, záměrně odloženo.
- **Zadáno:** 21. 10. 2026.
- **Kontext:** Hostitelský PowerX portál již používá formulářové přihlášení. Důvěryhodný `CurrentUserId` (GUID uživatele portálu) má pocházet výhradně z ověřené serverové session; frontend jej může znát pro zobrazení, ale nesmí jej určovat ani předávat jako autoritativní identitu. REST business endpointy a interní providery získávají uživatelský kontext na backendu.
- **K detailnímu prověření na skutečné implementaci PowerX:** jak probíhá přihlášení a vytvoření session; co přesně je v cookie (opaque session ID vs podepsaný/šifrovaný autentizační ticket); jak se cookie váže na serverový stav a `CurrentUserId`; validace, expirace, odhlášení, obnova a rotace session ID po přihlášení (session fixation); jak backend reaguje na podvržené, neplatné, odcizené nebo cizí session ID.
- **Ochrany k posouzení:** HTTPS/TLS, `Secure`, `HttpOnly`, `SameSite`, vhodné `Path`/`Domain`, náhodnost a neuhodnutelnost session ID, bezpečné uložení a zneplatnění serverové session, CSRF a XSS, ochrana proti session hijackingu a replay, logování a detekce podezřelých relací; autorizace každého chráněného REST endpointu.
- **Konkrétní bezpečnostní test:** uživatel otevře vývojářské nástroje prohlížeče a ručně změní hodnotu cookie/session ID. Ověřit, že libovolné nebo neplatné ID nezpůsobí přihlášení ani změnu identity; **platná odcizená session cookie je však autentizační prostředek a může umožnit převzetí relace**, proto samotná serverová session nevylučuje impersonaci při krádeži cookie.
- **Výslovně mimo aktuální rozsah:** přepis autentizace PowerX, volba nové autentizační technologie, implementace bezpečnostních opatření bez auditu současného stavu.
- **Podmínka návratu:** Při integraci model-driven frameworku do PowerX a před zpřístupněním chráněných REST endpointů.

**Architektonická hranice:** Autentizaci spravuje hostitelská aplikace, nikoli model-driven renderery nebo metadatový model. Backend musí odvozovat identitu z ověřeného serverového kontextu a samostatně vynucovat autorizaci.
