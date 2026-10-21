# Architektura Contacts Demo — Windows a macOS

## Cíl

Lokální demonstrační aplikace se statickým frontendem, univerzálním JSON metadata rendererem a REST API. První implementace používá **Node.js >=22.13, Express 5 a SQLite** přes vestavěný `node:sqlite` (`DatabaseSync`). Cílové platformy jsou **Windows 10/11 a macOS**.

## Vrstvy

1. **Frontend:** statické HTML, čistý JavaScript, JSON metadata a **jeden centrální CSS soubor**; bez povinného bundleru. Frontend používá pouze relativní REST API `/api`, nikoli přímý přístup k databázi.
2. **REST backend:** Node.js proces poskytuje statické soubory a API na `127.0.0.1:3000` (port lze nastavit). Aplikační logika a repository/provider jsou oddělené od HTTP handlerů.
3. **Databáze:** lokální soubor `data/contacts.db`, bez samostatného DB serveru a ORM. Pro malou lokální demonstraci lze použít synchronní SQLite přístup. Soubor databáze nepatří do Gitu.

## Závazné kontrakty

- [Datový model](DATOVY_MODEL.md): tabulky `Contacts` a `TelephoneNumbers`, GUID/UUID v4 jako primární klíče, vztah 1:N, kaskádové mazání.
- [REST API](API.md): 10 CRUD endpointů (`/api/contacts`, `/api/telephones`), filtrování telefonů `?contactId={guid}`.
- [README](../README.md): UI, dashboard, formuláře, subgridy, JSON metadata a centrální CSS.
- [AGENTS.md](../AGENTS.md): **jediný univerzální vývojový agent**, žádná multiagentní orchestrace.

## Budoucí portace backendu

| Prostředí | Backend | Databáze | Fáze |
| --- | --- | --- | --- |
| Windows/macOS lokálně | Node.js / Express | SQLite | První implementace |
| Windows Server / IIS | ASP.NET Core / C# | SQLite | Později |
| Apache / PHP hosting | PHP | SQLite | Později |

Portace zachovají REST URL, metody, JSON struktury, GUID, validace a chybové kódy. SQL Server ani MariaDB nejsou součástí v1. Pro veřejné nasazení je nutné doplnit autentizaci, autorizaci, HTTPS a zabezpečení databázového souboru.

## Bezpečnost a provoz

První verze poslouchá pouze na `127.0.0.1`, nemá autentizaci ani šifrování SQLite souboru a používá jen demonstrační data. Bez dalších opatření ji nevystavovat do veřejné sítě.

## Stav implementace

Tento dokument je **závazný popis cílové architektury**, nikoli potvrzení hotové implementace. Datový model a REST API jsou schváleny; finální JSON schéma rendereru ještě čeká na schválení. Existující implementaci je nutné uvést do souladu s těmito kontrakty.

## Rozhodnutí o vývoji rendereru bez databáze (21. 10. 2026)

Frontend běží výhradně přes HTTP/HTTPS; `file://` ani zabalená metadata nejsou podporována. Metadata se vždy načítají přes `fetch()` ze statických JSON souborů. Pro data jsou pouze dva centrálně přepínané režimy: `mock` (statický JSON přes GET a klientský adaptér pro filtrování/stránkování, bez aplikačního backendu a DB) a `rest` (skutečné REST API a databáze). Lokálně stačí jednoduchý statický webserver; stejný frontend musí fungovat pod IIS nebo Apache. Podrobný závazný návrh: [DATA_SOURCE_TESTING.md](DATA_SOURCE_TESTING.md). Implementace je odložena.

## Konvence názvů a case sensitivity (21. 10. 2026)

JSON klíče a technické identifikátory se porovnávají case-sensitive. Neprovádí se automatická změna velikosti písmen.

