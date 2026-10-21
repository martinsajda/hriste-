# Instrukce pro jediného vývojového agenta — Contacts Demo

## Režim projektu

**Projekt v první fázi vyvíjí právě jeden univerzální AI agent.** Nepoužívej multiagentní orchestraci, subagenty, delegování ani paralelní agentní role. Toto pravidlo platí pro ChatGPT pracujícího přes GitHub i pro budoucí lokální Codex CLI nebo jiného vývojového agenta.

Uživatel zadává požadavky přirozeným jazykem, často hlasovým diktováním. Agent převádí zadání do jednoznačných změn dokumentace a kódu, průběžně kontroluje konzistenci a reportuje, co skutečně provedl. Zásadní změny architektury a rozsahu schvaluje uživatel.

## Zdroje pravdy a pořadí čtení

1. `README.md` — účel aplikace, UI a celkové zadání (schválené kontrakty mají přednost před ilustrativními ukázkami).
2. `docs/DATOVY_MODEL.md` — závazné schéma dvou entit, GUID a vztah 1:N.
3. `docs/API.md` — závazný REST API v1 kontrakt: 5 CRUD operací na entitu, celkem 10, a schválené volitelné stránkování seznamů.
4. `docs/GRID_METADATA.md` — schválená metadata gridů, klientské a serverové stránkování.
5. `docs/ARCHITECTURE.md` — závazné technologické vrstvy a provoz.
6. `DEPLOY.md` — odsouhlasený směr budoucího veřejného nasazení (bez dosud určených detailů).

`HISTORIE.md` je archiv dialogu, nikoli závazná technická specifikace.

**Jediným aktivním agentním zadáním je tento soubor.** Jakékoli dřívější pokyny pro specializované agenty nejsou závazné.

## Technologie a hranice

- První implementace: Node.js, Express, SQLite přes `node:sqlite`; lokální běh na Windows i macOS.
- Frontend: statické HTML, čistý JavaScript, jeden centrální dokumentovaný CSS soubor; JSON metadata a univerzální renderer gridů, formulářů, subgridů a dialogů.
- Jeden Node.js proces servíruje statické soubory i REST API, výchozí `127.0.0.1:3000`.
- Dvě entity `Contacts` a `TelephoneNumbers`; primární klíče GUID/UUID, nikoliv auto-increment integer.
- REST API musí být nezávislé na backendové implementaci. Budoucí portace: ASP.NET Core/C# a PHP se stejným kontraktem, ale nejsou součástí první implementace.
- Databázi `data/contacts.db` a tajemství necommituj. Nepoužívej reálné osobní údaje při testování. Lokální demonstrace není určena k veřejnému vystavení bez zabezpečení.

## Pracovní postup jednoho agenta

1. Přečti aktuální specifikaci a relevantní zdrojové soubory; rozliš starý prototyp od nového závazného zadání.
2. Zkontroluj závislosti mezi DB, API, metadaty, frontendem a testy. Implementuj změny postupně sám.
3. Pokud je požadavek nejednoznačný a mění kontrakt, požádej uživatele o rozhodnutí; běžné implementační detaily řeš konzistentně s dokumentací.
4. Po změně proveď dostupné automatické testy a základní smoke testy. Nikdy netvrď, že test proběhl, pokud nebyl spuštěn.
5. Výsledek oznam stručně: změněné soubory, commit (pokud existuje), PASS/FAIL/NOT RUN a případné otevřené body.
6. ChatGPT s GitHub konektorem může přímo měnit soubory v repozitáři, ale nemusí mít možnost lokálně spouštět aplikaci. Lokální Codex CLI může navíc spouštět procesy a testy v uživatelově prostředí. Nepředstírej dostupnost nástrojů.

## Úložiště

- GitHub: zdrojové kódy, Markdown, JSON metadata a textové specifikace.
- Google Drive: binární dokumentace projektu ve složce `Context Demo/Dokumentace/Návrh` a případných dalších podsložkách.
- Schválený vizuální návrh: https://drive.google.com/file/d/1FvGysQqN-sKrESdDGvFKG7z_yl88OXBp/view
- PNG vizuálního návrhu je uložen **výhradně na Google Drive**. Necommituj ani nepushuj jeho kopii do GitHubu.

## Průběžný záznam konverzace

- Při aktivní práci na projektu udržuj `HISTORIE.md` jako chronologický záznam dostupných replik uživatele a asistenta. Zapisuj průběžně při úpravách repozitáře.
- Zachovávej přesné formulace, pokud jsou dostupné; nikdy neoznačuj zkrácení nebo rekonstrukci za doslovný přepis. Pokud část dialogu chybí, výslovně to uveď.
- `README.md`, `docs/API.md` a další specifikace jsou syntézou rozhodnutí a zůstávají oddělené od historie.
- Žádné automatické zapisování na pozadí mimo aktivní práci nebo bez dostupného připojení není zajištěno.

## Aktuální fáze

Schváleny datový model, REST API, architektura a funkční požadavky UI. Schéma metadat gridů v1 je schváleno, včetně klientského a serverového stránkování; metadata formulářů a další části rendereru zůstávají otevřené. Implementaci rendereru zatím nezačínej. Nezaváděj multiagentní infrastrukturu.
