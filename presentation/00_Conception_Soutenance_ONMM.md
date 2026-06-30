# Conception de la soutenance — PFE ONMM
### Application Web pour l'Ordre National des Médecins de Mauritanie
**Auteur :** Mohamed Sidi Mohamed Mohamed Salem (C23282) · Licence DAII · Université de Nouakchott
**Encadrants :** Dr. Ahmed Sejad · Ing. Mohamed Saleck Elbechir · **Entreprise :** SMART MS SA
**Soutenance :** 11/07/2026 · **Durée cible :** 15–18 min · **Format :** 16:9

> Document de travail rédigé comme un consultant senior en soutenance. Il ne résume pas le rapport : il le **transforme en récit de soutenance**. Le fichier `Presentation_PFE_ONMM.pptx` (généré à partir de ce document) est le support éditable correspondant.

---

## PARTIE 0 — Analyse stratégique du rapport (avant toute slide)

### 0.1 Ce que le projet est vraiment (lecture de consultant)
Ce n'est pas « un site web pour des médecins ». C'est **la première brique du système d'information d'une autorité de régulation professionnelle**, dans un pays qui vient d'inscrire la e-santé (Stratégie nationale e-Santé 2024–2030) parmi ses priorités. L'angle gagnant devant un jury : **une institution régalienne récente (ONMM, créée en 2019) qui passe du papier à un SI centralisé, sécurisé et traçable.**

### 0.2 Les 3 forces à mettre en avant (ce qui impressionne un jury)
1. **Le vote électronique cryptographique** — c'est le joyau. Chiffrement hybride **AES-256-GCM + RSA-2048-OAEP** (enveloppe DEK), clé privée RSA **inaccessible pendant le scrutin**, **HMAC-SHA256** pour l'anonymat (Voter Token), **SHA-256** pour l'intégrité, **signature Ed25519** pour l'authenticité. Vérifié dans le code (`service/election/crypto/`). Niveau rare en Licence.
2. **Le raisonnement problème → solution** — l'analyse de l'existant est solide et chiffrée (papier, Excel, présentiel, WhatsApp, ~1028 médecins, régions éloignées). Le projet répond à un **vrai** besoin, pas à un exercice.
3. **L'ampleur fonctionnelle maîtrisée** — 8 modules, 3 espaces, livrés en 8 sprints, avec une architecture en couches propre (React / Spring Boot / PostgreSQL, REST, stateless JWT, RBAC).

### 0.3 Les 3 risques à neutraliser (ce qui attire les questions pièges)
1. **Scrum « solo »** — méthodo d'équipe appliquée seul. À assumer, pas à cacher : « j'en ai gardé les principes utiles (backlog, sprints, incréments, Jira), pas le folklore (daily, revues collectives). »
2. **Pas de tests automatisés / pas de métriques de perf** — le rapport parle de « tests fonctionnels » manuels via Postman. Préparer une réponse honnête (cf. Q&A).
3. **Clés cryptographiques stockées en base** — le rapport le reconnaît (limite : pas de HSM). C'est une **force** si vous l'annoncez vous-même comme une perspective maîtrisée.

### 0.4 Le fil narratif retenu (la colonne vertébrale)
> Contexte national → mission de l'ONMM → comment il fonctionne aujourd'hui → ce qui ne va pas → ce que ça coûte → la question centrale + objectifs → ce que font les autres → notre solution → pour qui / quels besoins → comment on l'a construit → comment c'est architecturé → un workflow en détail → la sécurité de base → le vote électronique (climax) → la plateforme en images → bilan & limites → conclusion & ouverture.

Chaque slide « tire » la suivante par une **question** que se pose naturellement le jury.

---

## PARTIE 1 — Identité graphique (charte de la présentation)

**Principe directeur :** institutionnel + médical + numérique. Sobre, aéré, crédible. Zéro effet gadget.

### Palette
| Rôle | Couleur | Hex | Usage |
|---|---|---|---|
| Primaire (institutionnel) | Bleu médical profond | `#0A3D62` | Titres, bandeaux, fonds de section |
| Secondaire (numérique) | Cyan / turquoise e-santé | `#1B9AAA` | Accents, traits, icônes actives |
| Validation | Vert | `#2EC4B6` | Solution, « réalisé », succès |
| Alerte | Corail | `#E63946` | Problèmes, limites de l'existant |
| Or discret | Sable | `#E8B04B` | Touche « officiel / sceau » (rare) |
| Fond | Blanc / gris très clair | `#FFFFFF` / `#F5F7FA` | Respiration |
| Texte | Anthracite | `#2D3748` | Corps |
| Texte secondaire | Gris | `#718096` | Légendes, notes |

**Règle de couleur narrative :** tout ce qui décrit l'**ancien monde** (problèmes) en **corail/gris** ; tout ce qui décrit la **solution** en **bleu/cyan/vert**. Le jury comprend l'opposition sans la lire.

### Typographie
- **Titres :** Montserrat SemiBold (alt. Poppins). 28–40 pt.
- **Corps :** Inter / Open Sans. 18–24 pt. Jamais < 18 pt.
- **Code / crypto :** JetBrains Mono ou Consolas. Pour les blocs techniques.

### Iconographie & style
- Icônes **outline** cohérentes, trait 2 px (Lucide / Phosphor / Font Awesome Thin). Jamais d'emojis colorés hétérogènes.
- Cartes à coins arrondis 10–12 px, ombre douce (`y=4, blur=12, 12% noir`).
- Beaucoup de blanc. Une idée = une zone. Marge de sécurité ≥ 6 % des bords.
- Bandeau bas discret : `ONMM · PFE 2026 · M. Sidi Mohamed — n° slide`.

### Transitions & animations (règles globales)
- **Transition par défaut :** Fondu (Fade) 0,3 s. **Morph** uniquement entre 2 slides jumelles (existant→solution, fondations→vote).
- **Animations :** Apparition / Estompage progressif des puces (« par paragraphe »), au clic. Jamais de rebond, rotation, vol. Vitesse « Rapide » (0,3–0,5 s).
- **Interdits :** damier, volet, rotation 3D, sons, soulignés clignotants.

