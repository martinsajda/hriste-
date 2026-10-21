# Testování grid rendereru — rozhodnutí: HTTP/HTTPS, dva datové režimy

**Rozhodnutí (21. 10. 2026):** režim `file://` a balení metadat či dat do JavaScriptu **definitivně vyřazujeme z architektury**. Aplikace vždy běží přes HTTP/HTTPS. Toto je schválené architektonické zadání pro budoucí implementaci; renderer ani adaptéry zatím nejsou hotové.

## Základní princip

- Stejný statický frontend a stejný renderer fungují pod lokálním vývojovým HTTP serverem, IIS, Apache i jiným standardním webserverem.
- Metadata gridů a formulářů se **vždy načítají přes `fetch()`** jako běžné statické JSON soubory, například `metadata/contacts.grid.json`. Stejným způsobem se načte i aplikační konfigurace.
- Data mají **pouze dva režimy**: `mock` a `rest`. Režim je nastaven centrálně, bez změny metadat jednotlivých gridů.
- Renderer používá jednotné asynchronní rozhraní datového adaptéru; rozdíl mezi mockem a reálným REST API neřeší.

## Režimy

| Režim | Metadata | Data | Potřebná infrastruktura |
| --- | --- | --- | --- |
| `mock` | HTTP GET / fetch statických JSON metadat | HTTP GET / fetch statického testovacího JSON datasetu; řazení, filtrování, hledání a stránkování simuluje klientský adaptér | Pouze statický HTTP server; žádný aplikační backend ani databáze |
| `rest` | HTTP GET / fetch stejných statických JSON metadat | Skutečné REST API dle `docs/API.md` a budoucích rozšíření | Webserver, aplikační backend a databáze |

Lokálně může statické soubory poskytovat jednoduchý Node.js HTTP server, ale Node.js **není požadovaná runtime závislost frontendového rendereru**. Stejný frontend musí fungovat na IIS a Apache. V produkci může frontend a API poskytovat stejný nebo různý server podle nasazení.

## Přesnost mock kontraktu

- Statický soubor `mock/contacts.json` vrací při GET vždy stejný dataset. **Nejde o dynamický endpoint `GET /api/contacts?page=...`**: statický webserver sám nezpracuje stránkování, filtry ani POST.
- `mock` adaptér po načtení datasetu lokálně napodobí sémantiku REST kontraktu, včetně shodné struktury odpovědi `items` a `pagination`, stabilního řazení, sloupcových filtrů a globálního hledání.
- Simulace CRUD a pokročilého `POST /search` může probíhat v paměti mock adaptéru; přesné scénáře určíme před implementací.
- Režim `rest` volá skutečné API. Backend je autoritou pro validace, autorizaci a stránkování nad úplným datasetem.
- Metadata `dataSource` popisují logický REST kontrakt. Volba `mock/rest` patří do centrální konfigurace.

## Návrh konfigurace (ilustrační, zatím neměnit app.config.json)

```json
{
  "dataAccess": {
    "mode": "mock",
    "mock": {
      "contacts": "mock/contacts.json",
      "telephones": "mock/telephones.json",
      "latencyMs": 0,
      "simulateErrors": false
    },
    "rest": {
      "baseUrl": "/api"
    }
  }
}
```

Cesty ke statickým souborům navrhnout s ohledem na nasazení aplikace do podadresáře webu (nepředpokládat vždy kořen domény).

## Testovací plán

1. Spustit pouze lokální statický HTTP server, bez databáze a aplikačního backendu; přes fetch načíst metadata i mock data a zobrazit grid.
2. Otestovat identické chování na IIS/Apache při servírování stejných souborů.
3. Ověřit řazení, stránkování, globální hledání, typové filtry, výběr, prázdné stavy, chyby a simulovanou latenci.
4. Přepnout centrálně na `rest` a ověřit stejné UI proti skutečnému backendu a DB.
5. Samostatně otestovat export a uživatelské pohledy.

## Výslovně vyřazeno

- Otevírání aplikace přes `file://`.
- Režim `embedded` a jakékoliv povinné balení JSON metadat/dat do JS kvůli lokálnímu souborovému režimu.
- Samostatný speciální renderer pro mock.

**Odloženo:** konkrétní implementace adapterů, fixture, testovací framework a volba lokálního statického serveru. Žádný renderer ani backend se touto změnou neimplementuje.
