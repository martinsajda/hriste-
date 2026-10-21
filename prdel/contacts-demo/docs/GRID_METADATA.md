# Metadata gridů — kontrakt v1 a schválené rozšíření v2

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
  "entity": "contact",
  "dataSource": {
    "type": "rest",
    "endpoint": "/api/contacts",
    "method": "GET",
    "response": {
      "idField": "id"
    }
  },
  "columns": [
    {
      "field": "firstName",
      "dataType": "string",
      "sortable": true,
      "filterable": true,
      "visible": true,
      "width": 160,
      "minWidth": 100,
      "resizable": true,
      "labels": {
        "1029": "Jméno",
        "1031": "Vorname",
        "1033": "First name"
      }
    },
    {
      "field": "lastName",
      "dataType": "string",
      "sortable": true,
      "filterable": true,
      "visible": true,
      "width": 190,
      "minWidth": 100,
      "resizable": true,
      "labels": {
        "1029": "Příjmení",
        "1031": "Nachname",
        "1033": "Last name"
      }
    },
    {
      "field": "address",
      "dataType": "string",
      "sortable": true,
      "filterable": true,
      "visible": true,
      "width": 240,
      "minWidth": 100,
      "resizable": true,
      "labels": {
        "1029": "Adresa",
        "1031": "Adresse",
        "1033": "Address"
      }
    },
    {
      "field": "description",
      "dataType": "string",
      "sortable": false,
      "filterable": true,
      "visible": false,
      "width": 300,
      "minWidth": 100,
      "resizable": true,
      "labels": {
        "1029": "Popis",
        "1031": "Beschreibung",
        "1033": "Description"
      }
    }
  ],
  "sorting": {
    "enabled": true,
    "default": [
      {
        "field": "lastName",
        "direction": "asc"
      },
      {
        "field": "firstName",
        "direction": "asc"
      }
    ]
  },
  "pagination": {
    "enabled": true,
    "mode": "client",
    "defaultPageSize": 20,
    "pageSizeOptions": [
      10,
      20,
      50,
      100
    ],
    "showTotalCount": true
  },
  "filtering": {
    "enabled": true,
    "display": "columnHeader",
    "defaultOperator": "contains",
    "caseSensitive": false,
    "combine": "and"
  },
  "selection": {
    "mode": "multiple",
    "showCheckboxes": true
  },
  "recordOpening": {
    "enabled": true,
    "trigger": "column",
    "field": "lastName",
    "target": {
      "type": "form",
      "entity": "contact",
      "form": "detail"
    }
  },
  "localization": {
    "labels": {
      "1029": {
        "title": "Moje kontakty",
        "rowsPerPage": "Řádků na stránku",
        "totalItems": "Celkem záznamů",
        "selectedItems": "Vybráno",
        "page": "Stránka",
        "of": "z",
        "noRecords": "Žádné záznamy",
        "noResults": "Žádné odpovídající záznamy",
        "filterPlaceholder": "Filtrovat…",
        "nextPage": "Další stránka",
        "previousPage": "Předchozí stránka"
      },
      "1031": {
        "title": "Meine Kontakte",
        "rowsPerPage": "Zeilen pro Seite",
        "totalItems": "Datensätze insgesamt",
        "selectedItems": "Ausgewählt",
        "page": "Seite",
        "of": "von",
        "noRecords": "Keine Datensätze",
        "noResults": "Keine passenden Datensätze",
        "filterPlaceholder": "Filtern…",
        "nextPage": "Nächste Seite",
        "previousPage": "Vorherige Seite"
      },
      "1033": {
        "title": "My Contacts",
        "rowsPerPage": "Rows per page",
        "totalItems": "Total records",
        "selectedItems": "Selected",
        "page": "Page",
        "of": "of",
        "noRecords": "No records",
        "noResults": "No matching records",
        "filterPlaceholder": "Filter…",
        "nextPage": "Next page",
        "previousPage": "Previous page"
      }
    }
  }
}
```

## Lokalizace všech popisků pomocí LCID

- Výchozí LCID a seznam podporovaných LCID jsou definovány **pouze centrálně** v kořenovém `app.config.json` (`localization.defaultLcid`, `localization.supportedLcids`), nikoli v metadatech jednotlivých gridů nebo formulářů. LCID je číselný Windows/Microsoft identifikátor, nikoli přímo ISO kód; například `1029` = cs-CZ, `1033` = en-US, `1031` = de-DE, `1051` = sk-SK.
- `localization.labels` obsahuje lokalizované texty gridu: titulek, ovládání stránkování, počty záznamů, stav výběru, prázdné výsledky, navigační tlačítka a placeholder filtrů. `columns[].labels` obsahuje překlady nadpisu konkrétního sloupce. Všechna lokalizovaná pole používají stejný vzor mapy `{ "1029": "...", "1033": "..." }` (LCID je klíč JSON objektu, tedy řetězec).
- Aktuální LCID poskytne aplikační kontext uživatele, nikoli jednotlivý grid. Pokud pro daný text chybí překlad v aktuálním LCID, použije se překlad `app.config.json.localization.defaultLcid`; pokud chybí i ten, jde o neplatnou definici metadat. Pro každý lokalizovaný text je tedy výchozí jazyk povinný. Aktuální LCID uživatele musí být jedním z `supportedLcids`; pokud není, použije se centrální `defaultLcid`.
- Technické názvy polí, ID, REST parametry, enumy a datové hodnoty se **nepřekládají**. Stejný mechanismus lokalizace se později použije pro formuláře a dialogy.
- Popisky patřící rendereru, které nejsou v konkrétním gridu uvedeny, musí být definovány v samostatném sdíleném lokalizačním katalogu; žádný uživatelsky viditelný text se nesmí napevno zapisovat do rendereru. Konkrétní schéma sdíleného katalogu bude navrženo zvlášť.

## Viditelnost, šířky a otevření záznamu

- `columns[].visible` určuje počáteční viditelnost sloupce. `false` sloupec skryje, ale nemaže datové pole ani jeho hodnotu z REST odpovědi. Výchozí hodnota při vynechání je `true`.
- `columns[].resizable` je boolean určující, zda může uživatel měnit šířku sloupce tažením jeho hranice v záhlaví. Výchozí hodnota při vynechání je `false`. Při změně šířky se respektují `minWidth` a `maxWidth`; změna je pouze v aktuálním zobrazení gridu a nemění JSON definici. Trvalé ukládání uživatelských šířek zatím není součástí kontraktu.
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


---

# Metadata gridů v2 — schválené rozšíření kontraktu

**Stav:** schválený návrh metadat; renderer, REST POST vyhledávání, export ani ukládání pohledů zatím nejsou implementovány. Předchozí v1 výše zůstává referencí zpětné kompatibility. V2 je preferovaná specifikace pro novou implementaci.

## Kompletní referenční JSON v2 (grid kontaktů)

```json
{
  "schemaVersion": 2,
  "id": "contacts-grid",
  "type": "grid",
  "entity": "contact",
  "dataSource": {
    "type": "rest",
    "endpoint": "/api/contacts",
    "method": "GET",
    "response": {
      "idField": "id"
    },
    "advancedSearch": {
      "enabled": true,
      "endpoint": "/api/contacts/search",
      "method": "POST",
      "requestMode": "structured",
      "response": {
        "itemsPath": "items",
        "pagePath": "pagination.page",
        "pageSizePath": "pagination.pageSize",
        "totalItemsPath": "pagination.totalItems",
        "totalPagesPath": "pagination.totalPages"
      }
    }
  },
  "columns": [
    {
      "field": "firstName",
      "dataType": "string",
      "labels": {
        "1029": "Jméno",
        "1031": "Vorname",
        "1033": "First name"
      },
      "visible": true,
      "width": 160,
      "minWidth": 100,
      "resizable": true,
      "reorderable": true,
      "hideable": true,
      "pinning": {
        "enabled": true,
        "default": "none"
      },
      "sortable": true,
      "filterable": true,
      "filter": {
        "type": "text",
        "defaultOperator": "contains"
      },
      "format": {
        "align": "left",
        "overflow": "ellipsis",
        "tooltip": true
      }
    },
    {
      "field": "lastName",
      "dataType": "string",
      "labels": {
        "1029": "Příjmení",
        "1031": "Nachname",
        "1033": "Last name"
      },
      "visible": true,
      "width": 190,
      "minWidth": 100,
      "maxWidth": 500,
      "resizable": true,
      "reorderable": true,
      "hideable": true,
      "pinning": {
        "enabled": true,
        "default": "none"
      },
      "sortable": true,
      "filterable": true,
      "filter": {
        "type": "text",
        "defaultOperator": "contains"
      },
      "format": {
        "align": "left",
        "overflow": "ellipsis",
        "tooltip": true
      }
    },
    {
      "field": "address",
      "dataType": "string",
      "labels": {
        "1029": "Adresa",
        "1031": "Adresse",
        "1033": "Address"
      },
      "visible": true,
      "width": 240,
      "minWidth": 100,
      "resizable": true,
      "reorderable": true,
      "hideable": true,
      "pinning": {
        "enabled": true,
        "default": "none"
      },
      "sortable": true,
      "filterable": true,
      "filter": {
        "type": "text",
        "defaultOperator": "contains"
      },
      "format": {
        "align": "left",
        "overflow": "ellipsis",
        "tooltip": true
      }
    },
    {
      "field": "description",
      "dataType": "string",
      "labels": {
        "1029": "Popis",
        "1031": "Beschreibung",
        "1033": "Description"
      },
      "visible": false,
      "width": 300,
      "minWidth": 100,
      "resizable": true,
      "reorderable": true,
      "hideable": true,
      "pinning": {
        "enabled": true,
        "default": "none"
      },
      "sortable": false,
      "filterable": true,
      "filter": {
        "type": "text",
        "defaultOperator": "contains"
      },
      "format": {
        "align": "left",
        "overflow": "ellipsis",
        "tooltip": true
      }
    }
  ],
  "sorting": {
    "enabled": true,
    "default": [
      {
        "field": "lastName",
        "direction": "asc"
      },
      {
        "field": "firstName",
        "direction": "asc"
      }
    ]
  },
  "pagination": {
    "enabled": true,
    "mode": "client",
    "defaultPageSize": 20,
    "pageSizeOptions": [
      10,
      20,
      50,
      100
    ],
    "showTotalCount": true
  },
  "filtering": {
    "enabled": true,
    "display": "columnHeader",
    "combine": "and",
    "defaultOperator": "contains",
    "caseSensitive": false,
    "globalSearch": {
      "enabled": true,
      "fields": [
        "firstName",
        "lastName",
        "address"
      ],
      "operator": "contains",
      "debounceMs": 350,
      "minLength": 2
    },
    "operators": {
      "string": [
        "contains",
        "equals",
        "startsWith",
        "endsWith",
        "isEmpty"
      ],
      "integer": [
        "equals",
        "gt",
        "gte",
        "lt",
        "lte",
        "between",
        "isEmpty"
      ],
      "decimal": [
        "equals",
        "gt",
        "gte",
        "lt",
        "lte",
        "between",
        "isEmpty"
      ],
      "date": [
        "equals",
        "before",
        "after",
        "between",
        "isEmpty"
      ],
      "datetime": [
        "equals",
        "before",
        "after",
        "between",
        "isEmpty"
      ],
      "boolean": [
        "equals",
        "isEmpty"
      ],
      "enum": [
        "in",
        "notIn",
        "isEmpty"
      ]
    }
  },
  "selection": {
    "mode": "multiple",
    "showCheckboxes": true,
    "selectAllScope": "currentPage"
  },
  "recordOpening": {
    "enabled": true,
    "trigger": "column",
    "field": "lastName",
    "target": {
      "type": "form",
      "entity": "contact",
      "form": "detail"
    }
  },
  "actions": [
    {
      "id": "create",
      "handler": "openForm",
      "target": {
        "entity": "contact",
        "form": "detail",
        "mode": "create"
      },
      "labels": {
        "1029": "Nový kontakt",
        "1031": "Neuer Kontakt",
        "1033": "New contact"
      },
      "icon": "plus",
      "selection": "none"
    },
    {
      "id": "open",
      "handler": "openForm",
      "target": {
        "entity": "contact",
        "form": "detail",
        "mode": "edit"
      },
      "labels": {
        "1029": "Otevřít",
        "1031": "Öffnen",
        "1033": "Open"
      },
      "icon": "external-link",
      "selection": "single"
    },
    {
      "id": "delete",
      "handler": "deleteRecords",
      "selection": "oneOrMore",
      "confirmation": {
        "required": true,
        "messageKey": "confirmDelete"
      },
      "labels": {
        "1029": "Odstranit",
        "1031": "Löschen",
        "1033": "Delete"
      },
      "icon": "trash-2"
    },
    {
      "id": "refresh",
      "handler": "refreshGrid",
      "selection": "any",
      "labels": {
        "1029": "Obnovit",
        "1031": "Aktualisieren",
        "1033": "Refresh"
      },
      "icon": "refresh-cw"
    },
    {
      "id": "export",
      "handler": "exportGrid",
      "selection": "any",
      "labels": {
        "1029": "Exportovat",
        "1031": "Exportieren",
        "1033": "Export"
      },
      "icon": "download"
    }
  ],
  "toolbar": {
    "enabled": true,
    "actions": [
      "create",
      "delete",
      "refresh",
      "export"
    ]
  },
  "contextMenu": {
    "enabled": true,
    "actions": [
      "open",
      "delete"
    ]
  },
  "views": {
    "enabled": true,
    "defaultViewId": "default",
    "allowCreate": true,
    "allowRename": true,
    "allowDelete": true,
    "allowSetDefault": true,
    "persistence": {
      "provider": "localStorage",
      "key": "contacts-grid.views",
      "scope": "user"
    },
    "save": {
      "columnOrder": true,
      "columnVisibility": true,
      "columnWidths": true,
      "columnPinning": true,
      "sorting": true,
      "filters": true,
      "pageSize": true
    }
  },
  "export": {
    "enabled": true,
    "formats": [
      "csv",
      "xlsx"
    ],
    "defaultFormat": "xlsx",
    "scopes": [
      "currentPage",
      "filtered",
      "selected"
    ],
    "defaultScope": "filtered",
    "columns": "visible",
    "respectColumnOrder": true,
    "respectSorting": true,
    "useLocalizedHeaders": true,
    "csv": {
      "delimiter": ";",
      "encoding": "utf-8",
      "includeBom": true
    },
    "xlsx": {
      "sheetName": "Contacts",
      "freezeHeader": true,
      "autoFilter": true
    }
  },
  "localization": {
    "labels": {
      "1029": {
        "title": "Moje kontakty",
        "confirmDelete": "Opravdu odstranit vybrané záznamy?"
      },
      "1031": {
        "title": "Meine Kontakte",
        "confirmDelete": "Ausgewählte Datensätze löschen?"
      },
      "1033": {
        "title": "My Contacts",
        "confirmDelete": "Delete the selected records?"
      }
    }
  }
}
```

## 1. Kompatibilita a validace

- `schemaVersion: 2` je povinné pro v2. V1 definice bez verze zůstávají v1; žádná tichá změna jejich významu.
- Základní části v1 (`dataSource`, `columns`, `sorting`, `pagination`, `filtering`, `selection`, `recordOpening`) zůstávají. V2 přidává `actions`, `toolbar`, `contextMenu`, `views`, `export` a další atributy sloupců a filtrů.
- Před vykreslením validovat JSON Schema a sémantické vazby: unikátní `columns[].field` a `actions[].id`, platné odkazy na pole, akce, handler a operátory, rozsahy šířek, vazbu `recordOpening.field` na viditelný sloupec, podporované typy a metody, přítomnost lokalizace pro centrální výchozí LCID.
- Žádný spustitelný JS, SQL ani HTML z metadat; povolené pouze známé hodnoty handlerů, ikon a formátovačů. Validace klienta není náhradou serverových oprávnění a validace vstupů.

## 2. Sloupce a formátování

- Podporované `dataType`: `string`, `integer`, `decimal`, `boolean`, `date`, `datetime`, `enum`, `guid`. Hodnota `field` je stabilní technický identifikátor, nikoli lokalizovaný název.
- `reorderable`: povolí změnu pořadí; `hideable`: uživatelské skrytí; `pinning.enabled` a `pinning.default` (`none|left|right`) povolují připnutí. `visible` zůstává výchozí viditelností. Ukládaný stav je oddělen od definice.
- `format.align`: `left|center|right`; `format.overflow`: `ellipsis|wrap|clip`; `format.tooltip`: boolean. Texty tooltipů musí být bezpečně escapovány. `width`, `minWidth`, `maxWidth`, `resizable` mají význam definovaný ve v1.
- Typově orientovaný formát hodnot: např. `{"dataType":"decimal","format":{"style":"currency","currency":"CZK","decimals":2,"align":"right"}}`. U datumů podporovat `format.style: "date"|"datetime"`; u enumu mapu hodnot na LCID popisky a předdefinovanou vizuální variantu. Formátování používá locale odpovídající aktuálnímu LCID z `app.config.json`; samotná data a enum kódy se nepřekládají.
- `columns[].filter` upřesňuje typ UI filtru a výchozí operátor; `filterable: false` má přednost a filtr deaktivuje. Formátování je pouze prezentace, nikoli transformace uložených dat.

## 3. Globální hledání a typované filtry

- `globalSearch.fields` musí odkazovat na existující povolená textová pole. Globální hledání používá OR mezi uvedenými poli; jeho výsledek se spojuje pomocí AND s jednotlivými sloupcovými podmínkami.
- `debounceMs` je prodleva po psaní před vyhledáním; `minLength` je minimální počet znaků pro aktivaci hledání (prázdný text hledání vypíná).
- Podporované operátory jsou definovány v `filtering.operators`. `between` přijímá dvojici hodnot [od, do] včetně mezí; `in/notIn` přijímají neprázdné pole; `isEmpty` nemá `value`. Ostatní operátory přijímají jednu typově správnou hodnotu. `isEmpty` znamená NULL a u textu také prázdný řetězec. Časové hodnoty přenášet ISO 8601; data `YYYY-MM-DD`.
- Klientské filtrování a serverové filtrování musí poskytovat ekvivalentní výsledky. V1 GET `filter[field]=text` (contains) zůstává podporován.
- Pro strukturované složité dotazy v serverovém režimu v2 použít `POST /api/contacts/search` s JSON tělem. Tento endpoint rozšiřuje API v1, nenahrazuje dosavadní `GET /api/contacts`. Odpověď má stejný `items/pagination` tvar jako stránkovaný GET. `dataSource.advancedSearch` určuje mapování; při jednoduchém filtrování může renderer nadále používat GET.

Příklad strukturovaného POST požadavku:

```http
POST /api/contacts/search
Content-Type: application/json
```

```json
{
  "page": 1,
  "pageSize": 20,
  "sort": [
    {
      "field": "lastName",
      "direction": "asc"
    }
  ],
  "filter": {
    "logic": "and",
    "conditions": [
      {
        "field": "address",
        "operator": "contains",
        "value": "Brno"
      }
    ],
    "globalSearch": {
      "value": "Novák",
      "fields": [
        "firstName",
        "lastName",
        "address"
      ]
    }
  }
}
```

Server musí používat allowlist polí a operátorů, validovat datové typy a rozsahy, vynutit limity stránky a parametrizovat databázové dotazy. Neznámé pole, neplatný operátor či hodnota => HTTP 400. Serverové řazení stabilizovat podle `id`. Pokročilé vnořené skupiny AND/OR lze v budoucnu doplnit verzovaně; ukázkový v2 kontrakt má jednu úroveň `conditions` s `logic`.

## 4. Akce, toolbar a kontextové menu

- `actions[]` je jediný registr akcí. `toolbar.actions` a `contextMenu.actions` obsahují jen existující ID. `handler` je název povoleného handleru rendereru (např. `openForm`, `deleteRecords`, `refreshGrid`, `exportGrid`), nikoli JavaScript.
- `selection` pro akce: `none` = bez výběru, `single` = přesně jeden, `oneOrMore` = alespoň jeden, `any` = bez ohledu na výběr. Kontextové menu nad řádkem poskytne ID daného řádku; `open` tak pracuje s právě cíleným řádkem.
- `confirmation.required` vyžaduje potvrzení před destruktivní operací; `messageKey` odkazuje na lokalizaci gridu nebo sdílený katalog.
- `selection.selectAllScope: "currentPage"` omezuje výběr všech na aktuální stránku. Výběr všech odpovídajících záznamů napříč serverovými stránkami **není** v tomto kontraktu podporován. Hromadné akce dostávají explicitní seznam ID; server musí ověřit oprávnění a limity hromadné operace.
- `export` je deklarovaná akce i samostatná konfigurace exportu; handler `exportGrid` používá `export` blok.

## 5. Uživatelské pohledy a persistence

- Vývojářská definice gridu je neměnná. Aktuální stav uživatele a uložené pohledy se drží mimo metadata.
- `views.persistence.provider: "localStorage"` je schválená první fáze. `scope: "user"` je požadavek na logické oddělení podle identity uživatele; při absenci autentizace je úložiště pouze lokální pro daný prohlížeč a profil, nikoli skutečně oddělené mezi uživateli. Klíč úložiště musí obsahovat `gridId` a případný stabilní identifikátor uživatele; `views.persistence.key` je prefix.
- `defaultViewId: "default"` označuje výchozí systémový pohled odvozený z metadat; nelze jej přejmenovat ani odstranit. Uživatelské pohledy lze zakládat, přejmenovávat, mazat a volit jako výchozí, pokud to konfigurace povolí.
- Ukládat jen vlastnosti povolené `views.save`. Neznámá nebo odstraněná pole při obnově ignorovat a použít výchozí metadata. Pohled musí mít `schemaVersion`, `id`, `gridId`, `name` a stav příslušných vlastností.

Příklad uloženého pohledu (samostatný uživatelský JSON, nikoli část definice gridu):

```json
{
  "schemaVersion": 2,
  "id": "brno-contacts",
  "gridId": "contacts-grid",
  "name": "Kontakty Brno",
  "columns": [
    {
      "field": "lastName",
      "order": 0,
      "visible": true,
      "width": 220,
      "pinned": "left"
    },
    {
      "field": "firstName",
      "order": 1,
      "visible": true,
      "width": 160,
      "pinned": "none"
    }
  ],
  "sorting": [
    {
      "field": "lastName",
      "direction": "asc"
    }
  ],
  "filters": [
    {
      "field": "address",
      "operator": "contains",
      "value": "Brno"
    }
  ],
  "pageSize": 50
}
```

## 6. Export CSV a XLSX

- `scopes`: `currentPage` = zobrazená stránka, `filtered` = všechny záznamy odpovídající aktuálním filtrům a řazení, `selected` = explicitně vybraná ID. `columns: "visible"` znamená jen aktuálně viditelné sloupce v uživatelském pořadí, pokud `respectColumnOrder: true`.
- `useLocalizedHeaders: true` exportuje názvy sloupců podle aktuálního LCID s centrálním fallbackem. CSV používá definovaný oddělovač, UTF-8 a volitelný BOM; XLSX obsahuje záhlaví, zamražení a autofilter podle nastavení.
- Při `pagination.mode: "server"` musí export `filtered` probíhat na serveru nad celým výsledkem, nikoli pouze nad aktuální stránkou. Endpoint a způsob synchronního/asynchronního přenosu se určí při návrhu implementace exportního API; metadata exportu zde neznamenají existenci endpointu.
- Export musí dodržovat serverová oprávnění, maximální objem dat a ochranu proti CSV/XLSX formula injection. Texty začínající `=`, `+`, `-`, `@` a relevantními řídicími znaky nesmějí být interpretovány jako vzorce. Citlivá data neexportovat jen na základě viditelnosti sloupce.

## 7. Lokalizace a sdílené texty

- `defaultLcid` a `supportedLcids` zůstávají **výhradně** v kořenovém `app.config.json`. `columns[].labels`, `actions[].labels` a `localization.labels` obsahují LCID překlady. Pokud aktuální překlad chybí, použít centrální `defaultLcid`.
- Sdílené texty rendereru (stránkování, prázdný výsledek, tlačítka a obecná potvrzení) mají být v samostatném sdíleném katalogu, aby se nemusely opakovat v každém gridu. Starší v1 lokální popisky zůstávají kompatibilní. Konkrétní soubor katalogu a jeho naplnění jsou implementační krok.

## 8. Rozsah mimo v2

Inline editace, seskupování, agregace, virtual scrolling, select-all nad všemi stránkami a serverové sdílení uživatelských pohledů nejsou součástí v2. Zůstanou pro pozdější iterace. Žádný renderer, backend ani databázové schéma se touto dokumentační změnou nemění.
