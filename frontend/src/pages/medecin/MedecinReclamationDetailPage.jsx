import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyReclamationById } from "../../services/medecinReclamationApi";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock3,
  MessageSquare,
  CalendarDays,
  Tag,
  Paperclip,
  Inbox,
  Circle,
  FolderClock,
} from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Soumise",
    badge: "badge-warning badge-outline",
    card: "border-amber-200 bg-amber-50 text-amber-700",
  },
  IN_PROGRESS: {
    label: "En cours",
    badge: "badge-info badge-outline",
    card: "border-blue-200 bg-blue-50 text-blue-700",
  },
  CLOSED: {
    label: "Clôturée",
    badge: "badge-success badge-outline",
    card: "border-green-200 bg-green-50 text-green-700",
  },
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

const TIMELINE_STEPS = [
  { key: "SUBMITTED", label: "Soumise", field: "dateCreation" },
  { key: "IN_PROGRESS", label: "Prise en charge", field: "datePriseEnCharge" },
  { key: "CLOSED", label: "Clôturée", field: "dateCloture" },
];

const STATUS_ORDER = {
  SUBMITTED: 0,
  IN_PROGRESS: 1,
  CLOSED: 2,
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileName(path) {
  if (!path) return "Pièce jointe";
  return decodeURIComponent(path.split("/").pop() || "Pièce jointe");
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[(status || "").toUpperCase()] || {
    label: status || "—",
    badge: "badge-neutral badge-outline",
  };

  return <span className={cx("badge badge-sm font-medium", config.badge)}>{config.label}</span>;
}

function Timeline({ status, reclamation }) {
  const currentOrder = STATUS_ORDER[(status || "").toUpperCase()] ?? -1;

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const stepOrder = STATUS_ORDER[step.key];
        const done = currentOrder >= stepOrder;
        const current = currentOrder === stepOrder;
        const isLast = idx === TIMELINE_STEPS.length - 1;
        const date = reclamation[step.field];

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cx(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  done && current
                    ? "border-green-600 bg-green-600 text-white"
                    : done
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-slate-200 bg-white text-slate-300"
                )}
              >
                {done ? <CheckCircle2 size={13} /> : <Circle size={10} />}
              </div>

              {!isLast && (
                <div
                  className={cx(
                    "mt-1 w-0.5 flex-1 rounded-full",
                    done && currentOrder > stepOrder ? "bg-green-300" : "bg-slate-100"
                  )}
                  style={{ minHeight: 26 }}
                />
              )}
            </div>

            <div className={cx("pb-5", isLast && "pb-0")}>
              <p
                className={cx(
                  "text-sm font-semibold leading-7",
                  done ? "text-slate-800" : "text-slate-400"
                )}
              >
                {step.label}
              </p>

              <p className="text-xs text-slate-400">{date ? formatDateTime(date) : "—"}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span
        className={cx(
          "break-words text-right text-xs font-medium",
          accent ? "text-green-700" : "text-slate-700"
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm">
      {title && (
        <div className="flex items-center gap-2.5 border-b border-base-200 bg-base-200/30 px-5 py-3">
          <span className="text-green-600">{icon}</span>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        </div>
      )}
      <div className="card-body p-5">{children}</div>
    </div>
  );
}

function MiniStat({ label, value, icon, className = "" }) {
  return (
    <div className={cx("card border shadow-sm bg-base-100", className)}>
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {label}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6">{value || "—"}</p>
          </div>

          <div className="rounded-xl border border-base-200 bg-base-100/80 p-2">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function MedecinReclamationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reclamation, setReclamation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyReclamationById(id);
        setReclamation(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le détail de la réclamation.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <MedecinLayout title="Détail réclamation" subtitle="Chargement...">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-slate-100" />
          <div className="h-32 rounded-xl bg-slate-100" />
          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-slate-100" />
              <div className="h-36 rounded-xl bg-slate-100" />
              <div className="h-36 rounded-xl bg-slate-100" />
            </div>
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-slate-100" />
              <div className="h-60 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </MedecinLayout>
    );
  }

  if (error) {
    return (
      <MedecinLayout title="Détail réclamation" subtitle="">
        <div className="alert alert-error shadow-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      </MedecinLayout>
    );
  }

  if (!reclamation) {
    return (
      <MedecinLayout title="Détail réclamation" subtitle="">
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Inbox size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Réclamation introuvable
          </p>
        </div>
      </MedecinLayout>
    );
  }

  const r = reclamation;
  const statusKey = (r.statut || "").toUpperCase();
  const statusLabel = STATUS_CONFIG[statusKey]?.label || r.statut || "—";
  const statusCardClass =
    STATUS_CONFIG[statusKey]?.card || "border-slate-200 bg-slate-50 text-slate-700";
  const categoryLabel = CATEGORY_LABELS[r.categorie] || r.categorie || "—";
  const fileName = getFileName(r.pieceJointePath);
  const hasResponse = !!r.adminResponse;

  return (
    <MedecinLayout
      title="Détail réclamation"
      subtitle="Consultez votre demande et la réponse de l'administration."
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <button
          onClick={() => navigate("/medecin/reclamations")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          Retour à mes réclamations
        </button>

        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <div className="card border border-base-200 bg-base-100 shadow-sm">
            <div className="card-body p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      {r.numeroReclamation}
                    </span>

                    <StatusBadge status={r.statut} />

                    {hasResponse && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle2 size={11} />
                        Réponse disponible
                      </span>
                    )}
                  </div>

                  <h1 className="mt-3 text-xl font-semibold leading-snug text-slate-900">
                    {r.objet || "Sans objet"}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={12} />
                      Créée le {formatDate(r.dateCreation)}
                    </span>

                    {r.categorie && (
                      <span className="inline-flex items-center gap-1">
                        <Tag size={12} />
                        {categoryLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <MiniStat
                  label="Statut"
                  value={statusLabel}
                  icon={<FolderClock size={16} className="text-slate-600" />}
                  className={statusCardClass}
                />
                <MiniStat
                  label="Date de création"
                  value={formatDateTime(r.dateCreation)}
                  icon={<CalendarDays size={16} className="text-slate-600" />}
                />
                <MiniStat
                  label="Réponse admin"
                  value={hasResponse ? "Disponible" : "En attente"}
                  icon={<CheckCircle2 size={16} className="text-slate-600" />}
                  className={hasResponse ? "border-green-200 bg-green-50 text-green-700" : ""}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-5">
            <Card title="Votre message" icon={<MessageSquare size={14} />}>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-800">
                  {r.message || "—"}
                </p>
              </div>
            </Card>

            {r.pieceJointePath && (
              <Card title="Pièce jointe" icon={<Paperclip size={14} />}>
                <a
                  href={`http://localhost:8080${r.pieceJointePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-green-200 hover:bg-green-50/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                    <FileText size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {fileName}
                    </p>
                    <p className="text-xs text-slate-400">
                      Cliquez pour consulter le document
                    </p>
                  </div>

                  <span className="text-xs font-medium text-green-700">Ouvrir →</span>
                </a>
              </Card>
            )}

            <Card title="Réponse de l'administration" icon={<CheckCircle2 size={14} />}>
              {hasResponse ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-green-800">
                    {r.adminResponse}
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                  <Clock3 size={15} className="mt-0.5 shrink-0 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Aucune réponse disponible pour le moment.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-5">
            <Card title="Résumé" icon={<FileText size={14} />}>
              <InfoRow label="Référence" value={r.numeroReclamation} accent />
              <InfoRow label="Statut" value={statusLabel} />
              <InfoRow label="Catégorie" value={categoryLabel} />
              <InfoRow
                label="Pièce jointe"
                value={r.pieceJointePath ? fileName : "Aucune"}
              />
              <InfoRow
                label="Réponse admin"
                value={hasResponse ? "Disponible" : "En attente"}
                accent={hasResponse}
              />
            </Card>

            <Card title="Progression" icon={<Clock3 size={14} />}>
              <Timeline status={r.statut} reclamation={r} />
            </Card>
          </motion.div>
        </div>
      </div>
    </MedecinLayout>
  );
}

export default MedecinReclamationDetailPage;