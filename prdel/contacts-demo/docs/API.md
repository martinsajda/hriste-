# API kontrakt v1

Base URL: `/api/contacts`, JSON UTF-8.

## GET /api/contacts
200 OK: `[{"id":1,"firstName":"Jan","lastName":"Novák","phone":"+420123456789"}]` seřazeno podle LastName, FirstName, Id.

## POST /api/contacts
Body: `{"firstName":"Jan","lastName":"Novák","phone":"+420123456789"}`.
201 Created + objekt s `id` a hlavičkou Location. Při chybě validace 400. Limity: jméno/příjmení 1–100 znaků, telefon 1–40 znaků po trimování.

## DELETE /api/contacts/{id}
204 No Content při úspěchu; 404 Not Found pro neexistující ID.

Případné změny kontraktu schvaluje Martin přes orchestrátora.
