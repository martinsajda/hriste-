# Migrace legacy PowerBuilder aplikace – architektonická analýza

**Stav:** analytická fáze, návrh bez implementace  
**Datum:** 20. 10. 2026

## 1. Výchozí stav
- Přibližně 20 let stará desktopová aplikace PowerBuilder (pravděpodobně verze 10–12, ověřit).
- K dispozici jsou původní zdrojové knihovny.
- Dvouvrstvá architektura: klient PowerBuilder → ODBC → Microsoft SQL Server (verze odhadem 2008, ověřit).
- Formuláře seznam/detail využívají převážně standardní DataWindow.
- DataWindow čtou data SQL dotazy nebo uloženými procedurami; mohou generovat INSERT/UPDATE/DELETE.
- PowerBuilder Foundation Classes (PFC) slouží zejména pro dědičnost, menu, oprávnění a společné chování.
- Agendy: objednávky, dodací listy, výrobní/pracovní výkazy a další provozní procesy.

## 2. Cílová architektura
```text
Webový prohlížeč
  └─ statické HTML/CSS/JavaScript (React nebo jiná technologie)
       └─ HTTPS / REST / JSON
            └─ ASP.NET Core Web API na IIS
                 ├─ autentizace a autorizace
                 ├─ business služby a transakce
                 ├─ validační pravidla
                 └─ datový přístup / SQL / uložené procedury
                      └─ stávající SQL Server databáze
```
Frontend se může distribuovat jako statický build bez produkčního Node.js procesu. Volba React versus ASP.NET UI zatím není rozhodnuta.

## 3. Migrační strategie
1. Zachovat **business chování 1:1**, zejména validace, transakce, oprávnění a procesní pravidla.
2. Zachovat ergonomii seznamů, detailů, editace v tabulkách a klávesových postupů, s kompromisy kvůli prohlížeči.
3. Vytvořit API vrstvu nad stejnou databází; neomezovat ji na mechanický CRUD, ale zahrnout doménové akce.
4. Migrovat postupně po agendách; po přechodnou dobu počítat se souběhem desktopového a webového klienta.
5. Před migrací zmapovat závislosti mezi DataWindow, skripty, uloženými procedurami a PFC.

## 4. Reverzní inženýrství
- Exportovat definice PBL objektů do textové podoby pomocí kompatibilních nástrojů/verze PowerBuilderu.
- Analyzovat DataWindow: layout, sloupce, datové typy, edit styly, validace, SQL, update metadata, procedury.
- Vytvořit **neutrální JSON metadata** pro formuláře a gridy, nikoli přímo generovat ručně psaný React pro každé okno.
- Nad metadaty použít renderer, který vytvoří HTML UI a mapuje akce na REST API.
- Separátně analyzovat PowerScript eventy, dědičnost, sdílené funkce, oprávnění a transakce; automatický převod zde není zaručen.
- Z SQL a update metadat generovat pouze **návrhy** endpointů a DTO; ověřovat proti skutečnému chování.

## 5. Rizika a otevřené otázky
- Skutečná verze PowerBuilderu a SQL Serveru, kompatibilita exportních nástrojů.
- Chování uložených procedur, triggerů, transakční hranice a concurrency.
- Business logika skrytá v PowerScriptu, DataWindow expressions a PFC předcích.
- Zachování bezpečnosti, oprávnění a auditování.
- Klávesové zkratky rezervované prohlížečem.
- Společná databáze během postupného přechodu, změny schématu a zpětná kompatibilita.
- Výkon webového gridu, filtrování, stránkování, zamykání záznamů a práce s tiskovými sestavami.
- Podpora a bezpečnost historické verze SQL Serveru.

## 6. Další analytický postup (zatím neschválená implementace)
Inventarizace PBL, DataWindow, PFC dědičnosti, skriptů a SQL vazeb. Poté vybrat reprezentativní seznam a detail pro ověření exportu → JSON → renderer → návrh API. Projekt je stále ve fázi analýzy; žádný migrační kód zatím nevznikl.
