import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot, Send, Mic, MicOff, ChevronRight, Search,
  ArrowLeft, FilePlus2, FileSearch, Stethoscope,
  MessageSquareWarning, ExternalLink, Sparkles,
  UserCircle, Vote, Bell,
} from "lucide-react";
import Marquee from "react-fast-marquee";

// ─── FAQ — rich data with links + follow-ups ──────────────────────────────────
const FAQ = [
  // ── Adhésion ──────────────────────────────────────────────────────────────
  {
    q: "Comment m'inscrire à l'Ordre ?",
    a: "Pour rejoindre l'ONMM, votre dossier d'adhésion se complète en **5 étapes guidées** directement en ligne :\n\n**1. Informations personnelles** — sexe, nationalité, N° pièce d'identité, adresse\n**2. Éducation** — spécialité, sous-spécialité, diplôme, université, année\n**3. Expérience professionnelle** — poste actuel, établissement, dates\n**4. Documents requis** — upload sécurisé de vos pièces justificatives\n**5. Déclaration & consentement** — validation finale et soumission\n\nAprès soumission, vous recevrez un **email de confirmation** et un numéro de référence pour suivre votre dossier. Le délai de traitement est de **15 jours ouvrables**.",
    tags: ["inscription", "adhesion", "inscrire", "rejoindre", "m'inscrire"],
    links: [{ label: "Déposer ma demande d'adhésion", to: "/adhesion" }],
    followUps: [
      "Quels documents sont requis pour l'adhésion ?",
      "Quel est le délai de traitement ?",
      "Mon diplôme étranger est-il accepté ?",
    ],
  },
  {
    q: "Quels documents sont requis pour l'adhésion ?",
    a: "Voici la liste complète des documents à fournir lors de l'étape 4 de votre dossier :\n\n**Documents obligatoires :**\n1. Diplôme de médecine (légalisé et traduit si étranger)\n2. Certificats de spécialisation (si applicable)\n3. Copie de la pièce d'identité nationale ou passeport\n4. Photo d'identité récente\n5. Justificatif de domicile (moins de 3 mois)\n6. Attestation du lieu d'exercice prévu\n\nTous les fichiers doivent être au format **PDF ou JPG**, taille maximale **5 Mo par fichier**.",
    tags: ["documents", "dossier", "pièces", "requis", "fichiers", "upload"],
    links: [{ label: "Commencer mon dossier d'adhésion", to: "/adhesion" }],
    followUps: [
      "Comment suivre mon dossier après soumission ?",
      "Mon diplôme étranger est-il accepté ?",
      "Quel est le délai de traitement ?",
    ],
  },
  {
    q: "Mon diplôme étranger est-il accepté ?",
    a: "Oui, les diplômes obtenus à l'étranger sont acceptés sous conditions :\n\n**Conditions requises :**\n1. **Légalisation** du diplôme par les autorités compétentes du pays d'obtention\n2. **Reconnaissance officielle** par le Ministère de la Santé mauritanien\n3. **Attestation d'équivalence** délivrée par le Ministère de l'Enseignement Supérieur\n4. **Traduction certifiée** si le document n'est pas en arabe ou français\n\nVous devrez fournir l'ensemble de ces documents lors de l'étape 4 du formulaire d'adhésion. En cas de doute, contactez directement le département Inscriptions.",
    tags: ["étranger", "diplôme", "international", "équivalence", "reconnaissance"],
    links: [
      { label: "Déposer ma demande", to: "/adhesion" },
      { label: "Contacter les Inscriptions", to: "/contact" },
    ],
    followUps: [
      "Quels documents sont requis pour l'adhésion ?",
      "Comment contacter l'ONMM ?",
    ],
  },
  {
    q: "Quel est le délai de traitement de l'inscription ?",
    a: "Les délais de traitement varient selon le type de demande :\n\n**Inscription à l'Ordre :** 15 jours ouvrables\n**Réclamation disciplinaire :** 30 à 45 jours\n**Message de contact :** 5 jours ouvrables\n**Renouvellement d'inscription :** 7 jours\n\nCes délais peuvent être allongés en période de forte affluence. Vous serez notifié par **email automatique** à chaque changement de statut de votre dossier (soumis, en cours, approuvé ou refusé).",
    tags: ["délai", "durée", "temps", "attente", "traitement", "combien de jours"],
    links: [{ label: "Suivre mon dossier", to: "/suivi-dossier" }],
    followUps: [
      "Comment suivre mon dossier d'adhésion ?",
      "Que se passe-t-il après l'approbation ?",
    ],
  },
  // ── Suivi de dossier ──────────────────────────────────────────────────────
  {
    q: "Comment suivre mon dossier d'adhésion ?",
    a: "Vous pouvez suivre l'état de votre dossier en temps réel via la page **Suivi de dossier**.\n\n**Comment procéder :**\n1. Rendez-vous sur la page de suivi\n2. Saisissez votre **numéro de référence** reçu par email lors de la soumission\n3. Consultez le statut actuel de votre dossier\n\n**Les 3 statuts possibles :**\n- **En attente (PENDING)** — votre dossier est reçu et en file d'attente\n- **Approuvé (APPROVED)** — inscription validée, votre profil médecin est activé\n- **Refusé (REJECTED)** — refus avec commentaire obligatoire de l'administrateur\n\nEn cas de refus, le commentaire de l'admin vous indiquera les éléments manquants ou incorrects.",
    tags: ["suivi", "dossier", "statut", "avancement", "suivre", "référence", "numéro"],
    links: [{ label: "Accéder au suivi de dossier", to: "/suivi-dossier" }],
    followUps: [
      "Que se passe-t-il si mon dossier est approuvé ?",
      "Que faire si mon dossier est refusé ?",
      "Quel est le délai de traitement ?",
    ],
  },
  {
    q: "Que se passe-t-il si mon dossier est approuvé ?",
    a: "Félicitations ! Lorsque votre dossier est **approuvé** par l'administration :\n\n1. Vous recevez un **email de confirmation** automatique\n2. Votre **profil médecin** est créé et activé dans le registre officiel de l'ONMM\n3. Vous pouvez vous connecter à votre **Espace Médecin** personnel\n4. Vous pouvez télécharger votre **certificat d'adhésion en PDF**\n5. Votre profil apparaît dans l'**Annuaire public** des médecins\n\nVous aurez également accès aux questionnaires/sondages et aux élections de l'Ordre.",
    tags: ["approuvé", "accepted", "validé", "profil", "certificat", "après"],
    links: [
      { label: "Se connecter à l'Espace Médecin", to: "/login" },
      { label: "Annuaire des médecins", to: "/annuaire" },
    ],
    followUps: [
      "Comment télécharger mon certificat d'adhésion ?",
      "Comment me connecter à mon espace médecin ?",
    ],
  },
  {
    q: "Comment télécharger mon certificat d'adhésion ?",
    a: "Le certificat d'adhésion est disponible uniquement après **approbation** de votre dossier.\n\n**Pour le télécharger :**\n1. Connectez-vous à votre **Espace Médecin** avec vos identifiants\n2. Rendez-vous dans la section **Mon Profil**\n3. Cliquez sur « **Télécharger mon certificat** » (format PDF)\n\nCe certificat officiel atteste de votre inscription valide à l'Ordre National des Médecins Mauritaniens et peut être présenté à tout établissement de santé.",
    tags: ["certificat", "télécharger", "pdf", "attestation", "adhésion"],
    links: [{ label: "Se connecter à l'Espace Médecin", to: "/login" }],
    followUps: [
      "Comment me connecter à mon espace médecin ?",
      "Comment mettre à jour mon profil ?",
    ],
  },
  // ── Espace médecin ────────────────────────────────────────────────────────
  {
    q: "Comment me connecter à mon espace médecin ?",
    a: "L'Espace Médecin est accessible après **validation de votre dossier d'adhésion**.\n\n**Connexion :**\n1. Rendez-vous sur la page de connexion\n2. Saisissez votre **email** et votre **mot de passe**\n3. Accédez à votre tableau de bord personnel\n\n**Fonctionnalités disponibles :**\n- Consulter et mettre à jour votre profil\n- Télécharger votre certificat d'adhésion PDF\n- Déposer et suivre vos réclamations\n- Participer aux questionnaires et sondages\n- Voter lors des élections de l'Ordre\n- Consulter vos notifications\n\n**Mot de passe oublié ?** Utilisez la fonction de réinitialisation sur la page de connexion.",
    tags: ["connexion", "login", "connecter", "espace médecin", "mot de passe", "compte"],
    links: [{ label: "Se connecter", to: "/login" }],
    followUps: [
      "Comment télécharger mon certificat d'adhésion ?",
      "Comment participer aux questionnaires ?",
      "Comment voter lors des élections ?",
    ],
  },
  // ── Réclamations ──────────────────────────────────────────────────────────
  {
    q: "Comment déposer une réclamation ?",
    a: "Toute personne peut déposer une réclamation auprès de l'ONMM sans être médecin. La procédure est **entièrement en ligne** et **confidentielle**.\n\n**Étapes du dépôt :**\n1. Rendez-vous sur la page Réclamations\n2. Remplissez le formulaire en **3 étapes** :\n   - Vos coordonnées (nom, email, téléphone)\n   - Détails de la réclamation (médecin concerné, faits, date)\n   - Documents justificatifs (optionnel)\n3. Soumettez — vous recevrez un **numéro de référence** par email\n\n**Statuts possibles :** Reçue → En cours → Clôturée",
    tags: ["réclamation", "plainte", "signalement", "déposer", "porter plainte"],
    links: [{ label: "Déposer une réclamation", to: "/reclamations" }],
    followUps: [
      "La réclamation est-elle confidentielle ?",
      "Quel est le délai de traitement d'une réclamation ?",
      "Qu'est-ce que la déontologie médicale ?",
    ],
  },
  {
    q: "La réclamation est-elle confidentielle ?",
    a: "Oui, **la confidentialité est garantie** à toutes les étapes du traitement.\n\n**Garanties de confidentialité :**\n- Vos informations personnelles ne sont jamais divulguées sans votre consentement\n- Le Conseil de Discipline traite toutes les affaires avec discrétion totale\n- L'anonymat peut être préservé dans certaines procédures disciplinaires\n- Seuls les membres habilités de l'ONMM ont accès aux dossiers\n\nL'ONMM est soumis aux **règles strictes du secret professionnel** dans toutes ses procédures.",
    tags: ["confidentiel", "confidentialité", "anonyme", "secret", "privé", "discret"],
    links: [{ label: "Déposer une réclamation", to: "/reclamations" }],
    followUps: [
      "Comment déposer une réclamation ?",
      "Qu'est-ce que la déontologie médicale ?",
    ],
  },
  {
    q: "Qu'est-ce que la déontologie médicale ?",
    a: "La **déontologie médicale** est l'ensemble des règles et devoirs qui régissent l'exercice de la médecine.\n\n**Les principes fondamentaux :**\n- **Secret médical** — confidentialité absolue des informations patients\n- **Respect du patient** — dignité, consentement éclairé, non-discrimination\n- **Indépendance professionnelle** — liberté de prescription\n- **Confraternité** — respect entre confrères\n- **Compétence** — formation continue obligatoire\n- **Honnêteté** — interdiction de publicité mensongère\n\nL'ONMM veille au respect du Code de déontologie et instruit les plaintes via son **Conseil de Discipline**.",
    tags: ["déontologie", "éthique", "code", "règles", "devoirs", "discipline"],
    links: [{ label: "En savoir plus sur l'ONMM", to: "/a-propos" }],
    followUps: [
      "Comment déposer une réclamation ?",
      "Quel est le rôle de l'ONMM ?",
    ],
  },
  // ── Annuaire ──────────────────────────────────────────────────────────────
  {
    q: "Comment trouver un médecin inscrit ?",
    a: "L'**Annuaire médical public** de l'ONMM permet à tout citoyen de vérifier qu'un médecin est bien inscrit et autorisé à exercer.\n\n**Modes de recherche disponibles :**\n- **Par nom/prénom** — recherche directe\n- **Par spécialité ou sous-spécialité** — parmi 40+ spécialités\n- **Par wilaya** — dans les 13 wilayas de Mauritanie\n- **Par lieu d'exercice** — hôpital, cabinet, clinique\n\nChaque profil affiché contient : nom complet, spécialité, wilaya d'exercice, lieu d'exercice et statut d'inscription valide.",
    tags: ["annuaire", "trouver", "chercher", "médecin", "praticien", "recherche"],
    links: [{ label: "Rechercher un médecin", to: "/annuaire" }],
    followUps: [
      "Comment rechercher par spécialité ?",
      "Comment rechercher un médecin par wilaya ?",
      "Comment vérifier l'autorisation d'un médecin ?",
    ],
  },
  {
    q: "Comment rechercher par spécialité ?",
    a: "Dans l'Annuaire médical, le filtre **Spécialité** vous permet de sélectionner parmi plus de **40 spécialités médicales** disponibles en Mauritanie :\n\nCardiologie, Pédiatrie, Gynécologie-Obstétrique, Chirurgie générale, Dermatologie, Ophtalmologie, ORL, Neurologie, Psychiatrie, Rhumatologie, Oncologie, Urologie, Radiologie, Anesthésie-Réanimation, Médecine générale, et bien d'autres.\n\nVous pouvez également filtrer par **sous-spécialité** pour une recherche encore plus précise.",
    tags: ["spécialité", "spécialiste", "cardiologie", "pédiatrie", "filtre"],
    links: [{ label: "Accéder à l'Annuaire", to: "/annuaire" }],
    followUps: [
      "Comment rechercher un médecin par wilaya ?",
      "Comment trouver un médecin inscrit ?",
    ],
  },
  // ── Questionnaires & Élections ────────────────────────────────────────────
  {
    q: "Comment participer aux questionnaires et sondages ?",
    a: "Les questionnaires et sondages sont accessibles aux **médecins inscrits et connectés** uniquement.\n\n**Pour participer :**\n1. Connectez-vous à votre **Espace Médecin**\n2. Rendez-vous dans la section **Sondages**\n3. Consultez les questionnaires disponibles\n4. Répondez — chaque médecin ne peut répondre qu'**une seule fois** par questionnaire\n5. Recevez une confirmation de soumission\n\nLes résultats sont analysés par l'administration et peuvent être partagés avec les membres selon la politique de l'Ordre.",
    tags: ["questionnaire", "sondage", "participation", "répondre", "vote sondage"],
    links: [{ label: "Se connecter à l'Espace Médecin", to: "/login" }],
    followUps: [
      "Comment voter lors des élections ?",
      "Comment me connecter à mon espace médecin ?",
    ],
  },
  {
    q: "Comment voter lors des élections de l'Ordre ?",
    a: "Le **module électoral** de l'ONMM permet aux médecins inscrits de participer démocratiquement à la vie de l'Ordre.\n\n**Processus de vote :**\n1. Connectez-vous à votre **Espace Médecin**\n2. Vérifiez les élections ouvertes dans la section **Élections**\n3. Consultez les profils des **candidats** et leur programme\n4. Émettez votre vote — **une seule fois** par élection\n5. Recevez une confirmation de vote enregistré\n\n**Important :** Le vote n'est autorisé que durant la **période d'ouverture officielle** définie par l'administration. Les résultats sont publiés après la clôture.",
    tags: ["élection", "vote", "voter", "candidat", "élire", "scrutin"],
    links: [{ label: "Se connecter à l'Espace Médecin", to: "/login" }],
    followUps: [
      "Comment participer aux questionnaires ?",
      "Comment me connecter à mon espace médecin ?",
    ],
  },
  // ── Notifications ─────────────────────────────────────────────────────────
  {
    q: "Quelles notifications vais-je recevoir ?",
    a: "L'ONMM envoie des **emails automatiques** lors des événements importants concernant votre dossier :\n\n**Notifications automatiques :**\n- Dossier d'adhésion **soumis** — accusé de réception + numéro de référence\n- Dossier **approuvé** — activation de votre profil médecin\n- Dossier **refusé** — raison détaillée fournie par l'administrateur\n- Profil **suspendu** — avec motif de suspension\n- Profil **réactivé** — confirmation de réactivation\n\nL'administration peut également vous envoyer des **notifications in-app** ciblées (informations, rappels, annonces importantes).",
    tags: ["notification", "email", "alerte", "information", "message", "notifier"],
    links: [{ label: "Contacter l'ONMM", to: "/contact" }],
    followUps: [
      "Comment me connecter à mon espace médecin ?",
      "Comment contacter l'ONMM ?",
    ],
  },
  // ── Contact / ONMM ────────────────────────────────────────────────────────
  {
    q: "Comment contacter l'ONMM ?",
    a: "Plusieurs moyens sont disponibles pour joindre l'Ordre National des Médecins Mauritaniens :\n\n**Téléphone :** +222 45 25 00 00 (standard)\n**Email :** contact@ordre-medecins.mr\n**Adresse :** Siège ONMM, Tevragh Zeina, Nouakchott\n\n**Contacts par département :**\n- Inscriptions & Adhésions : +222 45 25 00 02\n- Réclamations & Déontologie : +222 45 25 00 03\n- Secrétariat général : +222 45 25 00 01\n- Communication : +222 45 25 00 04\n\nVous pouvez aussi utiliser le **formulaire de contact en ligne** pour toute demande écrite.",
    tags: ["contact", "téléphone", "email", "adresse", "contacter", "joindre", "appeler"],
    links: [{ label: "Formulaire de contact", to: "/contact" }],
    followUps: [
      "Quelles sont les heures d'ouverture ?",
      "Qu'est-ce que l'ONMM ?",
    ],
  },
  {
    q: "Quelles sont les heures d'ouverture ?",
    a: "Le siège de l'ONMM est ouvert aux horaires suivants :\n\n**Jours ouvrables :** Dimanche au Jeudi\n**Horaires :** 08h00 – 16h00\n**Jours fermés :** Vendredi et Samedi\n\nPour les **urgences administratives**, envoyez un email à contact@ordre-medecins.mr — nous répondons dans un délai de **24h** les jours ouvrables.\n\nLe portail en ligne et cet assistant virtuel restent disponibles **24h/24, 7j/7** pour toutes vos démarches numériques.",
    tags: ["horaires", "ouverture", "fermeture", "heures", "ouvert", "fermé", "disponible"],
    links: [{ label: "Page Contact", to: "/contact" }],
    followUps: [
      "Comment contacter l'ONMM ?",
      "Qu'est-ce que l'ONMM ?",
    ],
  },
  {
    q: "Qu'est-ce que l'ONMM ?",
    a: "L'**Ordre National des Médecins Mauritaniens (ONMM)** est l'institution officielle qui régule et encadre l'exercice de la médecine en République Islamique de Mauritanie.\n\n**Fondé en 1981**, l'ONMM remplit plusieurs missions essentielles :\n- **Régulation** — encadrer et autoriser l'exercice de la médecine\n- **Déontologie** — veiller au respect du Code de déontologie médicale\n- **Registre officiel** — tenir le registre des médecins autorisés à exercer\n- **Discipline** — instruire les plaintes via le Conseil de Discipline\n- **Représentation** — défendre les intérêts légitimes de la profession\n\nActuellement, l'ONMM regroupe **plus de 500 médecins** inscrits dans les **13 wilayas** de Mauritanie, avec plus de **40 spécialités** représentées.",
    tags: ["onmm", "ordre", "institution", "présentation", "rôle", "histoire", "missions"],
    links: [{ label: "En savoir plus sur l'ONMM", to: "/a-propos" }],
    followUps: [
      "Comment m'inscrire à l'Ordre ?",
      "Comment trouver un médecin inscrit ?",
      "Comment contacter l'ONMM ?",
    ],
  },
  {
    q: "Quels services sont disponibles en ligne ?",
    a: "Le portail numérique de l'ONMM offre l'ensemble des services suivants en ligne :\n\n**Site public (sans inscription) :**\n- Annonces et actualités de l'Ordre\n- Annuaire public des médecins inscrits\n- Dépôt de réclamation\n- Informations institutionnelles et galerie\n\n**Espace Médecin (après inscription) :**\n- Dépôt du dossier d'adhésion (multi-étapes)\n- Suivi en temps réel de votre demande\n- Téléchargement du certificat d'adhésion PDF\n- Participation aux sondages et élections\n- Gestion de votre profil privé\n- Consultation des notifications",
    tags: ["services", "ligne", "portail", "disponible", "plateforme", "numérique", "fonctionnalités"],
    links: [
      { label: "Accéder à l'Espace Médecin", to: "/login" },
      { label: "Annuaire des médecins", to: "/annuaire" },
    ],
    followUps: [
      "Comment m'inscrire à l'Ordre ?",
      "Comment me connecter à mon espace médecin ?",
    ],
  },
];

