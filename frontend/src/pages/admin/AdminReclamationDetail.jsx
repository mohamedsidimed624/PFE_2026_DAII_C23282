import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getReclamationById,
  startReclamation,
  closeReclamation,
} from "../../services/adminReclamationApi";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Lock,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  X,
  XCircle,
  CalendarDays,
  Clock3,
  Paperclip,
  Inbox,
  ClipboardList,
} from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Soumise",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  IN_PROGRESS: {
    label: "En cours",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  CLOSED: {
    label: "Clôturée",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
};

const STATUS_ORDER = {
  SUBMITTED: 0,
  IN_PROGRESS: 1,
  CLOSED: 2,
};

const TIMELINE_STEPS = [
  { key: "SUBMITTED", label: "Réclamation soumise", field: "dateCreation" },
  { key: "IN_PROGRESS", label: "Prise en charge", field: "datePriseEnCharge" },
  { key: "CLOSED", label: "Réclamation clôturée", field: "dateCloture" },
];

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// function getStatusLabel(status) {
//   return STATUS_CONFIG[(status || "").toUpperCase()]?.label || status || "—";
// }

function getFileName(path) {
  if (!path) return "Pièce jointe";
  const decoded = decodeURIComponent(path);
  const parts = decoded.split("/");
  return parts[parts.length - 1] || "Pièce jointe";
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[(status || "").toUpperCase()] || {
    label: status || "—",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        config.badge
      )}
    >
      {config.label}
    </span>
  );
}

