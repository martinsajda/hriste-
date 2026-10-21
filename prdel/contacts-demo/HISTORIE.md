# HISTORIE — doslovný pracovní záznam konverzace

Tento soubor je **chronologický záznam dialogu**, nikoli syntéza zadání. Syntéza patří do `README.md`, `docs/DATOVY_MODEL.md`, `docs/API.md` a dalších specifikací.

**Omezení první archivace:** V okamžiku vytvoření souboru je dostupná přesná formulace níže zachycené části vlákna. Starší část konverzace před první uvedenou replikou není v plném doslovném znění dostupná, a proto ji zde nevymýšlíme ani nenahrazujeme parafrází. Záznamy mají zachovávat formulace a pořadí replik; případné nové repliky se připojují na konec při další práci s repozitářem. Nejde o automatický záznam běžící na pozadí.

---

## 2026-10-21 — revize zadání

**Uživatel:**

> Tak teďko udělej revizi, jestli z hlediska zadání máme už všechno podstatné.

**Asistent:**

> Prošel jsem aktuální `README.md` a instrukce hlavního agenta v `AGENTS.md` na GitHubu.
>
> **Výsledek: Architekturu máme navrženou dostatečně dobře, abychom mohli začít implementovat. Před spuštěním Codexu bych ale ještě odstranil několik rozporů a doplnil technické detaily.**
>
> Co už máme dobře definované: celková třívrstvá architektura, SQLite a vztah 1:N, REST operace, dashboard, gridy, formuláře a subgrid, JSON metadata, centrální CSS, dialogy mazání a budoucí backendy.
>
> Co je potřeba ještě vyřešit:
>
> 1. Rozpor mezi README a instrukcemi agentů.
> 2. Chybějí dvě operace REST API: `GET /api/contacts/{id}` a `GET /api/contacts/{id}/telephone-numbers/{phoneId}`.
> 3. Dokončit datový model.
> 4. Přesně definovat chování rendereru.
> 5. Chování formulářů a gridů.
> 6. Testování a předávací kritéria.
> 7. Vizuální specifikace a dokumentace.
>
> **Závěr:** Z hlediska funkčního zadání už máme téměř všechno podstatné. Největší zbývající práce není vymýšlení dalších funkcí, ale převedení současného návrhu do jednoznačných technických kontraktů, podle kterých mohou jednotliví agenti nezávisle programovat.
>
> Tuto revizi jsem zatím provedl pouze jako kontrolu. Žádné soubory v GitHubu jsem při ní neměnil.

## 2026-10-21 — finalizace datového modelu

**Uživatel:**

> Dobře, pojďme teda finalizovat datový model a kontrakty. Takže datový model budou dvě tabulky: tabulka Kontakt, tabulka Telefon. Kontakt bude obsahovat pole jméno, příjmení, adresa, popis. Entita neboli tabulka Telefon bude obsahovat typ telefonního spojení, to bude obsahovat, kde budou hodnoty a možnosti: pevná linka, mobil, fax, telefon do práce, případně ještě další, které uznáš za vhodné. Bude tam políčko telefon a bude tam políčko popis. Vztah mezi kontaktem a telefonem bude 1:N, aby kontakt mohl mít více telefonů. No a to je všechno. Primární klíče udělujeme jako GUIDy, aby se to dobře přenášelo, i do prostředí třeba Dataware a podobně. Tento model zapiš do souboru Datový model MD a vytvoř k tomu i Mermaid diagram, ať se můžu podívat na to, jak to vypadá, jak jsou vedeny ty vztahy.

**Asistent:**

> Datový model tedy uzavřeme na **dvě entity: Kontakt a Telefon**, se vztahem 1:N a identifikátory typu GUID (UUID).
>
> Pro implementaci zachováme anglické technické názvy `Contacts` a `TelephoneNumbers`, zatímco uživatelské popisky budou české. Primární klíče budou `Id` a vazba telefonu na kontakt bude `ContactId`.
>
> Jeden kontakt může mít libovolný počet telefonních čísel. Každý telefon patří právě jednomu kontaktu.
>
> Typ telefonu bude option set s hodnotami **mobil, pevná linka, fax, pracovní telefon a jiný**. Pro první verzi je to dostačující; další hodnoty půjdou později přidat.
>
> Součástí dokumentu bude také Mermaid ER diagram, pravidla cizího klíče, mazání a datové typy pro SQLite.

**Asistent (po zápisu na GitHub):**

> **Datový model je uložený na GitHubu.**
>
> Vytvořil jsem soubor:
>
> https://github.com/martinsajda/hriste-/blob/main/prdel/contacts-demo/docs/DATOVY_MODEL.md
>
> Dokument obsahuje definice obou tabulek, datové typy, GUID primární klíče, pravidla vazby 1:N, option set telefonů, Mermaid ER diagram a referenční SQL pro SQLite.
>
> **Commit:** `89cde66`
>
> GitHub Mermaid diagram vykreslí přímo v dokumentu. Dalším krokem může být finalizace REST API kontraktu podle tohoto datového modelu.

## 2026-10-21 — finalizace REST API