const DEFAULT_REPLY = {
  a: "Je n'ai pas de réponse précise à cette question dans ma base de données. Je vous invite à :\n\n1. **Reformuler** votre question avec d'autres mots\n2. **Consulter** notre page Contact pour joindre directement l'ONMM\n3. **Appeler** le +222 45 25 00 00 du Dimanche au Jeudi de 08h à 16h\n\nNos agents seront heureux de vous aider personnellement.",
  links: [{ label: "Formulaire de contact", to: "/contact" }],
  followUps: ["Qu'est-ce que l'ONMM ?", "Quels services sont disponibles en ligne ?"],
};

function findAnswer(input) {
  const lower = input.toLowerCase().trim();
  if (!lower) return null;
  for (const faq of FAQ) {
    if (faq.tags.some((t) => lower.includes(t))) return faq;
    if (faq.q.toLowerCase().includes(lower)) return faq;
  }
  return null;
}

// ─── Marquee pills ─────────────────────────────────────────────────────────────
const MARQUEE_PILLS = [
  "Comment m'inscrire à l'Ordre ?",
  "Documents requis pour l'adhésion",
  "Diplôme étranger accepté ?",
  "Délai de traitement inscription",
  "Suivre mon dossier en ligne",
  "Dossier approuvé, et ensuite ?",
  "Télécharger mon certificat PDF",
  "Déposer une réclamation",
  "Réclamation confidentielle ?",
  "Déontologie médicale ONMM",
  "Trouver un médecin inscrit",
  "Recherche par spécialité",
  "Recherche par wilaya",
  "Participer aux sondages",
  "Voter lors des élections",
  "Notifications et emails ONMM",
  "Contacter l'ONMM",
  "Horaires d'ouverture",
  "Qu'est-ce que l'ONMM ?",
  "Services disponibles en ligne",
  "Se connecter à l'espace médecin",
  "Mot de passe oublié",
  "Annonces et actualités",
  "Galerie de l'ONMM",
  "Spécialités médicales disponibles",
  "Wilayas couvertes par l'ONMM",
  "Délai traitement réclamation",
  "Candidats aux élections",
];

