# QA smoke test — checklist (dosud neprovedeno)

1. `dotnet restore` a `dotnet build` ve `src/Contacts.Api`.
2. Vytvoř prázdnou DB ContactsDemo, spusť DDL dvakrát (idempotence).
3. Nastav connection string a spusť `dotnet run`.
4. GET /api/contacts vrací 200 a pole.
5. POST platný kontakt vrací 201 a Location; další GET jej obsahuje.
6. POST prázdné jméno / příjmení / telefon vrací 400; příliš dlouhé hodnoty vrací 400.
7. DELETE existujícího ID vrací 204; druhé smazání 404.
8. Ve formuláři ověř uložení, načtení, smazání a escapování HTML znaků.
9. `dotnet publish -c Release`; deployment na testovací IIS s Hosting Bundle, aplikační pool No Managed Code.
10. Ověř SQL účet s minimálními právy a HTTPS. **Nevystavuj demo veřejně bez autentizace.**

Výsledky vyplní QA agent až po skutečném provedení.
