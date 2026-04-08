import { useEffect, useState } from "react";
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
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  Inbox,
} from "lucide-react";

/* helpers */
function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR");
}

function formatStatus(status) {
  switch ((status || "").toUpperCase()) {
    case "SUBMITTED":
      return "Soumise";
    case "IN_PROGRESS":
      return "En cours";
    case "CLOSED":
      return "Clôturée";
    default:
      return status || "—";
  }
}

function getStatusBadge(status) {
  switch ((status || "").toUpperCase()) {
    case "SUBMITTED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "CLOSED":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function getTimelineConfig(status) {
  switch ((status || "").toUpperCase()) {
    case "SUBMITTED":
      return { label: "Réclamation soumise", color: "bg-amber-500" };
    case "IN_PROGRESS":
      return { label: "Réclamation en cours de traitement", color: "bg-blue-500" };
    case "CLOSED":
      return { label: "Réclamation clôturée", color: "bg-green-500" };
    default:
      return { label: "Statut inconnu", color: "bg-slate-400" };
  }
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

  if (loading) {
    return (
      <AdminLayout title="Réclamations">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            Chargement du détail de la réclamation...
          </div>

          <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-4 h-8 w-60 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 rounded bg-slate-100" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!reclamation) {
    return (
      <AdminLayout title="Réclamations">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
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

  const isSubmitted = reclamation.statut === "SUBMITTED";
  const isInProgress = reclamation.statut === "IN_PROGRESS";
  const isClosed = reclamation.statut === "CLOSED";
  const timeline = getTimelineConfig(reclamation.statut);

  return (
    <AdminLayout title="Réclamations">
      <div className="space-y-6">
        <button
          onClick={() => navigate("/admin/reclamations")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </button>

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-green-600">
                Réclamation
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {reclamation.numeroReclamation}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {reclamation.objet || "Sans objet"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-semibold ${getStatusBadge(
                  reclamation.statut
                )}`}
              >
                {formatStatus(reclamation.statut)}
              </span>

              {!isClosed && (
                <>
                  {isSubmitted && (
                    <button
                      onClick={handleStart}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <PlayCircle size={16} />
                      Prendre en charge
                    </button>
                  )}

                  {(isSubmitted || isInProgress) && (
                    <button
                      onClick={handleClose}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Lock size={16} />
                      Clôturer
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickStat
              label="Type d’auteur"
              value={reclamation.typeAuteur === "MEDECIN" ? "Médecin" : "Citoyen"}
              icon={<User size={16} />}
            />
            <QuickStat
              label="Date de création"
              value={formatDateTime(reclamation.dateCreation)}
              icon={<CalendarDays size={16} />}
            />
            <QuickStat
              label="Traitement"
              value={timeline.label}
              icon={<ShieldCheck size={16} />}
              dotClass={timeline.color}
            />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          {/* main */}
          <div className="space-y-6">
            <Section title="Message de la réclamation">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-800">
                  {reclamation.message || "—"}
                </p>
              </div>
            </Section>

            {reclamation.pieceJointePath && (
              <Section title="Pièce jointe">
                <div className="space-y-3">
                  <a
                    href={`http://localhost:8080${reclamation.pieceJointePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Ouvrir la pièce jointe
                        </p>
                        <p className="text-xs text-slate-400">
                          Consulter le document transmis
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-slate-400" />
                  </a>
                </div>
              </Section>
            )}

            <Section title="Réponse de l’administration">
              <div className="space-y-3">
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  disabled={isClosed}
                  rows={8}
                  placeholder="Saisir ici la réponse administrative..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                {!isClosed && (
                  <p className="text-xs text-slate-400">
                    Cette réponse sera conservée comme réponse finale de
                    l’administration.
                  </p>
                )}
              </div>
            </Section>
          </div>

          {/* sidebar */}
          <div className="space-y-6">
            <Section title="Chronologie">
              <TimelineRow
                label="Création"
                value={formatDateTime(reclamation.dateCreation)}
                active={!!reclamation.dateCreation}
                colorClass="bg-amber-500"
              />
              <TimelineRow
                label="Prise en charge"
                value={formatDateTime(reclamation.datePriseEnCharge)}
                active={!!reclamation.datePriseEnCharge}
                colorClass="bg-blue-500"
              />
              <TimelineRow
                label="Clôture"
                value={formatDateTime(reclamation.dateCloture)}
                active={!!reclamation.dateCloture}
                colorClass="bg-green-500"
                last
              />
            </Section>

            <Section title="Auteur">
              <span className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {reclamation.typeAuteur === "MEDECIN" ? "Médecin" : "Citoyen"}
              </span>

              <div className="space-y-1">
                <AuthorRow
                  icon={<User size={15} />}
                  value={
                    `${reclamation.prenomAuteur || ""} ${reclamation.nomAuteur || ""}`.trim() ||
                    "—"
                  }
                />
                <AuthorRow
                  icon={<Mail size={15} />}
                  value={reclamation.emailAuteur || "—"}
                />
                <AuthorRow
                  icon={<Phone size={15} />}
                  value={reclamation.telephoneAuteur || "—"}
                />
                <AuthorRow
                  icon={<MapPin size={15} />}
                  value={
                    reclamation.villeAuteur ||
                    reclamation.adresseAuteur ||
                    "—"
                  }
                />
              </div>
            </Section>

            <Section title="Informations générales">
              <InfoRow
                label="Type d'auteur"
                value={reclamation.typeAuteur === "MEDECIN" ? "Médecin" : "Citoyen"}
              />
              <InfoRow
                label="Statut"
                value={formatStatus(reclamation.statut)}
              />
              <InfoRow
                label="Numéro"
                value={reclamation.numeroReclamation}
              />
            </Section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function QuickStat({ label, value, icon, dotClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
            {value || "—"}
          </p>
        </div>

        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
          {dotClass && (
            <span className={`absolute right-1 top-1 h-2 w-2 rounded-full ${dotClass}`} />
          )}
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}

function AuthorRow({ icon, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <p className="text-sm text-slate-700 break-all">{value}</p>
    </div>
  );
}

function TimelineRow({ label, value, active, colorClass, last = false }) {
  return (
    <div className={`flex gap-3 ${!last ? "pb-4" : ""}`}>
      <div className="flex flex-col items-center">
        <span
          className={`mt-1 h-3 w-3 rounded-full ${
            active ? colorClass : "bg-slate-300"
          }`}
        />
        {!last && <span className="mt-2 h-full w-px bg-slate-200" />}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{value || "—"}</p>
      </div>
    </div>
  );
}

export default AdminReclamationDetail;