// ─── Welcome starter cards ─────────────────────────────────────────────────────
const STARTERS = [
  {
    icon: FilePlus2,
    title: "Adhésion & Inscription",
    sub: "Rejoindre l'Ordre des médecins",
    question: "Comment m'inscrire à l'Ordre ?",
    color: "bg-green-50 text-green-700 border-green-200",
    iconBg: "bg-green-100",
  },
  {
    icon: FileSearch,
    title: "Suivi de dossier",
    sub: "Vérifier l'état de ma demande",
    question: "Comment suivre mon dossier d'adhésion ?",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100",
  },
  {
    icon: Stethoscope,
    title: "Annuaire médecins",
    sub: "Trouver un praticien inscrit",
    question: "Comment trouver un médecin inscrit ?",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100",
  },
  {
    icon: MessageSquareWarning,
    title: "Réclamations",
    sub: "Signaler un problème confidentiel",
    question: "Comment déposer une réclamation ?",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100",
  },
  {
    icon: UserCircle,
    title: "Espace médecin",
    sub: "Connexion, profil, certificat",
    question: "Comment me connecter à mon espace médecin ?",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    iconBg: "bg-slate-100",
  },
  {
    icon: Vote,
    title: "Élections & Sondages",
    sub: "Participer à la vie de l'Ordre",
    question: "Comment voter lors des élections de l'Ordre ?",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-100",
  },
];

