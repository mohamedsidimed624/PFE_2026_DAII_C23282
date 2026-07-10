# Plateforme ONMM

Application web full-stack pour la gestion des services de l'Ordre National des Medecins de Mauritanie (ONMM).

Le projet contient un backend Spring Boot et un frontend React/Vite. Il couvre l'espace public, l'espace medecin et l'espace administrateur.

## Fonctionnalites principales

- Site public ONMM : accueil, annonces, galerie, contact, presentation et annuaire des medecins.
- Demande d'adhesion avec formulaire multi-etapes, pieces justificatives et suivi de dossier.
- Authentification JWT, activation de compte et reinitialisation du mot de passe.
- Espace medecin : tableau de bord, profil, notifications, reclamations, sondages, elections, candidatures et vote.
- Espace administrateur : dashboard, gestion des demandes, medecins, contenus, specialites, reclamations, sondages et elections.
- Gestion des fichiers avec stockage local en developpement ou stockage objet compatible S3/R2 en production.
- Envoi d'emails via SMTP et/ou Brevo selon la configuration.

## Stack technique

### Frontend

- React 19
- Vite 7
- React Router
- Tailwind CSS
- Shadcn/Radix UI
- Axios
- Recharts
- Framer Motion

### Backend

- Java 21
- Spring Boot 4
- Spring MVC
- Spring Security
- Spring Data JPA
- PostgreSQL
- Maven
- JWT
- OpenPDF
- AWS SDK S3 compatible R2/B2

## Structure du projet

```text
.
├── backend/              # API Spring Boot
│   ├── src/main/java/    # Controllers, services, entities, repositories, DTOs
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-dev.properties
│   │   └── db/           # Scripts SQL utiles
│   ├── Dockerfile
│   └── pom.xml
├── frontend/             # Application React/Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── routes/
│   │   └── config/
│   ├── package.json
│   └── vite.config.js
├── render.yaml           # Configuration deploiement backend Render
└── DEPLOIEMENT.md        # Notes de deploiement existantes
```

## Prerequis

- Java 21
- Maven 3.9+ ou le wrapper Maven fourni dans `backend/`
- Node.js 20+ recommande
- npm
- PostgreSQL

## Installation locale

### 1. Cloner le projet

```bash
git clone <url-du-repository>
cd PFE_2025_DAII_C23282
```

### 2. Creer la base de donnees PostgreSQL

Creer une base nommee `onmm_db` ou adapter `DB_URL` dans les variables d'environnement.

Exemple :

```sql
CREATE DATABASE onmm_db;
```

### 3. Configurer le backend

Le backend utilise par defaut :

```properties
DB_URL=jdbc:postgresql://localhost:5432/onmm_db
DB_USERNAME=postgres
DB_PASSWORD=34509008ma
PORT=8080
```

Pour un environnement local propre, il est conseille de definir les variables suivantes selon votre machine :

```bash
DB_URL=jdbc:postgresql://localhost:5432/onmm_db
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt_base64
ELECTION_MASTER_SECRET=votre_secret_elections
APP_FRONTEND_URL=http://localhost:5173
CONTACT_EMAIL=contact@example.com
```

Variables optionnelles utiles :

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
BREVO_API_KEY=
R2_ENDPOINT=
R2_REGION=auto
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_UPLOADS_BUCKET=
STORAGE_LOCAL_DIR=uploads
```

Sans configuration R2/S3, les fichiers sont stockes localement dans `backend/uploads`.

### 4. Lancer le backend

Depuis le dossier `backend` :

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Sous Windows PowerShell :

```powershell
cd backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

L'API est disponible sur :

```text
http://localhost:8080
```

Endpoint de sante :

```text
http://localhost:8080/api/public/health
```

### 5. Configurer le frontend

Dans `frontend/.env` :

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 6. Lancer le frontend

Depuis le dossier `frontend` :

```bash
cd frontend
npm install
npm run dev
```

L'application est disponible sur :

```text
http://localhost:5173
```

## Scripts utiles

### Backend

```bash
cd backend
./mvnw test
./mvnw clean package
./mvnw spring-boot:run
```

Sous Windows :

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd clean package
.\mvnw.cmd spring-boot:run
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run preview
npm run lint
```

## Routes principales

### Public

- `/` : accueil
- `/contact` : contact
- `/annonces` : liste des annonces
- `/annonces/:id` : detail d'une annonce
- `/adhesion` : demande d'adhesion
- `/suivi-dossier` : suivi de dossier
- `/annuaire` : annuaire des medecins
- `/annuaire/:id` : fiche medecin
- `/reclamations` : reclamation publique
- `/galerie` : galerie
- `/a-propos` : a propos

### Authentification

- `/login` : connexion
- `/activate` : activation de compte
- `/set-password` : definition du mot de passe
- `/forgot-password` : mot de passe oublie

### Espace medecin

- `/medecin/dashboard`
- `/medecin/profil`
- `/medecin/notifications`
- `/medecin/reclamations`
- `/medecin/sondages`
- `/medecin/elections`
- `/medecin/candidatures`
- `/medecin/parametres`

### Espace admin

- `/admin/*`

Les routes admin sont protegees par `AdminRoute`. Les routes medecin sont protegees par `MedecinRoute`.

## Build production

### Backend

```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/*.jar
```

### Frontend

```bash
cd frontend
npm install
npm run build
```

Le build frontend est genere dans `frontend/dist`.

## Deploiement

Le fichier `render.yaml` configure le backend pour Render avec Docker :

- service : `onmm-backend`
- runtime : Docker
- Dockerfile : `backend/Dockerfile`
- health check : `/api/public/health`

Variables a definir en production :

```bash
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
ELECTION_MASTER_SECRET
MAIL_USERNAME
MAIL_PASSWORD
APP_FRONTEND_URL
CONTACT_EMAIL
R2_ENDPOINT
R2_REGION
R2_ACCESS_KEY
R2_SECRET_KEY
R2_UPLOADS_BUCKET
```

Le frontend contient aussi `frontend/vercel.json` pour permettre le routage SPA sur Vercel.

## Tests et qualite

Backend :

```bash
cd backend
./mvnw test
```

Frontend :

```bash
cd frontend
npm run lint
npm run build
```


- Utiliser un stockage objet R2/S3 en production pour eviter la perte des fichiers uploades.
- Configurer `APP_FRONTEND_URL` avec l'URL publique du frontend.
- Verifier les identifiants SMTP avant de tester l'activation de compte et la reinitialisation du mot de passe.
