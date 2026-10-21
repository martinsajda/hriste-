# WYSIWYG editor formulářů a layoutu

**Stav:** Koncepce, implementace odložena.

Editor skládá formulář z metadat existujících entit: záložky, sekce, sloupce, pole, lookupy, subgridy a další komponenty. Umožní drag & drop, panel vlastností, podmínky viditelnosti/povinnosti, náhled a validaci.

## Klíčový princip
**Editor i runtime používají jeden Form Renderer.** Náhled vychází ze stejného layout JSON kontraktu jako skutečný formulář; neudržovat druhý nezávislý způsob vykreslování.

## Hranice
- Layout formuláře je samostatný JSON dokument od entity metadata a od datového záznamu.
- Vlastnosti atributu se čtou z entity metadata; layout je nezdvojuje jako konkurenční definici.
- Konfigurace načtení/uložení přes business REST je oddělená od vizuálního rozložení.
- Rozpracovaný editorový stav (výběr, historie undo/redo) není součástí publikovaného JSON.

## Otevřené otázky
Responzivní layout, pořadí tabulátoru, více formulářů na entitu, role/viditelnost, vlastní komponenty, preview s mock daty a pravidla validace.
