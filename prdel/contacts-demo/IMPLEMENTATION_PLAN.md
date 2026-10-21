# Implementation Plan — etapový harmonogram Contacts Demo / model-driven frameworku

**Stav dokumentu:** schválené pořadí etap, orientační plán bez závazných kalendářních termínů.
**Založeno:** 21. 10. 2026.
**Aktuální etapa:** F0 — analýza a návrh metadatových kontraktů.

## Základní rozhodnutí

**Nejdříve metadata a datová vrstva, potom jejich důkladné testování, teprve následně vizuální grid/form renderery a nakonec WYSIWYG editory.**

Jednotlivé fáze mají jasná akceptační kritéria (gate). Nepřeskakovat dopředu a nevyvíjet současně backendové datové kontrakty a finální UI. Při testování na datové úrovni se mohou ukázat nesrovnalosti typů, vazeb, null hodnot, serializace, stránkování a integrací. Tyto problémy chceme opravit **před** vznikem závislostí v rendererech.

Kalendářní termíny a odhady pracnosti zatím nejsou závazné. Analýza může trvat přibližně 1–2 týdny podle potřeby; zahájení programování určí až schválení specifikací, nikoli datum.

## Etapy a jejich návaznosti

| Fáze | Náplň | Výstup / podmínka postupu | Stav |
| --- | --- | --- | --- |
| **F0 — Analýza a specifikace** | Metadatový model, typy, JSON/JSONC, JSON Schema, REST kontrakty, entity/data/layout, providery, chybové stavy | Odsouhlasené, verzované kontrakty a testovací příklady | **Probíhá** |
| **F1 — Metadatová API a mock storage** | Čtení a správa definic entit, atributů, vztahů, option setů; souborový metadata provider, JSON dokumenty; validace | Metadatové API plně testovatelné bez UI | Čeká |
| **F2 — Business datová API a mock data** | Aplikačně specifické REST endpointy; typované `Entity`/`EntityCollection`; mock JSON data a datový provider; filtry, řazení, stránkování, čtení a zápis dle konkrétních operací | Úplné funkční datové operace a konzistentní payloady bez UI | Čeká |
| **F3 — Integrační a kontraktové testování datové vrstvy** | Automatické i ruční API testy, hraniční stavy, opravy kontraktů a jejich stabilizace | **Povinný gate: schválené a prokazatelně funkční metadata + datová API** | Čeká |
| **F4 — Runtime grid renderer** | Grid z metadat, napojení na existující API, typované hodnoty, filtr, sort, paging, akce | Grid vykresluje ověřená mock/API data bez změn jejich sémantiky | Čeká |
| **F5 — Runtime form renderer** | Form layout, pole, lookupy, option sety, validace, čtení/zápis, subgridy dle specifikace | Form renderer nad stejnými stabilními kontrakty | Čeká |
| **F6 — Integrace a stabilizace UI** | Společné komponenty, UX, chyby, testy rendererů, regresní scénáře | Funkční demonstrace portálu s gridy a formuláři | Čeká |
| **F7 — Metadatové API pro autorské workflow a WYSIWYG editory** | Editor entit, formulářů, gridů, REST vazeb; validace, preview, bezpečné ukládání a publikace | Editory tvoří stejná JSON metadata, která runtime přímo interpretuje | Čeká |
| **F8 — Nasazení, portace a rozšiřování** | Integrace do PowerX, bezpečnost session, IIS/PHP, alternativní providery, provozní testy | Ověřené konkrétní cílové prostředí | Čeká |

**Poznámka k F1 a F7:** Již v F1 vznikne minimální funkční **metadatové API pro správu JSON definic** a souborový provider, aby bylo možné data připravovat a testovat. F7 nad tím postaví **autorské workflow a vizuální editory**; nejde o odložení celého metadatového API až na konec.

## F0 — Analýza a specifikace (aktuálně)

- [ ] Dopracovat struktury entity/attribute/relationship/option set metadat podle [docs/METADATA_MODEL.md](docs/METADATA_MODEL.md).
- [ ] Specifikovat kanonické verzované JSON wire kontrakty pro data `Entity`, `EntityCollection`, hodnotové typy a metadata; JSONC ukázky a JSON Schema.
- [ ] Oddělit datový model, entity metadata, layout gridu/formuláře a mapování konkrétních aplikačních HTTP operací.
- [ ] Definovat čtecí/zápisové metadatové API, datová API, chyby, validace, mock režim a očekávané testovací scénáře.
- [ ] Vymezit minimum nutné pro F1–F3; otevřená témata zapsat do TODO bez předčasné implementace.

**Gate F0 → F1:** Dokumentace a příklady jsou vzájemně konzistentní; známe očekávané vstupy, výstupy a chování API.

