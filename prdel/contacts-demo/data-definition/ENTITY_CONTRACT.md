# Entity / EntityCollection — pracovní návrh v1

**Stav:** návrh k revizi; žádný nový endpoint ani JSON Schema zatím není schválen.

## Vzor podle Dynamics 365 SDK

| D365 SDK pojem | Návrh v JSON | Účel |
| --- | --- | --- |
| `EntityCollection` | `entityName`, `entities`, `paging` | Sada záznamů jedné entity |
| `Entity` | `logicalName`, `id`, `attributes` | Jeden záznam a jeho atributy |
| `AttributeCollection` | Mapa `logicalName -> AttributeValue` | Typované hodnoty |
| `EntityReference` | `logicalName`, `id`, `name` | Lookup na jiný záznam |
| `OptionSetValue` | `value` | Stabilní kód volby |
| `EntityMetadata` | `logicalName`, `displayNames`, `attributes` | Definice entity oddělená od záznamů |
| `AttributeMetadata` | `logicalName`, `type`, `displayNames`, ... | Typ a pravidla atributu |

`id` lookupu identifikuje **cílový záznam**. Název entity identifikuje **typ**; neplést s GUID definice entity.

## Příklad datové odpovědi — návrh typovaných hodnot

```json
{
  "entityName": "contact",
  "entities": [
    {
      "logicalName": "contact",
      "id": "3a8cf720-fc91-4db8-9d8d-7f2bde49bd18",
      "attributes": {
        "firstname": {"type": "string", "value": "Jana"},
        "lastname": {"type": "string", "value": "Nováková"},
        "birthdate": {"type": "dateTime", "value": "1990-05-14T00:00:00Z"},
        "isactive": {"type": "boolean", "value": true},
        "rating": {"type": "integer", "value": 4},
        "creditlimit": {"type": "decimal", "value": "12500.50"},
        "category": {"type": "optionSet", "value": 100000001},
        "parentcustomerid": {
          "type": "lookup",
          "value": {
            "logicalName": "account",
            "id": "d03e19b7-75bc-42f0-bbd7-96279e4d3120",
            "name": "ACME s.r.o."
          }
        }
      }
    }
  ],
  "paging": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1,
    "moreRecords": false
  }
}
```

Toto je **ilustrativní** kontrakt, ne existující endpoint `/api/contacts`. `creditlimit` je string, aby přesná desetinná čísla nebyla omezena přesností JavaScript `Number`; k diskusi. `birthdate` je pouze příklad ISO 8601 a vyžaduje upřesnění date-only vs user-local.

## Typy atributů

| Typ | Hodnota | Poznámka |
| --- | --- | --- |
| `string` | JSON string | Text, případně délka/format v metadatech |
| `integer` | JSON integer | Rozsah a 64bit integer dořešit |
| `decimal` | Decimal string nebo number | Rozhodnout přesnost; doporučen string pro přesné finance |
| `dateTime` | ISO 8601 string | UTC a timezone behavior definovat |
| `guid` | UUID string | Kanonický GUID |
| `boolean` | JSON true/false | Null zvlášť |
| `optionSet` | Integer nebo stabilní string | D365 obvykle integer; stávající telefonní enum má string |
| `lookup` | EntityReference objekt | logicalName + GUID záznamu + optional name |

Potenciální rozšíření: `dateOnly`, `money`, `bigInteger`, `multiOptionSet`, `state`, `status`, `file`, `image`, `alias`.

## Metadata entity — lokalizace LCID

```json
{
  "logicalName": "contact",
  "primaryIdAttribute": "contactid",
  "primaryNameAttribute": "fullname",
  "displayNames": {
    "1029": "Kontakt",
    "1033": "Contact",
    "1031": "Kontakt"
  },
  "attributes": {
    "firstname": {
      "type": "string",
      "displayNames": {
        "1029": "Jméno",
        "1033": "First name",
        "1031": "Vorname"
      },
      "required": true
    },
    "parentcustomerid": {
      "type": "lookup",
      "displayNames": {
        "1029": "Zákazník",
        "1033": "Customer",
        "1031": "Kunde"
      },
      "targets": ["account"]
    },
    "category": {
      "type": "optionSet",
      "displayNames": {
        "1029": "Kategorie",
        "1033": "Category",
        "1031": "Kategorie"
      },
      "options": [
        {
          "value": 100000001,
          "labels": {
            "1029": "Klíčový",
            "1033": "Key",
            "1031": "Wichtig"
          }
        }
      ]
    }
  }
}
```

`displayNames` a `labels` jsou mapy LCID; výchozí a podporované LCID jsou centrálně v `app.config.json`. Nezapisovat přeložené názvy místo invariantních hodnot do samotných záznamů.

**Pozor:** Ukázka používá D365-like názvy `contactid`, `firstname`, `fullname`; stávající demo API používá `id`, `firstName` atd. Je nutné rozhodnout, zda jde o novou SDK-like reprezentaci, aliasy nebo změnu stávajícího kontraktu. Ukázka není deklarací skutečných polí existující demo entity.

## Hodnoty z jiných entit

Například grid kontaktů může zobrazovat `account.name` nebo jiné hodnoty souvisejících entit. API musí vrátit požadované hodnoty v jedné výsledné sadě. Uvažované varianty:
- **Flat alias** v `attributes`, např. `account.name` nebo `account_name`, s doplňkovým `source` popisem.
- **Typovaný aliased value** obsahující původní entitu, atribut a hodnotu.
- **Nested objekt** s jednoznačným kontextem vztahu.

Nejdřív definovat datový kontrakt a pravidla pro aliasy, potom lookup proklik a metadata gridu. Renderer **nesestavuje JOIN**; backend má odpovědnost za dotaz a návratovou sadu.

## Zásady pro budoucí implementaci

- Typový kontrakt musí fungovat stejně v `mock` a `rest` režimu.
- Formát odpovědi nemá nutit frontend znát SQLite, SQL Server, FetchXML nebo jiný provider.
- Metadata mohou být samostatný statický JSON, načítaný přes HTTP `fetch`; entity jsou runtime data.
- Při stránkování vracet konzistentní počty a stabilní identitu záznamu.
- Backend určuje oprávnění a vrací pouze dostupné hodnoty; frontend se nesmí spoléhat na pouhé skrytí sloupců.

## Klíčové otázky k rozhodnutí

1. Chceme plné typované obálky `{"type","value"}` pro každý atribut, nebo kompaktní nativní JSON + samostatná metadata?
2. Chceme ponechat jednoduché CRUD API v1 a vytvořit vedle něj SDK-like datový kontrakt, nebo jej nahradit?
3. Chceme napodobit D365 integer OptionSetValue, nebo ponechat i string kódy?
4. Jak mají vypadat aliased values z připojených entit?
5. Jak reprezentovat rozdíl `null`, nevrácený atribut a nenačtený lookup?
6. Jak zajistit stabilní navigaci lookupu a lokalizované názvy bez dalších requestů?
