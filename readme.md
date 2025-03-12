# Sovelluksen nimi: **MyLens**

---

## Kuvaus:

**MyLens** on sosiaalinen medianjakoalusta, jossa käyttäjät voivat julkaista kuvia ja videoita, tykätä ja kommentoida vapaasti julkaisuja sekä tallentaa mediaa suosikeiksi. Käyttäjät voivat vapaasti seurata muita käyttäjiä. Sovellus on ottanut inspiraatiota suosituimpien sosiaalisten medioiden ja viihdealustojen käyttöliittymistä.

---

## Toiminnot:

### 1. Käyttäjäprofiilit:

- Käyttäjät voivat luoda profiilin, johon he voivat lisätä tietoja itsestään
- Profiilin avulla saa auki mahdollisuuden tykätä, kommentoida, jakaa mediaa sekä seurata käyttäjiä.
- Käyttäjän omaava saa auki "following"-feedin jossa näkyy vain seurattujen käyttäjien media.
- Normaali käyttäjä voi poistaa julkaisunsa tai halutessaan koko tilinsä, joka poistaa myös tilin julkaiseman sisällön.
- Profiilikuvan lisääminen ja vaihtaminen. Vaihtaessa profiilikuvan, vanha kuva poistetaan myös taustapalvelun tiedostoista.
- Julkisesti esillä olevien tietojen muokkaaminen, kuten profiilin kuvauksen ja käyttäjänimen muokkaus.
- Ilman aktiivista käyttäjätiliä interaktiivisuus on hyvin rajallista.
- Muiden käyttäjien julkaisut näkee vierailemalla heidän tilillään.

### 2. Materiaalin jakaminen:

- Käyttäjät voivat ladata ja jakaa mediatiedostoja, eli kuvia ja videoita.
- Mahdollisuus lisätä kuvauksia ja tageja (esim. aihe), jotta materiaalin löytäminen olisi helpompaa.
- Julkaisussa olevaa tagia klikkaamalla tai oikeaan osoitteeseen navigoimalla saa esiin kaikki saman tagin sisältävät julkaisut.

### 3. Haku ja suodatus:

- Materiaalit voidaan etsiä hakusanojen, nimen, aiheen tai tagien avulla.
- Haku toimii dynaamisesti ilman haku-painikkeen painamista.
- Mahdollisuus hakea myös muita käyttäjiä nimeltä.

### 4. Keskustelu ja kommentointi:

- Käyttäjät voivat kommentoida ja keskustella jakamistaan medioista kommenttikentissä. Sovelluksessa on mahdollisuus vastata kommentteihin, jolloin kommentti liitetään alkuperäisen kommentin alle.

### 5. Ylläpitäjien oikeudet

- Ylläpitäjät voivat poistaa kommentteja (oikeus vain ylläpitäjillä), käyttäjien julkaisuja ja myös tilejä.

### 6. Tiedossa olevat ongelmat ja puutteet:

- API-kutsut eivät toimi mobiililaitteella tuntemattomasta syystä. Cors-asetukset ovat päällä ja rajoituksia ei pitäisi olla. USB-debuggausta on kokeiltu puhelimella mutta konsoliin ei ilmesty virheviestejä ja network-osiossa näkyy vain "waiting" kutsuissa ilman vastausta.

- Alkuperäisestä suunnitelmasta poiketen ilmoitukset ei ole käytössä vaikka niille tehtiinkin endpointit.

## Tekninen toteutus:

- **Frontend:** React ja TypeScript.
- **Backend:** Node.js ja Express (RESTful-arkkitehtuuri).
- **Tietokanta:** MySQL/MariaDB käyttäjätietojen, materiaalien ja keskusteluiden tallentamiseen.
- **Tiedostojen hallinta:** Tiedostojen lataus ja tallennus
- **Autentikointi:** Käyttäjien rekisteröinti ja kirjautuminen (JWT).
- **Responsiivinen käyttöliittymä:** Tailwind CSS
- **Progressiivinen web-sovellus:** Vite PWA toiminnallisuus.

## Kolmannen osapuolen kirjastot ja lisäosat:

