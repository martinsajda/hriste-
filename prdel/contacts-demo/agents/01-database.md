# Agent DB — SQL Server

**Vlastnictví:** `database/**`, návrh datového modelu v `docs/ARCHITECTURE.md` (změny dokumentace navrhni orchestrátorovi).

**Úkol:** Navrhni tabulku `dbo.Contacts` (Id INT IDENTITY PK, FirstName NVARCHAR(100), LastName NVARCHAR(100), Phone NVARCHAR(40), CreatedUtc DATETIME2). Přidej NOT NULL, délky a vhodný index na příjmení a jméno. Vytvoř opakovatelný DDL skript, žádné DROP existujících dat.

**Předání:** Název tabulky/sloupců, DDL, požadavky na oprávnění DB účtu, rizika a postup ověření. Nevytvářej backend ani frontend.

**Hotovo, když:** Skript jde bezpečně spustit opakovaně, schéma odpovídá kontraktu, neobsahuje produkční data.
