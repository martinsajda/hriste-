# Metadatový a datový model — Dataverse SDK compatibility

**Stav:** SCHVÁLENO (ADR 2026-10-21). **Rozsah:** cílový model-driven kontrakt; neznamená, že je již implementován.  
**Referenční knihovny:** `Microsoft.Xrm.Sdk`, `Microsoft.Xrm.Sdk.Metadata` (Dynamics 365 / Dataverse).  
**Navazující dokumenty:** [ARCHITECTURE.md](ARCHITECTURE.md), [DATOVY_MODEL.md](DATOVY_MODEL.md), [API.md](API.md), [GRID_METADATA.md](GRID_METADATA.md).

## 1. Záměr a závazná pravidla

1. Převzít **sémantiku a typový systém Microsoft SDK 1:1** jako cílový doménový model. Žádné vlastní zjednodušené substituty typů `EntityReference`, `Money`, `OptionSetValue`, `AliasedValue` apod.
2. **Nezaměňovat** objektový model SDK, Dataverse OData Web API a naši JSON serializaci. SDK je sémantický zdroj pravdy; konkrétní JSON wire formát je náš dokumentovaný, verzovaný kontrakt. Názvy vlastností JSON jsou camelCase, logical names lowercase, identifikátory case-sensitive.
3. **Metadata oddělit od dat**: entity/attribute/relationship/option-set metadata se načítají a cachují nezávisle; entity records obsahují pouze hodnoty, identitu a případné formatted values. Grid/form layout metadata jsou další samostatná vrstva.
4. Frontend a renderery neznají backend: `mock/json`, `sqlite`, `dataverse` a později jiné providery musí produkovat shodné kontrakty.
5. Převod **nesmí ztratit** typ, lookup target, alias origin, peněžní přesnost, null/absent rozdíl, paging cookie, total count ani lokalizované labely, jsou-li dostupné.
6. Rozsah SDK je referenční, ale implementace může být inkrementální; nepodporovaný typ musí být explicitně odmítnut či označen, nikoli tiše převeden na string.

## 2. Sémantický slovník SDK

| SDK typ / koncept | Význam a požadavek |
| --- | --- |
| `Entity` | `LogicalName`, `Id`, `Attributes`, `FormattedValues`; volitelně `KeyAttributes`, `RelatedEntities`, `RowVersion` dle použití |
| `EntityCollection` | `Entities`, `EntityName`, `MoreRecords`, `PagingCookie`, `TotalRecordCount`, `TotalRecordCountLimitExceeded`, `MinActiveRowVersion` podle dostupnosti |
| `EntityReference` | `LogicalName`, `Id`, `Name`, případně `KeyAttributes` a `RowVersion`; cílová entita není jen GUID |
| `OptionSetValue` | Objekt s `Value: int`; popisek pochází z metadat/formatted values, nikoliv z hodnoty |
| `OptionSetValueCollection` | Kolekce `OptionSetValue` pro multi-select |
| `Money` | Objekt `Value: decimal`; neměnit na IEEE-754 float |
| `AliasedValue` | `EntityLogicalName`, `AttributeLogicalName`, `Value` (vnořená typovaná hodnota) |
| `BooleanManagedProperty` | Zachovat `Value` a `CanBeChanged` tam, kde se používá v metadatech |
| `EntityMetadata` | Logical/schema/display names, primary ID/name, attributes, keys, ownership, relationships, další SDK vlastnosti podle kontraktu |
| `AttributeMetadata` a potomci | Typ, required level, validity for create/update/read, precision, max length, lookup targets, formátování, labely, další specifika |
| `OptionSetMetadata`, `OptionMetadata` | Globální/lokální výčty, číselné hodnoty, lokalizované popisky, state/status vazby |
| `OneToManyRelationshipMetadata`, `ManyToManyRelationshipMetadata` | Referencing/referenced entity, attribute, schema name, cascade config a vazby |
| `Label`, `LocalizedLabel` | Lokalizované texty podle LCID, včetně fallbacku určeného aplikací |

SDK atributy mohou obsahovat `string`, `bool`, `int`, `long`, `decimal`, `double`, `Guid`, `DateTime`, `byte[]`, výše uvedené objektové typy, případně kolekce a další podporované SDK objekty. Pro datum/čas zachovat DateTimeBehavior a časovou sémantiku metadat; pro GUID používat kanonický UUID string. Přesnost `decimal` a `Money.Value` přenášet jako invariantní desetinný **řetězec** ve wire formátu; v typovaném runtime se mapuje na decimal, nikoliv JS number. Jde o vědomou volbu serializace pro věrnost SDK.

## 3. Typované hodnoty a serializace

