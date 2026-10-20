const form = document.querySelector('#contactForm');
const tbody = document.querySelector('#contacts');
const message = document.querySelector('#message');

async function loadContacts() {
  const response = await fetch('/api/contacts');
  if (!response.ok) throw new Error('Načtení kontaktů selhalo.');
  const contacts = await response.json();
  tbody.replaceChildren();
  for (const contact of contacts) {
    const tr = document.createElement('tr');
    for (const key of ['firstName', 'lastName', 'phone']) {
      const td = document.createElement('td');
      td.textContent = contact[key];
      tr.append(td);
    }
    const td = document.createElement('td');
    const button = document.createElement('button');
    button.textContent = 'Smazat';
    button.addEventListener('click', async () => {
      if (!confirm('Opravdu smazat kontakt?')) return;
      try {
        const response = await fetch('/api/contacts/' + encodeURIComponent(contact.id), { method: 'DELETE' });
        if (!response.ok) throw new Error('Smazání selhalo.');
        message.textContent = '';
        await loadContacts();
      } catch (error) { message.textContent = error.message; }
    });
    td.append(button); tr.append(td); tbody.append(tr);
  }
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch('/api/contacts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    if (!response.ok) throw new Error('Uložení selhalo. Zkontroluj vstupní údaje.');
    form.reset(); message.textContent = ''; await loadContacts();
  } catch (error) { message.textContent = error.message; }
});
loadContacts().catch(error => { message.textContent = error.message; });
