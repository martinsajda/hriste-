# Konverzace – migrace PowerBuilderu na web
Datum: 20. 10. 2026

> Archiv dostupného textového přepisu hlasové diskuse. Hlasový přepis obsahuje přeřeknutí a chyby rozpoznávání. Níže jsou zachovány klíčové promluvy v původním znění; nejde o ověřený doslovný export všech hlasových dat.

## React a Node.js
**Uživatel:** A já třeba stingkla reakt, kde je, stingkla Node.js a to sim vytvoří speciální server, kde běží vlastně ten worker, že jo, ten engine, který vlastně dělá listenera na tom portu, že.

**Asistent:** React je knihovna UI, Node.js runtime a Vite vývojový server. Produkční build Reactu může běžet jako statické HTML, CSS a JS bez Node.js serveru.

**Uživatel:** Takže když to vyplním pro produkci a budu mít vlastně sadu statických HTML, CSS a JS, tak potom vlastně tyhlety věci zajišťují uživatelské rozhraní a zajišťují vlastně nějaký předávání krut událostí nebo krut zpráv pro nějakou další backendovou vrstvu, která už pak implementuje nějakýho providera pro práci s daty a podobně, že.

**Asistent:** Ano, React v prohlížeči zpracuje UI a přes HTTP/JSON komunikuje s ASP.NET Core Web API, které provádí business logiku a pracuje s daty.

## Původní aplikace
**Uživatel:** Mám totiž takovou myšlenku, já mám u jednoho svého zákazníka Legacy aplikaci, což je už dneska 20 let stará aplikace napsaná v PowerBuilderu od Sybase. Běží to nad Microsoft SQL Server, tuším, že nějakých 2008

**Uživatel:** Ta aplikace je v PowerBuilderu, to jsem říkal, to je těžká apka, která dělá uživatelské rozhraní a dvouvrstvě si to povídá přímo se SQL Serverem.

**Uživatel:** Přemýšlím, že udělám vlastně API vrstvu na úrovni HTTP, to by klidně mohlo být napsaný na IISku v .NET, to není žádný problém.

**Uživatel:** Ta bude zajišťovat vlastně komunikaci se SQL Serverem a navenek to bude interpretovat jako nějaké REST API kde budou nějaké datové operace právě pro tu komunikaci s těmi daty. No a s tím, že bych postupně překlápěl tu těžkou aplikaci v PowerBuilderu do nějaké webové aplikace, a teďka je úplně jedno, jestli to bude React, nebo to budou ASPčka.

## Reverzní inženýrství
**Uživatel:** Jestli jsme schopni udělat revers z těch vlastně v PowerBuilderových knihoven a z toho vlastně vysyntetizovat jako nějakou kostru uživatelskýho rozhraní, která bude už čistě v HTML formě pro webový prohlížeč.

**Asistent:** Ze zdrojových knihoven lze exportovat definice oken a DataWindow, analyzovat je a generovat meziformát, například JSON, z něhož renderer vytvoří webové formuláře. Je nutné zvlášť analyzovat události a business logiku.

**Uživatel:** Mám všechny ty zdrojové knihovny, protože sám osobně ten systém [vyvíjel].

**Asistent:** Dostupnost zdrojových knihoven umožňuje export definic, analýzu a automatizovanou inventuru.

**Uživatel:** No v prvé řadě to chování bych zachoval jedna k jedný podle businessové stránce, v osobnosti klasické agendy typu objednávky, dodací listy, potom nějaké výrobní listy, kam lidi zadávají prostě výkony své práce.

**Uživatel:** Na tohle bych udělal určitě nějakou mezivrstvu s nějakým API, kde to na backendu si vlastně bude povídat s tím SQLem a bude to provádět ty vlastní úlohy, čili to budou kontrolery. A teprve nad tím to bych potom budoval uživatelské rozhraní, který by mělo být jakože co nejbližší tomu ovládání té těžké aplikace.

**Asistent:** Zachovat business chování a pracovní ergonomii, kde to prohlížeč dovolí. Některé klávesové zkratky Alt/Ctrl+Alt mohou kolidovat s prohlížečem. API nemá být pouze CRUD obal nad tabulkami, ale má vystavovat i business operace.

**Uživatel:** Je to tuším nějaká desítka nebo jedenáctka. Deset nebo jedenáct nebo dvanáct, teď si nejsem úplně jistý, ale je to prostě už jako 20 let stará věc.

**Uživatel:** No tak uživatelské objekty tam samozřejmě nějaký jsou, ale jsou spíš na úrovni toho, že jsem používal vlastně Power Foundation framework, který vlastně generoval sám Powersoft, nebo potažmo potom Sybase. A to jsou nějaké věci prostě, je tam nějaká dědičnost na oprávnění a na meny a na hlavní okna a tak podobně, ale to vlastní uživatelské rozhraní, to znamená formuláře typu detail a seznam, to jsou všecko klasické data window, které mají pod sebou buďto SQL dotaz a generují updaty a creaty a delíty, a nebo si to povídá to data window s uloženou procedurou.

**Asistent:** DataWindow jsou hlavní zdroj metadat pro UI, SQL vazby, validace a aktualizační chování. PFC je vhodnější funkčně nahradit než doslovně překládat.

**Uživatel:** Je to vyloženě dvouvrstvé, to znamená data window si přímo povídají se SQL Serverem přes nějaký ODBC.

**Asistent:** Z DataWindow lze připravit JSON pro UI a návrhy API kontraktů. Složitější SQL, transakce, dědičnost a události je nutné zvlášť prověřit. Zatím zůstáváme v analytické fázi.

## Archivace
**Uživatel:** Tohle vlákno, když si teďka spolu povídáme, jaký má omezení, jaký to má limity, abych třeba nezjistil, že si budu teďka s tebou tady den povídat [...] a odmaže se první hodina.

**Asistent:** Dlouhé vlákno není zárukou, že celý jeho obsah bude vždy v aktivním kontextu. Doporučena průběžná archivace.

**Uživatel:** Do mého GitHubu, kde už máme přístup, je tam složka Prdel, tak do té složky vytvoř několik souborů. Za prvý soubor konverzace MD, kam bude surový přepis tady toho, co si povídáme. Druhá věc, vytvoř tam soubor architektura tečka MD, kde uděláš souhrn už technický dokument vlastně celé tady té naší konverzace a udělej tam aj soubor Agents MD, kde zapiš prostě jenom jednoduchý overview tady tohto projektu.

**Asistent:** Potvrzeno vytvoření konverzace.md, architektura.md a AGENTS.md po písemném pokynu.

**Uživatel:** Udělej to.
