# API v1
GET /api/contacts → 200 JSON pole `[{ "id":1, "firstName":"Jan", "lastName":"Novák", "phone":"123" }]`, řazení podle příjmení, jména, ID.

POST /api/contacts → JSON `{"firstName":"Jan","lastName":"Novák","phone":"123"}`; 201 Created, Location a vytvořený objekt. Neplatné hodnoty 400. Délky po trimování: firstName 1–100, lastName 1–100, phone 1–40.

DELETE /api/contacts/:id → 204 při smazání, 404 při neexistujícím ID.