**Wire kontrakt v1 (náš, nikoli nativní SDK/OData):** pro každý neprimitivní SDK objekt použít diskriminátor `@type` s názvem SDK typu. Primitivní atributy mohou být přímo JSON string/number/boolean, ale metadata určují jejich přesný SDK typ. V případě potřeby přesného typu (zejména `decimal`, `long`, `DateTime`) je povinný typovaný obal nebo definované mapování podle metadat. Pro identifikátory a `decimal` je nutná bezztrátová reprezentace. Serializace je verzovaná; nerozpoznané `@type` se nesmí tiše ignorovat.

### Příklad Entity s SDK hodnotovými objekty (JSONC — pouze dokumentace)

```jsonc
{
  "logicalName": "account",                  // Entity.LogicalName
  "id": "11111111-1111-4111-8111-111111111111", // Entity.Id (GUID)
  "attributes": {
    "name": "Contoso",                       // string
    "revenue": {
      "@type": "Money",                       // SDK Money
      "value": "1500000.50"                   // decimal, invariant string
    },
    "statecode": {
      "@type": "OptionSetValue",              // SDK OptionSetValue
      "value": 0
    },
    "primarycontactid": {
      "@type": "EntityReference",             // SDK EntityReference
      "logicalName": "contact",
      "id": "22222222-2222-4222-8222-222222222222",
      "name": "Jan Novák"
    },
    "new_tags": {
      "@type": "OptionSetValueCollection",    // multi-select
      "values": [
        { "@type": "OptionSetValue", "value": 100000000 },
        { "@type": "OptionSetValue", "value": 100000001 }
      ]
    },
    "contact.fullname": {
      "@type": "AliasedValue",                // výsledek FetchXML link-entity
      "entityLogicalName": "contact",
      "attributeLogicalName": "fullname",
      "value": "Jan Novák"
    }
  },
  "formattedValues": {
    "revenue": "1 500 000,50 Kč",
    "statecode": "Aktivní"
  }
}
```

`@type` je **náš JSON diskriminátor**, nikoli vlastnost SDK. Názvy `values` a mapování `OptionSetValueCollection` jsou definicí našeho wire kontraktu. `formattedValues` jsou pouze prezentace, nikdy zdroj hodnot pro zápis. Pro `AliasedValue` může být vnořené `value` samo typovaný objekt. Výstupy FetchXML agregací musí respektovat skutečný SDK typ vrácené hodnoty.

### EntityCollection (JSONC)

```jsonc
{
  "entityName": "account",                    // EntityCollection.EntityName
  "entities": [],                             // pole Entity objektů
  "moreRecords": false,                       // MoreRecords
  "pagingCookie": null,                       // PagingCookie
  "totalRecordCount": -1,                     // -1 = nezjištěno dle SDK
  "totalRecordCountLimitExceeded": false
}
```

Pole `entities` obsahuje objekty dle předchozího příkladu; paging cookie je opaque hodnota a nesmí být frontendem parsována ani upravována.

## 4. Metadata entity a atributů (JSONC)

```jsonc
{
  "logicalName": "telephone",                 // EntityMetadata.LogicalName (demo logical name)
  "schemaName": "Telephone",
  "primaryIdAttribute": "telephoneid",
  "primaryNameAttribute": "phonenumber",
  "attributes": [
    {
      "@type": "StringAttributeMetadata",
      "logicalName": "phonenumber",
      "attributeType": "String",
      "maxLength": 100,
      "requiredLevel": { "value": "ApplicationRequired" }
    },
    {
      "@type": "PicklistAttributeMetadata",
      "logicalName": "type",
      "attributeType": "Picklist",
      "optionSet": {
        "@type": "OptionSetMetadata",
        "isGlobal": false,
        "options": [
          { "value": 100000000, "label": { "localizedLabels": [
            { "languageCode": 1029, "label": "Mobil" },
            { "languageCode": 1033, "label": "Mobile" }
          ] } },
          { "value": 100000001, "label": { "localizedLabels": [
            { "languageCode": 1029, "label": "Pevná linka" },
            { "languageCode": 1033, "label": "Landline" }
          ] } }
        ]
      }
    },
    {
      "@type": "LookupAttributeMetadata",
      "logicalName": "contactid",
      "attributeType": "Lookup",
      "targets": ["contact"]
    }
  ]
}
```

Příklad demonstruje **tvar cílového kontraktu**, nikoli kompletní export všech vlastností `EntityMetadata`. Další SDK metadata se doplňují věrně, bez změny významu existujících polí. `requiredLevel` modeluje `AttributeRequiredLevelManagedProperty` (včetně dalších SDK vlastností, pokud jsou přítomny); v ukázce je zkrácený.

