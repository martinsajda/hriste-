# Data Definition — model-driven datová architektura

**Schválený princip (21. 10. 2026):** metadata datového modelu a entit jsou oddělena od runtime dat. Formuláře i gridy čtou tentýž katalog metadat. Příklady a JSON Schema v této složce jsou **pracovní kontrakt v1 k další revizi**, nikoli hotové nebo automaticky schválené REST API.

## Tři oddělené vrstvy

1. **Data Model / Entity Metadata** — logické názvy entit, atributy, typy, primární klíče, vztahy, lookup targets, option set hodnoty, validace, lokalizované popisky dle LCID.
2. **Presentation Metadata** — samostatná metadata gridu a v budoucnu formuláře: layout, pořadí, viditelnost, ovládací prvky, akce a události. Nepředefinují základní datový typ atributu.
3. **Entity Data** — konkrétní Entity / EntityCollection: identita záznamu a nativní hodnoty atributů, bez opakování typu u každého pole.

**Renderer** zkombinuje entity metadata + metadata formuláře/gridu + data a podle typu atributu automaticky zvolí ovládací prvek a doplní hodnotu. **Backend** je autoritou pro integritu, oprávnění a validaci.

## Schválené rozhodnutí o reprezentaci hodnot

Běžné atributy mají **nativní JSON hodnoty**: string, integer/number, boolean, ISO datum jako string, GUID jako string, null. **Nepoužívat obálky `{"type":"...","value":...}` u každého atributu.** Typ se určí z EntityMetadata. Speciální `lookup` nese objekt `EntityReference` s `logicalName`, `id` GUID cílového záznamu a volitelným `name`. Option set ukládá invariantní kód; jeho lokalizovaný popisek je v metadatech. Decimal s požadavkem na přesnost, date/time behavior a integer vs string option set jsou stále otevřené detaily.

## Vazba na D365 SDK

- `EntityCollection` obsahuje `entities` a `paging`.
- `Entity` obsahuje `logicalName`, `id` a `attributes`.
- `EntityMetadata` / `AttributeMetadata` jsou oddělené definice.
- `EntityReference` je lookup na **záznam** jiné entity, nikoli GUID typu entity.
- Hodnoty z dalších entit může do výsledné sady sestavit REST API; grid žádné JOINy neprovádí.

## Soubory

| Soubor | Účel |
| --- | --- |
| [ENTITY_CONTRACT.md](ENTITY_CONTRACT.md) | Podrobný návrh, příklady, otevřené otázky |
| [examples/model.metadata.json](examples/model.metadata.json) | Katalog entit, vztah 1:N, sdílený option set |
| [examples/contact.entity-metadata.json](examples/contact.entity-metadata.json) | Metadata kontaktu, LCID názvy a atributy |
| [examples/telephone.entity-metadata.json](examples/telephone.entity-metadata.json) | Metadata telefonu, lookup na kontakt a option set |
| [examples/contacts.entity-collection.json](examples/contacts.entity-collection.json) | Runtime data kontaktů |
| [examples/telephones.entity-collection.json](examples/telephones.entity-collection.json) | Runtime data telefonů a lookup |
| [schemas/model-metadata.schema.json](schemas/model-metadata.schema.json) | JSON Schema katalogu |
| [schemas/entity-metadata.schema.json](schemas/entity-metadata.schema.json) | JSON Schema definice entity |
| [schemas/entity-collection.schema.json](schemas/entity-collection.schema.json) | JSON Schema návratové kolekce |

Ke každému `examples/*.json` existuje stejně pojmenovaný **`.jsonc`** s komentáři pro vývojáře. JSONC je pouze dokumentační varianta, **není** vstupem standardního `JSON.parse`. Schémata jsou Draft 2020-12; kontrolují tvar, nikoli sémantiku mezi soubory.

## Lokalizace

`app.config.json` určuje `defaultLcid: 1029` a `supportedLcids: [1029,1033,1031]`. Definice entit, atributů a option setů nesou mapy LCID popisků. Renderer při chybějícím překladu použije defaultLcid. Runtime hodnoty jsou jazykově invariantní.

## Vztah ke stávajícímu API a databázi

Stávající [docs/DATOVY_MODEL.md](../docs/DATOVY_MODEL.md) a [docs/API.md](../docs/API.md) zůstávají **platné pro původní jednoduchý CRUD v1**. Nová SDK-like `EntityCollection` se zatím nevrací ze stávajících endpointů; nejde o tichou změnu API. Stávající `contactId` je prostý GUID string, zatímco nová SDK-like reprezentace používá `EntityReference` — způsob mapování se musí rozhodnout.

## Otevřené body před programováním

- [ ] DD01 Jak mapovat jednoduché CRUD API v1 na EntityCollection (samostatný endpoint, adaptér, nebo nová verze API).
- [ ] DD02 Definovat typy: decimal přesnost, integer rozsahy, date-only vs dateTime UTC/timezone.
- [ ] DD03 Option set: ponechat string kódy u telefonu nebo migrovat na integer podobně jako D365.
- [ ] DD04 Lookup: povinná `name`? polymorfní reference? null? lookup v POST/PUT?
- [ ] DD05 Aliased values z dalších entit, jejich identita, metadata zdroje a navigace.
- [ ] DD06 Rozlišit explicitní null, nevrácený atribut, readonly a přístupová práva.
- [ ] DD07 Metadata katalog: verzování, cache, invalidace, načítání přes HTTP fetch.
- [ ] DD08 Přesná definice primaryNameAttribute (u kontaktu může být složené jméno).
- [ ] DD09 Přísná sémantická validace typů hodnot proti EntityMetadata; JSON Schema samo nestačí.
- [ ] DD10 Navrhnout metadata formuláře až následně, odděleně od datového kontraktu.
