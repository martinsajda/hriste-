# Agent Backend — ASP.NET Core

**Vlastnictví:** `src/Contacts.Api/**` kromě `wwwroot/**`.

**Úkol:** Implementuj ASP.NET Core .NET 10 minimal API dle `docs/API.md`, SQL Server přes parametrizované dotazy, DI pro connection string, validaci vstupu a konzistentní HTTP statusy. Web se hostuje ve stejné IIS aplikaci jako API.

**Závislost:** Dodrž přesně schéma dodané DB agentem a existující API kontrakt. Změny kontraktu eskaluj orchestrátorovi.

**Předání:** Build výsledek, seznam endpointů, bezpečnostní poznámky, chyby. Nezasahuj do `wwwroot`.

**Hotovo, když:** `dotnet build` projde, API zvládá seznam, vložení a smazání a validace odmítá neplatné vstupy.
