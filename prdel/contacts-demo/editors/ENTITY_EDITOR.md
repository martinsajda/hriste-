# Editor entit a metadat

**Stav:** Koncepce, implementace odložena.

Vizuální správa definic logických entit v sémantice `Microsoft.Xrm.Sdk.Metadata`: názvy, primární ID, atributy a jejich typy, požadovanost, délky/přesnost, lookupy a vztahy, option sety, lokalizované popisky a pravidla validace. Výsledkem jsou verzovaná kanonická JSON metadata, nikoli XML ani databázová DDL.

## Návrh UI
Seznam entit → detail entity → seznam atributů/vztahů → panel vlastností. Formuláře pro typované vlastnosti, výběr cílových entit, správu option setů, vyhledávání a kontrolu závislostí.

## Invarianty
- Věrnost schválenému SDK-inspirovanému metamodelu; nezužovat typy kvůli editoru.
- Respektovat lowercase logical names, camelCase JSON a case sensitivity.
- Při změně/mazání atributu ověřovat odkazy z formulářů, gridů a integrací.
- Metadata a business záznamy zůstávají oddělené; změna definice entity automaticky nemigruje fyzické úložiště dat.

## Otevřené otázky
Správa verzí, editace globálních/lokálních option setů, změny schématu, bezpečné refaktoringy, lokalizace a validace vztahů.
