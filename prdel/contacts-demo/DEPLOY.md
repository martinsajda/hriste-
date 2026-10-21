# DEPLOY — publikace Contacts Demo na webhostingu

**Stav:** předběžný plán budoucího nasazení; není implementováno ani nakonfigurováno.

## Cíl

Po dokončení lokální demonstrační aplikace ji vystavit na internetu na uživatelově stávajícím webhostingu s podporou **PHP**.

- **Frontend:** statické HTML, CSS, JavaScript a JSON metadata; zůstane společný pro lokální Node.js i veřejnou PHP variantu.
- **Backend:** vytvořit **PHP implementaci** stejného REST API v1, které je definováno v [docs/API.md](docs/API.md). Node.js proces se na PHP webhostingu nepředpokládá.
- **Databáze:** prozatím SQLite podle [docs/DATOVY_MODEL.md](docs/DATOVY_MODEL.md), pokud hosting podporuje PDO SQLite a zapisovatelný prostor. Databázový soubor musí být mimo veřejně přístupný webový adresář.

## Automatizované nahrávání přes FTP

Plánujeme **automatizované nasazování souborů přes FTP server webhostingu**. Konkrétní nástroj, spouštěč nasazení (např. ručně nebo z GitHub Actions), cílové adresáře a přihlašovací údaje určíme později.

Preferovat **FTPS (FTP přes TLS)** nebo **SFTP**, pokud jej hosting podporuje; neodesílat hesla ani zdrojové soubory přes nešifrované FTP. Přihlašovací údaje ukládat do bezpečného úložiště tajemství, nikdy do Git repozitáře.

Nasazovat pouze soubory potřebné pro web (frontend, PHP backend a nutnou konfiguraci). Nevystavovat `data/contacts.db`, interní dokumentaci, testy ani tajemství jako veřejně stažitelné soubory.

## Před veřejným spuštěním dořešit

- Přesné parametry hostingu: PHP verze, dostupnost PDO SQLite, FTP/FTPS/SFTP, struktura webrootu.
- Routování `/api/contacts` a `/api/telephones` na PHP backend, včetně metod PUT/DELETE.
- Konfiguraci HTTPS, autentizaci/autorizaci a ochranu osobních údajů; lokální prototyp nyní žádné přihlašování nemá.
- Oddělení produkčních dat a konfigurace od nahrávaného kódu; zálohování SQLite.
- Postup automatického nasazení, testu po deployi a případného návratu k předchozí verzi.

**Důležité:** Tento dokument pouze zaznamenává odsouhlasený směr. FTP přístup, PHP backend ani veřejný web nyní nevytváříme.
