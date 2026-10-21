# Demo databáze — projektový overview

**Stav k 21. 10. 2026 · Verze 1.0 · Architektonický přehled**

> Tento dokument shrnuje schválenou cílovou architekturu a implementační plán. Neznamená, že popsané komponenty již byly implementovány. Podrobné a závazné kontrakty zůstávají v odkazovaných dokumentech.

## 1. Vize a účel

Cílem není pouze demonstrační portál kontaktů, ale **znovupoužitelná model-driven platforma pro tvorbu webových portálů a aplikací**. Autor pomocí metadat definuje entity, atributy, vztahy, formuláře, gridy a jejich napojení na konkrétní REST operace. Runtime komponenty pak vykreslují uživatelské rozhraní bez opakovaného programování obdobných formulářů a gridů.

Dlouhodobým cílem jsou **WYSIWYG editory**, aby autor nemusel ručně psát JSON. Frontend má být přenositelný mezi lokálním Node.js serverem, IIS/.NET a PHP/Apache při zachování sjednaných kontraktů.

## 2. Oddělení architektonických vrstev

1. **Metadata datového modelu:** entity, atributy, typy, lookupy, vztahy, option sety, validace.
2. **Data:** jednotlivé typované záznamy a kolekce; metadata a data jsou oddělené.
3. **Layout metadata:** samostatné definice formulářů, gridů a komponent.
4. **Konfigurace integrace:** konkrétní aplikační HTTP operace a mapování jejich parametrů a payloadů.
5. **Backend / providery:** business logika, autorizace, transformace a fyzické zdroje.
6. **WYSIWYG editory:** vizuální tvorba a ukládání stejných kanonických metadat.

Renderer nemá znát fyzické tabulky, SQL, FetchXML ani způsob autentizace hostitelské aplikace.

## 3. Referenční model Microsoft Dynamics 365 / Dataverse SDK

Cílový doménový a metadatový model zachovává sémantiku **`Microsoft.Xrm.Sdk`** a **`Microsoft.Xrm.Sdk.Metadata`**, zejména `Entity`, `EntityCollection`, `EntityReference`, `Money`, `OptionSetValue`, `OptionSetValueCollection`, `AliasedValue`, `EntityMetadata`, `AttributeMetadata`, metadata vztahů a lokalizované labely.

- Vlastní **verzovaný JSON wire kontrakt** není totožný s nativní .NET serializací ani Dataverse OData.
- Typované hodnoty se nesmějí ztrátově převádět na stringy nebo čísla. Pro neprimitivní typy používáme diskriminátor `@type`.
- `Money` a `decimal` se ve wire formátu reprezentují invariantním desetinným řetězcem, aby nedošlo ke ztrátě přesnosti.
- Zachováváme rozdíl mezi chybějícím atributem a explicitním `null`, lookup target, formatted values, paging cookie a další významové informace SDK.
- Rozsah SDK lze implementovat postupně, ale nepodporované typy nesmějí být tiše zjednodušeny.

Podrobnosti a JSONC příklady: [METADATA_MODEL.md](docs/METADATA_MODEL.md).

## 4. JSON jako jediný kanonický formát

Původně zvažované XML bylo historicky přirozené pro Dynamics CRM a ruční editaci. **Rozhodli jsme se pro JSON**, protože se v prohlížeči přímo převádí na nativní JS objekty a přirozeně jej zpracují Node.js, .NET i PHP. Podpora XML i JSON by znamenala dvojí parser, validaci, mapování a riziko nejednotné sémantiky.

- **JSON** je jediný runtime a výměnný formát metadat a standardizovaných typovaných dat.
- **JSONC** slouží pouze jako dokumentační formát s komentáři, nikoliv pro runtime.
- **JSON Schema** bude definovat strukturální validaci; doménová pravidla doplní sémantický validátor.
- XML smí existovat pouze **za integrační hranicí**, například FetchXML v Dataverse provideru.
- JSON je **serializace**, nikoliv sám doménový model; jeho sémantika vychází z SDK.

## 5. Konvence názvů a kompatibilita