- Vlastnosti metamodelu a API: camelCase (`entityName`, `primaryKey`, `firstName`).
- Logické názvy entit, atributů, relací a OptionSetů: lowercase, vzor `^[a-z][a-z0-9_]*$` (`contact`, `firstname`, `contact_company`).
- Textové kódy OptionSetů jsou case-sensitive; číselné hodnoty jsou čísla. Zobrazované popisky a uživatelská data nemají omezení velikosti písmen.
- Validátor odmítá chybné názvy a kolize i při porovnání bez ohledu na velikost písmen; hlásí cestu k chybě. Runtime názvy automaticky neopravuje.
- SQL/ERD/UML generátory používají kanonické logické názvy a explicitní mapování.
- Schválené názvy SQL (`Contacts`, `FirstName`, `ContactId`) a REST API (`firstName`, `contactId`) zůstávají zachovány. Například logické `firstname` se explicitně mapuje na SQL `FirstName` a API `firstName`. Toto pravidlo nezpůsobuje migraci ani změnu API.
- JSONC je dokumentační formát; běhová metadata jsou validní JSON.


## ADR-2026-10-21: Dataverse SDK jako referenční metadatový a datový model

**Stav: SCHVÁLENO — závazné architektonické rozhodnutí.**

Pro všechny model-driven komponenty je referenčním doménovým modelem **Microsoft Dynamics 365 / Dataverse SDK**, zejména `Microsoft.Xrm.Sdk` a `Microsoft.Xrm.Sdk.Metadata`. Naše platformově nezávislá JSON reprezentace zachovává typovou informaci, význam, identitu, null/absent sémantiku a vazby objektů SDK; není nutně doslovnou kopií interní .NET serializace ani Dataverse OData Web API. Nezavádíme konkurenční zjednodušený metamodel.

**Motivace:** Portály vyvíjené nad demonstračními JSON/SQLite daty musí být přenositelné na skutečný Dynamics 365/Dataverse. Za stejnými REST/JSON kontrakty lze vyměnit provider za implementaci nad FetchXML a SDK `EntityCollection` / `Entity` bez přepisu grid/form/lookup rendererů.

**Normativní podrobnosti, typová matice, JSONC příklady, mapování a akceptační pravidla:** [METADATA_MODEL.md](METADATA_MODEL.md).

**Důsledky a hranice:** Metadata entity, atributů, relací a option setů jsou oddělena od záznamů. Layout formulářů a gridů je další samostatná vrstva. `EntityReference`, `Money`, `OptionSetValue`, `OptionSetValueCollection`, `AliasedValue` a další SDK hodnotové objekty nesmějí být ztrátově redukovány na primitivní typy. Datové providery odpovídají za mapování fyzických SQLite/SQL/Dataverse typů na jednotný doménový kontrakt.

**Řízení rozporů:** Starší návrhy s textovým option setem `TelephoneNumbers.Type`, plochými CRUD DTO nebo jinou strukturou jsou **legacy kontrakty**, nikoliv definice cílového model-driven kontraktu. Stávající implementace a endpointy se nemění automaticky tímto ADR; před implementací je nutná explicitní migrační specifikace. Předchozí konvence camelCase JSON vlastností a lowercase logických názvů platí, pokud nekolidují s věrností SDK sémantice; originální názvy SDK jsou dokumentovány a jejich JSON mapování je explicitní.


## ADR-2026-10-21: Oddělení model-driven datového modelu od servisních operací

**Stav: SCHVÁLENO — závazné, klíčové architektonické pravidlo.**

**Princip:** Framework standardizuje **význam a strukturu metadat a dat** (sémantika `Microsoft.Xrm.Sdk` a `Microsoft.Xrm.Sdk.Metadata`, vlastní verzovaný JSON wire kontrakt), **nikoli způsob získání, změny nebo uložení dat**. Abstrakce fyzických datových zdrojů a aplikačních operací je základním cílem frameworku. Převzetí SDK typového systému **neznamená** převzetí `IOrganizationService`, generického CRUD API ani Dataverse/OData endpointů.

### Závazné hranice odpovědnosti

