# Architektura Contacts Demo — Windows a macOS

## Cíl

Lokální demonstrační aplikace se statickým frontendem, univerzálním JSON metadata rendererem a REST API. První implementace používá **Node.js >=22.13, Express 5 a SQLite** přes vestavěný `node:sqlite` (`DatabaseSync`). Cílové platformy jsou **Windows 10/11 a macOS**.

## Vrstvy

1. **Frontend:** statické HTML, čistý JavaScript, JSON metadata a **jeden centrální CSS soubor**; bez povinného bundleru. Frontend používá pouze relativní REST API `/api`, nikoli přímý přístup k databázi.
2. **REST backend:** Node.js proces poskytuje statické soubory a API na `127.0.0.1:3000` (port lze nastavit). Aplikační logika a repository/provider jsou oddělené od HTTP handlerů.
3. **Databáze:** lokální soubor `data/contacts.db`, bez samostatného DB serveru a ORM. Pro malou lokální demonstraci lze použít synchronní SQLite přístup. Soubor databáze nepatří do Gitu.

## Závazné kontrakty

- [Datový model](DATOVY_MODEL.md): tabulky `Contacts` a `TelephoneNumbers`, GUID/UUID v4 jako primární klíče, vztah 1:N, kaskádové mazání.
- [REST API](API.md): 10 CRUD endpointů (`/api/contacts`, `/api/telephones`), filtrování telefonů `?contactId={guid}`.
- [README](../README.md): UI, dashboard, formuláře, subgridy, JSON metadata a centrální CSS.
- [AGENTS.md](../AGENTS.md): **jediný univerzální vývojový agent**, žádná multiagentní orchestrace.

## Budoucí portace backendu

| Prostředí | Backend | Databáze | Fáze |
| --- | --- | --- | --- |
| Windows/macOS lokálně | Node.js / Express | SQLite | První implementace |
| Windows Server / IIS | ASP.NET Core / C# | SQLite | Později |
| Apache / PHP hosting | PHP | SQLite | Později |

Portace zachovají REST URL, metody, JSON struktury, GUID, validace a chybové kódy. SQL Server ani MariaDB nejsou součástí v1. Pro veřejné nasazení je nutné doplnit autentizaci, autorizaci, HTTPS a zabezpečení databázového souboru.

## Bezpečnost a provoz

První verze poslouchá pouze na `127.0.0.1`, nemá autentizaci ani šifrování SQLite souboru a používá jen demonstrační data. Bez dalších opatření ji nevystavovat do veřejné sítě.

## Stav implementace

Tento dokument je **závazný popis cílové architektury**, nikoli potvrzení hotové implementace. Datový model a REST API jsou schváleny; finální JSON schéma rendereru ještě čeká na schválení. Existující implementaci je nutné uvést do souladu s těmito kontrakty.

## Rozhodnutí o vývoji rendereru bez databáze (21. 10. 2026)

Frontend běží výhradně přes HTTP/HTTPS; `file://` ani zabalená metadata nejsou podporována. Metadata se vždy načítají přes `fetch()` ze statických JSON souborů. Pro data jsou pouze dva centrálně přepínané režimy: `mock` (statický JSON přes GET a klientský adaptér pro filtrování/stránkování, bez aplikačního backendu a DB) a `rest` (skutečné REST API a databáze). Lokálně stačí jednoduchý statický webserver; stejný frontend musí fungovat pod IIS nebo Apache. Podrobný závazný návrh: [DATA_SOURCE_TESTING.md](DATA_SOURCE_TESTING.md). Implementace je odložena.

## Konvence názvů a case sensitivity (21. 10. 2026)

JSON klíče a technické identifikátory se porovnávají case-sensitive. Neprovádí se automatická změna velikosti písmen.

- Vlastnosti metamodelu a API: camelCase (`entityName`, `primaryKey`, `firstName`).
- Logické názvy entit, atributů, relací a OptionSetů: lowercase, vzor `^[a-z][a-z0-9_]*$` (`contact`, `firstname`, `contact_company`).
- Textové kódy OptionSetů jsou case-sensitive; číselné hodnoty jsou čísla. Zobrazované popisky a uživatelská data nemají omezení velikosti písmen.
- Validátor odmítá chybné názvy a kolize i při porovnání bez ohledu na velikost písmen; hlásí cestu k chybě. Runtime názvy automaticky neopravuje.
- SQL/ERD/UML generátory používají kanonické logické názvy a explicitní mapování.
- Schválené názvy SQL (`Contacts`, `FirstName`, `ContactId`) a REST API (`firstName`, `contactId`) zůstávají zachovány. Například logické `firstname` se explicitně mapuje na SQL `FirstName` a API `firstName`. Toto pravidlo nezpůsobuje migraci ani změnu API.
- JSONC je dokumentační formát; běhová metadata jsou validní JSON.


## ADR-2026-10-21: Dataverse SDK jako referenční metadatový a datový model

**Stav: SCHVÁLENO — závazné architektonické rozhodnutí.**

Pro všechny model-driven komponenty je referenčním doménovým modelem **Microsoft Dynamics 365 / Dataverse SDK**, zejména `Microsoft.Xrm.Sdk` a `Microsoft.Xrm.Sdk.Metadata`. Naše platformově nezávislá JSON reprezentace zachovává typovou informaci, význam, identitu, null/absent sémantiku a vazby objektů SDK; není nutně doslovnou kopií interní .NET serializace ani Dataverse OData Web API. Nezavádíme konkurenční zjednodušený metamodel.

**Motivace:** Portály vyvíjené nad demonstračními JSON/SQLite daty musí být přenositelné na skutečný Dynamics 365/Dataverse. Za stejnými REST/JSON kontrakty lze vyměnit provider za implementaci nad FetchXML a SDK `EntityCollection` / `Entity` bez přepisu grid/form/lookup rendererů.

**Normativní podrobnosti, typová matice, JSONC příklady, mapování a akceptační pravidla:** [METADATA_MODEL.md](METADATA_MODEL.md).

**Důsledky a hranice:** Metadata entity, atributů, relací a option setů jsou oddělena od záznamů. Layout formulářů a gridů je další samostatná vrstva. `EntityReference`, `Money`, `OptionSetValue`, `OptionSetValueCollection`, `AliasedValue` a další SDK hodnotové objekty nesmějí být ztrátově redukovány na primitivní typy. Datové providery odpovídají za mapování fyzických SQLite/SQL/Dataverse typů na jednotný doménový kontrakt.

**Řízení rozporů:** Starší návrhy s textovým option setem `TelephoneNumbers.Type`, plochými CRUD DTO nebo jinou strukturou jsou **legacy kontrakty**, nikoliv definice cílového model-driven kontraktu. Stávající implementace a endpointy se nemění automaticky tímto ADR; před implementací je nutná explicitní migrační specifikace. Předchozí konvence camelCase JSON vlastností a lowercase logických názvů platí, pokud nekolidují s věrností SDK sémantice; originální názvy SDK jsou dokumentovány a jejich JSON mapování je explicitní.