---

## PARTIE 2 — Conception slide par slide (les 17 slides)

> Légende des champs : **Obj. péda.** = ce que la slide enseigne · **Message** = la phrase unique à retenir · **Type** = nature visuelle · **Reveal** = ce qui est visible / caché / révélé au clic · **Oral** = à dire / à ne pas lire · **Durée**.

---

### 🟦 SLIDE 1 — Couverture
- **Titre :** *Conception et développement d'une application web pour l'Ordre National des Médecins de Mauritanie*
- **Sous-titre :** Plateforme centralisée, sécurisée et traçable au service de la régulation médicale
- **Obj. péda. :** poser le cadre institutionnel et donner une première impression de sérieux.
- **Message :** « Un projet réel, pour une institution réelle. »
- **Contenu exact :** Titre · sous-titre · logo ONMM + logo SMART MS SA + logo Université · Auteur (C23282) · encadrants · date 11/07/2026.
- **Type :** page de garde graphique. Fond bleu `#0A3D62` plein, fine trame médicale (croix/ECG) en filigrane 5 % d'opacité, accent cyan en bas.
- **Reveal :** tout visible d'emblée (pas d'animation sur la couverture).
- **Placement :** ouverture.
- **Transition → S2 :** « Voici en une minute le chemin que je vais vous faire suivre. »
- **Durée :** 30–40 s. **Mots max :** ~25. **Visuels max :** 3 logos + 1 motif.
- **Oral :** se présenter, annoncer le titre, **ne pas lire** les noms d'encadrants (ils sont écrits). Donner le ton : « projet mené en entreprise, sur un besoin réel. »
- **Hiérarchie :** Titre (1) > sous-titre (2) > logos (3) > mentions (4).

---

### 🟦 SLIDE 2 — Fil conducteur (le récit)
- **Titre :** Le fil de cette présentation
- **Obj. péda. :** donner au jury la carte mentale du raisonnement.
- **Message :** « Je raconte une histoire : un problème réel, une solution argumentée. »
- **Contenu exact :** parcours en 6 jalons, pas une table des matières plate :
  `1. Le contexte & la mission` → `2. Le problème` → `3. La solution` → `4. La construction` → `5. La sécurité` → `6. Bilan & perspectives`.
- **Type :** timeline horizontale / chevrons numérotés, icône par jalon.
- **Reveal :** les 6 jalons apparaissent **un par un** (Fade rapide) pendant l'annonce orale, puis tous restent visibles.
- **Placement :** juste après la couverture, avant d'entrer dans le fond.
- **Transition ← S1 :** « Pour vous orienter… » **→ S3 :** « Commençons par pourquoi ce projet existe. »
- **Durée :** 40 s. **Mots max :** ~18. **Visuels max :** 6 icônes.
- **Oral :** annoncer le voyage, **insister** que la sécurité (jalon 5) est le cœur technique. Ne pas détailler.
- **Piège :** ne pas transformer ce slide en sommaire de rapport (chapitres). C'est un **parcours**, pas un plan Word.

---

### 🟦 SLIDE 3 — Contexte & cadre du projet
- **Titre :** Un projet né d'une priorité nationale
- **Obj. péda. :** ancrer le projet dans un contexte légitime (e-santé) et présenter les acteurs (SMART MS SA, ONMM).
- **Message :** « La Mauritanie numérise sa santé ; l'ONMM est en première ligne. »
- **Contenu exact (3 blocs courts) :**
  - **Le cadre :** Stratégie nationale e-Santé 2024–2030 → numériser les services médicaux.
  - **L'entreprise :** SMART MS SA — éditeur mauritanien, e-santé & digitalisation des services publics (Odoo Gold Partner). Stage 4 mois.
  - **Le client :** ONMM — créé en 2019, **~1 028 médecins**, inscription **obligatoire** pour exercer.
- **Type :** 3 cartes icônographiées (drapeau/stratégie · entreprise · institution) + frise de dates (2019 création → janv. 2024 1ᵉʳ congrès → 2024–2030 stratégie → 2026 projet).
- **Reveal :** les 3 cartes en cascade ; la frise de dates apparaît en dernier.
- **Placement :** 1ᵉʳ étage du récit — le « pourquoi ».
- **Transition ← S2 :** « Le point de départ, c'est un contexte. » **→ S4 :** « Mais quelle est concrètement la mission de cette institution, et comment travaille-t-elle aujourd'hui ? »
- **Durée :** 1 min. **Mots max :** ~45. **Visuels max :** 3 cartes + 1 frise.
- **Oral :** raconter la dynamique nationale. **Chiffre-clé à dire :** 1 028 médecins, inscription obligatoire (= enjeu de masse + enjeu légal). **Ne pas lire** la définition d'Odoo Partner.
- **Q jury probable :** « Pourquoi l'ONMM et pas le ministère ? » → R : l'ONMM est l'autorité ordinale, seule habilitée à tenir le tableau des médecins ; c'est le détenteur légitime de la donnée.

---

