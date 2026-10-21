# Editor zdrojů dat a aplikačních REST kontraktů

**Stav:** Koncepce, implementace odložena.

Vizuální konfigurace vazeb mezi komponentami a **konkrétními aplikačními REST operacemi**: HTTP metoda, URL/route, parametry, mapování požadavku a odpovědi, případně obálka dat, chyby a omezení endpointu.

## Hranice
- Standardizovaný je význam metadat a typovaných dat, nikoli univerzální CRUD servisní rozhraní.
- Endpointy jsou specifické pro aplikaci a entitu; mohou používat SQL, FetchXML, SDK, externí API i composite providery.
- Editor nesmí vyžadovat veřejné `IOrganizationService` ani `IDataProvider` CRUD metody.
- Žádné přihlašovací údaje, API klíče ani důvěryhodné `CurrentUserId` v publikovaných frontendových metadatech. Autentizaci řeší host, autorizaci backend.
- Editor popisuje kontrakty a vazby; neslouží jako nástroj pro přímé zpřístupnění interních backendových služeb.

## Otevřené otázky
Přesný JSON Schema, transformace a typová kontrola payloadů, dynamické parametry, ověřování endpointů, rozdíly prostředí DEV/TEST/PROD, bezpečnost a oprávnění.