**Uživatel:**

> Tak, teďka jsme finalizujeme kontakty. Bude to úplně jednoduché, bude to tedy restapy, který pojede primárně na Node.js procesu, postupně to pak budeme implementovat i pro ASP.NET a PHP. A kontrakt bude jednoduchý. Pro každou entitu se udělá klasický CRUD, to znamená pět načtení všech kontaktů, pět načtení zápis kontaktů, modifikace kontaktů, smazání kontaktu, to samé i pro events. Tohle, čeho tam to nově.

**Asistent:**

> REST API v1 tedy uzavřeme jako **klasický CRUD pro obě entity**. Každá bude mít pět operací: načíst seznam, načíst jeden záznam, vytvořit, upravit a smazat.
>
> Celkem tedy **10 endpointů**.
>
> Kontakty:
>
> - `GET /api/contacts`
> - `GET /api/contacts/{id}`
> - `POST /api/contacts`
> - `PUT /api/contacts/{id}`
> - `DELETE /api/contacts/{id}`
>
> Telefony:
>
> - `GET /api/telephones`
> - `GET /api/telephones/{id}`
> - `POST /api/telephones`
> - `PUT /api/telephones/{id}`
> - `DELETE /api/telephones/{id}`
>
> Pro subgrid telefonů na detailu kontaktu použijeme filtrování seznamu: `GET /api/telephones?contactId={guid}`. Nevznikne tím žádná další speciální operace.
>
> Backend bude nejprve Node.js, později ASP.NET Core a PHP. Všechny implementace budou dodržovat stejný kontrakt, včetně GUID identifikátorů a JSON struktury.

**Asistent (po zápisu na GitHub):**

> **REST API kontrakt v1 je uložený na GitHubu.**
>
> Aktualizoval jsem existující dokument:
>
> https://github.com/martinsajda/hriste-/blob/main/prdel/contacts-demo/docs/API.md
>
> **Commit:** `571b778`
>
> Zapsal jsem deset CRUD operací, JSON příklady obou entit, GUID identifikátory, HTTP návratové kódy, validace a pravidla mazání.
>
> Jako návrhové rozhodnutí jsem použil samostatné endpointy `/api/contacts` a `/api/telephones`, aby každá entita měla jednotné CRUD rozhraní. Vazbu 1:N řeší `contactId` a filtr seznamu.
>
> **Datový model a REST kontrakt máme nyní definované.** Zbývá sjednotit starší ukázky v README a instrukce agentů podle těchto nových dokumentů.

## 2026-10-21 — druhá revize zadání

**Uživatel:**

> Udělejme znovu teda revizi stavu zadání.

**Asistent:**

> Znovu jsem načetl projekt přímo z GitHubu, včetně nového datového modelu, REST kontraktu a starší architektonické dokumentace.
>
> **Výsledek: Datový model i REST API už máme uzavřené. Hlavní zbývající problém je nesoulad nových specifikací se staršími dokumenty a existující implementací.**
>
> Konkrétní zjištěné problémy:
>
> 1. Agenti stále pracují podle původního zadání. DB agent požaduje jednu tabulku s číselným ID, backend zná jen GET/POST/DELETE, frontend má pevný formulář a QA testuje staré operace.
> 2. Existující `server.js` je starší prototyp s `INTEGER PRIMARY KEY AUTOINCREMENT`, jednou tabulkou a třemi endpointy.
> 3. Zbývá uzavřít přesný formát JSON metadat a univerzální renderer.
> 4. Sjednotit pojmenování Contacts Demo / Context Demo, odkazy na vizuální návrh a akceptační scénáře.
>
> Doporučený postup: datový model a REST API jsou hotové; následují JSON metadata a renderer, synchronizace dokumentace a agentů, akceptační testy a spuštění Codexu.
>
> **Závěr:** Backendové zadání je dostatečně určité. Než začneme generovat aplikaci, doporučuji finalizovat JSON metadata a pravidla rendereru. Potom jedním průchodem sjednotíme všechny instrukce agentů a můžeme začít implementovat bez rizika, že každý agent postaví něco jiného.
>
> Revize byla pouze kontrolní; soubory jsem tentokrát neupravoval.

## 2026-10-21 — rozhodnutí o jediném agentovi

**Uživatel:**

> Co se týče kodex agentů, já bych chtěl vidět teďka celkem, že nebudeme to dělat multiagentně. Já si chci první vyzkoušet, že vlastně funguje tenhle způsob vývoje, kdy já ti vlastně diktuju, co se má v tomhle generalizuješ. A potřebuju, aby to teda generoval aktuálně jeden jediný agent. To znamená buď to teďka přímo ty, anebo někdy později třeba, že si pustím lokální kodex nebo jiný těžký agent.

**Asistent:**

