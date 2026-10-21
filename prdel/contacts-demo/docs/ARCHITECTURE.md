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