### 🟦 SLIDE 4 — L'ONMM aujourd'hui : comment ça fonctionne
- **Titre :** Aujourd'hui : papier, Excel et WhatsApp
- **Obj. péda. :** montrer le fonctionnement réel actuel — rendre le problème **tangible**.
- **Message :** « Une institution régalienne fonctionne sans système d'information. »
- **Contenu exact (workflow visuel de l'existant) :**
  - Adhésion → **dossier papier** déposé au siège, diplômes vérifiés **en présentiel**.
  - Registre des médecins → **fichier Excel**.
  - Suivi de dossier → **téléphone / e-mail / WhatsApp / déplacement** à Nouakchott.
  - Réclamations → **archives papier**.
  - Élections → **100 % manuelles**.
- **Type :** schéma de flux « monde papier », icônes corail/gris, un siège au centre, des flèches qui convergent physiquement (illustre la centralisation forcée à Nouakchott).
- **Reveal :** les canaux apparaissent un à un ; à la fin, surligner « **tout converge physiquement vers Nouakchott** ».
- **Placement :** transition contexte → problème.
- **Transition ← S3 :** « Voici comment l'Ordre assure ses missions aujourd'hui. » **→ S5 :** « Ce fonctionnement a un coût. Lequel ? »
- **Durée :** 1 min. **Mots max :** ~40. **Visuels max :** 5 icônes + 1 siège central.
- **Oral :** raconter le parcours d'un médecin de l'intérieur du pays. **Image forte à verbaliser :** « pour connaître l'état de son dossier, un médecin de Néma doit appeler, écrire sur WhatsApp, ou faire 1 200 km. »
- **Piège :** ne pas mépriser l'existant ; on **constate**, on ne juge pas les agents.

---

### 🟥 SLIDE 5 — Le diagnostic : limites & conséquences
- **Titre :** Le vrai problème n'est pas la lenteur — c'est l'absence de système d'information
- **Obj. péda. :** élever le constat au niveau **analytique** (pas une liste de plaintes).
- **Message :** « Sans SI centralisé : pas de traçabilité, pas de contrôle, des risques légaux. »
- **Contenu exact — 2 colonnes (cause → conséquence) :**
  - Procédures manuelles → retards, erreurs de saisie, temps agent gaspillé.
  - Suivi dispersé → aucun historique, aucune visibilité (médecin **et** admin).
  - Données Excel → **aucune traçabilité, aucun contrôle d'accès** → risque légal sur données sensibles.
  - Réclamations papier → impossibles à exploiter collectivement.
  - Aucun espace médecin → tout repose sur l'informel.
  - Élections manuelles → participation des régions éloignées limitée.
- **Type :** tableau visuel « Limite → Conséquence » (flèches), code couleur corail. **Mettre en exergue** la ligne « traçabilité / contrôle d'accès » (encadré).
- **Reveal :** révéler **ligne par ligne** ; faire grossir la ligne « traçabilité » en dernier (c'est le pont vers la sécurité).
- **Placement :** climax du « problème ».
- **Transition ← S4 :** « Derrière ces canaux dispersés, six limites structurelles. » **→ S6 :** « D'où une question centrale. »
- **Durée :** 1 min 15. **Mots max :** ~55 (slide la plus dense autorisée). **Visuels max :** tableau 6 lignes.
- **Oral :** **ne pas lire les 6 lignes**. En développer 2 (traçabilité + régions éloignées), survoler le reste. Phrase-pivot : « ce ne sont pas des dysfonctionnements isolés, c'est le symptôme d'une organisation sans outil numérique. »
- **Q jury probable :** « Avez-vous quantifié ces problèmes (délais, volumétrie) ? » → R honnête : pas de métriques formelles, constats qualitatifs issus de la phase d'analyse en entreprise ; c'est une limite de l'étude (cf. perspectives).

---

### 🟦 SLIDE 6 — Problématique & objectifs
- **Titre :** La question centrale
- **Obj. péda. :** formuler **une** problématique nette et la traduire en objectifs mesurables.
- **Message :** « Concevoir un SI centralisé, sécurisé, accessible — et traçable. »
- **Contenu exact :**
  - **Problématique (encadré, centré) :** « Comment doter l'ONMM d'une plateforme **centralisée, sécurisée et accessible** qui structure ses démarches, assure le suivi et la **traçabilité** des dossiers, et fluidifie les échanges entre l'administration, les médecins et le public ? »
  - **4 objectifs (icônes) :** Centraliser · Dématérialiser & suivre · Sécuriser & tracer · Rapprocher (régions/public).
- **Type :** problématique en grand au centre + 4 piliers en bas.
- **Reveal :** la problématique apparaît seule d'abord (temps de lecture) ; puis les 4 objectifs.
- **Placement :** charnière problème → solution.
- **Transition ← S5 :** « Tout cela tient en une question. » **→ S7 :** « Avant de répondre, qu'ont fait des institutions comparables ? »
- **Durée :** 50 s. **Mots max :** ~45. **Visuels max :** 1 encadré + 4 icônes.
- **Oral :** **lire** la problématique lentement (seule chose qu'on lit volontairement, car c'est le contrat). Annoncer les 4 objectifs comme grille d'évaluation de fin.
- **Piège :** ne pas multiplier les objectifs (4 max, mémorisables).

---

### 🟦 SLIDE 7 — Benchmark & positionnement
- **Titre :** Ce que font les autres ordres — et ce que nous ajoutons
- **Obj. péda. :** montrer une démarche d'**étude comparative** et justifier la valeur ajoutée.
- **Message :** « Les autres s'arrêtent au portail ; nous allons jusqu'au vote en ligne. »
- **Contenu exact :**
  - 3 vignettes : **France** (espace membre sécurisé + tableau) · **Maroc** (info + tableau, contexte proche) · **Sénégal** (communication institutionnelle).
  - **Échelle de maturité** : Portail public → Annuaire → Espace membre → **Réclamations · Sondages · Élections en ligne** (← notre différenciation, en vert).
- **Type :** 3 captures miniatures + une **jauge de maturité** horizontale.
- **Reveal :** les 3 pays d'abord ; puis la jauge ; puis le segment « notre apport » s'illumine en vert.
- **Placement :** crédibilise la solution avant de la présenter.
- **Transition ← S6 :** « Nous ne partons pas de zéro : regardons l'existant ailleurs. » **→ S8 :** « Voici notre réponse, qui reprend ces niveaux et va plus loin. »
- **Durée :** 50 s. **Mots max :** ~35. **Visuels max :** 3 captures + 1 jauge.
- **Oral :** insister que réclamations + sondages + élections **n'ont pas été trouvés** sur ces plateformes → valeur ajoutée ONMM.
- **Q jury probable :** « Avez-vous testé ces plateformes en profondeur ? » → R : consultation des fonctionnalités publiques accessibles ; benchmark de cadrage, pas audit.

---

### 🟩 SLIDE 8 — La solution : vision 360°
- **Titre :** Une plateforme, trois espaces, huit modules
- **Obj. péda. :** donner la vue d'ensemble du produit en un coup d'œil.
- **Message :** « Un point d'entrée unique pour le public, les médecins et l'administration. »
- **Contenu exact :**
  - **3 espaces :** Portail public · Espace médecin · Espace administrateur.
  - **8 modules (icônes) :** Adhésions · Registre/Annuaire · Réclamations · Annonces · Sondages · **Élections & vote** · Notifications · Spécialités.
- **Type :** schéma « hub central » : la plateforme au centre, 3 espaces autour, modules en couronne. **Mettre en avant** le module Élections (halo).
- **Reveal :** centre → 3 espaces → modules en couronne ; halo final sur Élections (annonce le climax à venir).
- **Placement :** ouverture de la partie « solution ».
- **Transition ← S7 :** « Notre réponse. » **→ S9 :** « Mais pour qui, et avec quelles exigences ? »
- **Durée :** 1 min. **Mots max :** ~30. **Visuels max :** 1 schéma hub + 8 icônes.
- **Oral :** présenter les 3 espaces comme 3 portes d'une même maison. **Teaser :** « le module élections concentre l'essentiel de la difficulté technique — j'y reviens. »
- **Piège :** ne pas détailler chaque module ici (on les voit en images plus tard).

---

### 🟦 SLIDE 9 — Acteurs & besoins
- **Titre :** Trois acteurs, des exigences claires
- **Obj. péda. :** relier acteurs ↔ besoins fonctionnels ↔ besoins non fonctionnels.
- **Message :** « Chaque acteur a son périmètre ; la sécurité et la traçabilité encadrent tout. »
- **Contenu exact :**
  - **Acteurs :** Visiteur public (consulter, vérifier, réclamer) · Médecin (adhérer, suivre, voter, répondre) · Administrateur (valider, gérer, publier, organiser).
  - **Besoins non fonctionnels (bandeau) :** Sécurité · Traçabilité · Performance · Disponibilité · Ergonomie · Compatibilité · Évolutivité.
- **Type :** 3 colonnes-personas + bandeau NFR en bas.
- **Reveal :** les 3 personas en parallèle ; le bandeau NFR ensuite, avec **Sécurité & Traçabilité** surlignés.
- **Placement :** précise la solution avant la construction.
- **Transition ← S8 :** « Cette plateforme sert trois profils. » **→ S10 :** « Comment a-t-elle été construite ? »
- **Durée :** 45 s. **Mots max :** ~40. **Visuels max :** 3 personas + 7 puces NFR.
- **Oral :** lier chaque acteur à 2 actions max. Souligner que sécurité/traçabilité ne sont **pas** des options mais des exigences.
- **Q jury probable :** « Comment garantissez-vous l'évolutivité ? » → R : architecture en couches + REST stateless + modules découplés ; ajout d'un module sans toucher au noyau.

---

### 🟦 SLIDE 10 — Méthodologie
- **Titre :** UML pour concevoir, Scrum pour livrer
- **Obj. péda. :** montrer une démarche d'ingénierie rigoureuse.
- **Message :** « Une modélisation UML + 8 sprints itératifs suivis sur Jira. »
- **Contenu exact :**
  - **UML :** cas d'utilisation · séquence · classes (les 3 retenus, ciblés).
  - **Scrum :** 8 sprints × 2 semaines (16 sem.) ; Product/Sprint Backlog ; incréments ; suivi Jira (À faire / En cours / En test / Terminé).
  - **Mini-frise sprints :** S0 analyse/UML → S1-2 auth+adhésion+registre → S3 portail/annuaire → S4 réclamations/notifs → S5 sondages → S6 **élections/vote** → S7 intégration/tests.
- **Type :** moitié gauche UML (icônes diagrammes), moitié droite frise des sprints (Gantt simplifié).
- **Reveal :** UML d'abord, puis la frise sprint par sprint (l'animation matérialise l'itération).
- **Placement :** entrée dans le « comment ».
- **Transition ← S9 :** « Place à la fabrication. » **→ S11 :** « Quelle architecture en résulte ? »
- **Durée :** 1 min. **Mots max :** ~40. **Visuels max :** 3 icônes UML + frise 8 sprints.
- **Oral :** **assumer le Scrum solo** d'avance : « projet individuel, j'ai gardé les principes (backlog, sprints, incréments) et adapté les cérémonies. » Désamorce la question piège.
- **Q jury probable :** « Scrum a-t-il un sens seul ? » → R préparée (cf. Q&A finale).

---

### 🟦 SLIDE 11 — Architecture technique
- **Titre :** Une architecture en couches, découplée et sécurisée
- **Obj. péda. :** prouver la maîtrise de l'architecture web moderne.
- **Message :** « Front React ↔ API REST Spring Boot stateless ↔ PostgreSQL. »
- **Contenu exact (schéma 3 couches) :**
  - **Présentation :** React.js · React Router · Axios · Tailwind CSS.
  - **Application/Métier :** Spring Boot (Java) · API REST · **Spring Security + JWT (stateless)** · RBAC (ADMIN / MEDECIN).
  - **Données :** PostgreSQL (relationnel, intégrité référentielle).
  - Flux : navigateur → HTTPS → API REST → service métier → JPA → DB.
- **Type :** diagramme d'architecture en 3 bandes horizontales + flux fléché ; logos techno.
- **Reveal :** couche par couche, du haut vers le bas ; puis la flèche de flux traverse les 3 (animation de trajectoire **discrète**).
- **Placement :** socle technique avant les zooms (workflow + sécurité).
- **Transition ← S10 :** « Le résultat de cette démarche : cette architecture. » **→ S12 :** « Suivons une requête réelle de bout en bout. »
- **Durée :** 1 min 15. **Mots max :** ~40 (+ logos). **Visuels max :** 3 bandes + flux + ~8 logos.
- **Oral :** justifier **chaque** choix en 1 phrase (cf. tableau justifications). Insister sur **stateless** (= scalabilité) et **séparation des couches** (= maintenabilité/sécurité).
- **Q jury probable :** « Pourquoi Spring Boot et pas Node ? Pourquoi PostgreSQL et pas Mongo ? » → R préparée (cf. Q&A).

---

### 🟦 SLIDE 12 — Zoom conception : le workflow d'adhésion
- **Titre :** Du dossier papier au compte activé — en ligne
- **Obj. péda. :** montrer un diagramme de séquence **vivant**, pas décoratif.
- **Message :** « Le parcours d'adhésion est entièrement dématérialisé et traçable. »
- **Contenu exact (séquence simplifiée) :**
  Médecin dépose la demande (5 étapes : infos · formations · expériences · documents · confirmation) → Admin instruit → **Validation** → e-mail d'activation → médecin **confirme l'e-mail + définit son mot de passe (BCrypt)** → compte actif + entrée au registre officiel.
  Branche **Rejet** → notification motivée.
- **Type :** diagramme de séquence **épuré** (4 lanes : Médecin · Front · API · DB) OU parcours horizontal à étapes. Préférer le **parcours à étapes** pour la lisibilité orale.
- **Reveal :** étape par étape (matérialise la chronologie) ; la branche « rejet » apparaît en gris à la fin.
- **Placement :** concret avant l'abstraction sécurité ; relie conception ↔ réalité.
- **Transition ← S11 :** « Concrètement, voici un parcours de bout en bout. » **→ S13 :** « Ce parcours suppose un socle de sécurité. »
- **Durée :** 1 min. **Mots max :** ~35. **Visuels max :** 1 séquence (≤ 7 nœuds).
- **Oral :** raconter comme une histoire utilisateur. Pointer le moment **traçabilité** (chaque transition d'état est historisée) et **BCrypt** (mot de passe jamais en clair) → transition vers sécurité.
- **Piège :** ne **pas** afficher le diagramme de classes complet (illisible projeté). S'il est demandé, l'avoir en **slide annexe**.

---

### 🟦 SLIDE 13 — Sécurité : les fondations
- **Titre :** Sécurité by design : identité, accès, secrets
- **Obj. péda. :** poser les 3 piliers de sécurité avant le climax du vote.
- **Message :** « Authentification JWT stateless, contrôle d'accès par rôles, mots de passe BCrypt+sel. »
- **Contenu exact (3 cartes) :**
  - **Authentification — JWT :** jeton signé, politique **stateless** (aucune session serveur), validé à chaque requête.
  - **Autorisation — RBAC (Spring Security) :** rôles **ADMIN / MEDECIN**, chaque route filtrée.
  - **Secrets — BCrypt + Salt :** hachage adaptatif, sel aléatoire → 2 mots de passe identiques ⇒ empreintes différentes.
- **Type :** 3 cartes icônographiées (cadenas/jeton · rôles · empreinte). Fond bleu nuit (registre « sécurité »).
- **Reveal :** 3 cartes en cascade.
- **Placement :** **rampe de lancement** du slide vote (la slide suivante est le sommet).
- **Transition ← S12 :** « Tout cela repose sur un socle de sécurité. » **→ S14 :** « Et pour l'opération la plus critique — le vote — on va beaucoup plus loin. »
- **Durée :** 1 min. **Mots max :** ~40. **Visuels max :** 3 cartes.
- **Oral :** expliquer **stateless** (pourquoi : scalabilité + pas de session à voler) et **sel** (pourquoi : anti rainbow-table). Bref, net, confiant.
- **Q jury probable :** « Où stockez-vous le JWT côté client ? Durée de vie ? Refresh ? » → R préparée (cf. Q&A).

---

### 🟥🟩 SLIDE 14 — Le vote électronique (SLIDE PHARE / CLIMAX)
- **Titre :** Vote électronique : confidentialité, anonymat, intégrité, authenticité
- **Obj. péda. :** démontrer une vraie maîtrise cryptographique — le pic technique de la soutenance.
- **Message :** « 4 garanties, 5 mécanismes cryptographiques combinés. »
- **Contenu exact — mapping propriété → mécanisme :**
  | Propriété | Mécanisme |
  |---|---|
  | **Anonymat de l'électeur** | **HMAC-SHA256** → *Voter Token* (secret + electionId + médecinId), unicité sans révéler l'identité |
  | **Confidentialité du bulletin** | **AES-256-GCM**, clé (DEK) **aléatoire par bulletin** |
  | **Protection de la clé** | **RSA-2048-OAEP** : la clé publique scelle la DEK ; la clé privée est **inaccessible pendant le scrutin** |
  | **Intégrité** | **SHA-256** *Vote Hash* (sur le bulletin déjà chiffré) |
  | **Authenticité des résultats** | **Signature Ed25519** du serveur sur chaque bulletin |
  - **Schéma « cycle de vie d'un bulletin » :** Vote → chiffrement hybride (AES+RSA) → hash SHA-256 → signature Ed25519 → stockage → *(fin du scrutin)* → déverrouillage clé privée → dépouillement vérifié.
- **Type :** **pipeline cryptographique animé** (5 étapes) + tableau propriété/mécanisme à côté. Registre visuel « coffre-fort ».
- **Reveal (crucial) :** révéler le bulletin qui traverse le pipeline **étape par étape** au clic ; chaque étape illumine la propriété correspondante dans le tableau. Le verrou « clé privée » reste **fermé** jusqu'à l'étape dépouillement, puis s'ouvre.
- **Placement :** **sommet dramatique** de la présentation (≈ 70 % du temps écoulé).
- **Transition ← S13 :** « Pour le vote, les fondations ne suffisent pas. » **→ S15 :** « Voyons maintenant la plateforme en action. »
- **Durée :** 2 min (la plus longue — c'est voulu). **Mots max :** ~55 (tableau compact). **Visuels max :** 1 pipeline + 1 tableau 5 lignes.
- **Oral — à développer :** la logique « **chiffrement hybride** » (pourquoi pas tout en RSA : trop lent / limité en taille → AES pour les données, RSA pour la clé). La logique « **clé privée verrouillée pendant le vote** » = personne, pas même l'admin, ne peut lire un bulletin avant la clôture. Distinguer **hash** (détecte une modif après coup) et **signature** (prouve l'origine). 
- **À NE PAS lire :** les noms d'algorithmes un par un — les **montrer**, **expliquer la logique**.
- **Q jury (très probable) :** voir Q&A — c'est ici que tomberont les vraies questions. Maîtriser : hybride, OAEP, GCM (chiffré+authentifié), pourquoi Ed25519, où sont stockées les clés (limite assumée : pas de HSM).
- **Piège :** ne pas réciter en perroquet. Si vous ne savez pas répondre à un détail, dire « le principe est X, l'implémentation précise est dans le code, je peux la montrer ». Honnêteté > bluff.

---

### 🟩 SLIDE 15 — La plateforme en action (réalisation)
- **Titre :** La plateforme en action
- **Obj. péda. :** prouver que **ça existe et que c'est soigné** (UX réelle).
- **Message :** « Du concept au produit fonctionnel, sur les 3 espaces. »
- **Contenu exact :** mosaïque de **4–6 captures clés** seulement :
  - Portail public (accueil + annuaire).
  - Adhésion multi-étapes.
  - Tableau de bord médecin.
  - Interface de **vote** + résultats.
  - Tableau de bord admin (gestion adhésions/élections).
- **Type :** grille de captures dans des mockups (cadre navigateur), 4–6 max, légendées d'un mot.
- **Reveal :** apparition par groupe (public → médecin → admin) ; **ou** mieux : enchaîner sur une **démo live** de 60–90 s si le contexte le permet (cf. conseils).
- **Placement :** redescente après le pic technique — du concret rassurant.
- **Transition ← S14 :** « Tout cela vit dans une plateforme réelle. » **→ S16 :** « Quel bilan, et après ? »
- **Durée :** 1 min 15 (ou +90 s si démo). **Mots max :** ~20 (légendes). **Visuels max :** 6 captures.
- **Oral :** ne **pas** décrire chaque écran ; choisir 2 écrans à raconter (adhésion + vote). **Recommandation forte :** prévoir une **démo live courte** du vote (l'effet « ça marche vraiment » est imbattable) avec captures en secours si réseau/temps.
- **Piège :** trop de captures = surcharge. 6 max, lisibles.

---

### 🟦 SLIDE 16 — Bilan, limites & perspectives
- **Titre :** Objectifs atteints — et la suite
- **Obj. péda. :** montrer du recul critique (force, pas faiblesse).
- **Message :** « Les 4 objectifs sont tenus ; voici les limites assumées et la trajectoire. »
- **Contenu exact (3 colonnes) :**
  - **Réalisé :** plateforme centralisée · adhésions dématérialisées + suivi · registre/annuaire · réclamations · sondages · **élections sécurisées** · RBAC/JWT.
  - **Limites assumées :** clés crypto en base (pas de HSM) · pas d'audit externe indépendant · tests surtout fonctionnels (Postman) · déploiement mono-instance.
  - **Perspectives :** HSM + audit externe + archi distribuée · tableaux de bord & stats · notifications avancées · **API officielle du registre** (l'ONMM comme source de référence pour d'autres SI santé).
- **Type :** 3 colonnes (vert / orange / bleu) — un « radar » des objectifs en option.
- **Reveal :** Réalisé → Limites → Perspectives.
- **Placement :** avant-dernière, prépare la conclusion.
- **Transition ← S15 :** « Quel bilan dresser ? » **→ S17 :** « En conclusion. »
- **Durée :** 1 min. **Mots max :** ~50. **Visuels max :** 3 colonnes.
- **Oral :** **revenir aux 4 objectifs du slide 6** (boucle narrative = très apprécié). Présenter les limites comme **choix maîtrisés**, pas oublis. Mettre en avant l'**API registre** comme vision stratégique.
- **Q jury probable :** « Qu'est-ce qui manque pour passer en production ? » → R : HSM/gestion de secrets, audit sécurité externe, tests automatisés + charge, HTTPS/infra durcie, RGPD-like sur données de santé.

---

### 🟦 SLIDE 17 — Conclusion & ouverture
- **Titre :** De l'Excel partagé à l'autorité de référence numérique
- **Obj. péda. :** clore par une vision et remercier.
- **Message :** « Une première brique solide du SI de l'ONMM. »
- **Contenu exact :** 1 phrase de synthèse (problème → solution → valeur) · l'ouverture (registre comme source officielle via API) · « Merci — questions ? » · coordonnées discrètes.
- **Type :** slide épuré, fond bleu, logo ONMM, une phrase forte centrée.
- **Reveal :** statique.
- **Placement :** clôture.
- **Transition ← S16 :** « Pour conclure. »
- **Durée :** 30 s. **Mots max :** ~25.
- **Oral :** finir sur la **vision** (l'ONMM comme autorité de référence numérique de la santé), pas sur « voilà j'ai fini ». Remercier le jury, inviter aux questions avec assurance.
- **Piège :** ne jamais finir par « euh, voilà ». Phrase de clôture **répétée à l'avance**.

---

### 🗂️ SLIDES ANNEXES (cachées, sorties uniquement sur question)
- **A1 — Diagramme de classes complet** (sur demande « modèle de données »).
- **A2 — Diagrammes de cas d'utilisation** (les 3).
- **A3 — Détail crypto** : format de stockage `Base64(wrappedDEK).Base64(iv+ciphertext)`, OAEP-SHA256, GCM tag 128 bits, IV 12 octets, Ed25519.
- **A4 — Planning des 8 sprints** (tableau complet).
- **A5 — Schéma machine d'état d'une élection** (BROUILLON → VOTE_EN_COURS → CLÔTURE → DÉPOUILLEMENT → RÉSULTATS).

> Astuce : ces slides vivent **après** la slide « Merci », non numérotées dans le flux principal. On y saute par lien ou par numéro.

---

## PARTIE 3 — Revue critique (comme un membre du jury sévère)

### 3.1 Slides à risque / à corriger
- **Slide 5 (diagnostic)** : la plus dense. Risque de surcharge → **révélation ligne par ligne obligatoire**, sinon le jury lit au lieu d'écouter.
- **Slide 14 (vote)** : risque inverse — trop d'algorithmes d'un coup. → animer le **pipeline**, raconter la **logique** (hybride, verrou), pas la liste.
- **Slide 11 (architecture)** : risque « slide à logos ». → chaque techno doit avoir **une justification orale** ; sinon ça sonne « buzzwords ».
- **Slide 12 (séquence)** : un diagramme de séquence UML brut est illisible projeté. → préférer le **parcours à étapes**.

### 3.2 Slides faibles si mal traitées
- **Slide 2 (fil)** : devient inutile si c'est un sommaire plat → en faire un **parcours narratif**.
- **Slide 15 (captures)** : faible si 12 captures minuscules → **6 max**, ou démo live.

### 3.3 Slides à vraie valeur (vos points forts)
- **5, 6, 8, 14** = la colonne vertébrale convaincante (problème → question → solution → climax technique). C'est là qu'on gagne la note.

### 3.4 Fusions / divisions recommandées
- **Ne pas** faire un slide par diagramme UML (cas d'usage public / médecin / admin = 3 slides) → **1 slide** méthodo + **annexes**.
- **Ne pas** faire un slide par module → **1 slide** vision 360°.
- **Ne pas** détailler les besoins NF un par un → **1 bandeau**.
- Si le temps est court, **fusionner 9 dans 8** (acteurs en encart du hub).

### 3.5 Slides à supprimer si > 18 min
1. Slide 7 (benchmark) — réductible à 30 s ou supprimable.
2. Slide 9 (acteurs) — fusionnable dans 8.
3. Slide 12 (workflow) — supprimable si la démo live montre le parcours.

---

## PARTIE 4 — Budget temps (cible 16 min, marge jusqu'à 18)

| # | Slide | Durée | Cumul |
|---|---|---|---|
| 1 | Couverture | 0:35 | 0:35 |
| 2 | Fil conducteur | 0:40 | 1:15 |
| 3 | Contexte & cadre | 1:00 | 2:15 |
| 4 | ONMM aujourd'hui | 1:00 | 3:15 |
| 5 | Diagnostic | 1:15 | 4:30 |
| 6 | Problématique & objectifs | 0:50 | 5:20 |
| 7 | Benchmark | 0:50 | 6:10 |
| 8 | Solution 360° | 1:00 | 7:10 |
| 9 | Acteurs & besoins | 0:45 | 7:55 |
| 10 | Méthodologie | 1:00 | 8:55 |
| 11 | Architecture | 1:15 | 10:10 |
| 12 | Workflow adhésion | 1:00 | 11:10 |
| 13 | Sécurité — fondations | 1:00 | 12:10 |
| 14 | **Vote électronique** | 2:00 | 14:10 |
| 15 | Plateforme en action | 1:15 | 15:25 |
| 16 | Bilan & perspectives | 1:00 | 16:25 |
| 17 | Conclusion | 0:30 | **16:55** |

≈ **17 min**, marge de sécurité pour les questions. Si stress → on accélère 7 et 9.

---

## PARTIE 5 — Justification des choix techniques (à dégainer en soutenance)

| Choix | Justification courte (à dire) |
|---|---|
| **React.js** | Composants réutilisables, SPA fluide sans rechargement, écosystème mûr, séparation nette front/back. |
| **Spring Boot** | Robustesse Java entreprise, Spring Security intégré (atout sécurité), REST rapide, idéal pour données critiques. |
| **PostgreSQL** | Relationnel : nombreuses relations (médecins↔demandes↔réclamations↔élections), intégrité référentielle, open source robuste. |
| **JWT stateless** | Pas de session serveur → scalabilité horizontale, validation indépendante par requête. |
| **RBAC (ADMIN/MEDECIN)** | Principe du moindre privilège, surface d'attaque réduite. |
| **BCrypt + sel** | Hachage adaptatif (coût ajustable), anti rainbow-table et anti brute-force. |
| **AES-256-GCM** | Chiffrement symétrique rapide **+ authentifié** (confidentialité + intégrité du chiffré). |
| **RSA-2048-OAEP** | Enveloppe asymétrique de la clé AES ; OAEP = padding sûr ; sépare « qui chiffre » de « qui peut déchiffrer ». |
| **Chiffrement hybride** | RSA seul est lent et limité en taille ; AES seul ne résout pas la distribution de clé → on combine. |
| **SHA-256 (Vote Hash)** | Empreinte d'intégrité publiquement vérifiable, sans clé, sans révéler le vote. |
| **Ed25519 (signature)** | Signature moderne, rapide, courte ; prouve l'**origine** du bulletin (anti-insertion en base). |

---

## PARTIE 6 — Questions probables du jury & réponses (préparation ciblée)

**Q1. Scrum tout seul, est-ce sérieux ?**
R : Scrum est un cadre d'équipe ; en solo j'en ai gardé ce qui crée de la valeur — Product/Sprint Backlog, sprints de 2 semaines, incréments livrables, suivi Jira — et écarté les cérémonies collectives (daily, revue d'équipe). Résultat : priorisation claire et livraison progressive, ce qui était l'objectif.

**Q2. Pourquoi Spring Boot plutôt que Node/Express ou Django ?**
R : Données sensibles + opérations critiques (vote) → je voulais Spring Security (RBAC, filtres JWT) et la robustesse de l'écosystème Java. Node aurait marché mais Spring offrait un cadre de sécurité plus intégré et typé.

**Q3. Pourquoi PostgreSQL et pas une base NoSQL ?**
R : Le domaine est fortement relationnel (médecins, demandes, réclamations, élections, votes liés). L'intégrité référentielle et les transactions ACID sont essentielles pour des données légales ; NoSQL aurait compliqué la cohérence.

**Q4. Où et combien de temps vit le JWT ? Refresh token ?**
R : Jeton signé renvoyé après login, transmis en en-tête sur chaque requête protégée, vérifié par un filtre Spring. Durée de vie courte ; le refresh/rotation et le stockage durci côté client font partie des améliorations de production.
*(Si non implémenté : le dire — « la rotation de token est une perspective »).*

**Q5. Comment garantissez-vous qu'un médecin ne vote qu'une fois sans connaître son identité ?**
R : À la soumission, je calcule un *Voter Token* = HMAC-SHA256(secret, electionId, médecinId). Il est **déterministe** (même médecin → même token pour cette élection) donc un doublon est détecté, mais **non réversible** (on ne remonte pas au médecin). La table des votes ne contient jamais l'ID réel.

**Q6. Pourquoi un chiffrement hybride et pas tout en RSA ?**
R : RSA est lent et limité à de petits messages. Je chiffre donc le bulletin en AES-256-GCM (rapide, authentifié) avec une clé (DEK) aléatoire **par bulletin**, et je protège cette DEK avec la clé publique RSA de l'élection. C'est le schéma standard d'enveloppe.

**Q7. Qui peut lire les votes pendant le scrutin ?**
R : Personne, pas même l'administrateur. La clé privée RSA de l'élection n'est délivrée par le service de gestion des clés **que** si l'élection n'est plus au statut « vote en cours ». Avant la clôture, les bulletins sont indéchiffrables.

**Q8. Différence entre le hash et la signature ?**
R : Le *Vote Hash* (SHA-256) détecte toute **modification** d'un bulletin déjà stocké (intégrité), vérifiable sans clé. La **signature Ed25519** du serveur prouve l'**origine** : un attaquant qui insérerait une ligne directement en base ne pourrait pas produire de signature valide sans la clé privée du serveur.

**Q9. Et si la base de données est volée ?**
R : Mots de passe en BCrypt+sel (inutilisables). Votes chiffrés AES dont la clé est scellée par RSA ; sans la clé privée (hors scrutin) ils restent illisibles. Identités des votants jamais stockées (HMAC). Le risque résiduel est la clé privée — d'où la perspective HSM.

**Q10. Vos clés privées, où sont-elles ?**
R (honnête) : actuellement gérées par l'application/au niveau base. C'est la limite que j'assume : en production, je les déplacerais vers un HSM / coffre de secrets (Vault), avec audit externe. C'est ma première perspective de sécurité.

**Q11. Avez-vous testé l'application ? Tests automatisés ?**
R : Tests fonctionnels manuels via Postman sur les API et parcours. Les tests unitaires/d'intégration automatisés et les tests de charge sont une perspective claire ; je connais leur importance pour la mise en production.

**Q12. Performance / montée en charge ?**
R : Architecture stateless (scalable horizontalement) + PostgreSQL indexé. Je n'ai pas mené de test de charge formel ; ~1 028 médecins, la charge réelle est modeste, mais je documenterais la perf avant prod.

**Q13. Accessibilité / régions à faible connexion ?**
R : SPA responsive (Tailwind) utilisable sur mobile ; c'est justement la réponse au problème des médecins éloignés. Un mode allégé/offline serait une amélioration.

**Q14. Conformité / protection des données de santé ?**
R : Données personnelles de professionnels → contrôle d'accès RBAC, chiffrement, traçabilité. Un cadre type RGPD (consentement, durée de conservation, droit d'accès) serait à formaliser avec l'ONMM.

**Q15. Qu'avez-vous appris / qu'auriez-vous fait autrement ?**
R : J'aurais intégré les tests automatisés dès le départ et externalisé la gestion des secrets plus tôt. J'ai surtout appris à transformer un besoin institutionnel flou en SI sécurisé.

---

## PARTIE 7 — Conseils de présentation & erreurs à éviter

**À faire**
- Répéter **3 fois minimum** à voix haute, chronométré. Mémoriser la 1ʳᵉ et la dernière phrase de chaque slide.
- Parler à **l'idée**, pas à la slide. Regarder le jury, pas l'écran.
- Avoir un **plan B démo** (captures/vidéo) si le live échoue.
- Boucler la fin sur les **4 objectifs** du début.
- Pour le vote : ralentir, c'est votre moment fort.

**À éviter**
- Lire les slides mot à mot (sauf la problématique).
- Réciter les algorithmes en perroquet.
- Surcharger (max ~40 mots/slide, sauf S5/S14).
- Bluffer sur un détail crypto : dire « le principe est X, le détail est dans le code ».
- Dénigrer l'existant de l'ONMM (respect institutionnel).
- Finir mollement.

---

## PARTIE 8 — Note de la présentation conçue & chemin vers « Excellent »

**Note de cette conception (structure + récit + support) : 17/20.**

Ce qui la tient à 17 et non plus haut, et comment monter à **19–20** :
1. **Démo live du vote** réussie (+1,5) — l'effet « ça marche vraiment » est décisif.
2. **Maîtrise orale de la crypto** au niveau Q&A (+1) — c'est ce qui distingue un 16 d'un 19 dans ce projet.
3. **Schémas réellement dessinés** (architecture, pipeline crypto, hub) plutôt que puces (+0,5) — le support doit *montrer*.
4. **Chronométrage tenu** ≤ 18 min (−2 garanti si dépassement).
5. **Slides annexes** prêtes pour les questions pointues (+0,5) — signale la préparation.

> Le contenu du projet **vaut** un 18–19 (le vote cryptographique est exceptionnel pour une Licence). La note finale dépendra surtout de votre **aisance orale** et du **respect du temps**, pas du fond, qui est solide.

---

## PARTIE 9 — Récapitulatif livrable
- **Récit final :** 17 slides (Contexte → Problème → Solution → Construction → Sécurité → Bilan) + 5 annexes.
- **Ordre & durées :** cf. Partie 4 (≈ 17 min).
- **Transitions :** Fondu par défaut, Morph entre slides jumelles.
- **Animations :** révélation progressive des puces ; pipeline animé sur S14 ; flux animé sur S11.
- **Identité :** bleu `#0A3D62` / cyan `#1B9AAA` / vert `#2EC4B6` / corail `#E63946` ; Montserrat + Inter ; icônes outline.
- **Support éditable :** `Presentation_PFE_ONMM.pptx`.
