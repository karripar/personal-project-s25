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

---

## Suunnitelma API-päätteille

### Users

- POST /users 
- GET /users
- GET /users/:id 
- PUT /users/:id
- DELETE /users/:id

### User authentication

- POST /auth/login
- POST /auth/logout
- POST /auth/refresh (tokenin päivitys)

### Material

- POST /materials 
- GET /materials 
- GET /materials/:id 
- PUT /materials/:id 
- DELETE /materials/:id 

### Tags

- POST /tags 
- GET /tags 
- GET /tags/:id 
- PUT /tags/:id 
- DELETE /tags/:id 

### Tags

- POST /tags 
- GET /tags 
- GET /tags/:id 
- PUT /tags/:id 
- DELETE /tags/:id 

### Material Tags

- POST /materials/:id/tags - Add tags to a material.
- DELETE /materials/:id/tags/:tagId - Remove a tag from a material.

### Comments

- POST /materials/:id/comments - Add a comment to a material.
- GET /materials/:id/comments - Get all comments for a material.
- GET /comments/:id - Get a specific comment by ID.
- PUT /comments/:id - Update a comment (admin).
- DELETE /comments/:id - Delete a comment (author or admin).

### Likes

- POST /materials/:id/likes - Like a material.
- POST /comments/:id/likes - Like a comment.
- DELETE /materials/:id/likes - Remove a like from a material.
- DELETE /comments/:id/likes - Remove a like from a comment.

### Ratings

- POST /materials/:id/ratings - Rate a material.
- GET /materials/:id/ratings - Get all ratings for a material (average rating and individual ratings).

### Follows

- POST /follows - Follow a user.
- DELETE /follows/:id - Unfollow a user.
- GET /users/:id/followers - Get all followers of a user.
- GET /users/:id/following - Get all users a user is following.

### Notifications

- GET /notifications - Get all notifications for the current user.
- PUT /notifications/:id/mark-read - Mark a notification as read.
- DELETE /notifications/:id - Delete a notification.

### Analytics

- GET /materials/ratings - Get average ratings for all materials (from the MaterialRatings view).
- GET /materials/comments - Get a list of materials and their comment counts (from the MaterialComments view).
- GET /users/activity - Get user activity stats (from the UserActivity view).
- GET /users/:id/notifications - Get unread notification counts for a user (from the UserNotifications view).

### Latest Data

- GET /materials/latest - Get the latest uploaded materials (from the LatestMaterials view).
- GET /notifications/latest - Get the latest notifications (from the LatestNotifications view).

### Search

- GET /search/materials - Search for materials by title, tags, or description.