# Contacts Demo — lokální aplikace (Node.js + SQLite)

## Cíl projektu

Cílem projektu je vytvořit jednoduchou lokální webovou aplikaci pro evidenci kontaktů, která bude fungovat na macOS bez cloudové infrastruktury a bez nutnosti instalovat samostatný databázový server.

Aplikace bude postavena na třech vrstvách:

1. **Databáze — SQLite:** Data budou uložena v lokálním databázovém souboru `data/contacts.db`.
2. **Backend — Node.js:** Lokální proces Node.js bude provozovat HTTP server na konfigurovatelném portu (výchozí `3000`). Bude obsahovat databázové providery pro komunikaci se SQLite a poskytovat REST API pro práci s daty.
3. **Frontend — statické HTML, CSS a JavaScript:** Uživatelské rozhraní bude tvořit statická HTML stránka s JavaScriptem. Frontend bude komunikovat s backendem prostřednictvím HTTP požadavků na REST API. Nebude přistupovat k SQLite přímo.

### Architektura

```text
Webový prohlížeč (Safari)
  └── Statické HTML + CSS + JavaScript
        │ HTTP / REST API
        ▼
Lokální Node.js server (127.0.0.1:3000)
  ├── Poskytování statických souborů frontendu
  ├── REST API (/api/contacts)
  └── Databázová vrstva / provideři
        │
        ▼
SQLite (data/contacts.db)
```

Aplikace bude běžet výhradně lokálně. Backend bude obsluhovat jak REST API, tak statické soubory frontendu, takže není nutný samostatný webový server ani frontendový bundler.

## Rozsah demonstrační aplikace

Cílový datový model bude obsahovat dvě tabulky:

- **Contacts** — evidence kontaktů (např. jméno a příjmení).
- **TelephoneNumbers** — telefonní čísla přiřazená ke kontaktům.

Mezi tabulkami bude vztah **1:N**: jeden kontakt může mít více telefonních čísel; každé telefonní číslo náleží právě jednomu kontaktu. Vazba bude realizována cizím klíčem `TelephoneNumbers.ContactId` na `Contacts.Id`.

Každý záznam `TelephoneNumbers` bude obsahovat:
- `Id` — primární klíč,
- `ContactId` — cizí klíč na kontakt,
- `Type` — **option set** (výběr z předdefinovaných typů telefonu): **mobil, pevná linka, fax, pracovní, jiný**,
- `PhoneNumber` — textové pole pro zadání telefonního čísla (aby se zachovalo `+`, úvodní nuly a formátování).

```text
Contacts (1)
  Id
  FirstName
  LastName
    │
    └── (N) TelephoneNumbers
              Id
              ContactId → Contacts.Id
              Type
              PhoneNumber
```

**Uživatelské rozhraní:** Přehled kontaktů a pohodlný editační formulář kontaktu. V detailu kontaktu bude možné přímo zobrazovat, přidávat, upravovat a odebírat libovolný počet telefonních čísel. U každého čísla bude výběrové pole pro typ telefonu a vstupní pole pro samotné číslo. Ovládání má být přehledné a umožňovat editaci kontaktu i jeho telefonních čísel bez zbytečného přecházení mezi stránkami.

Dosavadní demonstrační implementace eviduje jméno, příjmení a jedno telefonní číslo; výše uvedený model a editor představují **požadovaný cílový stav**, nikoli potvrzení, že už jsou implementovány.

Dosavadní REST API:
- `GET /api/contacts` — načtení kontaktů
- `POST /api/contacts` — vytvoření kontaktu
- `DELETE /api/contacts/:id` — odstranění kontaktu

**Plánované rozšíření REST API:** operace pro načítání, přidávání, úpravy a mazání telefonních čísel konkrétního kontaktu (např. `/api/contacts/:contactId/telephone-numbers`), včetně validace typu a čísla. Konkrétní kontrakt API se upřesní při implementaci.

## Spuštění na macOS

Vyžaduje Node.js **22.13+** (doporučeno aktuální LTS) a npm.

```bash
cd prdel/contacts-demo
npm install
npm start
```

Otevři v Safari **http://localhost:3000**. Ukončení: Ctrl+C. SQLite databáze vznikne automaticky v `data/contacts.db`; tento soubor se necommituje.

**Neotevírej `index.html` přes file://** — frontend volá API běžící na stejném lokálním serveru. Server poslouchá jen na `127.0.0.1`, ne na celé síti.

## Agenti

Projekt počítá s jedním hlavním Codex orchestrátorem a čtyřmi rolemi: DB, Backend, Frontend a QA.

`AGENTS.md` je vstup pro hlavního orchestrátora, `agents/*.md` obsahují pravidla čtyř specializací. Pouhé MD soubory agenty samy nespouštějí. Codex musí mít nakonfigurovanou odpovídající podporu delegování.

## Bezpečnost a stav

Určeno pro lokální vývoj a demonstraci, bez autentizace; nevystavovat veřejně. Nejsou potřeba cloudové databáze ani přístup k osobním účtům. Projekt je připravený k experimentu; agenti zatím nebyli skutečně spuštěni. **Na Macu ani v Safari aplikace zatím nebyla spuštěna a otestována.**
