# Contacts Demo — Mac (Node.js + SQLite)

Jednoduchá lokální evidence jména, příjmení a telefonu. Jeden hlavní Codex orchestrátor a čtyři role DB, Backend, Frontend, QA. Projekt je připravený k experimentu; agenti zatím nebyli skutečně spuštěni.

## Spuštění na macOS
Vyžaduje Node.js **22.13+** (doporučeno aktuální LTS) a npm.

```bash
cd prdel/contacts-demo
npm install
npm start
```

Otevři v Safari **http://localhost:3000**. Ukončení: Ctrl+C. SQLite databáze vznikne automaticky v `data/contacts.db`; tento soubor se necommituje.

**Neotevírej `index.html` přes file://** — frontend volá API běžící na stejném lokálním serveru. Server poslouchá jen na `127.0.0.1`, ne na celé síti.

## Funkce
Seznam kontaktů, přidání, smazání s potvrzením. API: GET/POST `/api/contacts`, DELETE `/api/contacts/:id`. Frontend bez bundleru, SQLite přes vestavěný modul `node:sqlite`.

## Agenti
`AGENTS.md` je vstup pro hlavního orchestrátora, `agents/*.md` obsahují pravidla čtyř specializací. Pouhé MD soubory agenty samy nespouštějí. Codex musí mít nakonfigurovanou odpovídající podporu delegování.

## Bezpečnost a stav
Určeno pro lokální vývoj a demonstraci, bez autentizace; nevystavovat veřejně. Nejsou potřeba cloudové databáze ani přístup k osobním účtům. Změny jsou commitnuté, **na Macu ani v Safari jsem je zatím nespustil a neotestoval**.
