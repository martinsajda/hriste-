# REST API v1 — Contacts Demo

**Stav:** závazný kontrakt v1.  
**První implementace:** Node.js + SQLite.  
**Budoucí implementace:** ASP.NET Core (C#) a PHP, beze změny URL, HTTP metod a JSON kontraktu.

## Základní principy

- REST API je oddělené od databázového provideru a od frontendového rendereru.
- Prefix API: `/api` (konfigurovatelný podle prostředí; frontend nepoužívá pevně zadaný host).
- Formát požadavků a odpovědí: `application/json`.
- Primární klíče `id` a cizí klíč `contactId` jsou UUID v4 / GUID jako řetězce v kanonickém formátu s pomlčkami.
- Backend přiděluje `id` při vytvoření; klient jej při `POST` neposílá.
- Obě entity mají **pět standardních CRUD operací**, celkem **10 endpointů**.
- Struktura polí vychází z [DATOVY_MODEL.md](DATOVY_MODEL.md).

## Kontakty — `Contacts`

| HTTP metoda | Endpoint | Význam |
| --- | --- | --- |
| `GET` | `/api/contacts` | Načtení všech kontaktů |
| `GET` | `/api/contacts/{id}` | Načtení jednoho kontaktu |
| `POST` | `/api/contacts` | Vytvoření kontaktu |
| `PUT` | `/api/contacts/{id}` | Úplná aktualizace kontaktu |
| `DELETE` | `/api/contacts/{id}` | Smazání kontaktu včetně jeho telefonů |

### JSON kontaktu

```json
{
  "id": "72ec4e2d-71c6-4e9a-bdc3-83e80a4ac8c0",
  "firstName": "Jan",
  "lastName": "Novák",
  "address": "Brno",
  "description": "Firemní kontakt"
}
```

Pro `POST` a `PUT` se posílají editovatelná pole `firstName`, `lastName`, `address`, `description` bez `id`; identifikátor při `PUT` určuje URL.

## Telefony — `TelephoneNumbers`

| HTTP metoda | Endpoint | Význam |
| --- | --- | --- |
| `GET` | `/api/telephones` | Načtení všech telefonů, volitelně filtrovaných podle kontaktu |
| `GET` | `/api/telephones/{id}` | Načtení jednoho telefonu |
| `POST` | `/api/telephones` | Vytvoření telefonu |
| `PUT` | `/api/telephones/{id}` | Úplná aktualizace telefonu |
| `DELETE` | `/api/telephones/{id}` | Smazání telefonu |

**Subgrid telefonu v detailu kontaktu:** `GET /api/telephones?contactId={guid}`. Jde o filtr seznamu, nikoliv další CRUD endpoint.

### JSON telefonu

```json
{
  "id": "d9c92b61-fde9-4a90-9682-6bbf96d63e0b",
  "contactId": "72ec4e2d-71c6-4e9a-bdc3-83e80a4ac8c0",
  "type": "mobile",
  "phoneNumber": "+420 777 123 456",
  "description": "Soukromý mobil"
}
```

Pro `POST` se posílá `contactId`, `type`, `phoneNumber`, `description` bez `id`. Pro `PUT` se posílají stejná editovatelná pole; `contactId` je neměnný a případná odlišná hodnota je chyba. Vytvoření telefonu vyžaduje existující kontakt.

Povolené hodnoty `type`: `mobile`, `landline`, `fax`, `work`, `other`.

## Odpovědi a chyby

| Situace | HTTP status | Tělo |
| --- | --- | --- |
| Úspěšný seznam nebo detail | `200 OK` | JSON pole / objekt |
| Úspěšný `POST` | `201 Created` | Nový JSON objekt s GUID, hlavička `Location` |
| Úspěšný `PUT` | `200 OK` | Aktualizovaný JSON objekt |
| Úspěšný `DELETE` | `204 No Content` | Prázdné |
| Neplatné GUID, chybějící povinné pole, chybný option set | `400 Bad Request` | Standardní JSON chyba |
| Neexistující záznam nebo odkazovaný kontakt | `404 Not Found` | Standardní JSON chyba |
| Neočekávaná chyba serveru | `500 Internal Server Error` | Standardní JSON chyba bez interních detailů |

Prázdný seznam vrací `200 OK` a `[]`. Příklad jednotného formátu chyby:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Pole firstName je povinné."
  }
}
```

## Validace a integrita

- `firstName`, `lastName`, `phoneNumber` jsou povinné neprázdné texty; `address` a `description` jsou nepovinné.
- `type` je povinný a musí být jednou z povolených hodnot.
- `phoneNumber` se ukládá jako text, ne jako číslo.
- Všechny backendové implementace musí používat stejná pravidla validace a chybové odpovědi.
- Smazání kontaktu kaskádově smaže všechny jeho telefony (`ON DELETE CASCADE`).
- Identifikátory se nikdy negenerují jako číselné auto-increment hodnoty.
- `PUT` aktualizuje kompletní sadu editovatelných polí, `PATCH` není součástí v1.
- Autentizace, obecné pokročilé filtrování a vyhledávání nejsou součástí minimálního kontraktu v1. **Volitelné stránkování a řazení seznamových GET endpointů je schváleným rozšířením** podle [GRID_METADATA.md](GRID_METADATA.md).

## Volitelné stránkování a řazení seznamů — schválené rozšíření

Seznamové endpointy podporují volitelné parametry `page`, `pageSize` a `sort`. Bez stránkovacích parametrů zůstává odpovědí JSON pole; při společném zadání `page` a `pageSize` je odpovědí objekt s `items` a `pagination` (`page`, `pageSize`, `totalItems`, `totalPages`). Syntaxe `sort` je `field:asc,otherField:desc`; `page` začíná na 1, `pageSize` je nejvýše 100. Neplatné parametry vracejí HTTP 400. Pro telefony zůstává použitelný filtr `contactId`, také společně se stránkováním. Detailní pravidla a JSON příklady jsou závazně popsány v [GRID_METADATA.md](GRID_METADATA.md).

## Implementační nezávislost

| Backend | Databáze | Úloha |
| --- | --- | --- |
| Node.js | SQLite | První implementace |
| ASP.NET Core (C#) | SQLite | Budoucí portace |
| PHP | SQLite | Budoucí portace |

Frontend i JSON metadata používají pouze REST kontrakt; nesmějí znát implementační jazyk backendu.

**Poznámka:** Starší ukázky v README a v existujícím kódu s číselnými ID, polem `phone` přímo na kontaktu nebo vnořenými cestami `/api/contacts/{id}/telephone-numbers` jsou překonané tímto kontraktem. Při implementaci se mají sjednotit podle tohoto dokumentu.
