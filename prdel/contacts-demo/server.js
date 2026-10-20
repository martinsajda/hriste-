const express = require('express');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');

const app = express();
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'contacts.db'));
db.exec(`
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL CHECK(length(trim(first_name)) BETWEEN 1 AND 100),
  last_name TEXT NOT NULL CHECK(length(trim(last_name)) BETWEEN 1 AND 100),
  phone TEXT NOT NULL CHECK(length(trim(phone)) BETWEEN 1 AND 40),
  created_utc TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS ix_contacts_name ON contacts(last_name, first_name, id);
`);
app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const all = db.prepare('SELECT id, first_name AS firstName, last_name AS lastName, phone FROM contacts ORDER BY last_name, first_name, id');
const insert = db.prepare('INSERT INTO contacts (first_name, last_name, phone) VALUES (?, ?, ?)');
const byId = db.prepare('SELECT id, first_name AS firstName, last_name AS lastName, phone FROM contacts WHERE id = ?');
const remove = db.prepare('DELETE FROM contacts WHERE id = ?');

app.get('/api/contacts', (req, res) => res.json(all.all()));
app.post('/api/contacts', (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Invalid JSON object' });
  const fields = ['firstName', 'lastName', 'phone'];
  const values = fields.map(k => typeof body[k] === 'string' ? body[k].trim() : '');
  if (values.some((v, i) => v.length < 1 || v.length > (i === 2 ? 40 : 100))) {
    return res.status(400).json({ error: 'Invalid firstName, lastName or phone' });
  }
  const result = insert.run(...values);
  const id = Number(result.lastInsertRowid);
  res.status(201).location('/api/contacts/' + id).json(byId.get(id));
});
app.delete('/api/contacts/:id', (req, res) => {
  if (!/^[1-9]\d*$/.test(req.params.id) || !Number.isSafeInteger(Number(req.params.id))) return res.sendStatus(404);
  const result = remove.run(Number(req.params.id));
  return res.sendStatus(result.changes ? 204 : 404);
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, '127.0.0.1', () => console.log('Contacts Demo: http://localhost:' + port));
}
module.exports = app;
