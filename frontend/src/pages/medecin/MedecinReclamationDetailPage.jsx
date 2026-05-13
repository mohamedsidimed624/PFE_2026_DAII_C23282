import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyReclamationById } from "../../services/medecinReclamationApi";
import StatusBadge from "../../Components/shared/StatusBadge";
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

const fadeIn = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
};

const STATUS_CONFIG = {
  SUBMITTED:   { label: "Soumise",   statusCls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"   },
  IN_PROGRESS: { label: "En cours",  statusCls: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"         },
  CLOSED:      { label: "Clôturée",  statusCls: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"   },
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
  { key: "SUBMITTED",   label: "Soumise",          field: "dateCreation"      },
  { key: "IN_PROGRESS", label: "Prise en charge",  field: "datePriseEnCharge" },
  { key: "CLOSED",      label: "Clôturée",          field: "dateCloture"       },
];

const STATUS_ORDER = { SUBMITTED: 0, IN_PROGRESS: 1, CLOSED: 2 };

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getFileName(path) {
  if (!path) return "Pièce jointe";
  return decodeURIComponent(path.split("/").pop() || "Pièce jointe");
}

function Timeline({ status, reclamation }) {
  const currentOrder = STATUS_ORDER[(status || "").toUpperCase()] ?? -1;

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const stepOrder = STATUS_ORDER[step.key];
        const done    = currentOrder >= stepOrder;
        const current = currentOrder === stepOrder;
        const isLast  = idx === TIMELINE_STEPS.length - 1;
        const date    = reclamation[step.field];

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                done && current
                  ? "border-green-600 bg-green-600 text-white"
                  : done
                  ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-900/30"
                  : "border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-900"
              }`}>
                {done ? <CheckCircle2 size={13} /> : <Circle size={10} />}
              </div>
              {!isLast && (
                <div
                  className={`mt-1 w-0.5 flex-1 rounded-full ${
                    done && currentOrder > stepOrder ? "bg-green-300 dark:bg-green-800" : "bg-slate-100 dark:bg-slate-800"
                  }`}
                  style={{ minHeight: 26 }}
                />
              )}
            </div>
            <div className={`${isLast ? "pb-0" : "pb-5"}`}>
              <p className={`text-sm font-semibold leading-7 ${done ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-600"}`}>
                {step.label}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{date ? formatDateTime(date) : "—"}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{label}</span>
      <span className={`break-words text-right text-xs font-medium ${accent ? "text-green-700 dark:text-green-400" : "text-slate-700 dark:text-slate-300"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {title && (
        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-green-600 dark:text-green-400">{icon}</span>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function MiniStat({ label, value, icon, colorCls }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${colorCls || "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">{value || "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">{icon}</div>
      </div>
    </div>
  );
}

function MedecinReclamationDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [reclamation, setReclamation] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

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
      <MedecinLayout title="Détail réclamation">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="space-y-4">
              <div className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-60 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </MedecinLayout>
    );
  }

  if (error) {
    return (
      <MedecinLayout title="Détail réclamation">
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      </MedecinLayout>
    );
  }

  if (!reclamation) {
    return (
      <MedecinLayout title="Détail réclamation">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <Inbox size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Réclamation introuvable</p>
        </div>
      </MedecinLayout>
    );
  }

  const r            = reclamation;
  const statusKey    = (r.statut || "").toUpperCase();
  const statusCfg    = STATUS_CONFIG[statusKey] || { label: r.statut || "—", statusCls: "" };
  const categoryLabel = CATEGORY_LABELS[r.categorie] || r.categorie || "—";
  const fileName     = getFileName(r.pieceJointePath);
  const hasResponse  = !!r.adminResponse;

  return (
    <MedecinLayout title="Détail réclamation">
      <div className="mx-auto max-w-5xl space-y-5">
        <button
          onClick={() => navigate("/medecin/reclamations")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft size={15} />
          Retour à mes réclamations
        </button>

        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">
                      {r.numeroReclamation}
                    </span>
                    <StatusBadge preset={r.statut} />
                    {hasResponse && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle2 size={11} />
                        Réponse disponible
                      </span>
                    )}
                  </div>

                  <h1 className="mt-3 text-xl font-semibold leading-snug text-slate-900 dark:text-white">
                    {r.objet || "Sans objet"}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
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
                  value={statusCfg.label}
                  icon={<FolderClock size={16} className="text-slate-500 dark:text-slate-400" />}
                  colorCls={statusCfg.statusCls || undefined}
                />
                <MiniStat
                  label="Date de création"
                  value={formatDateTime(r.dateCreation)}
                  icon={<CalendarDays size={16} className="text-slate-500 dark:text-slate-400" />}
                />
                <MiniStat
                  label="Réponse admin"
                  value={hasResponse ? "Disponible" : "En attente"}
                  icon={<CheckCircle2 size={16} className={hasResponse ? "text-green-600" : "text-slate-500 dark:text-slate-400"} />}
                  colorCls={hasResponse ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : undefined}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-5">
            <SectionCard title="Votre message" icon={<MessageSquare size={14} />}>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-800 dark:text-slate-200">
                  {r.message || "—"}
                </p>
              </div>
            </SectionCard>

            {r.pieceJointePath && (
              <SectionCard title="Pièce jointe" icon={<Paperclip size={14} />}>
                <a
                  href={`http://localhost:8080${r.pieceJointePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-green-200 hover:bg-green-50/30 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-green-800 dark:hover:bg-green-900/10"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <FileText size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{fileName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Cliquez pour consulter le document</p>
                  </div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Ouvrir →</span>
                </a>
              </SectionCard>
            )}

            <SectionCard title="Réponse de l'administration" icon={<CheckCircle2 size={14} />}>
              {hasResponse ? (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 dark:border-green-800 dark:bg-green-900/20">
                  <p className="whitespace-pre-line text-sm leading-7 text-green-800 dark:text-green-200">
                    {r.adminResponse}
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <Clock3 size={15} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucune réponse disponible pour le moment.
                  </p>
                </div>
              )}
            </SectionCard>
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-5">
            <SectionCard title="Résumé" icon={<FileText size={14} />}>
              <InfoRow label="Référence"    value={r.numeroReclamation} accent />
              <InfoRow label="Statut"       value={statusCfg.label} />
              <InfoRow label="Catégorie"    value={categoryLabel} />
              <InfoRow label="Pièce jointe" value={r.pieceJointePath ? fileName : "Aucune"} />
              <InfoRow label="Réponse admin" value={hasResponse ? "Disponible" : "En attente"} accent={hasResponse} />
            </SectionCard>

            <SectionCard title="Progression" icon={<Clock3 size={14} />}>
              <Timeline status={r.statut} reclamation={r} />
            </SectionCard>
          </motion.div>
        </div>
      </div>
    </MedecinLayout>
  );
}

export default MedecinReclamationDetailPage;