**Oddělené dokumenty:** `entity metadata` popisují atributy, typy, lookup targets, option sets, vztahy a validace; `entity data` obsahují instance a hodnoty; `grid/form metadata` popisují rozvržení a interakce. UI renderer si typ sloupce odvozuje primárně z metadat entity, ne z náhodné hodnoty v prvním záznamu.

## 5. Dataverse / FetchXML adapter

```text
Grid / Form / Lookup renderery
       ↓ jednotný JSON model-driven kontrakt
MetadataProvider + DataProvider
       ├─ Demo JSON / SQLite adapter
       └─ Dataverse adapter
            ├─ RetrieveEntity / RetrieveMetadataChanges (metadata)
            └─ FetchXML / RetrieveMultiple (EntityCollection, Entity)
                         ↓
                  SDK → typově věrný JSON serializer
```

- Adapter převádí `EntityCollection` včetně `MoreRecords`, `PagingCookie`, `TotalRecordCount` a `Entities`.
- `Entity.Attributes` je **sparse dictionary**. Chybějící atribut není automaticky `null`. Explicitní `null` při update může znamenat vymazání hodnoty; pro částečný update je nutné zachovat rozdíl `missing` vs `null`.
- `AliasedValue` se zachová i při FetchXML join/aggregate. Klíč v `attributes` může obsahovat alias s tečkou, např. `contact.fullname`.
- Lookup je `EntityReference`, nikoli jen cizí GUID; validuje se cílový `logicalName`.
- Choice hodnoty jsou **int** jako v SDK; UI labely jsou podle LCID z metadat / formatted values. Status/state metadata mají vlastní pravidla.
- Peněžní a desetinné hodnoty se mapují bezztrátově; DateTime behavior (UserLocal / DateOnly / TimeZoneIndependent) se určuje podle metadat, nikoli heuristikou.
- Metadata mohou být cachována a verzována nezávisle na záznamech; invalidace je explicitní.
- Server řeší autorizaci a skutečné oprávnění ke čtení/zápisu; klientská metadata nejsou bezpečnostní hranice.

## 6. Kompatibilita se stávajícím Contacts Demo

Dnešní `DATOVY_MODEL.md` používá SQLite tabulky `Contacts`, `TelephoneNumbers` a textové hodnoty `Type` (`mobile`, `fax` ...); dnešní `API.md` používá plochá DTO (`firstName`, `contactId`). Tyto kontrakty zůstávají **platným popisem dosavadního prototypu**, ale nejsou cílovým SDK modelem. Přechod musí obsahovat explicitní mapování:

- fyzické `Contacts.Id` ↔ logické `contactid`, `TelephoneNumbers.ContactId` ↔ `EntityReference(contact)`;
- textové `Type` ↔ stabilní číselné `OptionSetValue.Value` podle explicitní mapovací tabulky (ne podle pořadí options);
- ploché DTO ↔ `Entity.attributes` (oddělená kompatibilní API vrstva nebo verzování endpointů);
- názvy SQL a staré endpointy se **nemění implicitně**.

Výše uvedené mapování je plánované, nikoli provedená migrace. Konkrétní názvy logických entit a přidělené option-set integer hodnoty pro Contacts Demo musí být finálně schváleny v samostatné migrační specifikaci. Ukázkové hodnoty zde nejsou automaticky databázovou migrací.

## 7. Akceptační kritéria

1. Round-trip `SDK Entity → JSON → SDK Entity` zachová identitu, typy a podporované hodnoty.
2. `Money`, `decimal`, `EntityReference`, `OptionSetValue`, `OptionSetValueCollection` a `AliasedValue` mají samostatné testy včetně vnoření a null/absent.
3. `EntityCollection` zachová stránkování, počty a paging cookie.
4. Metadata rozlišují `Picklist`, `Lookup`, `Money`, `Decimal`, `DateTime`, `State`, `Status`, `MultiSelectPicklist`, `Boolean` a další SDK typy.
5. Stejný grid/form/lookup vykreslí identický logický výsledek nad mock i Dataverse providerem.
6. Validace odhalí neznámé `@type`, chybný lookup target, neexistující option value, kolizi názvů a nepřesný decimal.
7. Formuláře i gridy čerpají typovou informaci z metadat entity; layout metadata nezdvojují typový model.
8. Každá další implementace Node.js, .NET i PHP respektuje stejné verzované JSON kontrakty.

## 8. Otevřené implementační detaily (nejsou změnou rozhodnutí)

Před kódováním dopracovat úplné JSON Schema pro všechny podporované typy, přesné wire mapování DateTime/long/decimal, verzování kontraktu, konkrétní názvy demo entit a migraci dosavadních endpointů. Nezaměňovat schválení architektonického principu s dokončenou specifikací všech SDK vlastností.