// ─── Inline text renderer (bold + paragraphs + numbered lists) ─────────────────
function RichText({ text }) {
  const paragraphs = text.split("\n\n");
  return (
    <div className="space-y-3">
      {paragraphs.map((para, pi) => {
        const lines = para.split("\n");
        const isNumberedList = lines.every((l) => /^\d+\./.test(l.trim()) || l.trim() === "");
        const isBulletList = lines.every((l) => l.trim().startsWith("-") || l.trim() === "");

        if (isNumberedList && lines.length > 1) {
          return (
            <ol key={pi} className="list-none space-y-1.5">
              {lines.filter(Boolean).map((line, li) => {
                const content = line.replace(/^\d+\.\s*/, "");
                return (
                  <li key={li} className="flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center justify-center">
                      {li + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{renderInline(content)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        if (isBulletList && lines.length > 1) {
          return (
            <ul key={pi} className="space-y-1">
              {lines.filter(Boolean).map((line, li) => {
                const content = line.replace(/^-\s*/, "");
                return (
                  <li key={li} className="flex items-start gap-2 text-sm leading-relaxed">
                    <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>{renderInline(content)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={pi} className="text-sm leading-relaxed">
            {renderInline(para)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  // streaming
  const [streamingText, setStreamingText] = useState(null);
  const [streamingIdx, setStreamingIdx] = useState(null);
  const streamRef = useRef(null);
  const pendingStreamRef = useRef(null);

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setMicSupported(false);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, streamingText]);

  // suggestions filter
  useEffect(() => {
    const val = input.trim().toLowerCase();
    if (!val) { setSuggestions([]); setShowSuggestions(false); setSelectedIndex(-1); return; }
    const matches = FAQ.filter(
      (f) => f.q.toLowerCase().includes(val) || f.tags.some((t) => t.includes(val))
    ).slice(0, 5).map((f) => f.q);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setSelectedIndex(-1);
  }, [input]);

  const now = () =>
    new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const startStream = useCallback((text, idx) => {
    if (streamRef.current) clearInterval(streamRef.current);
    const words = text.split(" ");
    let i = 0;
    setStreamingIdx(idx);
    setStreamingText("");
    streamRef.current = setInterval(() => {
      i++;
      setStreamingText(words.slice(0, i).join(" "));
      if (i >= words.length) {
        clearInterval(streamRef.current);
        streamRef.current = null;
        setStreamingText(null);
        setStreamingIdx(null);
      }
    }, 22);
  }, []);

  // Trigger streaming after a bot message is added (must be after startStream declaration)
  useEffect(() => {
    if (pendingStreamRef.current !== null && messages.length > 0) {
      const text = pendingStreamRef.current;
      const idx = messages.length - 1;
      pendingStreamRef.current = null;
      if (messages[idx]?.from === "bot") {
        startStream(text, idx);
      }
    }
  }, [messages, startStream]);

  const send = useCallback((text) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Handle goodbye
    if (msg === "Non, merci") {
      const userMsg = { from: "user", text: msg, time: now() };
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);
      setTimeout(() => {
        const goodbye = {
          from: "bot",
          text: "Parfait ! N'hésitez pas à revenir si vous avez d'autres questions. Je reste disponible 24h/24. Bonne journée !",
          links: [],
          followUps: [],
          noFollowUp: true,
          time: now(),
        };
        setMessages((prev) => [...prev, goodbye]);
        pendingStreamRef.current = goodbye.text;
        setTyping(false);
      }, 400);
      return;
    }

    const userMsg = { from: "user", text: msg, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const faq = findAnswer(msg);
      const reply = faq ?? DEFAULT_REPLY;
      const botMsg = {
        from: "bot",
        text: reply.a,
        links: reply.links || [],
        followUps: reply.followUps || [],
        time: now(),
      };
      setMessages((prev) => [...prev, botMsg]);
      pendingStreamRef.current = reply.a;
      setTyping(false);
    }, 700);
  }, [input, startStream]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) send(suggestions[selectedIndex]);
      else send();
    }
    else if (e.key === "Escape") { setShowSuggestions(false); setSelectedIndex(-1); }
  };

  const toggleVoice = () => {
    if (!micSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const r = new SR();
    r.lang = "fr-FR";
    r.interimResults = false;
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col bg-white" style={{ height: "100dvh" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-6 border-b border-slate-100 bg-white shrink-0" style={{ height: "56px" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 shadow-sm">
            <Bot size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">Assistant ONMM</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-none">Propulsé par l'Ordre National des Médecins</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            En ligne
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={12} />
            Retour au site
          </Link>
        </div>
      </header>

      {/* ── Marquee band ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-100 bg-slate-50 py-2 shrink-0">
        <Marquee speed={36} pauseOnHover gradient={false}>
          {MARQUEE_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => { inputRef.current?.focus(); send(pill); }}
              className="mx-1.5 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-500 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors whitespace-nowrap"
            >
              <Sparkles size={9} className="opacity-40" />
              {pill}
            </button>
          ))}
        </Marquee>
      </div>

      {/* ── Chat area ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">

          {/* Welcome screen */}
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-8"
            >
              <div className="mb-4 flex justify-center">
                <div className="h-14 w-14 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30">
                  <Bot size={28} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Comment puis-je vous aider ?</h2>
              <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                Posez vos questions sur l'ONMM — adhésion, annuaire, réclamations, espace médecin, et plus encore.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
                {STARTERS.map((s) => {
                  const StarterIcon = s.icon;
                  return (
                    <motion.button
                      key={s.title}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => send(s.question)}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:shadow-md ${s.color}`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}>
                        <StarterIcon size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-snug">{s.title}</p>
                        <p className="text-xs opacity-70 mt-0.5 leading-snug">{s.sub}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isUser = msg.from === "user";
                const isLastBot = !isUser && idx === messages.length - 1 && !typing;
                const isStreaming = streamingIdx === idx;
                const displayText = isStreaming ? streamingText ?? "" : msg.text;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    {!isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 shadow-sm mt-1">
                        <Bot size={15} className="text-white" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 ${isUser ? "items-end max-w-[80%]" : "flex-1"}`}>
                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isUser
                            ? "bg-green-600 text-white rounded-tr-none"
                            : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none"
                        }`}
                      >
                        {isUser ? (
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        ) : (
                          <RichText text={displayText} />
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>

                      {/* Bot extras: links + follow-ups (only on last bot msg, after streaming) */}
                      {!isUser && isLastBot && !isStreaming && (
                        <div className="w-full mt-1 space-y-3">
                          {/* Page links */}
                          {msg.links?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {msg.links.map((l) => (
                                <Link
                                  key={l.to}
                                  to={l.to}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 hover:border-green-300 transition-colors"
                                >
                                  {l.label}
                                  <ExternalLink size={10} />
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* ChatGPT-like "Anything else?" follow-up */}
                          {!msg.noFollowUp && (
                            <div className="rounded-xl border border-slate-100 bg-white p-3">
                              <div className="flex items-center gap-1.5 mb-2.5">
                                <Sparkles size={11} className="text-green-500 shrink-0" />
                                <p className="text-[11px] text-slate-500">Y a-t-il autre chose avec laquelle je peux vous aider ?</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {msg.followUps?.slice(0, 2).map((q) => (
                                  <button
                                    key={q}
                                    onClick={() => send(q)}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                                  >
                                    {q}
                                  </button>
                                ))}
                                <button
                                  onClick={() => send("Non, merci")}
                                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                >
                                  Non, merci
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 shadow-sm">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-slate-50 px-4 py-3">
                  <TypingDots />
                </div>
              </motion.div>
            )}

            <div ref={endRef} />
          </div>
        </div>
      </main>

      {/* ── Input area ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-4 sm:px-6 pb-4 pt-3">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                    <Search size={11} className="text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-400">
                      {suggestions.length} suggestion{suggestions.length > 1 ? "s" : ""}
                    </span>
                    <span className="ml-auto text-[10px] text-slate-300">↑↓ naviguer · ↵ sélectionner</span>
                  </div>
                  <ul>
                    {suggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          onMouseDown={(e) => { e.preventDefault(); send(s); }}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                            i === selectedIndex ? "bg-green-50 text-green-700" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <ChevronRight size={13} className={i === selectedIndex ? "text-green-500" : "text-slate-300"} />
                          <span className="flex-1 leading-snug">{s}</span>
                          {i === selectedIndex && (
                            <kbd className="hidden sm:block text-[10px] rounded border border-green-200 bg-green-100 text-green-600 px-1.5 py-0.5">↵</kbd>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input row */}
            <div className={`flex items-end gap-2 rounded-2xl border px-4 py-3 shadow-sm transition-all ${
              isListening
                ? "border-red-300 bg-red-50 ring-2 ring-red-400/15"
                : "border-slate-200 bg-white focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-500/10"
            }`}>
              {isListening && (
                <div className="flex items-center gap-0.5 shrink-0 mb-0.5">
                  {[4, 8, 12, 8, 4].map((h, i) => (
                    <span key={i} className="w-0.5 rounded-full bg-red-500 animate-bounce" style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              )}

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={onKey}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={isListening ? "Écoute en cours…" : "Posez votre question sur l'ONMM…"}
                maxLength={300}
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none leading-relaxed"
                style={{ maxHeight: "120px" }}
              />

              <div className="flex items-center gap-1.5 shrink-0">
                {input.length > 50 && (
                  <span className={`text-[10px] tabular-nums ${input.length > 270 ? "text-red-400" : "text-slate-300"}`}>
                    {input.length}/300
                  </span>
                )}

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={toggleVoice}
                  disabled={!micSupported}
                  title={!micSupported ? "Non supporté" : isListening ? "Arrêter" : "Saisie vocale"}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                    !micSupported ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : isListening ? "bg-red-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => send()}
                  disabled={!input.trim() || !!streamingIdx}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700 disabled:opacity-35 shadow-sm shadow-green-600/20"
                >
                  <Send size={14} />
                </motion.button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-[11px] text-slate-400">
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-px font-mono text-[10px]">Shift+Entrée</kbd> nouvelle ligne
                {" · "}
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-px font-mono text-[10px]">Entrée</kbd> envoyer
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Bell size={9} />
                <span>Ne fournit pas de conseil médical</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