1. **Model-driven frontend** (grid, form, lookup) interpretuje typované entity, kolekce, metadata a samostatná layout metadata. Nezná Dataverse SDK servisní metody, SQL, FetchXML ani fyzické tabulky.
2. **REST API je aplikačně a entitně specifické.** Každý backend definuje explicitní kontrakty pro své konkrétní entity a scénáře (např. `/api/contacts`, `/api/orders`). Framework **nevyžaduje a nedefinuje** univerzální endpointy typu `/api/entities/{logicalName}/retrieveMultiple` nebo veřejné rozhraní `create/update/delete/retrieve/retrieveMultiple` po vzoru Dataverse.
3. **Metadata mohou deklarativně popsat volání konkrétních HTTP operací** pro načtení seznamu/záznamu, uložení či jinou akci: URL/route, HTTP metodu, parametry a mapování požadavku/odpovědi. Jde o **konfiguraci integrace UI**, nikoli o obecné Dataverse CRUD rozhraní. Přesný konfigurační kontrakt se dopracuje před implementací; zde uvedený princip není schválením konkrétního JSON Schema.
4. **Backendová aplikační logika a interní providery** rozhodují o implementaci operací: SQL, SQLite, FetchXML, `IOrganizationService.RetrieveMultiple`, `Create`, `Update`, externí REST, agregace a transformace. Framework jejich interní metody, strukturu tříd ani transakční strategii nepředepisuje.
5. **Jedna logická entita nemusí odpovídat jedné tabulce ani jednomu zdroji.** Backend může sestavit typově věrnou `Entity`/`EntityCollection` z více nezávislých systémů; původ atributů je pro renderer transparentní. Identita, metadata a hodnoty výsledné entity musejí respektovat sjednaný datový kontrakt.
6. **Oddělit datový kontrakt od endpointu.** Různá aplikační REST API mohou vracet stejný SDK-inspirovaný JSON tvar; endpoint může také používat explicitně definovanou obálku či transformaci, pokud je integrace s rendererem jednoznačná a typová informace se neztratí.
7. **Nezavádět povinný `IDataProvider` s CRUD metodami jako veřejné rozhraní frameworku.** Případný interní provider/adaptér s těmito metodami je implementační detail konkrétního backendu. Termín „provider“ v dosavadních dokumentech neimplikuje univerzální veřejnou servisní smlouvu.

**Kompatibilita:** Existující konkrétní CRUD endpointy Contacts Demo v [API.md](API.md) mohou zůstat aplikačním REST kontraktem prototypu; nejsou však vzorem ani povinností pro všechny entity či další projekty. Starší diagramy s `DataProvider` nebo „jednotným REST kontraktem“ je nutné vykládat jako jednotnou **sémantiku datového modelu**, nikoli jako povinnou sadu CRUD metod nebo identických URL. Přesný budoucí formát payloadů a migrace legacy DTO jsou samostatné úkoly.

**Odložené téma:** Zápis jedné logické entity do více nezávislých zdrojů a handling částečných selhání je evidován v [ARCHITECTURE_TODO.md](ARCHITECTURE_TODO.md), úkol A01; tímto ADR se neřeší.


## ADR-2026-10-21: JSON jako jediný kanonický formát metadat a model-driven dat

**Stav: SCHVÁLENO — závazné, klíčové architektonické rozhodnutí.**

### Historie a motivace

Původní návrh počítal s metadatovými popisy v XML. Tato úvaha vycházela z historického použití XML v Dynamics CRM a z možnosti přehledného ručního zápisu pojmenovaných elementů a atributů. Po zvážení cílové architektury byl **zvolen výhradně JSON**: framework je určen především pro webové renderery v JavaScriptu, konkrétní business REST API a přenositelné backendy v Node.js, .NET a PHP. Podpora dvou rovnocenných metadatových formátů by zbytečně přidala parsování, mapování, dvojí validaci, testování a riziko rozdílné sémantiky.

**Nejde o tvrzení, že JSON má obecně více vyjadřovacích možností než XML.** XML má například atributy, namespaces a XSD; pro náš objektový model a webový runtime je však JSON přirozenější a provozně jednodušší.

