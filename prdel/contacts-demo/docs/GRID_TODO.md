# GRID TODO — backlog rozhodnutí

Stav: návrhy k diskusi, nikoli schválené funkce. Datum: 2026-10-21.
Schválený základ: GRID_METADATA.md. Zde evidujeme neuzavřené otázky před implementací rendereru.

## P0 — rozhodnout před rendererem
- [ ] G01 Oddělit identifikátor sloupce, zdroj dat a způsob zobrazení. Podpora nested/flat JSON, aliasů a joined entit.
- [ ] G02 Lookup: ID, zobrazovaný název, cílová entita, navigace, polymorfní lookup.
- [ ] G03 Subgrid: kontext rodičovského záznamu, contactId, nový neuložený rodič, vytvoření souvisejícího záznamu.
- [ ] G04 Pokročilý filter AST: vnořené AND/OR, null/notNull, lookup, enum, relativní datumy. Stejná sémantika v mock a REST.
- [ ] G05 Akce: visibleWhen, enabledWhen, requiredPrivileges, podmínky podle stavu a výběru. Bez eval; práva ověřuje server.
- [ ] G06 Katalog systémových a osobních pohledů: přepínání, kopírování, výchozí nastavení, ochrana systémových.
- [ ] G07 Vyjasnit rozdíl mezi GET API v1 a POST advancedSearch ve v2; definovat endpoint a request/response.
- [ ] G08 Sjednotit typované operátory gridu s REST API v1, které dnes umí pouze contains.
- [ ] G09 Vyjasnit pagination.mode=client současně s advancedSearch POST.
- [ ] G10 Zpřesnit schema formTarget.type: povinnost vs současné ukázky akcí bez type.

## P1 — dokončení kontraktu
- [ ] G11 Datové typy state/status/choice/multiChoice; lookup zvlášť.
- [ ] G12 Datum, UTC, časová zóna, date-only, relativní datumy a export.
- [ ] G13 Null vs prázdný řetězec, chybějící vlastnost, 0 a false.
- [ ] G14 Přístupnost: klávesnice, fokus, ARIA, screen readery.
- [ ] G15 Stavové UI: loading, empty, error, retry, timeout.
- [ ] G16 Refresh, cache, debounce, abort zastaralých requestů, invalidace po CRUD.
- [ ] G17 Pravidla výběru řádků při stránkování, filtrování a změně pohledu.
- [ ] G18 Export currentPage/filtered/selected: rozsah, server vs klient, limity, oprávnění, CSV formula injection.
- [ ] G19 Verze a migrace JSON metadat i uložených uživatelských pohledů.
- [ ] G20 Sémantická validace nad JSON Schema: field/action odkazy, duplicity, typy filtrů, šířky, překlady.
- [ ] G21 Uložení pohledů: localStorage scope=user samo o sobě uživatele neizoluje; klíčování a migrace.
- [ ] G22 Responsive chování: mobil, skryté/připnuté sloupce, horizontální scroll.
- [ ] G23 URL stav: sdílení pohledu, filtrů, řazení, stránky.
- [ ] G24 Sdílený LCID katalog textů rendereru a fallback.
- [ ] G25 Ověřit všechny příklady proti Draft 2020-12 včetně relativních $ref; automatické testy.
- [ ] G26 Pravidla precedence: metadata, systémový pohled, osobní pohled, dočasný stav a URL.
- [ ] G27 Parita mock/rest adapteru; stejné testovací scénáře nad stejnými daty.

## P2 — další iterace
- [ ] G28 Inline editing: editor, validace, save/cancel, souběžné změny.
- [ ] G29 Grouping: skupiny a sbalování, vazba na stránkování.
- [ ] G30 Agregace: COUNT, SUM, AVG, součty nad celým filtrem.
- [ ] G31 Virtual scrolling a výkon pro velké datasety.
- [ ] G32 Pokročilé/asynchronní exporty pro velké datasety.

## Již uzavřená rozhodnutí
- [x] D01 Nepodporovat file://; frontend vždy HTTP/HTTPS.
- [x] D02 Metadata vždy načítat fetch ze statických JSON.
- [x] D03 Datové režimy pouze mock (statický GET a klientský adapter) a rest (skutečné API/DB).
- [x] D04 Jeden renderer a centrální přepínání režimu; bez libovolného JavaScriptu v metadatech.
- [x] D05 Implementaci rendereru/backendu odložit do výslovného zadání.

## Jak backlog používat
Každému bodu ponechat ID. Po rozhodnutí doplnit konkrétní závěr a dotčené soubory; teprve potom změnit schema, metadata a API. Nejprve řešit P0, potom P1. P2 není podmínkou první verze.

Související dokumenty: GRID_METADATA.md, API.md, DATA_SOURCE_TESTING.md, ../schemas/README.md.