## F1 — Metadatové REST API + souborový provider

- [ ] Implementovat metadata storage provider nad JSON soubory ve vyhrazené serverové složce.
- [ ] Implementovat API pro načtení, validaci a úpravy metadat (konkrétní URL/metody schválit v F0).
- [ ] Zajistit rozlišení typů dokumentů (entity, option set, vztahy, form/grid layout, endpoint konfigurace).
- [ ] Validovat JSON Schema a doménová pravidla, reference a verzování; řešit bezpečné zápisy.
- [ ] Připravit seed/mock metadata a automatické API testy.

**Gate F1 → F2:** Metadata lze bez UI vytvořit/načíst/upravit a validovat; jsou deterministicky serializovaná a opět načitatelná.

## F2 — Datová REST API + mock JSON data

- [ ] Implementovat konkrétní aplikační operace pro testovací entity, **bez zavedení povinného generického CRUD servisního rozhraní**.
- [ ] Provider pracuje nad mock JSON záznamy (případně testovacím úložištěm); backend vrací kanonické typované JSON payloady.
- [ ] Ověřit identitu entit, reference, option sety, money/decimal, null versus absent, kolekce a vazby.
- [ ] Implementovat a testovat potřebné datové operace včetně filtrů, řazení, stránkování a zápisů podle jednotlivých endpointů.
- [ ] Zajistit, aby výměna mock provideru za SQLite/SQL/Dataverse nevyžadovala změnu rendereru.

**Gate F2 → F3:** Všechny plánované datové scénáře lze provést čistě HTTP klientem bez gridu či formuláře.

## F3 — Povinná datová validační brána

- [ ] Kontraktové testy API a round-trip serializace/deserializace.
- [ ] Testy chybných metadat, neplatných referencí, kolizí názvů, chybných typů a hraničních hodnot.
- [ ] Testy prázdných kolekcí, chybějících atributů, null, chybových HTTP stavů, stránkování a konzistence.
- [ ] Ručně ověřit JSON odpovědi v HTTP klientovi; chyby opravit **v datovém/metadatovém kontraktu**, ne obcházet ve frontendu.
- [ ] Aktualizovat specifikace a testy podle nalezených nesrovnalostí.

**Závazný STOP/GATE:** **Dokud F3 neprojde, nezačínat implementaci grid ani form rendererů.**

## F4–F6 — Vizualizace až nad stabilními daty

**F4:** Nejdříve grid renderer nad již existujícími API a metadaty. Testovat typované sloupce, vazby, filtry, řazení a stránkování.

**F5:** Poté form renderer nad týmiž kontrakty; layout, editace, lookupy, validace a ukládání.

**F6:** Následná integrace obou rendererů, subgridy, společné UI chování, regresní testy a stabilizace. Nepřizpůsobovat datové kontrakty nahodilým potřebám UI bez explicitního architektonického rozhodnutí.

## F7 — WYSIWYG editory

Navazuje na funkční renderery a metadatové API. Viz [editors/README.md](editors/README.md) a samostatné dokumenty editorů. Editory používají kanonické JSON kontrakty; pro preview pokud možno znovu využijí runtime renderery. Zahrnout bezpečnost zápisů, verzování, souběžné změny a publish workflow podle budoucího návrhu.

## F8 — Produkční integrace a portace

Odděleně ověřit PowerX host authentication/session a autorizaci, cílové backendy a deployment. Pro PowerX viz [docs/ARCHITECTURE_TODO.md](docs/ARCHITECTURE_TODO.md), úkol A02. Portace nepatří do prvního průchodu datovým a UI prototypem.

## Pravidla řízení změn

1. **Žádný kód jen proto, že máme nápad.** Nejdřív analýza, schválení a dokumentace.
2. Každá etapa má testovatelný výsledek a explicitní gate; další etapa nezačíná před jeho splněním.
3. Odhalené problémy v datech opravovat v datech a kontraktech, nikoli maskovat rendererem.
4. Změny schválených kontraktů zdokumentovat, verzovat a promítnout do testů.
5. Rozlišovat **schválené architektonické principy**, **otevřené návrhy** a **hotovou implementaci**.
6. Prototyp Contacts Demo a jeho starší ploché DTO/SQLite API jsou legacy výchozí stav; jejich existence nepředepisuje cílový metadatový kontrakt.
7. Tento plán určuje **pořadí**, nikoli povinnost vyvíjet všechny budoucí funkce v první verzi.

## Související dokumenty

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/METADATA_MODEL.md](docs/METADATA_MODEL.md)
- [docs/ARCHITECTURE_TODO.md](docs/ARCHITECTURE_TODO.md)
- [editors/README.md](editors/README.md)