> Rozumím. **Pro první fázi zrušíme multiagentní architekturu a celý projekt bude obsluhovat jediný vývojový agent.**
>
> To odpovídá tomu, co chceme ověřit: ty budeš zadávat požadavky přirozeným jazykem, klidně hlasově, já je převedu do technické specifikace a následně je buď přímo provedu na GitHubu, nebo je později zpracuje lokální Codex CLI.
>
> Navrhuji tedy jednoduché uspořádání:
>
> - **Ty:** zadavatel, architekt a schvalovatel zásadních rozhodnutí.
> - **Jeden AI agent:** čte dokumentaci, implementuje databázi, backend, frontend i testy a kontroluje konzistenci.
> - **GitHub:** společné úložiště zdrojových kódů, specifikací a historie změn.
> - **Google Drive:** úložiště obrázků, PDF a dalších binárních podkladů.
>
> Soubor `AGENTS.md` bude obsahovat instrukce pro **jediného univerzálního agenta**, nikoliv orchestrátora. Stejná pravidla pak bude možné používat při práci se mnou i s lokálním Codexem.

**Asistent (po zápisu na GitHub):**

> **Změnu jsem už zapsal na GitHub.**
>
> Aktualizoval jsem `AGENTS.md` a `README.md`. Staré soubory čtyř specializovaných agentů jsem ponechal jako historické, ale výslovně jsem je označil za neaktivní.
>
> Tím máme jeden společný způsob práce pro ChatGPT i budoucí lokální Codex. Rozdíl bude jen v dostupných nástrojích: já teď mohu upravovat GitHub, zatímco lokální Codex bude moci také spouštět aplikaci a její testy přímo na tvém počítači.
>
> **Další krok:** dokončit JSON metadata a univerzální renderer. To je poslední zásadní část zadání, než začneme nový prototyp skutečně implementovat.

## 2026-10-21 — požadavek na historii konverzace

**Uživatel:**

> Důležitá provozní poznámka. Teďka sdružujeme poslední informace v Rhythmy MD, že jo. Já bych chtěl ještě, aby tam byla nějaká MD soubor historie MD a v něm vlastně zapiš celý tohleto vlákno, tak jak jsme si prostě povídali, abych se mohl případně i k nějakým myšlenkám prostě vrátit. Nijak to neshrnuj, spíš to udělej jako prostě zápis té naší konverzace. Ta syntéza potom do nějakého analytického podkladu je právě to Rhythmy MD, případně jiné MD soubory, jako je to API MD a podobně, co jsem tam založil. Já si to potom zkontroluju a ještě to ještě učešu, ano? A zapisuj všechno průběžně, pořád.

**Asistent:**

> [Odpověď na tuto repliku následuje v chatu po vytvoření souboru.]


## 2026-10-21 — odpověď k historii a nová revize

**Asistent (odpověď k založení historie, přesné znění textu):**

> Ano. Založil jsem v GitHubu nový soubor:
>
> **HISTORIE.md – historie konverzace**
>
> Commit: `1e6c69d`
>
> Oddělíme tím dvě věci: `HISTORIE.md` bude sloužit jako chronologický záznam našeho rozhovoru, zatímco `README.md`, `API.md` a další dokumenty budou obsahovat výslednou technickou specifikaci.
>
> Jedno důležité upřesnění: **první verze historie zatím není úplný doslovný přepis celého vlákna**. Obsahuje přesné dostupné uživatelské repliky, ale některé moje delší odpovědi jsou zkrácené. Starší části konverzace nemám dostupné v úplném znění, takže je nechci vymýšlet.
>
> Odteď budu při další práci na projektu průběžně doplňovat dostupný dialog do historie. Nemohu však zapisovat automaticky na pozadí mimo aktivní konverzaci.
>
> Soubor si můžeš zkontrolovat a upravit. Budeme ho brát jako pracovní archiv, ne jako finální specifikaci.

**Uživatel:**

> Tak teď uděláme zase revizi stavu toho zadání.

**Asistent (začátek aktuální revize, přesný text bez tabulkového formátování):**

> Revize zadání – 21. října 2026.
>
> Znovu jsem zkontroloval aktuální dokumenty na GitHubu. Tentokrát už hodnotím také nový režim **jediného vývojového agenta** a požadavek na průběžnou historii konverzace.
>
> **Celkový závěr: Funkční a backendové zadání je prakticky uzavřené. Zbývá dokončit specifikaci univerzálního frontendu a sjednotit dokumentaci.**
>
> Stav: datový model, REST API, Node.js/SQLite a jednoagentní režim jsou uzavřené. Historie je založena, ale neúplná. JSON metadata, sjednocení starších dokumentů a akceptační testy čekají.
>
> Zjištění: README obsahuje staré vnořené telefonní endpointy a neúplná pole formulářů; ARCHITECTURE.md popisuje jen macOS; AGENTS.md zatím neobsahuje explicitní pravidlo pro průběžné doplňování historie.

**Poznámka archivace:** Aktuální asistentská odpověď byla v chatu částečně vykreslena jako tabulka a interaktivní prvky. Zde je zapsán její obsah, nikoliv doslovná podoba všech UI prvků.


---

## Pokračování

Při dalších změnách projektu se na konec souboru připojují další **uživatelské a asistentské repliky v pořadí**, pokud je jejich přesné znění dostupné. Není-li dostupné, musí to být výslovně uvedeno; nikdy nevytvářet smyšlený doslovný přepis.
