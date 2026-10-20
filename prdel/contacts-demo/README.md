# Contacts Demo — multiagentní experiment

Experiment pro Martina: jeden hlavní Codex orchestrátor a čtyři specializovaní pracovníci (DB, backend, frontend, QA). **Toto je projektová kostra a instrukce, nikoliv běžící orchestrátor ani důkaz, že byli podagenti spuštěni.**

## Cíl
Jednoduchá evidence kontaktů: jméno, příjmení, telefon; seznam, přidání a smazání. ASP.NET Core (.NET 10) na IIS, SQL Server, statický HTML/CSS/JS frontend bez dalšího frameworku.

## Struktura
- `AGENTS.md`: pravidla hlavního orchestrátora.
- `agents/`: role a předávací protokoly čtyř pracovníků.
- `docs/`: kontrakt API, postup a architektonická rozhodnutí.
- `src/Contacts.Api/`: ASP.NET Core API a web.
- `database/`: SQL Server DDL.
- `tests/`: ruční smoke test.
- `.gitignore`: výstupy buildu.

## Lokální start
1. Nainstaluj .NET 10 SDK a SQL Server; vytvoř databázi `ContactsDemo` a spusť `database/001_create_contacts.sql`.
2. Nastav `ConnectionStrings__ContactsDb` na SQL Server connection string (nevkládej tajné údaje do Gitu).
3. `cd src/Contacts.Api` a `dotnet run`; otevři adresu oznámenou Kestrelem.
4. Pro IIS nainstaluj odpovídající .NET Hosting Bundle, vytvoř IIS site s app po `dotnet publish -c Release`, application pool nastav na **No Managed Code**, konfiguruj connection string bezpečně na serveru.

## Spuštění práce s orchestrátorem
Otevři Codex v kořeni této složky. Dej mu úkol: „Řiď implementaci podle AGENTS.md, deleguj DB, backend, frontend a QA podle agents/*.md; nejdříve sestav plán, potom proveď integraci a testy.“ Skutečné delegování závisí na dostupných schopnostech a konfiguraci konkrétní instalace Codexu.

## Stav
Ukázková minimální implementace je přiložena, **nebyla zde sestavena, spuštěna ani otestována na IIS**. Všechny změny nejprve ověř na sandbox VM.
