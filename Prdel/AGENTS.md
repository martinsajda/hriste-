# AGENTS.md – PowerBuilder → Web

## Účel projektu
Postupná modernizace přibližně 20 let staré dvouvrstvé desktopové aplikace PowerBuilder nad stávající databází Microsoft SQL Server.

## Cíl
Vybudovat ASP.NET Core REST API hostované na IIS pro bezpečný přístup k datům a business operacím. Nad API vytvořit moderní webové uživatelské rozhraní hostované na webovém serveru, s maximálním zachováním původního business chování a pracovní ergonomie.

## Zdroje a migrace
Původní zdrojové PBL knihovny jsou dostupné. UI tvoří převážně DataWindow, společné funkce využívají PFC. Preferovat export a analýzu metadat, neutrální JSON model a webový renderer; nevydávat automaticky generované výsledky za ověřenou business logiku.

## Pravidla pro agenty
- Projekt je **v analytické fázi**. Bez výslovného zadání neimplementovat ani neměnit databázi.
- Zachovat business chování 1:1, oddělit UI, API a datový přístup.
- Ověřovat PowerScript, DataWindow, PFC, SQL procedury, transakce a oprávnění.
- Nepředpokládat přesnou verzi PowerBuilderu (odhad 10–12) ani SQL Serveru (odhad 2008).
- Migraci plánovat postupně po agendách, se souběhem starého a nového klienta.
- Dokumentovat rozhodnutí, nejasnosti a rizika.
