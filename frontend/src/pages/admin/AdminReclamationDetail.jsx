import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getReclamationById,
  startReclamation,
  closeReclamation,
} from "../../services/adminReclamationApi";
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  X,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  Paperclip,
  FileText,
  Inbox,
  FilePlus2,
  UserCheck,
  Flag,
  User,
  Tag,
  Layers,
  Save,
  Clock,
  AlertCircle,
  Hash,
  ShieldCheck,
  History,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Référentiels                                                       */
/* ------------------------------------------------------------------ */
const STATUS_CFG = {
  SUBMITTED: {
    label: "Soumise",
    classes: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "En cours",
    classes: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  CLOSED: {
    label: "Clôturée",
    classes: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
};

const PRIORITY_CFG = {
  LOW:    { label: "Faible",  text: "text-slate-500 dark:text-slate-400" },
  MEDIUM: { label: "Moyenne", text: "text-blue-600 dark:text-blue-400" },
  HIGH:   { label: "Élevée",  text: "text-amber-600 dark:text-amber-400" },
  URGENT: { label: "Urgente", text: "text-red-600 dark:text-red-400" },
};

const AUTEUR_CFG = {
  MEDECIN: { label: "Médecin", classes: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
  CITOYEN: { label: "Citoyen", classes: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" },
};

const CATEGORY_LABELS = {
  RETARD_TRAITEMENT: "Retard de traitement",
  ERREUR_DOSSIER: "Erreur sur dossier",
  DEMANDE_INFORMATION: "Demande d'information",
  QUALITE_SOINS: "Qualité des soins",
  INFORMATION_CONSENTEMENT: "Information et consentement",
  SECRET_PROFESSIONNEL: "Secret professionnel",
  COMPORTEMENT_INAPPROPRIE: "Comportement inapproprié",
  CERTIFICAT_MEDICAL: "Certificat médical",
  PRESCRIPTION_ABUSIVE: "Prescription abusive",
  CONFRATERNITE: "Confraternité",
  PUBLICITE_CHARLATANISME: "Publicité / charlatanisme",
  DECONSIDERATION_PROFESSION: "Déconsidération de la profession",
  AUTRE: "Autre",
};

const MODULE_LABELS = {
  ADMINISTRATIF: "Administratif",
  EXERCICE_PROFESSIONNEL: "Exercice professionnel",
  ETHIQUE_DEONTOLOGIE: "Éthique et déontologie",
  RELATION_PATIENT: "Relation patient",
  DOCUMENT_MEDICAL: "Document médical",
  AUTRE: "Autre",
};

const STATUS_ORDER = { SUBMITTED: 0, IN_PROGRESS: 1, CLOSED: 2 };

const WORKFLOW_STEPS = [
  { key: "SUBMITTED", label: "Soumise", field: "dateCreation" },
  { key: "IN_PROGRESS", label: "Prise en charge", field: "datePriseEnCharge" },
  { key: "CLOSED", label: "Clôturée", field: "dateCloture" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatDateTime = (v) =>
  v
    ? new Date(v).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

const getFileName = (path) =>
  decodeURIComponent(path || "").split("/").pop() || "Pièce jointe";

const getInitials = (first, last) => {
  const a = (first || "").trim().charAt(0);
  const b = (last || "").trim().charAt(0);
  return (a + b).toUpperCase() || "?";
};

const draftStorageKey = (id) => `admin_reclamation_draft_${id}`;

/* ------------------------------------------------------------------ */
/*  Micro‑composants                                                   */
/* ------------------------------------------------------------------ */
function StatusBadge({ statut }) {
  const cfg = STATUS_CFG[statut] || STATUS_CFG.SUBMITTED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function AuteurBadge({ type }) {
  const cfg = AUTEUR_CFG[type] || AUTEUR_CFG.CITOYEN;
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, valueClass }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        <Icon size={13} strokeWidth={2.25} />
        <span className="text-[10.5px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p
        title={typeof value === "string" ? value : undefined}
        className={`mt-1.5 truncate text-[14px] font-semibold ${valueClass || "text-slate-800 dark:text-slate-100"}`}
      >
        {value === 0 ? 0 : value || "—"}
      </p>
    </div>
  );
}

function SectionCard({ icon: Icon, title, action, children, contentClassName = "p-5" }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Icon size={15} className="text-slate-400 dark:text-slate-500" />
          {title}
        </h2>
        {action}
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
      <Icon size={14} className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600" />
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-700 dark:text-slate-300" title={value}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function WorkflowIndicator({ statut, reclamation }) {
  const currentOrder = STATUS_ORDER[(statut || "").toUpperCase()] ?? -1;

  return (
    <div className="flex items-center">
      {WORKFLOW_STEPS.map((step, idx) => {
        const stepOrder = STATUS_ORDER[step.key];
        const done = currentOrder > stepOrder;
        const active = currentOrder === stepOrder;
        const isLast = idx === WORKFLOW_STEPS.length - 1;
        const date = reclamation?.[step.field];

        return (
          <div key={step.key} className={`flex items-center ${isLast ? "shrink-0" : "flex-1"}`}>
            <div className="flex shrink-0 items-center gap-2.5">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? "bg-green-600 text-white"
                    : done
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                {done ? <CheckCircle2 size={12} /> : idx + 1}
              </span>
              <div className="leading-tight">
                <p className={`text-xs font-semibold ${done || active ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-600"}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {date ? formatDateTime(date) : "En attente"}
                </p>
              </div>
            </div>
            {!isLast && (
              <div className={`mx-3 h-px flex-1 ${done ? "bg-green-300 dark:bg-green-800" : "bg-slate-200 dark:bg-slate-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActivityItem({ icon: Icon, label, detail, date, isLast }) {
  return (
    <div className={`flex gap-3 ${isLast ? "" : "pb-4"}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon size={13} />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{label}</p>
        {detail && (
          <p className="truncate text-xs text-slate-400 dark:text-slate-500" title={detail}>
            {detail}
          </p>
        )}
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-600">{formatDateTime(date)}</p>
      </div>
    </div>
  );
}

function AlertMessage({ type = "success", message }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
      }`}
    >
      {isSuccess ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
      {message}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */
export default function AdminReclamationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const responseRef = useRef(null);

  const [reclamation, setReclamation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getReclamationById(id);
      setReclamation(data);

      if (data.adminResponse) {
        setAdminResponse(data.adminResponse);
      } else {
        setAdminResponse(localStorage.getItem(draftStorageKey(id)) || "");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le détail de la réclamation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStart = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      await startReclamation(id);
      setShowModal(false);
      setSuccess("Réclamation prise en charge.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de prendre en charge.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(draftStorageKey(id), adminResponse);
    setDraftSavedAt(new Date());
    setSuccess("Brouillon enregistré localement.");
  };

  const handleClose = async () => {
    if (!adminResponse.trim()) {
      setError("La réponse administrative est obligatoire pour clôturer.");
      return;
    }
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      await closeReclamation(id, adminResponse);
      localStorage.removeItem(draftStorageKey(id));
      setSuccess("Réclamation clôturée avec succès.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de clôturer.");
    } finally {
      setActionLoading(false);
    }
  };

  const focusResponse = () => {
    responseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    responseRef.current?.focus();
  };

  const isSubmitted = reclamation?.statut === "SUBMITTED";
  const isInProgress = reclamation?.statut === "IN_PROGRESS";
  const isClosed = reclamation?.statut === "CLOSED";

  const authorLabel = reclamation?.typeAuteur === "MEDECIN" ? "Médecin" : "Citoyen";
  const authorName =
    `${reclamation?.prenomAuteur || ""} ${reclamation?.nomAuteur || ""}`.trim() || "Plaignant inconnu";
  const initials = getInitials(reclamation?.prenomAuteur, reclamation?.nomAuteur);
  const categoryLabel = CATEGORY_LABELS[reclamation?.categorie] || reclamation?.categorie || "—";
  const moduleLabel = MODULE_LABELS[reclamation?.moduleConcerne] || reclamation?.moduleConcerne || "—";
  const priorityCfg = PRIORITY_CFG[reclamation?.priorite];
  const attachmentCount = reclamation?.pieceJointePath ? 1 : 0;

  const activity = useMemo(() => {
    if (!reclamation) return [];
    const items = [
      {
        key: "created",
        icon: FilePlus2,
        label: "Réclamation déposée",
        detail: `Par ${authorName} · ${authorLabel}`,
        date: reclamation.dateCreation,
      },
    ];
    if (reclamation.datePriseEnCharge) {
      items.push({
        key: "assigned",
        icon: UserCheck,
        label: "Prise en charge",
        detail: reclamation.adminTraiteurNom
          ? `Assignée à ${reclamation.adminTraiteurNom}`
          : "Traitement démarré par un administrateur",
        date: reclamation.datePriseEnCharge,
      });
    }
    if (reclamation.dateCloture) {
      items.push({
        key: "closed",
        icon: CheckCircle2,
        label: "Réclamation clôturée",
        detail: reclamation.adminTraiteurNom
          ? `Réponse transmise par ${reclamation.adminTraiteurNom}`
          : "Réponse transmise au plaignant",
        date: reclamation.dateCloture,
      });
    }
    return items;
  }, [reclamation, authorName, authorLabel]);

  /* ---- États de chargement / vide ---- */
  if (loading) {
    return (
      <AdminLayout title="Gestion des réclamations">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            <span className="text-sm">Chargement…</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!reclamation) {
    return (
      <AdminLayout title="Gestion des réclamations">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-10 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <Inbox size={28} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Réclamation introuvable
            </p>
            <button
              onClick={() => navigate("/admin/reclamations")}
              className="text-sm text-green-600 hover:underline"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestion des réclamations">
      <div className="px-6 py-6 md:px-8">
        <div className="mx-auto max-w-7xl space-y-5">
          {/* Retour */}
          <button
            onClick={() => navigate("/admin/reclamations")}
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Retour à la liste
          </button>

          {/* Alertes */}
          <AlertMessage type="success" message={success} />
          <AlertMessage type="error" message={error} />

          {/* ══════════════ En‑tête — identité du plaignant ══════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
                    reclamation.typeAuteur === "MEDECIN"
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {initials}
                </div>
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="truncate text-2xl font-bold leading-tight text-slate-900 dark:text-white">
                      {authorName}
                    </h1>
                    <AuteurBadge type={reclamation.typeAuteur} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-400 dark:text-slate-500">
                      <Hash size={11} />
                      {reclamation.numeroReclamation}
                    </span>
                    <span className="text-slate-200 dark:text-slate-700">•</span>
                    <StatusBadge statut={reclamation.statut} />
                  </div>
                  <p className="max-w-xl truncate text-sm text-slate-500 dark:text-slate-400">
                    {reclamation.objet || "Sans objet"}
                  </p>
                </div>
              </div>

              {/* Action principale — dépend du statut */}
              <div className="shrink-0">
                {isSubmitted && (
                  <button
                    onClick={() => setShowModal(true)}
                    disabled={actionLoading}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60"
                  >
                    <PlayCircle size={16} />
                    Prendre en charge
                  </button>
                )}
                {isInProgress && (
                  <button
                    onClick={focusResponse}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  >
                    <ShieldCheck size={16} />
                    Rédiger la réponse
                  </button>
                )}
                {isClosed && (
                  <div className="inline-flex h-11 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-5 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 size={16} />
                    Clôturée le {formatDate(reclamation.dateCloture)}
                  </div>
                )}
              </div>
            </div>

            {/* Indicateur de workflow compact (remplace la timeline verticale décorative) */}
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <WorkflowIndicator statut={reclamation.statut} reclamation={reclamation} />
            </div>
          </motion.div>

          {/* ══════════════ Cartes de synthèse ══════════════ */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
            <SummaryCard
              icon={Clock}
              label="Statut"
              value={STATUS_CFG[reclamation.statut]?.label || reclamation.statut}
            />
            <SummaryCard icon={Tag} label="Type" value={categoryLabel} />
            <SummaryCard icon={User} label="Plaignant" value={authorLabel} />
            <SummaryCard icon={CalendarDays} label="Créée le" value={formatDate(reclamation.dateCreation)} />
            <SummaryCard
              icon={Flag}
              label="Priorité"
              value={priorityCfg?.label || reclamation.priorite || "—"}
              valueClass={priorityCfg?.text}
            />
            <SummaryCard
              icon={UserCheck}
              label="Assignée à"
              value={reclamation.adminTraiteurNom || "Non assignée"}
              valueClass={!reclamation.adminTraiteurNom ? "text-slate-400 dark:text-slate-500" : undefined}
            />
            <SummaryCard icon={Paperclip} label="Pièces jointes" value={attachmentCount} />
          </div>

          {/* ══════════════ Contenu en deux colonnes ══════════════ */}
          <div className="grid gap-5 lg:grid-cols-[7fr_3fr] lg:items-start">
            {/* Colonne gauche — 70% */}
            <div className="space-y-5">
              {/* Dossier de réclamation (case file) */}
              <SectionCard icon={FileText} title="Dossier de réclamation">
                <div className="space-y-1 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Objet du signalement
                  </p>
                  <p className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                    {reclamation.objet || "Sans objet"}
                  </p>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {reclamation.message || "Aucun message fourni par le plaignant."}
                </p>
              </SectionCard>

              {/* Pièces jointes */}
              <SectionCard icon={Paperclip} title={`Pièces jointes (${attachmentCount})`}>
                {reclamation.pieceJointePath ? (
                  <a
                    href={`http://localhost:8080${reclamation.pieceJointePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-green-300 hover:bg-green-50/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-green-800 dark:hover:bg-green-900/10"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                      <FileText size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                        {getFileName(reclamation.pieceJointePath)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Cliquer pour ouvrir le document</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-green-700 dark:text-green-400">Ouvrir →</span>
                  </a>
                ) : (
                  <p className="py-1 text-sm text-slate-400 dark:text-slate-500">
                    Aucune pièce jointe fournie avec cette réclamation.
                  </p>
                )}
              </SectionCard>
            </div>

            {/* Colonne droite — 30% */}
            <div className="space-y-5">
              {/* Coordonnées */}
              <SectionCard icon={Mail} title="Coordonnées">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <InfoRow icon={Mail} label="Email" value={reclamation.emailAuteur} />
                  <InfoRow icon={Phone} label="Téléphone" value={reclamation.telephoneAuteur} />
                  <InfoRow
                    icon={MapPin}
                    label="Adresse"
                    value={[reclamation.adresseAuteur, reclamation.villeAuteur].filter(Boolean).join(", ")}
                  />
                </div>
              </SectionCard>

              {/* Métadonnées */}
              <SectionCard icon={Layers} title="Détails de la réclamation">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <InfoRow icon={Hash} label="Référence" value={reclamation.numeroReclamation} />
                  <InfoRow icon={Layers} label="Module concerné" value={moduleLabel} />
                  <InfoRow icon={Clock} label="Dernière mise à jour" value={formatDateTime(reclamation.dateDerniereMiseAJour)} />
                </div>
              </SectionCard>

              {/* Historique d'activité — piste d'audit réelle */}
              <SectionCard icon={History} title="Historique d'activité">
                {activity.map(({ key, ...evt }, idx) => (
                  <ActivityItem key={key} {...evt} isLast={idx === activity.length - 1} />
                ))}
              </SectionCard>
            </div>
          </div>

          {/* ══════════════ Réponse administrative ══════════════ */}
          <SectionCard
            icon={ShieldCheck}
            title="Réponse administrative"
            contentClassName="p-6"
            action={
              isClosed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 size={12} /> Réponse finale
                </span>
              )
            }
          >
            {isClosed ? (
              <div className="rounded-xl border border-green-200 bg-green-50/60 px-5 py-4 dark:border-green-800 dark:bg-green-900/10">
                <p className="whitespace-pre-line text-sm leading-relaxed text-green-900 dark:text-green-200">
                  {reclamation.adminResponse}
                </p>
                <p className="mt-3 text-xs font-medium text-green-700/70 dark:text-green-400/70">
                  Transmise le {formatDateTime(reclamation.dateCloture)}
                  {reclamation.adminTraiteurNom ? ` par ${reclamation.adminTraiteurNom}` : ""}
                </p>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                  {isSubmitted
                    ? "Rédigez dès maintenant la décision du conseil, ou prenez en charge la réclamation pour démarrer officiellement le traitement."
                    : "Rédigez la décision officielle du conseil. Cette réponse sera transmise au plaignant à la clôture du dossier."}
                </p>
                <textarea
                  ref={responseRef}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={10}
                  placeholder="Rédigez ici la réponse officielle du conseil…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-relaxed text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:bg-slate-800"
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveDraft}
                      disabled={!adminResponse.trim()}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Save size={15} />
                      Enregistrer le brouillon
                    </button>
                    {draftSavedAt && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        Enregistré à {draftSavedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>

                  {isInProgress ? (
                    <button
                      onClick={handleClose}
                      disabled={actionLoading || !adminResponse.trim()}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} />
                      Clôturer la réclamation
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <AlertCircle size={13} />
                      Prenez en charge la réclamation pour pouvoir la clôturer
                    </span>
                  )}
                </div>
              </>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Modal de prise en charge */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Prendre en charge
                </h2>
                <p className="mt-1 text-sm text-slate-500">{reclamation.numeroReclamation}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Cette réclamation passera au statut <strong>En cours</strong>.
              Vous pourrez ensuite y répondre et la clôturer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white shadow-md transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60"
              >
                {actionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <PlayCircle size={16} />
                )}
                {actionLoading ? "Traitement..." : "Confirmer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
