# Sovelluksen nimi: **ScriptFlow**

---

## Kuvaus:
**ScriptFlow** on etenkin IT-alojen opiskelijoiden yhteisöllinen alusta, jossa käyttäjät voivat jakaa muistiinpanoja, PDF-tiedostoja ja kuvia. Sovelluksen avulla opiskelijat voivat löytää ja jakaa materiaalia eri kursseilta, jakaa opiskelukokemuksia ja tukea toisiaan opintojen aikana esimerkiksi kommentoimalla toisten julkaisuja. Sovelluksessa on esimerkiksi helppo jakaa koodiratkaisuja yleisiin ongelmiin.

---

## Toiminnot:

### 1. Käyttäjäprofiilit:
- Käyttäjät voivat luoda profiilin, johon he voivat lisätä tietoja itsestään (esim. opiskeltavat aineet, kurssit, kiinnostuksen kohteet).
- Profiilissa voi olla mahdollisuus seurata muita opiskelijoita ja saada ilmoituksia uusista julkaisuista.

### 2. Materiaalin jakaminen:
- Käyttäjät voivat ladata ja jakaa muistiinpanoja (tekstitiedostoja), PDF-tiedostoja, kuvia ja muita opiskelumateriaaleja.
- Mahdollisuus lisätä kuvauksia ja tageja (esim. kurssin nimi, aihealue), jotta materiaalin löytäminen olisi helpompaa.
- Julkaisujen yksityisyysasetukset, kuten "julkinen", "vain seuraajille".

### 3. Haku ja suodatus:
- Materiaalit voidaan etsiä hakusanojen, kurssin nimen, aiheen tai jopa materiaalin tyypin (muistiinpanot, PDF, kuvat) perusteella.
- Suodattimet, kuten kurssit, opiskeluvuosi tai suosituimmat materiaalit.

### 4. Keskustelu ja kommentointi:
- Käyttäjät voivat kommentoida ja keskustella jakamistaan materiaaleista, tarjota lisävinkkejä tai kysyä tarkennuksia.
- Mahdollisuus lisätä keskusteluketjuja ja jakaa kysymyksiä ja vastauksia.

### 5. Arvostelut ja suositukset:
- Käyttäjät voivat arvostella ja suositella materiaaleja muiden opiskelijoiden käyttöön.
- Arvostelujen perusteella käyttäjät voivat löytää suosituimmat ja hyödyllisimmät materiaalit.

### 6. Ilmoitukset:
- Käyttäjät saavat ilmoituksia uusista julkaisuista, kommenteista ja seurattujen käyttäjien aktiviteeteista.

### 7. Yksityisyys ja turvallisuus:
- Käyttäjät voivat valita, mitä materiaaleja he jakavat julkisesti ja mitä jää vain tietylle käyttäjäryhmälle.
- Mahdollisuus määrittää materiaalin jakamisen aikarajat tai poistaa materiaali myöhemmin.


## Tekniset vaatimukset:

- **Frontend:** React ja TypeScript.
- **Backend:** Node.js ja Express (RESTful-arkkitehtuuri).
- **Tietokanta:** MySQL/MariaDB käyttäjätietojen, materiaalien ja keskusteluiden tallentamiseen.
- **Tiedostojen hallinta:** Tiedostojen lataus ja tallennus
- **Autentikointi:** Käyttäjien rekisteröinti ja kirjautuminen (JWT).
- **Responsiivinen käyttöliittymä:** Bootstrap tai Tailwind CSS, valinta tarkentuu lähempänä varsinaista kehitystä.
- **Progressiivinen web-sovellus:** Vite PWA toiminnallisuus.


