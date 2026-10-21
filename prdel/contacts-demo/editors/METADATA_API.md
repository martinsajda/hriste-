# Metadatové API a storage provider

**Stav:** Schválený princip, detaily a implementace odloženy.

## Účel
Všechny vizuální editory čtou a ukládají definice entit, atributů, relací, option setů, formulářů, gridů a aplikačních HTTP vazeb přes **samostatné backendové metadatové API**. Toto API je odlišné od business REST endpointů pro skutečné záznamy.

## Schválené principy
1. API poskytuje operace pro správu metadat (načtení, validaci, vytvoření/úpravu, publikaci či smazání podle budoucího kontraktu). **Konkrétní URL a HTTP metody nejsou zatím schváleny.**
2. Backend používá **vyměnitelný metadata storage provider**. První provider ukládá validní JSON do adresářové struktury aplikace. Později může existovat provider nad databází či jiným úložištěm bez změny editorů.
3. Návrh uživatele: soubory uložené v samostatné složce na serveru hostujícím web. **Bezpečnější výchozí varianta:** adresář mimo veřejný document root, případně s explicitně zakázaným přímým HTTP přístupem; jen veřejná/publikovaná metadata se vystaví přes čtecí API nebo statické URL.
4. Prohlížeč nikdy přímo nezapisuje soubory na server. Zápisy jdou přes autorizované backendové API; server provede validaci JSON Schema i sémantiky, kontrolu referencí a bezpečný zápis.
5. Metadata mohou být v runtime načítána přes `fetch()` z publikovaných statických JSON souborů nebo přes HTTP API. Obě varianty musejí vracet **stejný kanonický JSON kontrakt**.
6. Oddělit návrhová/rozpracovaná metadata od publikovaných, pokud to bude vyžadovat workflow. Metadata nesmějí obsahovat tajné údaje, serverové connection stringy, session ID nebo API klíče.
7. Ošetřit traversal v cestách, whitelist typů dokumentů, oprávnění, konkurentní editace, atomický zápis (temp + rename podle možností prostředí), validaci a obnovu verzí/záloh.
8. U statického hostingu bez zapisovatelného backendu nelze metadatový editor ukládat přímo na hosting; potřebuje serverovou komponentu s odpovídajícími právy (např. PHP na hostingu).

## Ilustrační fyzické členění (není schválené finální schéma cest)
```text
metadata-store/
  entities/
  forms/
  grids/
  data-sources/
```

**Pozor:** `data-sources/` obsahuje jen veřejně bezpečné deklarativní mapování operací. Tajné backendové nastavení patří mimo publikovaná metadata.

## K rozhodnutí před implementací
Finální URL metadatového API, struktura složek a názvů souborů, identifikátory/verze, validace, publish/draft režim, zamykání či optimistic concurrency, audit, historie změn, zálohování, oprávnění a provozní model pro Node/IIS/PHP.
