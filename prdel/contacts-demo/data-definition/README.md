# Data Definition — návrh datového kontraktu inspirovaného D365 SDK

**Stav: pracovní návrh k diskusi (21. 10. 2026), nikoli schválený REST kontrakt.** Odděleno od metadat gridu v `docs/GRID_METADATA.md`. Nic se zatím neimplementuje.

## Cíl

Podobně jako Microsoft Dynamics 365 SDK rozlišit:
1. **EntityCollection** — sadu vrácených záznamů a stránkovací informace.
2. **Entity** — jeden záznam: logický název entity, GUID záznamu a kolekci typovaných atributů.
3. **AttributeValue** — hodnotu atributu, včetně speciálních typů `OptionSetValue` a `EntityReference` (lookup).
4. **EntityMetadata / AttributeMetadata** — popis entity a atributů, včetně lokalizovaných popisků podle LCID. **Metadata nejsou totéž co data záznamu.**

Pozor na rozdíl: lookup `EntityReference.id` je **GUID cílového záznamu**, nikoli GUID definice typu entity. `logicalName` identifikuje cílovou entitu; případný stabilní identifikátor definice entity je samostatná otázka.

## Navrhovaná struktura složky

- `README.md` — principy, rozhodnutí a otevřené otázky.
- `ENTITY_CONTRACT.md` — návrh struktury EntityCollection, Entity, typů atributů, lokalizace a lookupů.
- `examples/` — až po odsouhlasení kontraktu doplníme strojově čitelné ukázky.
- `schemas/` — až po odsouhlasení kontraktu JSON Schema pro entity a kolekce.

## Hranice odpovědnosti

REST API vrací **hotovou výslednou sadu**. Může obsahovat hodnoty z navázaných entit, aliasované atributy a lookup reference; jak backend vztahy získal (SQL JOIN, FetchXML, jiný provider), frontend neřeší. Grid později zpracuje data podle tohoto kontraktu a svých zobrazovacích metadat.

**Kompatibilita:** existující `docs/API.md` nyní vrací jednoduché JSON objekty a pole; návrh EntityCollection je potenciální **nová reprezentace**, nikoli již schválená náhrada. O způsobu migrace, případně samostatném SDK-like endpointu, rozhodneme před změnou API.

**Lokalizace:** centrální `app.config.json` stanoví `defaultLcid=1029` a podporované LCID 1029/1033/1031. Metadata mají lokalizované názvy entity, atributů a možností. Data vracejí invariantní hodnoty; lokalizované popisky se zjišťují podle metadat a LCID. Případný předformátovaný display text je jen pomocná hodnota, nikoli zdroj pravdy.

## Otevřená rozhodnutí

- [ ] DDATA-01: Typované obálky hodnot vs nativní JSON typy + metadata atributů (velikost payloadu a ergonomie JS).
- [ ] DDATA-02: Oddělený katalog EntityMetadata vs vložení definic do každé odpovědi; načítání, cache, verze.
- [ ] DDATA-03: `logicalName`, `id`, `primaryNameAttribute`, `displayName`, případně `entityTypeId` (GUID definice entity).
- [ ] DDATA-04: `EntityReference`: `logicalName`, `id`, `name`, polymorfní lookup, null, navigace.
- [ ] DDATA-05: `OptionSetValue`: stabilní integer jako v D365 vs stávající string enum u telefonu; migrace.
- [ ] DDATA-06: DateTime UTC / date-only / timezone behavior a desetinná čísla bez ztráty přesnosti.
- [ ] DDATA-07: Hodnoty ze souvisejících entit: aliasované atributy, zdrojový logicalName, cesta vztahu, duplicitní názvy.
- [ ] DDATA-08: Kolekce: `totalRecordCount`, `moreRecords`, stránkování, server sort/filter, kompatibilita s API v1.
- [ ] DDATA-09: Prázdný atribut vs explicitní null, chybějící atribut, readonly, validace a oprávnění.
- [ ] DDATA-10: Metadata LCID a fallback; lokalizace názvů entity/atributů/option setů.
- [ ] DDATA-11: Typy money, bigint, multi-select options, owner/customer lookup, state/status, file/image v dalších verzích.
- [ ] DDATA-12: Datový kontrakt pro create/update vs read (SDK-like odpověď nemusí být vhodné POST body).

Další detailní příklady a návrhy jsou v [ENTITY_CONTRACT.md](ENTITY_CONTRACT.md).
