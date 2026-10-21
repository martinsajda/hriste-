# Entity / EntityCollection — model-driven kontrakt

**Rozhodnutí 21. 10. 2026:** metadata datového modelu, entity a atributů jsou oddělena od runtime hodnot. Data jsou obrazem metadat; grid a budoucí formulář sdílejí stejné typové definice. Tento návrh **zatím není zaveden do REST API**.

## Vrstvy a životní cyklus

1. Načíst statická **ModelMetadata** a **EntityMetadata** přes HTTP `fetch()` (s cache/verzí).
2. Načíst samostatná **FormMetadata** nebo **GridMetadata** (layout a chování; pro formuláře zatím pouze budoucí návrh).
3. Načíst **Entity** nebo **EntityCollection** z mock/REST data provideru.
4. Renderer pro každé pole spojí `logicalName` atributu s jeho definicí, vybere typ komponenty, label dle LCID, validace a hodnotu. Formulářové metadata mohou určit layout, nikoli změnit základní typ.
5. Při uložení data validuje backend nezávisle na UI.

## ModelMetadata

Registr dostupných entit, vztahů a sdílených option setů. Ukázka: [model.metadata.json](examples/model.metadata.json), komentáře: [model.metadata.jsonc](examples/model.metadata.jsonc). Entity `contact` a `telephone` jsou spojeny vztahem 1:N; `telephone.contactId` ukazuje na kontakt.

## EntityMetadata

Každá entita má `logicalName`, `primaryIdAttribute`, `primaryNameAttribute`, `displayNames` a seznam `attributes`. Každý atribut má `logicalName`, `type`, `labels` a případná pravidla `required`, `readOnly`, `targets` (lookup) či `optionSet` (odkaz do katalogu). Popisky jsou mapy LCID 1029/1033/1031; fallback na centrální defaultLcid 1029.

Příklady: [contact.entity-metadata.json](examples/contact.entity-metadata.json) a [telephone.entity-metadata.json](examples/telephone.entity-metadata.json), s komentovanými protějšky JSONC.

## Podporované základní typy

| Metadata `type` | Runtime JSON | Význam |
| --- | --- | --- |
| `string` | string / null | Text |
| `integer` | number (integer) / null | Celé číslo; hranice bezpečného rozsahu JS k rozhodnutí |
| `decimal` | number nebo přesný string / null | Desetinné číslo; přesnost a kanonický formát zatím nerozhodnuty |
| `dateTime` | ISO 8601 string / null | Datum a čas; UTC/timezone behavior otevřeno |
| `guid` | UUID string / null | GUID |
| `boolean` | boolean / null | Logická hodnota |
| `optionSet` | invariantní string/integer kód / null | Popisky a volby z metadat |
| `lookup` | EntityReference objekt / null | Reference na záznam jiné entity |

Další kandidáti: `dateOnly`, `money`, `bigInteger`, `multiOptionSet`, `state`, `status`, `file`, `image`. Neschvalovat jejich reprezentaci bez rozhodnutí.

## Entity a EntityCollection

Ukázka runtime záznamu kontaktu:

```json
{
  "logicalName": "contact",
  "id": "3a8cf720-fc91-4db8-9d8d-7f2bde49bd18",
  "attributes": {
    "id": "3a8cf720-fc91-4db8-9d8d-7f2bde49bd18",
    "firstName": "Jana",
    "lastName": "Nováková",
    "address": "Brno",
    "description": null
  }
}
```

Kolekce vrací `entityName`, `entities[]` a `paging` s `page`, `pageSize`, `totalItems`, `totalPages`, `moreRecords`. Ukázky: [contacts.entity-collection.json](examples/contacts.entity-collection.json) a [telephones.entity-collection.json](examples/telephones.entity-collection.json).

**Důležité:** Typ hodnoty se neuvádí u každého atributu zvlášť; renderer jej čte z EntityMetadata. To platí pro grid i formulář.

## Lookup = EntityReference

```json
{
  "logicalName": "contact",
  "id": "3a8cf720-fc91-4db8-9d8d-7f2bde49bd18",
  "name": "Jana Nováková"
}
```

`logicalName` je logický název cílové entity, `id` je **GUID konkrétního cílového záznamu**, `name` je pomocný zobrazovaný text. Metadata lookup atributu obsahují `targets` se seznamem povolených entit. Z toho může grid či formulář později vytvořit klikací navigaci.

## Option set a lokalizace

Runtime hodnota telefonu `type: "mobile"` je invariantní kód. Její popisek (Mobil / Mobile / Mobil) se získá z `model.metadata.json` → `optionSets.telephoneType.options` podle aktuálního LCID. Formulář může z těchto metadat sestavit dropdown, grid zobrazí lokalizovaný text. Případná změna na integer kódy D365 zůstává otevřená.

## Atributy z jiných entit

REST API může do výsledné sady doplnit hodnoty z navázaných entit. Renderer nesmí sestavovat JOIN ani znát SQL/FetchXML. Reprezentace aliased values (flat/nested/typed source) **zatím není schválena** a je předmětem DD05 a GRID_TODO G01/G02. Navigace lookupu se navrhne po rozhodnutí o struktuře.

## Validace a kompatibilita

- JSON Schema Draft 2020-12 v [schemas](schemas/) kontroluje základní tvar tří dokumentů. Je to **návrhové schéma**, nikoli úplný důkaz správnosti.
- Sémantická validace musí navíc zkontrolovat atributy proti EntityMetadata, unikátní logicalName, existenci option setů/lookup targets, GUID, hodnoty option setů, LCID fallback a konzistenci ID.
- Stávající `docs/API.md` vrací jednoduché objekty, ne EntityCollection. Přechod vyžaduje výslovné rozhodnutí, ne tichou změnu.
- Metadata i data přes HTTP/HTTPS; žádné `file://`. Dva datové režimy `mock` a `rest`, stejný kontrakt na vstupu rendereru.
- Metadata mohou být cacheována; data se aktualizují nezávisle. Backend zůstává autoritou pro práva a integritu.

## Neuzavřené otázky

Viz [README.md](README.md), sekce DD01–DD10. Zejména mapování starého API, decimal/datetime, option set integer vs string, aliasy z relací, null vs absent, primaryNameAttribute a struktura budoucích form metadat.
