# Vizuální editory — architektonický plán

**Stav:** Schválený směr, návrh detailů otevřený; implementace odložena.

## Cíl
Vytvořit WYSIWYG návrhářské nástroje pro model-driven platformu. Autor aplikace nemusí ručně psát JSON. Všechny editory pracují nad **stejnými kanonickými, verzovanými JSON kontrakty** jako runtime renderer; JSONC slouží jen pro komentované ukázky v dokumentaci. XML se jako paralelní formát nezavádí.

## Samostatné oblasti
- [ENTITY_EDITOR.md](ENTITY_EDITOR.md) — entity, atributy, vztahy, option sety, validace.
- [FORM_EDITOR.md](FORM_EDITOR.md) — formuláře, záložky, sekce, rozložení, komponenty.
- [GRID_EDITOR.md](GRID_EDITOR.md) — gridy/pohledy, sloupce, řazení, filtry a akce.
- [DATA_SOURCE_EDITOR.md](DATA_SOURCE_EDITOR.md) — aplikační REST operace, endpointy a mapování kontraktů.
- [METADATA_API.md](METADATA_API.md) — metadatové API, storage provider a souborové úložiště.

## Sdílené principy
1. Editor a renderer sdílejí doménový model i JSON wire kontrakt; editor nesmí zavést druhý proprietární formát metadat. Lokální UI stav editoru (výběr, drag & drop, undo) je oddělený od ukládaných metadat.
2. Vizuální návrh, panel vlastností, průběžná validace, náhled a ukládání jsou společné schopnosti; živý náhled formuláře/gridu má pokud možno používat **skutečný runtime renderer**.
3. Entity metadata, záznamy, layout formulářů/gridů a konfigurace aplikačních HTTP operací jsou **oddělené dokumenty/kontrakty**; editor kontroluje reference mezi nimi.
4. Editor zapisuje přes backendové metadatové API, nikoli přímo do filesystemu prohlížeče. Metadatový provider je vyměnitelný; první varianta ukládá JSON soubory.
5. Verzování, JSON Schema + sémantická validace, konzistence referencí, autorizace změn, atomický zápis, konflikty souběžných editací, zálohy a audit jsou požadavky k návrhu, nikoli hotová implementace.
6. Editory nepředepisují univerzální CRUD API pro business data; konfigurují konkrétní aplikační endpointy dle [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

## Navržené pořadí práce
Nejprve stabilizovat JSON metadata kontrakty a renderery; poté metadatové API/storage provider a sdílené editorové komponenty; následně editor entit, formulářů, gridů a integrací. Přesné pořadí, UI knihovna a JSON Schema dosud nejsou schváleny.