- JSON klíče: **camelCase**; logické názvy entit, atributů a relací: **lowercase**, regulární výraz `^[a-z][a-z0-9_]*$`.
- Technické identifikátory a JSON klíče jsou **case-sensitive**. Runtime je automaticky nepřejmenovává.
- Mapování na starší SQL názvy a REST DTO je explicitní.
- Existující Contacts Demo (`Contacts`, `TelephoneNumbers`, SQLite, ploché CRUD DTO) představuje **legacy prototyp**, nikoliv cílový SDK model. Přechod vyžaduje samostatnou migrační specifikaci.

## 6. Oddělení datové sémantiky od REST operací

Převzetí typového modelu SDK **neznamená** převzetí `IOrganizationService`, generického CRUD API nebo univerzálních metod `Create`/`Update`/`Delete`/`Retrieve`/`RetrieveMultiple`.

- **Business REST API je konkrétní pro aplikaci a scénář** (např. `/api/contacts`, `/api/orders`).
- Metadata mohou deklarovat URL, metodu, parametry a mapování konkrétní operace, ale nepředepisují univerzální CRUD servisní kontrakt.
- Backend interně rozhoduje, zda použije SQL, SQLite, Dataverse/FetchXML, SDK nebo externí API.
- **Jedna logická entita může být složena z více nezávislých zdrojů**; renderer dostane jediný typově věrný výsledek.
- Řešení částečného selhání zápisů do více zdrojů je odloženo jako **A01**.

## 7. Frontend, mock a přenositelnost

Frontend používá statické HTML, JavaScript a centrální CSS, bez povinného bundleru. Běží pouze přes **HTTP/HTTPS**, nikoliv `file://`. Metadata načítá přes `fetch()`.

Dva centrální režimy dat:

| Režim | Princip |
| --- | --- |
| `mock` | Statický JSON dataset přes HTTP; klientský adaptér simuluje filtrování, řazení a stránkování. |
| `rest` | Skutečné aplikační REST API; renderer zůstává nezávislý na implementaci backendu. |

První lokální demonstrace počítá s Node.js >= 22.13, Express 5 a SQLite; budoucími prostředími jsou IIS/.NET a PHP/Apache. Přenositelnost neznamená automaticky bezpracnou portaci backendu.

## 8. Metadatové API a souborové úložiště

Pro správu definic vznikne **samostatné backendové metadatové API**, odlišné od business datových endpointů. Jeho vyměnitelný storage provider určuje fyzické úložiště.

- **První implementace:** validní JSON soubory ve vyhrazené adresářové struktuře serverové aplikace.
- Výchozí bezpečný návrh: soubory **mimo veřejný document root**, případně se zákazem přímého přístupu.
- Frontend načítá pouze publikovaná metadata přes HTTP; zápis probíhá výhradně přes autorizovaný backend.
- Pozdější databázový provider nesmí vyžadovat změny editorů.
- Před implementací dořešit verzování, validaci referencí, atomický zápis, souběžné úpravy, audit, zálohy a případný draft/publish workflow.

Podrobnosti: [METADATA_API.md](editors/METADATA_API.md).

## 9. WYSIWYG editory

Plánujeme samostatné editory:

| Editor | Náplň |
| --- | --- |
| **Entity editor** | Entity, atributy, typy, vztahy, lookupy, option sety a validace. |
| **Form editor** | Drag & drop polí, sekce, záložky, layout, vlastnosti a živý náhled. |
| **Grid editor** | Sloupce, pořadí, šířky, filtry, řazení, akce a pohledy. |
| **Data-source editor** | Konkrétní REST endpointy, parametry, request/response mapování. |

**Editor a runtime renderer používají stejný kanonický JSON kontrakt.** Pro živý náhled formulářů a gridů se má pokud možno znovu použít skutečný renderer. Dočasný editorový stav (výběr, undo/redo) není publikované metadata.

Rozcestník: [editors/README.md](editors/README.md).

## 10. Autentizace a bezpečnost PowerX

Autentizaci spravuje **hostitelská aplikace**, například PowerX; model-driven framework ji neimplementuje. Backend získává důvěryhodný `CurrentUserId` (GUID portálového uživatele) z **ověřené serverové session**. Frontend může uživatelskou identitu zobrazovat, ale nesmí ji určovat ani podvrhovat jako autoritativní parametr.