### Závazná pravidla

1. **Jediný kanonický runtime a výměnný formát** metadat model-driven frameworku a jeho standardizovaných typovaných datových kontraktů je **validní JSON**. XML není alternativním formátem těchto kontraktů; neimplementovat paralelní XML definice, XML serializaci metadat ani XML parser jako součást rendererů.
2. **JavaScriptový frontend** načítá JSON pomocí `fetch()` a `Response.json()` (případně `JSON.parse()`) přímo do nativních JS objektů; serializuje přes `JSON.stringify()`. Nepřidávat mezikrok XML → DOM → aplikační objekt.
3. **Backendová nezávislost:** Node.js, ASP.NET Core/.NET (např. `System.Text.Json` nebo Newtonsoft.Json) a PHP používají své JSON serializéry/deserializéry a zachovávají **stejnou dokumentovanou sémantiku a verzovaný wire kontrakt**. Výběr knihovny není součástí veřejného kontraktu.
4. **JSON je serializace, nikoli samotný doménový model.** Sémantika entit, atributů, vazeb a hodnotových typů zůstává založena na `Microsoft.Xrm.Sdk` a `Microsoft.Xrm.Sdk.Metadata`; JSON ji bezztrátově reprezentuje podle [METADATA_MODEL.md](METADATA_MODEL.md). Nesmí dojít ke ztrátě typů `EntityReference`, `Money`, `OptionSetValue`, `AliasedValue` ani přesnosti čísel.
5. **JSONC výhradně pro dokumentaci a příklady:** komentáře lze psát do `jsonc` ukázek; soubory načítané runtime musí být validní JSON bez komentářů a trailing commas. JSONC není druhý běhový formát.
6. **Validace a verzování:** struktury metadat a typovaných dat postupně specifikovat pomocí **JSON Schema**, doplnit sémantickou validaci a testy kompatibility; změny wire kontraktu verzovat. JSON Schema nenahrazuje všechna doménová pravidla SDK.
7. **Oddělené vrstvy:** entity metadata, záznamy (`Entity`/`EntityCollection`), layout formulářů/gridů a konfigurace aplikačních HTTP operací jsou samostatné logické kontrakty; všechny mohou mít JSON reprezentaci, ale nesmějí se slučovat do jednoho monolitického dokumentu jen kvůli formátu.
8. **Externí XML je povolené pouze za integrační hranicí.** Například Dataverse FetchXML, XML odpověď externí služby nebo legacy XML konfigurace může používat interní backend/provider. Ten provede potřebnou transformaci do kanonického JSON modelu. XML se tím nestává veřejným metadatovým kontraktem ani závislostí rendereru.
9. **Editace metadat:** Ruční editace JSON je možná; vývojářské nástroje mohou poskytovat validaci, nápovědu a automatické doplňování podle JSON Schema. Budoucí vizuální editor může upravovat stejné logické objekty a ukládat JSON; nepředpokládá se návrat k XML kvůli pohodlí editace.

### Praktický příklad (runtime JSON)

```json
{
  "logicalName": "contact",
  "primaryIdAttribute": "contactid",
  "attributes": [
    {
      "@type": "StringAttributeMetadata",
      "logicalName": "firstname",
      "attributeType": "String",
      "maxLength": 100
    }
  ]
}
```

```javascript
const response = await fetch("/metadata/contact.json");
if (!response.ok) throw new Error("Metadata request failed");
const metadata = await response.json();
console.log(metadata.logicalName);
```

Příklad ukazuje pouze princip nativního načítání; úplná metadata a jejich validace se řídí [METADATA_MODEL.md](METADATA_MODEL.md) a budoucím JSON Schema.

**Důsledek pro implementaci:** XML parser, XSD ani dvojí reprezentace metadat nejsou požadavkem frameworku. JSON je jednotná serializační hranice mezi metadatovým modelem, renderery a aplikačními REST kontrakty, aniž by tím vzniklo generické CRUD API (viz předchozí ADR).
