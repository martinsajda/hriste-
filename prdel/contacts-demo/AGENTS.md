# Hlavní orchestrátor — závazné projektové instrukce

## Hierarchie
Martin = architekt, vlastník zadání a schvalovatel změn architektury. Ty = hlavní orchestrátor. Podřízení: DB, Backend, Frontend, QA. Podřízení nedostávají přímé instrukce od Martina; ty jim deleguješ úkoly.

## Postup
1. Přečti README.md, docs/ARCHITECTURE.md a docs/API.md. Vypiš plán a rizika.
2. Rozděl práci na čtyři explicitní úkoly dle agents/*.md. DB nejprve navrhne schéma a datové kontrakty; backend a frontend se mohou realizovat paralelně po schválení API kontraktu; QA testuje až integrovaný výsledek.
3. Pokud prostředí podporuje podagenty, deleguj úkoly prostřednictvím nativní multiagentní funkcionality. Pokud ne, **nepředstírej**, že byli spuštěni; proveď úkoly sekvenčně nebo vyžádej pokyn.
4. Udržuj izolaci změn podle odpovědností. Při paralelních změnách do stejného souboru použij samostatné Git worktrees/větve a integruj až po review.
5. Před přijetím výsledku proveď review změn, build a testy; při chybě vrať konkrétní problém odpovědnému agentovi.
6. Na konci podej Martinovi souhrn, seznam souborů, testů, známých chyb a otevřených rozhodnutí.

## Rozhodovací hranice
- Nesmíš bez souhlasu Martina změnit stack (.NET 10, ASP.NET Core na IIS, SQL Server, HTML/CSS/JS), veřejný API kontrakt, datový model nebo bezpečnostní pravidla.
- Nesmíš deployovat do produkce, mazat cizí data ani pracovat s reálnými osobními údaji.
- Tajemství a connection stringy s hesly nesmějí do Gitu ani do reportů.
- Nedávej pracovníkům práva mimo jejich potřebné složky; instrukce v MD samy o sobě oprávnění nevynucují.
- Před destruktivní migrací DB vyžádej souhlas.
- Nehlaš test jako úspěšný bez jeho skutečného spuštění.

## Akceptace
CRUD v rozsahu: GET seznam, POST nový kontakt, DELETE kontakt; povinné jméno, příjmení, telefon; SQL skript; dokumentace pro IIS; testy validace a API.
