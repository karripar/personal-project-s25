# Sovelluksen nimi: **WildLens**

---

## Kuvaus:
**WildLens** on etenkin retkeilijöiden ja luonnossa liikkuvien yhteisöllinen alusta, jossa käyttäjät voivat jakaa kuvia, videoita, huomioita ja muuta olennaista. Sovelluksen avulla voidaan löytää alueella havaittuja eläimiä, vedenlaatuongelmia, sinilevähuomioita, marjasadon tilanteita ja muuta aiheeseen liittyvää.

---

## Toiminnot:

### 1. Käyttäjäprofiilit:
- Käyttäjät voivat luoda profiilin, johon he voivat lisätä tietoja itsestään
- Profiilissa voi olla mahdollisuus seurata muita käyttäjiä ja saada ilmoituksia uusista julkaisuista.

### 2. Materiaalin jakaminen:
- Käyttäjät voivat ladata ja jakaa mediatiedostoja, PDF-tiedostoja, kuvia ja muita materiaaleja.
- Mahdollisuus lisätä kuvauksia ja tageja (esim. eläinlaji, aihe), jotta materiaalin löytäminen olisi helpompaa.
- Julkaisujen yksityisyysasetukset, kuten "julkinen", "vain seuraajille".

### 3. Haku ja suodatus:
- Materiaalit voidaan etsiä hakusanojen, nimen, aiheen tai jopa materiaalin tyypin (muistiinpanot, PDF, kuvat) perusteella.
- Suodattimet

### 4. Keskustelu ja kommentointi:
- Käyttäjät voivat kommentoida ja keskustella jakamistaan mediioista, tarjota lisävinkkejä tai kysyä tarkennuksia.
- Mahdollisuus lisätä keskusteluketjuja ja jakaa kysymyksiä ja vastauksia.

### 5. Arvostelut ja suositukset:
- Käyttäjät voivat arvostella ja suositella materiaaleja muiden käyttäjien käyttöön.
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

### Media

- POST /media 
- GET /media 
- GET /media/:id 
- PUT /media/:id 
- DELETE /media/:id 

### Tags

- POST /tags 
- GET /tags 
- GET /tags/:id 
- PUT /tags/:id 
- DELETE /tags/:id 

### Media Tags

- POST /media/:id/tags - Add tags to a media.
- DELETE /media/:id/tags/:tagId - Remove a tag from a media.

### Comments

- POST /media/:id/comments - Add a comment to a media.
- GET /media/:id/comments - Get all comments for a media.
- GET /comments/:id - Get a specific comment by ID.
- PUT /comments/:id - Update a comment (admin).
- DELETE /comments/:id - Delete a comment (author or admin).

### Likes

- POST /media/:id/likes - Like a media.
- POST /comments/:id/likes - Like a comment.
- DELETE /media/:id/likes - Remove a like from a media.
- DELETE /comments/:id/likes - Remove a like from a comment.

### Ratings

- POST /media/:id/ratings - Rate a media.
- GET /media/:id/ratings - Get all ratings for a media (average rating and individual ratings).

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

- GET /media/ratings - Get average ratings for all medias (from the mediaRatings view).
- GET /media/comments - Get a list of medias and their comment counts (from the mediaComments view).
- GET /users/activity - Get user activity stats (from the UserActivity view).
- GET /users/:id/notifications - Get unread notification counts for a user (from the UserNotifications view).

### Latest Data

- GET /media/latest - Get the latest uploaded medias (from the Latestmedias view).
- GET /notifications/latest - Get the latest notifications (from the LatestNotifications view).

### Search

- GET /search/media - Search for medias by title, tags, or description.