# Metadata gridů v1 — schválený kontrakt

**Stav:** schváleno. Tento dokument popisuje metadata a očekávaný REST kontrakt, **nikoli hotovou implementaci rendereru**.

## Principy

- Jeden univerzální grid, dvě strategie načítání dat: `pagination.mode = "client"` a `"server"`.
- JSON definuje datový zdroj, sloupce, nadpisy, výchozí vícesloupcové řazení, stránkování a výběr řádků.
- Vzhled je řízen centrálním CSS; metadata neobsahují inline styly.
- Klientský režim načte celé pole a řadí, filtruje a stránkuje lokálně.
- Serverový režim při změně stránky, velikosti stránky či řazení opakuje GET požadavek. Server provádí řazení, filtrování a stránkování nad celým datasetem **před** odesláním stránky.
- Parametry REST požadavku a cesty v odpovědi jsou mapovatelné v metadatech.
- Jde o základní schéma v1; pokročilé vlastnosti sloupců, formátování, akce a syntaxe obecných filtrů budou předmětem další iterace.

## Referenční JSON — klientský grid kontaktů

```json
{
  "id": "contacts-grid",
  "type": "grid",
  "title": "Moje kontakty",
  "entity": "contact",
  "dataSource": {
    "type": "rest",
    "endpoint": "/api/contacts",
    "method": "GET",
    "response": { "idField": "id" }
  },
  "columns": [
    { "field": "firstName", "header": "Jméno", "dataType": "string", "sortable": true },
    { "field": "lastName", "header": "Příjmení", "dataType": "string", "sortable": true },
    { "field": "address", "header": "Adresa", "dataType": "string", "sortable": true },
    { "field": "description", "header": "Popis", "dataType": "string", "sortable": false }
  ],
  "sorting": {
    "enabled": true,
    "default": [
      { "field": "lastName", "direction": "asc" },
      { "field": "firstName", "direction": "asc" }
    ]
  },
  "pagination": {
    "enabled": true,
    "mode": "client",
    "defaultPageSize": 20,
    "pageSizeOptions": [10, 20, 50, 100],
    "showTotalCount": true
  },
  "selection": { "mode": "multiple", "showCheckboxes": true }
}
```

## Serverový režim — náhrada sekce pagination

Ostatní části gridu zůstávají stejné.

```json
{
  "enabled": true,
  "mode": "server",
  "defaultPageSize": 20,
  "pageSizeOptions": [10, 20, 50, 100],
  "showTotalCount": true,
  "request": {
    "pageParam": "page",
    "pageSizeParam": "pageSize",
    "sortParam": "sort"
  },
  "response": {
    "itemsPath": "items",
    "pagePath": "pagination.page",
    "pageSizePath": "pagination.pageSize",
    "totalItemsPath": "pagination.totalItems",
    "totalPagesPath": "pagination.totalPages"
  }
}
```

## REST kontrakt pro seznamové endpointy

Tento kontrakt rozšiřuje existující `GET /api/contacts` a `GET /api/telephones`, nikoli počet CRUD endpointů.

- Bez `page` a `pageSize`: zachovat dosavadní `200 OK` a JSON pole; `GET /api/telephones?contactId={guid}` stále filtruje podle kontaktu.
- Pro stránkovaný požadavek poslat oba parametry `page` a `pageSize`; odpovědí je objekt `{ "items": [...], "pagination": { "page": 1, "pageSize": 20, "totalItems": 153, "totalPages": 8 } }`.
- `page` je kladné celé číslo od 1; `pageSize` kladné celé číslo maximálně 100. Neplatné parametry vracejí `400 Bad Request`.
- `sort` má syntaxi `field:asc,otherField:desc`, např. `lastName:asc,firstName:asc`. Pole musejí být na serveru výslovně povolená; směry pouze `asc` nebo `desc`. Neplatné řazení vrací `400`.
- Při shodě řadicích hodnot server použije `id` jako poslední stabilizační klíč (pokud již není uveden).
- `totalItems` znamená počet záznamů po aplikaci filtru a před stránkováním; `totalPages` je počet stránek při dané velikosti (u prázdného výsledku 0).
- Serverové stránkování telefonního subgridu kombinuje `contactId` se stránkovacími parametry: `GET /api/telephones?contactId={guid}&page=1&pageSize=20&sort=type:asc`.
- Obecná syntaxe `filter` zatím **není schválena**. Schválen je pouze existující filtr `contactId`.
- V klientském režimu se nepoužívají serverové stránkovací parametry a odpověď zůstává polem.
- Serverový režim musí respektovat výchozí řazení gridu již při prvním načtení; renderer serializuje pole `sorting.default` do parametru `sort`.

## Příklad stránkovaného požadavku a odpovědi

```http
GET /api/contacts?page=2&pageSize=20&sort=lastName:asc,firstName:asc
```

```json
{
  "items": [
    {
      "id": "72ec4e2d-71c6-4e9a-bdc3-83e80a4ac8c0",
      "firstName": "Jan",
      "lastName": "Novák",
      "address": "Brno",
      "description": "Firemní kontakt"
    }
  ],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "totalItems": 153,
    "totalPages": 8
  }
}
```

Ukázka ilustruje tvar odpovědi, nikoli úplný počet položek na druhé stránce.

## Otevřené pro další iteraci

Rozměry a viditelnost sloupců, formátování hodnot, otevírání záznamů, akce a detailní chování výběru řádků. Neimplementovat renderer, dokud nebude schválen související metadatový kontrakt.