function DetailSection({ title, icon, children, action }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
            {icon}
          </div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        </div>

        {action}
      </div>

      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function MiniCard({ label, value, icon, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p
            className={cx(
              "mt-2 text-sm font-semibold leading-6",
              accent ? "text-green-700" : "text-slate-800"
            )}
          >
            {value || "—"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

function AuthorRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-all text-sm font-medium text-slate-700">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function Timeline({ status, reclamation }) {
  const currentOrder = STATUS_ORDER[(status || "").toUpperCase()] ?? -1;

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, index) => {
        const stepOrder = STATUS_ORDER[step.key];
        const done = currentOrder >= stepOrder;
        const current = currentOrder === stepOrder;
        const isLast = index === TIMELINE_STEPS.length - 1;
        const date = reclamation[step.field];

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cx(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  done && current
                    ? "border-green-600 bg-green-600 text-white"
                    : done
                    ? "border-green-300 bg-green-50 text-green-600"
                    : "border-slate-200 bg-white text-slate-300"
                )}
              >
                {done ? <CheckCircle2 size={14} /> : <Clock3 size={13} />}
              </div>

              {!isLast && (
                <div
                  className={cx(
                    "mt-1 w-0.5 flex-1 rounded-full",
                    done && currentOrder > stepOrder ? "bg-green-300" : "bg-slate-200"
                  )}
                  style={{ minHeight: 28 }}
                />
              )}
            </div>

            <div className={cx("pb-5", isLast && "pb-0")}>
              <p
                className={cx(
                  "text-sm font-semibold",
                  done ? "text-slate-800" : "text-slate-400"
                )}
              >
                {step.label}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {date ? formatDateTime(date) : "—"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminReclamationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reclamation, setReclamation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [ShowPrendreEnChargeModal, setShowPrendreEnChargeModal] = useState(false);

  const loadReclamation = async () => {
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
    loadReclamation();
  }, [id]);

  const handleStart = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      await startReclamation(id);
      setShowPrendreEnChargeModal(false);
      setSuccess("La réclamation a été prise en charge.");
      await loadReclamation();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Impossible de prendre en charge la réclamation."
      );
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
      setSuccess("La réclamation a été clôturée avec succès.");
      await loadReclamation();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Impossible de clôturer la réclamation."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const isSubmitted = reclamation?.statut === "SUBMITTED";
  const isInProgress = reclamation?.statut === "IN_PROGRESS";
  const isClosed = reclamation?.statut === "CLOSED";

  const authorTypeLabel =
    reclamation?.typeAuteur === "MEDECIN" ? "Médecin" : "Citoyen";

  const authorFullName = useMemo(() => {
    if (!reclamation) return "—";
    return (
      `${reclamation.prenomAuteur || ""} ${reclamation.nomAuteur || ""}`.trim() ||
      "—"
    );
  }, [reclamation]);

  if (loading) {
    return (
      <AdminLayout title="Gestion des réclamations">
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            Chargement du détail...
          </div>

          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-8 w-64 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-80 rounded bg-slate-100" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-5">
              <div className="h-44 rounded-2xl bg-slate-100" />
              <div className="h-52 rounded-2xl bg-slate-100" />
            </div>
            <div className="h-72 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!reclamation) {
    return (
      <AdminLayout title="Gestion des réclamations">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Réclamation introuvable
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Cette réclamation n’existe pas ou n’est plus disponible.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestion des réclamations">
      <div className="space-y-5">
        <button
          onClick={() => navigate("/admin/reclamations")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          Retour à la liste
        </button>

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-600">
                Réclamation
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {reclamation.numeroReclamation}
                </h1>
                <StatusBadge status={reclamation.statut} />
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {authorTypeLabel}
                </span>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                {reclamation.objet || "Sans objet"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isSubmitted && (
                <button
                  onClick={() => setShowPrendreEnChargeModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PlayCircle size={15} />
                  Prendre en charge
                </button>
              )}
            </div>
          </div>

          {ShowPrendreEnChargeModal && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Prendre en charge</h2>
              </div>
              <button
                onClick={() => setShowPrendreEnChargeModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setShowPrendreEnChargeModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={15} />
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

          <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
            <MiniCard
              label="Auteur"
              value={authorFullName}
              icon={<User size={15} />}
            />
            <MiniCard
              label="Date création"
              value={formatShortDate(reclamation.dateCreation)}
              icon={<CalendarDays size={15} />}
            />
            <MiniCard
              label="Pièce jointe"
              value={reclamation.pieceJointePath ? "Disponible" : "Aucune"}
              icon={<Paperclip size={15} />}
              accent={!!reclamation.pieceJointePath}
            />
            <MiniCard
              label="Réponse admin"
              value={reclamation.adminResponse ? "Rédigée" : "En attente"}
              icon={<ClipboardList size={15} />}
              accent={!!reclamation.adminResponse}
            />
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-5">
            <DetailSection
              title="Réclamation"
              icon={<FileText size={16} />}
            >
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-800">
                  {reclamation.message || "—"}
                </p>
              </div>
            </DetailSection>

            {reclamation.pieceJointePath && (
              <DetailSection
                title="Pièce jointe"
                icon={<Paperclip size={16} />}
              >
                <a
                  href={`http://localhost:8080${reclamation.pieceJointePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-green-200 hover:bg-green-50/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {getFileName(reclamation.pieceJointePath)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Ouvrir le document transmis
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-medium text-green-700">
                    Ouvrir
                  </span>
                </a>
              </DetailSection>
            )}

            <DetailSection
              title="Réponse administrative"
              icon={<ClipboardList size={16} />}
              action={
                !isClosed && (
                  <span className="text-xs text-slate-400">
                    Réponse obligatoire pour clôturer
                  </span>
                )
              }
            >
              <div className="space-y-4">
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  disabled={isClosed}
                  rows={10}
                  placeholder="Saisir ici la réponse administrative..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                {isClosed ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    Cette réclamation est clôturée. La réponse est désormais en lecture seule.
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs leading-5 text-slate-500">
                      La réponse enregistrée ici sera communiquée comme réponse finale de l’administration.
                    </p>

                    {isInProgress && (
                      <button
                        onClick={handleClose}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Lock size={15} />
                        Clôturer la réclamation
                      </button>
                    )}
                  </div>
                )}
              </div>
            </DetailSection>
          </div>

          <div className="space-y-5">
            <DetailSection
              title="Déposant"
              icon={<User size={16} />}
            >
              <div className="mb-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {authorTypeLabel}
                </span>
              </div>

              <div className="space-y-0">
                <AuthorRow
                  icon={<User size={14} />}
                  label="Nom complet"
                  value={authorFullName}
                />
                <AuthorRow
                  icon={<Mail size={14} />}
                  label="Email"
                  value={reclamation.emailAuteur || "—"}
                />
                <AuthorRow
                  icon={<Phone size={14} />}
                  label="Téléphone"
                  value={reclamation.telephoneAuteur || "—"}
                />
                <AuthorRow
                  icon={<MapPin size={14} />}
                  label="Adresse / Ville"
                  value={
                    reclamation.adresseAuteur ||
                    reclamation.villeAuteur ||
                    "—"
                  }
                />
              </div>
            </DetailSection>

            <DetailSection
              title="Suivi"
              icon={<Clock3 size={16} />}
            >
              <Timeline status={reclamation.statut} reclamation={reclamation} />
            </DetailSection>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminReclamationDetail;