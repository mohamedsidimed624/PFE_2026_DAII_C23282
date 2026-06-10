import { useEffect, useRef, useState } from "react";
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
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  Paperclip,
  Clock,
  Send,
  Mail,
  Phone,
  MapPin,
  Hash,
  Tag,
  UserCog,
  AlertTriangle,
  Inbox,
  Briefcase,
  ShieldCheck,
  PlayCircle,
  Download,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Config maps                                                        */
/* ------------------------------------------------------------------ */
const STATUS_CFG = {
  SUBMITTED: {
    label: "Soumise",
    cls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "En cours",
    cls: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  CLOSED: {
    label: "Clôturée",
    cls: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",
    dot: "bg-green-500",
  },
};

const AUTEUR_CFG = {
  MEDECIN: {
    label: "Médecin",
    cls: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  },
  CITOYEN: {
    label: "Citoyen",
    cls: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
  },
};

const PRIORITY_CFG = {
  LOW: { label: "Faible", cls: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" },
  MEDIUM: { label: "Moyenne", cls: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  HIGH: { label: "Élevée", cls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
  URGENT: { label: "Urgente", cls: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400" },
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

const LIFECYCLE_STEPS = [
  { key: "SUBMITTED", label: "Soumise", field: "dateCreation" },
  { key: "IN_PROGRESS", label: "Prise en charge", field: "datePriseEnCharge" },
  { key: "CLOSED", label: "Clôturée", field: "dateCloture" },
];
const STATUS_ORDER = { SUBMITTED: 0, IN_PROGRESS: 1, CLOSED: 2 };

/* ------------------------------------------------------------------ */
/*  Formatters                                                         */
/* ------------------------------------------------------------------ */
const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

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

const getFileName = (path) => decodeURIComponent(path || "").split("/").pop() || "Pièce jointe";

const humanize = (v) => (v ? v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ") : "—");

/* ------------------------------------------------------------------ */
/*  Micro‑components                                                   */
/* ------------------------------------------------------------------ */
function StatusBadge({ statut }) {
  const cfg = STATUS_CFG[statut] || STATUS_CFG.SUBMITTED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// function PriorityBadge({ priorite }) {
//   const cfg = PRIORITY_CFG[priorite] || PRIORITY_CFG.LOW;
//   return (
//     <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.cls}`}>
//       {cfg.label}
//     </span>
//   );
// }

function AlertMessage({ type = "success", message }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
      role="alert"
    >
      {message}
    </div>
  );
}

/** Compact inline icon + value — used for the glance "fact strip". No card chrome by design. */
function FactItem({ icon: Icon, label, children }) {
  if (!children) return null;
  return (
    <span title={label} className="inline-flex items-center gap-1.5 text-xs">
      {Icon && <Icon size={13} className="text-slate-400" />}
      <span className="font-medium text-slate-600 dark:text-slate-300">{children}</span>
    </span>
  );
}

/** Horizontal lifecycle stepper whose stage captions double as the audit trail (current stage + history in one element). */
function LifecycleStepper({ statut, reclamation }) {
  const currentIdx = STATUS_ORDER[statut] ?? -1;
  return (
    <div className="flex flex-wrap items-start gap-x-2 gap-y-3">
      {LIFECYCLE_STEPS.map((step, idx) => {
        const done = currentIdx > idx;
        const active = currentIdx === idx;
        const date = reclamation[step.field];
        return (
          <div key={step.key} className="flex items-start gap-2">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  active
                    ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : done
                    ? "border-green-200 bg-white text-green-600 dark:border-green-800 dark:bg-slate-900 dark:text-green-500"
                    : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
                }`}
              >
                {done ? <CheckCircle2 size={11} /> : active ? <Clock size={11} /> : <Circle size={8} />}
                {step.label}
              </span>
              <p className="mt-1 pl-1 text-[10px] text-slate-400">{date ? formatDateTime(date) : "—"}</p>
            </div>
            {idx < LIFECYCLE_STEPS.length - 1 && (
              <ChevronRight size={13} className="mt-1.5 shrink-0 text-slate-300 dark:text-slate-600" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
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

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getReclamationById(id);
      setReclamation(data);
      setAdminResponse(data.adminResponse || "");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le détail de la réclamation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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

  const authorName =
    `${reclamation?.prenomAuteur || ""} ${reclamation?.nomAuteur || ""}`.trim() || "—";
  const auteurCfg = AUTEUR_CFG[reclamation?.typeAuteur] || AUTEUR_CFG.CITOYEN;
  const location = [reclamation?.villeAuteur, reclamation?.adresseAuteur].filter(Boolean).join(" — ");

  /* ---- États de chargement / vide ---- */
  if (loading) {
    return (
      <AdminLayout title="Gestion des réclamations">
        <div className="flex min-h-[60vh] items-center justify-center">
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
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-10 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <Inbox size={28} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Réclamation introuvable</p>
            <button onClick={() => navigate("/admin/reclamations")} className="text-sm text-green-600 hover:underline">
              Retour à la liste
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestion des réclamations">
      <div className="max-w-4xl space-y-4">
        {/* Retour */}
        <button
          onClick={() => navigate("/admin/reclamations")}
          className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Retour à la liste
        </button>

        <AlertMessage type="success" message={success} />
        <AlertMessage type="error" message={error} />

        {/* Un seul bloc : identité → suivi → informations → dossier → réponse */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-7"
        >
          {/* Zone 1 — identité + action */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{authorName}</h1>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${auteurCfg.cls}`}>
                  {auteurCfg.label}
                </span>
                <StatusBadge statut={reclamation.statut} />
              </div>
              <p className="mt-1.5 inline-flex items-center gap-1 font-mono text-xs text-slate-400">
                <Hash size={11} />
                {reclamation.numeroReclamation}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isSubmitted && (
                <button
                  onClick={() => setShowModal(true)}
                  disabled={actionLoading}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60"
                >
                  <PlayCircle size={16} />
                  Prendre en charge
                </button>
              )}
              {/* {isInProgress && (
                <button
                  onClick={focusResponse}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  <Send size={16} />
                  Rédiger la réponse
                </button>
              )} */}
              {isClosed && (
                <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle2 size={16} />
                  Clôturée le {formatDate(reclamation.dateCloture)}
                </span>
              )}
            </div>
          </div>

          {/* Zone 2 — suivi du dossier (statut courant + historique en un seul élément) */}
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <LifecycleStepper statut={reclamation.statut} reclamation={reclamation} />
          </div>

          {/* Zone 3 — informations clés, en ligne (pas de cartes) */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <FactItem icon={Tag} label="Catégorie">{CATEGORY_LABELS[reclamation.categorie] || "—"}</FactItem>
            {/* <FactItem icon={AlertTriangle} label="Priorité">
              <PriorityBadge priorite={reclamation.priorite} />
            </FactItem> */}
            {/* <FactItem icon={UserCog} label="Administrateur assigné">{reclamation.adminTraiteurNom || "Non assignée"}</FactItem> */}
            <FactItem icon={Mail} label="Email">{reclamation.emailAuteur}</FactItem>
            <FactItem icon={Phone} label="Téléphone">{reclamation.telephoneAuteur}</FactItem>
            <FactItem icon={MapPin} label="Localisation">{location}</FactItem>
            <FactItem icon={Briefcase} label="Module concerné">{humanize(reclamation.moduleConcerne)}</FactItem>
          </div>

          {/* Zone 4 — le dossier (zone dominante : ce que l'admin doit lire) */}
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {reclamation.objet || "Sans objet"}
            </h2>
            <div className="mt-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {reclamation.message || "Aucun message."}
              </p>
            </div>
            {reclamation.pieceJointePath && (
              <a
                href={`http://localhost:8080${reclamation.pieceJointePath}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-w-0 items-center gap-2 text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 transition hover:text-green-700 hover:decoration-green-400 dark:text-slate-400 dark:hover:text-green-400"
              >
                <Paperclip size={14} className="shrink-0" />
                <span className="truncate">{getFileName(reclamation.pieceJointePath)}</span>
                <Download size={13} className="shrink-0" />
              </a>
            )}
          </div>

          {/* Zone 5 — réponse administrative (suit directement le dossier, comme une réponse à un message) */}
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <ShieldCheck size={15} className="text-green-600" />
                Réponse administrative
              </h2>
              {isClosed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 size={12} /> Clôturée
                </span>
              )}
            </div>

            {isSubmitted && (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock size={14} />
                Prenez d'abord en charge la réclamation pour pouvoir y répondre.
              </p>
            )}

            {isClosed ? (
              <div className="mt-3 rounded-xl border border-green-200 bg-green-50/60 px-4 py-3.5 dark:border-green-800 dark:bg-green-900/10">
                <p className="whitespace-pre-line text-sm leading-7 text-green-800 dark:text-green-300">
                  {reclamation.adminResponse}
                </p>
              </div>
            ) : (
              <>
                <textarea
                  ref={responseRef}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  disabled={!isInProgress}
                  rows={5}
                  placeholder="Rédigez ici la réponse officielle qui sera communiquée au déposant..."
                  className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-500"
                />
                {isInProgress && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    {/* <p className="text-xs text-slate-400">
                      La réponse sera communiquée au déposant lors de la clôture.
                    </p> */}
                    <button
                      onClick={handleClose}
                      disabled={actionLoading || !adminResponse.trim()}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} />
                      Clôturer la réclamation
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
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
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Prendre en charge</h2>
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
              Cette réclamation passera au statut <strong>En cours</strong>. Vous pourrez ensuite y répondre et la
              clôturer.
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
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60"
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