Autorizaci a filtrování záznamů vynucuje backend. V úkolu **A02** je odložen podrobný audit přihlášení, session cookies, expirace, rotace, CSRF/XSS a ochrany proti převzetí relace. Neplatná cookie nesmí změnit identitu; odcizená platná cookie může být bezpečnostním rizikem.

Lokální demonstrace není bez dalších opatření určena k veřejnému provozu.

## 11. Implementační harmonogram

**Schválené pořadí: metadata a datová API → jejich důkladné testy → až potom UI renderery → editory.**

| Etapa | Práce | Stav |
| --- | --- | --- |
| **F0** | Analýza, SDK sémantika, JSON kontrakty, schémata a API specifikace | **Probíhá** |
| **F1** | Metadatové REST API, souborový JSON provider, validace | Čeká |
| **F2** | Konkrétní business datová REST API a mock JSON data | Čeká |
| **F3** | Kontraktové, integrační a hraniční testy datové vrstvy | Čeká |
| **F4** | Grid renderer nad stabilními API | Čeká |
| **F5** | Form renderer nad stejnými kontrakty | Čeká |
| **F6** | Integrace UI, subgridy a regrese | Čeká |
| **F7** | WYSIWYG editory a autorské workflow | Čeká |
| **F8** | PowerX, zabezpečení, nasazení a portace | Čeká |

**Povinná brána:** Dokud neprojde **F3**, nezačínat implementaci grid ani form rendererů. Chyby nalezené na datové úrovni opravit v kontraktech a testech, ne maskovat ve frontendu.

Kalendářní termíny zatím nejsou závazné; přibližně 1–2 týdny jsou vyhrazeny na architektonické diskuse a návrh, programování začne až po stabilizaci specifikace.

Podrobný plán: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## 12. Otevřené otázky

1. **A01 — Multi-source write:** idempotence, retry, kompenzace, částečné selhání, konzistence a audit.
2. **A02 — PowerX session:** mechanismus přihlášení, význam a ochrana cookie, session fixation/hijacking, serverová autorizace.
3. Úplná JSON Schema a přesné wire mapování DateTime, long, decimal a dalších SDK typů.
4. Konkrétní metadatové API, názvy dokumentů, verze, publish/draft a souběžné editace.
5. Přesný form/grid layout kontrakt a deklarativní mapování aplikačních REST operací.
6. Migrace legacy Contacts Demo a hranice podporovaných typů první implementace.

Viz [ARCHITECTURE_TODO.md](docs/ARCHITECTURE_TODO.md).

## 13. Pravidla práce na projektu

- **Nejdříve analýza a schválení; neprogramovat automaticky každý nový nápad.**
- Rozlišovat **úvahu**, **schválené ADR**, **otevřené TODO** a **skutečně implementovanou funkci**.
- Rozhodnutí, argumentaci a příklady průběžně verzovat v Markdown dokumentaci na GitHubu.
- Každá implementační fáze má testovatelný výstup a kontrolní milník.
- Změny schválených kontraktů musí aktualizovat dokumentaci, verze a testy.

## 14. Zdroje a návazná dokumentace

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — hlavní architektura a ADR.
- [METADATA_MODEL.md](docs/METADATA_MODEL.md) — SDK datový a metadatový model.
- [DATA_SOURCE_TESTING.md](docs/DATA_SOURCE_TESTING.md) — HTTP a mock/rest režimy.
- [API.md](docs/API.md) a [DATOVY_MODEL.md](docs/DATOVY_MODEL.md) — legacy prototyp.
- [ARCHITECTURE_TODO.md](docs/ARCHITECTURE_TODO.md) — otevřené architektonické otázky.
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — implementační etapy a gates.
- [editors/README.md](editors/README.md) — WYSIWYG editory a samostatné návrhy.

**PDF vydání (21. 10. 2026):** [Google Drive](https://drive.google.com/file/d/1IRKbKgU5_4nWUYrPDTeszXmGnZaTusfh/view?usp=drivesdk).

> Markdown a PDF jsou dvě publikované podoby projektového overview k danému datu. Pro budoucí změny se má aktualizovat Markdown a z něj vytvořit nové PDF vydání.
