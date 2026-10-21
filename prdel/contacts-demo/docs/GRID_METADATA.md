# Metadata gridů v1 — schválený kontrakt

**Stav:** schváleno. Tento dokument popisuje metadata a očekávaný REST kontrakt, **nikoli hotovou implementaci rendereru**.

## Principy

- Jeden univerzální grid, dvě strategie načítání dat: `pagination.mode = "client"` a `"server"`.
- JSON definuje datový zdroj, sloupce, nadpisy, výchozí vícesloupcové řazení, stránkování, výběr řádků, viditelnost a šířky sloupců, otevírání záznamů a filtrování jednotlivých sloupců operátorem `contains`.
- Vzhled je řízen centrálním CSS; metadata neobsahují inline styly.
- Klientský režim načte celé pole a řadí, filtruje a stránkuje lokálně.
- Serverový režim při změně stránky, velikosti stránky či řazení opakuje GET požadavek. Server provádí řazení, filtrování a stránkování nad celým datasetem **před** odesláním stránky.
- Parametry REST požadavku a cesty v odpovědi jsou mapovatelné v metadatech.
- Jde o základní schéma v1; pokročilé vlastnosti sloupců, formátování, akce a jiné typy filtrů budou předmětem další iterace.

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
    { "field": "firstName", "header": "Jméno", "dataType": "string", "sortable": true, "filterable": true, "visible": true, "width": 160, "minWidth": 100 },
    { "field": "lastName", "header": "Příjmení", "dataType": "string", "sortable": true, "filterable": true, "visible": true, "width": 190, "minWidth": 100 },
    { "field": "address", "header": "Adresa", "dataType": "string", "sortable": true, "filterable": true, "visible": true, "width": 240, "minWidth": 100 },
    { "field": "description", "header": "Popis", "dataType": "string", "sortable": false, "filterable": true, "visible": false, "width": 300, "minWidth": 100 }
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
  "filtering": {
    "enabled": true,
    "display": "columnHeader",
    "defaultOperator": "contains",
    "caseSensitive": false,
    "combine": "and"
  },
  "selection": { "mode": "multiple", "showCheckboxes": true },
  "recordOpening": {
    "enabled": true,
    "trigger": "column",
    "field": "lastName",
    "target": { "type": "form", "entity": "contact", "form": "detail" }
  }
}
```

## Viditelnost, šířky a otevření záznamu

- `columns[].visible` určuje počáteční viditelnost sloupce. `false` sloupec skryje, ale nemaže datové pole ani jeho hodnotu z REST odpovědi. Výchozí hodnota při vynechání je `true`.
- `columns[].width` je kladné číslo udávající preferovanou šířku v CSS pixelech nebo řetězec `"auto"`. `minWidth` a volitelné `maxWidth` jsou kladná čísla v CSS pixelech. Výchozí `width` je `"auto"`. Při `minWidth > maxWidth` jsou metadata neplatná. Rozměry jsou strukturální metadata; vlastní vykreslení, přetečení a responzivita zůstávají v centrálním CSS.
- `recordOpening.enabled` povoluje otevření detailu. `trigger` může být `"column"` nebo `"row"`. U `"column"` je povinné `field`, které musí odpovídat viditelnému sloupci; pouze jeho hodnota se chová jako odkaz. U `"row"` se kliknutím na běžnou část řádku otevře záznam a `field` se neuvádí.
- `recordOpening.target` odkazuje na definici formuláře pomocí `type: "form"`, `entity` a `form`; žádná URL formuláře není natvrdo zakódovaná. ID záznamu se přenese podle `dataSource.response.idField`.
- Kliknutí na checkbox, tlačítko akce nebo ovládací prvek filtru nesmí spustit otevření záznamu ani při `trigger: "row"`. Otevření musí být dostupné i z klávesnice.
- Pro referenční grid kontaktů je otevření nastaveno na sloupec `lastName`, formulář `contact/detail`; sloupec `description` je výchozím nastavením skrytý.

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
    "sortParam": "sort",
    "filterParamPrefix": "filter"
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
- Schválené sloupcové filtry používají opakované query parametry `filter[field]=text` (v URL procentově kódované). Každý parametr znamená `contains` nad daným textovým polem, bez rozlišení velikosti písmen. Více různých polí se kombinuje pomocí AND. Prázdný nebo pouze mezerový text se ignoruje; hodnoty se před porovnáním oříznou o krajní mezery. Null hodnota neodpovídá neprázdnému filtru. Server povolí pouze známá filtrovatelná pole, jinak vrací HTTP 400. Duplicitní filtr stejného pole je neplatný (400).
- Klientský i serverový režim aplikují stejné filtry nad celou množinou dat **před** stránkováním; při změně filtru se aktuální stránka resetuje na 1. Počet `totalItems` již zohledňuje filtr. Řazení probíhá po filtrování a před stránkováním.
- Filtr `contactId` telefonního subgridu je samostatný přesný vztahový filtr a kombinuje se s fulltextovými sloupcovými filtry pomocí AND. Jiné operátory a obecná syntaxe výrazů zatím nejsou součástí v1.
- V klientském režimu se nepoužívají serverové stránkovací parametry a odpověď zůstává polem.
- Serverový režim musí respektovat výchozí řazení gridu již při prvním načtení; renderer serializuje pole `sorting.default` do parametru `sort`.

## Fulltextové filtry sloupců — metadata a REST

- Sloupec s `filterable: true` má textový vstup v záhlaví (`filtering.display: "columnHeader"`); s `false` nemá filtr.
- `filtering.defaultOperator: "contains"` znamená hledání podřetězce kdekoliv v hodnotě, nikoliv jen na začátku. `caseSensitive: false` vypíná rozlišení velikosti písmen. Pro české texty musí klient i server použít ekvivalentní Unicode porovnávání bez ohledu na velikost písmen; odstranění diakritiky **není** součástí kontraktu.
- `filtering.combine: "and"` vyžaduje splnění všech neprázdných sloupcových filtrů.
- Příklad serverového požadavku (hranaté závorky se při odeslání URL kódují):

```http
GET /api/contacts?page=1&pageSize=20&sort=lastName:asc&filter[firstName]=jan&filter[address]=Brno
```

- API kontrakt v1: `filter[field]=text` pro filtrovatelná textová pole; platí i bez stránkovacích parametrů, kdy API vrací běžné JSON pole.

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

Formátování hodnot, další akce a detailní chování výběru řádků. Neimplementovat renderer, dokud nebude schválen související metadatový kontrakt.
