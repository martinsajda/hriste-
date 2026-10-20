# Architektura a rozhodnutí

- Jedna ASP.NET Core 10 aplikace hostovaná na IIS (ASP.NET Core Module), backend a statický frontend v jednom deploymentu.
- SQL Server databáze `ContactsDemo`, tabulka `dbo.Contacts`.
- Komunikace přes JSON REST na `/api/contacts`.
- Frontend je vanilla HTML/CSS/JS, žádný Node build.
- DB connection string přes prostředí `ConnectionStrings__ContactsDb`; žádná hesla v repozitáři.
- Ukázka nemá autentizaci. **Nevystavovat veřejně na internet bez doplnění autentizace, autorizace, HTTPS a dalších bezpečnostních opatření.**
- Úlohy: DB → potvrzení schématu/kontraktu → backend + frontend → QA → orchestrátor review → Martin.
- Omezení: jednoduchá demonstrace bez editace kontaktů, paginace a produkční observability.
