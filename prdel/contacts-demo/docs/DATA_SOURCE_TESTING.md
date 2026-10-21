# Budoucí testování grid rendereru — tři režimy dat

**Stav:** schválený architektonický záměr; zatím bez implementace rendereru, adapterů, backendu a databáze.

## Cíl
Testovat stejný metadata-driven renderer bez povinného Node.js procesu nebo databáze. Přepnutí datového zdroje nesmí měnit definici gridu.

## Režimy
| Mode | Zdroj | Požadavky |
| --- | --- | --- |
| `embedded` | Zabalená JS data a metadata, bez fetch | Funguje přímo přes `file://`, bez serveru |
| `mockHttp` | Statický JSON přes HTTP GET/fetch | Stačí jednoduchý statický HTTP server, bez Node.js aplikačního backendu a databáze |
| `rest` | Skutečné REST API a databáze | Běžící aplikační backend |

## Zásady
- Renderer volá jednotné asynchronní rozhraní `dataSource.execute(request)`; adaptéry vracejí shodnou strukturu dat a stránkování.
- Režim se volí centrálně (budoucí `app.config.json`), nikoliv úpravou každého gridu.
- Pro `file://` zabalit do klasických JS skriptů **také metadata a konfiguraci**; nespoléhat na `fetch()` lokálních JSON ani na JS moduly.
- `mockHttp` přes fetch načte statický dataset. Filtrování, řazení, stránkování a simulace odpovědí REST probíhají v klientském adaptéru.
- Statický JSON soubor **není skutečný dynamický GET endpoint** a neumí zpracovat query parametry ani POST. Pro skutečné odchytávání URL by bylo nutné pozdější rozšíření (Service Worker/MSW/mock server).
- Mock adaptéry mohou simulovat `POST /api/contacts/search` a CRUD v paměti. Produkční `rest` volá skutečné endpointy.
- Sdílené fixture dataset a deterministické testy musí pokrýt prázdné výsledky, chyby, zpoždění, řazení, globální hledání, typové filtry a stránkování.
- `localStorage` při `file://` nemusí mít mezi prohlížeči konzistentní chování; jeho dostupnost nesmí být podmínkou základního zobrazení gridu.

## Ilustrativní centrální nastavení (zatím neměnit app.config.json)
```json
{
  "dataAccess": {
    "mode": "embedded",
    "mock": {
      "latencyMs": 0,
      "simulateErrors": false
    }
  }
}
```

## Budoucí testy
1. Otevřít HTML přímo jako `file://` bez procesu a zobrazit grid ze zabalených dat.
2. Přes jednoduchý HTTP server načíst stejná testovací data pomocí fetch GET.
3. Přepnout na skutečné REST API s databází bez změny rendereru a metadat.
4. Porovnat výsledky řazení, filtrování, stránkování a výběru napříč režimy.
5. Samostatně ověřit chování exportu a ukládaných pohledů.

**Odloženo:** konkrétní implementace adapterů, struktura fixture souborů, simulace HTTP endpointů a testovací framework. K tématu se vrátíme při zahájení implementace rendereru.