- **[Lucide React](https://lucide.dev/guide/):** Vapaasti käytettävä ikonikirjasto Reactille.
- **[Robohash](https://robohash.org/):** Oletusprofiilikuvat käyttäjille.
- **[FFmpeg](https://www.ffmpeg.org/about.html):** Multimedia framework mediatiedostojen käsittelylle taustapalvelussa.
- **[Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction):** Kommenttien, tykkäysten ja suosikkien tilan ja arvojen varastoimiseen sekä käsittelyyn.§

---

## Tietokannan kuvaus:

# mylens documentation

## Summary

- [Introduction](#introduction)
- [Database Type](#database-type)
- [Table Structure](#table-structure)
  - [Users](#Users)
  - [UserLevels](#UserLevels)
  - [ProfilePictures](#ProfilePictures)
  - [MediaItems](#MediaItems)
  - [Tags](#Tags)
  - [MediaTags](#MediaTags)
  - [Comments](#Comments)
  - [Likes](#Likes)
  - [Follows](#Follows)
  - [Favorites](#Favorites)
- [Relationships](#relationships)
- [Database Diagram](#database-Diagram)

## Introduction

## Database type

- **Database system:** MySQL

## Table structure

### Users

| Name              | Type         | Settings                                | References          | Note |
| ----------------- | ------------ | --------------------------------------- | ------------------- | ---- |
| **user_id**       | INTEGER      | 🔑 PK, not null , unique, autoincrement |                     |      |
| **username**      | VARCHAR(255) | not null , unique                       |                     |      |
| **password_hash** | VARCHAR(255) | not null                                |                     |      |
| **email**         | VARCHAR(255) | not null , unique                       |                     |      |
| **bio**           | TEXT(65535)  | not null                                |                     |      |
| **user_level_id** | INTEGER      | not null                                | Users.user_level_id |      |
| **created_at**    | TIMESTAMP    | not null                                |                     |      |

### UserLevels

| Name              | Type         | Settings                                | References | Note |
| ----------------- | ------------ | --------------------------------------- | ---------- | ---- |
| **user_level_id** | INTEGER      | 🔑 PK, not null , unique, autoincrement |            |      |
| **level_name**    | VARCHAR(255) | not null                                |            |      |

### ProfilePictures

| Name                   | Type         | Settings                                | References    | Note |
| ---------------------- | ------------ | --------------------------------------- | ------------- | ---- |
| **profile_picture_id** | INTEGER      | 🔑 PK, not null , unique, autoincrement |               |      |
| **user_id**            | INTEGER      | not null                                | Users.user_id |      |
| **filename**           | VARCHAR(255) | not null                                |               |      |
| **media_type**         | VARCHAR(255) | not null                                |               |      |
| **filesize**           | INTEGER      | not null                                |               |      |
| **created_at**         | TIMESTAMP    | not null                                |               |      |

### MediaItems

| Name            | Type         | Settings                                | References    | Note |
| --------------- | ------------ | --------------------------------------- | ------------- | ---- |
| **media_id**    | INTEGER      | 🔑 PK, not null , unique, autoincrement |               |      |
| **user_id**     | INTEGER      | not null                                | Users.user_id |      |
| **filename**    | VARCHAR(255) | not null                                |               |      |
| **thumbnail**   | VARCHAR(255) | not null                                |               |      |
| **filesize**    | INTEGER      | not null                                |               |      |
| **media_type**  | VARCHAR(255) | not null                                |               |      |
| **title**       | VARCHAR(255) | not null                                |               |      |
| **description** | TEXT(65535)  | not null                                |               |      |
| **created_at**  | TIMESTAMP    | not null                                |               |      |

### Tags

| Name         | Type         | Settings                                | References | Note |
| ------------ | ------------ | --------------------------------------- | ---------- | ---- |
| **tag_id**   | INTEGER      | 🔑 PK, not null , unique, autoincrement |            |      |
| **tag_name** | VARCHAR(255) | not null                                |            |      |

### MediaTags

| Name             | Type    | Settings                                | References          | Note |
| ---------------- | ------- | --------------------------------------- | ------------------- | ---- |
| **media_tag_id** | INTEGER | 🔑 PK, not null , unique, autoincrement |                     |      |
| **media_id**     | INTEGER | not null                                | MediaItems.media_id |      |
| **tag_id**       | INTEGER | not null                                | Tags.tag_id         |      |

### Comments

| Name                     | Type        | Settings                                | References          | Note |
| ------------------------ | ----------- | --------------------------------------- | ------------------- | ---- |
| **comment_id**           | INTEGER     | 🔑 PK, not null , unique, autoincrement |                     |      |
| **media_id**             | INTEGER     | not null                                | MediaItems.media_id |      |
| **user_id**              | INTEGER     | not null                                | Users.user_id       |      |
| **comment_text**         | TEXT(65535) | not null                                |                     |      |
| **reference_comment_id** | INTEGER     | not null                                | Comments.comment_id |      |
| **created_at**           | TIMESTAMP   | not null                                |                     |      |

### Likes

| Name           | Type      | Settings                                | References          | Note |
| -------------- | --------- | --------------------------------------- | ------------------- | ---- |
| **like_id**    | INTEGER   | 🔑 PK, not null , unique, autoincrement |                     |      |
| **media_id**   | INTEGER   | not null                                | MediaItems.media_id |      |
| **user_id**    | INTEGER   | not null                                | Users.user_id       |      |
| **created_at** | TIMESTAMP | not null                                |                     |      |

### Follows

| Name            | Type      | Settings                                | References    | Note |
| --------------- | --------- | --------------------------------------- | ------------- | ---- |
| **follow_id**   | INTEGER   | 🔑 PK, not null , unique, autoincrement |               |      |
| **follower_id** | INTEGER   | not null                                | Users.user_id |      |
| **followed_id** | INTEGER   | not null                                | Users.user_id |      |
| **created_at**  | TIMESTAMP | not null                                |               |      |

### Favorites

| Name            | Type      | Settings                                | References          | Note |
| --------------- | --------- | --------------------------------------- | ------------------- | ---- |
| **favorite_id** | INTEGER   | 🔑 PK, not null , unique, autoincrement |                     |      |
| **user_id**     | INTEGER   | not null                                | Users.user_id       |      |
| **media_id**    | INTEGER   | not null                                | MediaItems.media_id |      |
| **created_at**  | TIMESTAMP | not null                                |                     |      |

## Relationships

- **ProfilePictures to Users**: one_to_one
- **Users to UserLevels**: one_to_one
- **Favorites to MediaItems**: one_to_one
- **Favorites to Users**: one_to_one
- **Likes to MediaItems**: one_to_one
- **Likes to Users**: one_to_one
- **MediaTags to MediaItems**: one_to_one
- **MediaTags to Tags**: one_to_one
- **Comments to MediaItems**: one_to_one
- **Comments to Users**: one_to_one
- **Comments to Comments**: one_to_one
- **Follows to Users**: one_to_one
- **Follows to Users**: one_to_one
- **MediaItems to Users**: one_to_one

## Database Diagram

```mermaid
erDiagram
	ProfilePictures ||--|| Users : references
	Users ||--|| UserLevels : references
	Favorites ||--|| MediaItems : references
	Favorites ||--|| Users : references
	Likes ||--|| MediaItems : references
	Likes ||--|| Users : references
	MediaTags ||--|| MediaItems : references
	MediaTags ||--|| Tags : references
	Comments ||--|| MediaItems : references
	Comments ||--|| Users : references
	Comments ||--|| Comments : references
	Follows ||--|| Users : references
	Follows ||--|| Users : references
	MediaItems ||--|| Users : references

	Users {
		INTEGER user_id
		VARCHAR(255) username
		VARCHAR(255) password_hash
		VARCHAR(255) email
		TEXT(65535) bio
		INTEGER user_level_id
		TIMESTAMP created_at
	}

	UserLevels {
		INTEGER user_level_id
		VARCHAR(255) level_name
	}

	ProfilePictures {
		INTEGER profile_picture_id
		INTEGER user_id
		VARCHAR(255) filename
		VARCHAR(255) media_type
		INTEGER filesize
		TIMESTAMP created_at
	}

	MediaItems {
		INTEGER media_id
		INTEGER user_id
		VARCHAR(255) filename
		VARCHAR(255) thumbnail
		INTEGER filesize
		VARCHAR(255) media_type
		VARCHAR(255) title
		TEXT(65535) description
		TIMESTAMP created_at
	}

	Tags {
		INTEGER tag_id
		VARCHAR(255) tag_name
	}

	MediaTags {
		INTEGER media_tag_id
		INTEGER media_id
		INTEGER tag_id
	}

	Comments {
		INTEGER comment_id
		INTEGER media_id
		INTEGER user_id
		TEXT(65535) comment_text
		INTEGER reference_comment_id
		TIMESTAMP created_at
	}

	Likes {
		INTEGER like_id
		INTEGER media_id
		INTEGER user_id
		TIMESTAMP created_at
	}

	Follows {
		INTEGER follow_id
		INTEGER follower_id
		INTEGER followed_id
		TIMESTAMP created_at
	}

	Favorites {
		INTEGER favorite_id
		INTEGER user_id
		INTEGER media_id
		TIMESTAMP created_at
	}
```
