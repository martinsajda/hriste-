# JSON Schema — metadata gridů v2

- `grid.schema.json`: hlavní formální kontrakt definice gridu; používá `$ref` na `grid-column.schema.json`.
- `grid-column.schema.json`: vlastnosti jednotlivého sloupce, formátování a filtrů.
- `grid-view.schema.json`: samostatný kontrakt **uloženého uživatelského pohledu** (není součástí definice gridu).
- Všechny soubory používají JSON Schema Draft 2020-12. `description` jsou komentáře schématu pro editory a agenty; `default` je anotace, **nikoli automaticky doplněná hodnota**.
- `$schema` v instancích ukazuje na lokální hlavní schéma; VS Code ho může využít pro IntelliSense. `$id` v samotných schématech používá nepublikovanou identitu `example.invalid` a **neslouží jako URL ke stažení**; relativní `$ref` vyžaduje lokální resolver schémat. Při nasazení validačního nástroje zaregistrovat schémata pod jejich `$id` nebo používat lokální resolver.
- Samotné JSON Schema nekontroluje dynamické vazby: existenci `field` v `columns`, referenci akce v toolbaru, skutečnou existenci REST endpointu, vazbu operátoru na datový typ, `minWidth <= maxWidth` ani dostupnost překladů pro centrální LCID. Tyto kontroly patří do následné sémantické validace.
- `metadata/contacts.grid.jsonc` je komentovaný návrhový příklad; aplikace načítá standardní `.json`. JSONC **není** formálně validovaný jako JSON bez odstranění komentářů.
- Pro serverový subgrid telefonů je potřeba při implementaci doplnit kontextový parametr `contactId` z rodičovského formuláře; referenční `telephones.grid.json` ukazuje samostatnou strukturu sloupců, nikoli hotové napojení subgridu.

## Stav

Připravené příklady a schémata k revizi; renderer, POST search, export a persistence pohledů nejsou implementovány. Formální validátor ani runtime testy zatím nejsou připojeny.
