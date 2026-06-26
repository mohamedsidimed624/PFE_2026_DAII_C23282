# Guide de déploiement — ONMM

Architecture finale :

```
Vercel (frontend React/Vite)  ──HTTPS──>  Render (backend Spring Boot, Docker)
                                                │
                                                ├──> Neon (PostgreSQL)
                                                ├──> Backblaze B2 (fichiers uploadés)
                                                └──> Gmail SMTP (emails)
```

Coût total : **0 €/mois** (tous les services utilisés ont un plan gratuit suffisant pour ce projet). Limite connue : le plan gratuit Render met le service en veille après 15 min d'inactivité (premier appel après veille = ~30-50s de latence, le temps que le conteneur redémarre). Si gênant, on pourra passer le backend en payant (~7$/mois) plus tard sans rien changer au code.

---

## Étape 1 — Backblaze B2 (stockage des fichiers uploadés)

(Backblaze B2 est compatible avec l'API S3, comme Cloudflare R2, mais ne demande pas de carte bancaire à l'inscription pour le tier gratuit — 10 Go de stockage gratuits.)

**Le bucket reste en mode Private** — pas besoin d'activer d'accès public (qui est l'option payante chez plusieurs fournisseurs). Le backend sert lui-même les fichiers uploadés via son propre endpoint (`/api/files/**`), donc aucun bucket public n'est nécessaire.

1. Va sur https://www.backblaze.com/sign-up/cloud-storage et crée un compte (email + mot de passe).
2. Une fois connecté, dans le menu de gauche, va sur **B2 Cloud Storage** → **Buckets**.
3. Crée le bucket :
   - Nom : à toi de choisir (les noms de bucket B2 sont globaux — si "onmm-uploads" est déjà pris, choisis une variante, ex. en ajoutant ton pseudo ou un chiffre)
   - Files in Bucket : **Private**
   - Clique **Create a Bucket**.
4. Ouvre le bucket → note l'**Endpoint** affiché (ressemble à `https://s3.us-west-002.backblazeb2.com`) → ta variable `R2_ENDPOINT`. La partie région (`us-west-002`) → ta variable `R2_REGION`.
5. Crée une **clé d'application** pour que le backend puisse accéder au bucket :
   - Menu de gauche → **App Keys** → **Add a New Application Key**.
   - Nom : `onmm-backend`.
   - Allow access to Bucket(s) : sélectionne ton bucket.
   - Capabilities : laisse les permissions par défaut (lecture/écriture/suppression).
   - Clique **Create New Key**.
   - Backblaze affiche alors deux valeurs **une seule fois** — copie-les immédiatement dans un endroit sûr :
     - **keyID** → ta variable `R2_ACCESS_KEY`
     - **applicationKey** → ta variable `R2_SECRET_KEY`

Tu devrais maintenant avoir notés : `R2_ENDPOINT`, `R2_REGION`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, et le nom exact du bucket choisi.

---

## Étape 2 — Neon (base de données PostgreSQL)

1. Va sur https://neon.tech et crée un compte (tu peux utiliser "Continue with GitHub" si tu as un compte GitHub, sinon email).
2. Crée un projet : nom `onmm`, région la plus proche de toi (ex. Europe), version PostgreSQL par défaut.
3. Une fois le projet créé, Neon affiche une **Connection string** du type :
   ```
   postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
   ```
4. Le backend attend un format JDBC. Transforme la connection string Neon en gardant les morceaux :
   - `DB_URL` = `jdbc:postgresql://<host>/<dbname>?sslmode=require`
   - `DB_USERNAME` = `<user>`
   - `DB_PASSWORD` = `<password>`

   Exemple : si Neon te donne `postgresql://onmm_owner:AbC123@ep-cool-name-12345.eu-central-1.aws.neon.tech/onmm?sslmode=require`, alors :
   - `DB_URL=jdbc:postgresql://ep-cool-name-12345.eu-central-1.aws.neon.tech/onmm?sslmode=require`
   - `DB_USERNAME=onmm_owner`
   - `DB_PASSWORD=AbC123`

5. Rien d'autre à faire ici — le backend crée automatiquement toutes les tables au premier démarrage (`spring.jpa.hibernate.ddl-auto=update`), pas besoin de migration manuelle. Si tu veux repartir avec les données de seed/test, tu pourras les ré-importer plus tard via `psql` en pointant sur cette même connection string.

---

## Étape 3 — Gmail (envoi d'emails)

Le compte Gmail que tu utilises déjà en local (`spring.mail.username` dans `application-local.properties`) doit utiliser un **mot de passe d'application**, pas le mot de passe du compte Google :

1. Va sur https://myaccount.google.com/apppasswords (nécessite que la validation en 2 étapes soit activée sur le compte Google — active-la d'abord sur https://myaccount.google.com/security si ce n'est pas déjà fait).
2. Crée un mot de passe d'application (nom libre, ex. "ONMM Backend").
3. Google affiche un mot de passe de 16 caractères (ex. `abcd efgh ijkl mnop`) — c'est ta variable `MAIL_PASSWORD`. `MAIL_USERNAME` est l'adresse Gmail elle-même.

Si tu utilises déjà ce mot de passe dans `application-local.properties` en local, tu peux réutiliser exactement la même valeur en production.

---

## Étape 4 — Render (backend)

1. Va sur https://render.com et crée un compte (idéalement "Sign up with GitHub" pour lier directement ton repo).
2. Pousse le code sur GitHub si ce n'est pas déjà fait (`git push`) — Render a besoin d'un repo GitHub/GitLab pour déployer.
3. Sur le dashboard Render, clique **New +** → **Blueprint**.
4. Sélectionne ton repo `PFE_2025_DAII_C23282`. Render détecte automatiquement le fichier `render.yaml` à la racine du repo (déjà créé) et propose de créer le service `onmm-backend`.
5. Clique **Apply**. Render va te demander de renseigner les variables marquées `sync: false` dans `render.yaml` — remplis-les avec les valeurs collectées aux étapes précédentes :

   | Variable | Valeur |
   |---|---|
   | `DB_URL` | depuis Neon (étape 2) |
   | `DB_USERNAME` | depuis Neon |
   | `DB_PASSWORD` | depuis Neon |
   | `JWT_SECRET` | génère une nouvelle valeur aléatoire — voir commande ci-dessous |
   | `ELECTION_MASTER_SECRET` | génère une nouvelle valeur aléatoire (même commande, différente valeur) — protège les clés RSA/Ed25519 des élections, stockées chiffrées en base |
   | `MAIL_USERNAME` | ton adresse Gmail |
   | `MAIL_PASSWORD` | le mot de passe d'application (étape 3) |
   | `APP_FRONTEND_URL` | laisse vide pour l'instant, à remplir après l'étape 5 (Vercel) |
   | `CONTACT_EMAIL` | l'email qui doit recevoir les messages du formulaire de contact |
   | `R2_ENDPOINT` | depuis Backblaze B2 (étape 1) |
   | `R2_REGION` | depuis Backblaze B2 |
   | `R2_ACCESS_KEY` | depuis Backblaze B2 |
   | `R2_SECRET_KEY` | depuis Backblaze B2 |
   | `R2_UPLOADS_BUCKET` | le nom exact de ton bucket "uploads" |

   Pour générer une valeur aléatoire sûre pour `JWT_SECRET` ou `ELECTION_MASTER_SECRET`, exécute en local :
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```
   (répète la commande pour obtenir une 2e valeur différente pour `ELECTION_MASTER_SECRET`)

6. Clique **Deploy**. Render va construire l'image Docker (`backend/Dockerfile`) puis démarrer le service — la première build prend 5 à 10 minutes. Suis les logs dans l'onglet **Logs** du service.
7. Une fois démarré, Render affiche l'URL publique du backend, du type `https://onmm-backend.onrender.com`. **Note cette URL.**

---

## Étape 5 — Vercel (frontend)

1. Va sur https://vercel.com et crée un compte ("Continue with GitHub" recommandé, pour lier directement le repo).
2. Sur le dashboard, clique **Add New** → **Project**.
3. Sélectionne ton repo `PFE_2025_DAII_C23282`. Vercel doit déployer uniquement le dossier `frontend/` — dans la configuration du projet, règle **Root Directory** sur `frontend`.
4. Vercel détecte automatiquement Vite (framework preset = "Vite"), build command `npm run build`, output directory `dist` — rien à changer ici.
5. Avant de déployer, ajoute la variable d'environnement :
   - `VITE_API_BASE_URL` = l'URL Render notée à l'étape 4 (ex. `https://onmm-backend.onrender.com`, **sans slash final**)
6. Clique **Deploy**. Au bout de 1-2 minutes, Vercel donne une URL du type `https://ton-projet.vercel.app`. **Note cette URL.**

---

## Étape 6 — Reconnecter les deux

Il manque une variable côté Render qu'on a laissée vide à l'étape 4 :

1. Retourne sur Render → ton service `onmm-backend` → **Environment**.
2. Renseigne `APP_FRONTEND_URL` avec l'URL Vercel obtenue à l'étape 5 (ex. `https://ton-projet.vercel.app`, **sans slash final**).
3. Sauvegarde — Render redéploie automatiquement le service avec cette nouvelle variable (nécessaire pour que CORS autorise le frontend Vercel, et pour que les liens d'activation de compte/réinitialisation de mot de passe envoyés par email pointent vers la bonne URL).

---

## Étape 7 — Vérification end-to-end

Une fois les deux redéploiements terminés :

1. Ouvre l'URL Vercel dans le navigateur → la page de connexion doit s'afficher normalement (logo ONMM chargé depuis Vercel, pas d'erreur réseau dans la console).
2. Essaie de te connecter avec un compte existant — si la base Neon est vide (nouvelle base), il faudra d'abord créer un compte admin manuellement (voir note ci-dessous) ou repasser par le flux d'adhésion médecin.
3. Teste un upload de fichier (photo de profil médecin, ou pièce jointe de réclamation) → vérifie dans le dashboard Backblaze B2 (bucket `onmm-uploads`) que le fichier apparaît bien, et que l'image s'affiche correctement dans l'app.
4. Teste l'envoi d'un email (mot de passe oublié, ou soumission d'une demande d'adhésion) → vérifie la réception.
5. Si tu veux tester le module élections de bout en bout : crée une élection, ouvre les votes (génère les clés RSA/Ed25519, chiffrées et stockées directement en base — aucun fichier impliqué), vote, dépouille.

**⚠️ Compte admin par défaut créé automatiquement** : `backend/src/main/java/com/onmm/backend/mapper/DataInitializer.java` crée systématiquement, au premier démarrage sur une base vide, un compte `admin@onmm.com` / `Admin1234`. C'est pratique pour démarrer, mais ce mot de passe est visible dans le code source — **connecte-toi avec ces identifiants puis change immédiatement le mot de passe** depuis la page de profil admin, avant d'utiliser l'application en conditions réelles. Si tu préfères supprimer complètement cette création automatique en production, dis-le-moi, c'est un changement simple.

---

## Récapitulatif des variables d'environnement (Render)

| Variable | Source |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Neon |
| `JWT_SECRET` | générée aléatoirement |
| `ELECTION_MASTER_SECRET` | générée aléatoirement |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | Gmail (mot de passe d'application) |
| `APP_FRONTEND_URL` | URL Vercel |
| `CONTACT_EMAIL` | choisie par toi |
| `R2_ENDPOINT`, `R2_REGION`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_UPLOADS_BUCKET` | Backblaze B2 |

## Récapitulatif des variables d'environnement (Vercel)

| Variable | Valeur |
|---|---|
| `VITE_API_BASE_URL` | URL Render |

---

## Pour le développement local après ce changement

Le code bascule **automatiquement** entre stockage objet et disque local, selon que `r2.endpoint` est renseigné ou non :

- **Sans aucun compte cloud configuré** (cas par défaut de `application-local.properties` désormais) : les fichiers uploadés sont écrits dans le dossier `backend/uploads/` local, exactement comme avant ce chantier de déploiement. Rien à faire, ça fonctionne directement.
- **Avec un compte Backblaze B2** : décommente et renseigne les variables `r2.*` dans `backend/src/main/resources/application-local.properties` (déjà préparé, ce fichier n'est jamais commité) si tu veux tester le stockage objet en local — tu peux réutiliser exactement les mêmes buckets qu'en production.

En production (Render), `R2_*` sont définies via les variables d'environnement (étape 4) — le stockage objet est donc toujours utilisé là-bas, peu importe ce que contient `application-local.properties` (ce fichier n'existe même pas sur Render).
