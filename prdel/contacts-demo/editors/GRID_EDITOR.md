# WYSIWYG editor gridů a pohledů

**Stav:** Koncepce, implementace odložena.

Návrh gridů/pohledů nad definovanými entitami: výběr a pořadí sloupců, šířky, formátování podle typů, řazení, filtrování, stránkování, akce, navigace a případné vazby na lookupy/subgridy.

## Klíčové principy
- Grid layout je samostatný JSON dokument, reference na atributy a jejich typy se ověřují vůči entity metadata.
- Živý náhled používá pokud možno stejný Grid Renderer jako runtime.
- Definice zobrazení a mapování konkrétního REST endpointu jsou oddělené; žádné povinné generické RetrieveMultiple API.
- Filtry a řazení v editoru je třeba explicitně mapovat na schopnosti konkrétního endpointu; renderer nesmí předpokládat SQL nebo FetchXML.

## Otevřené otázky
Typy filtrů, serverové vs klientské operace, řazení, stránkování, akce řádků, personalizace a vztah gridu k lookup dialogům.
