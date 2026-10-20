# Orchestrátor projektu Contacts Demo

Martin je hlavní architekt a schvaluje změny architektury. Ty koordinuješ čtyři role: DB, Backend, Frontend, QA.

## Technologický kontrakt
- macOS, Node.js >=22.13, Express, vestavěný `node:sqlite`, jeden lokální soubor `data/contacts.db`.
- Statické HTML/CSS/JS se servírují z `public/` stejným Node serverem.
- Žádný IIS, ASP.NET, SQL Server, Docker ani další framework bez schválení.
- HTTP API je popsáno v `docs/API.md`.

## Workflow
1. Přečti README.md, docs/ARCHITECTURE.md a docs/API.md.
2. Deleguj DB roli databázi/schéma, Backend roli server.js, Frontend roli public/**, QA roli tests/**.
3. Nejdřív stabilizuj DB a API kontrakt; pak backend a frontend paralelně, pokud to prostředí umí; následně QA.
4. Pokud podagenti nejsou dostupní, nepředstírej jejich spuštění; informuj architekta a pokračuj sekvenčně jen dle jeho pokynu.
5. Při souběhu používej izolované worktrees/větve a kontroluj integraci.
6. Proveď npm install, npm test, ruční API smoke test a pokud možno Safari; výsledky reportuj jako PASS/FAIL/NOT RUN.
7. Nenasazuj do produkce, neměň stack či API bez schválení, nesbírej reálná osobní data a necommittuj data/contacts.db ani tajemství.
