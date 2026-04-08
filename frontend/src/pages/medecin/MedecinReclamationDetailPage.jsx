import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyReclamationById } from "../../services/medecinReclamationApi";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Lock,
  MessageSquare,
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  Inbox,
} from "lucide-react";

function MedecinReclamationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reclamation, setReclamation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReclamation = async () => {
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
    };

    fetchReclamation();
  }, [id]);

  const formatStatus = (status) => {
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
  };

  const getStatusBadge = (status) => {
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
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("fr-FR");
  };

  if (loading) {
    return (
      <MedecinLayout
        title="Détail de la réclamation"
        subtitle="Chargement des informations..."
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            Chargement...
          </div>
        </div>
      </MedecinLayout>
    );
  }

  if (error) {
    return (
      <MedecinLayout
        title="Détail de la réclamation"
        subtitle="Une erreur est survenue."
      >
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      </MedecinLayout>
    );
  }

  if (!reclamation) {
    return (
      <MedecinLayout
        title="Détail de la réclamation"
        subtitle="Réclamation introuvable."
      >
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Réclamation introuvable
          </h2>
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout
      title="Détail de la réclamation"
      subtitle="Consultez l'état et la réponse de l'administration."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          onClick={() => navigate("/medecin/reclamations")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Retour à mes réclamations
        </button>

        {/* header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-green-600">
                Réclamation
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {reclamation.numeroReclamation}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {reclamation.objet || "Sans objet"}
              </p>
            </div>

            <span
              className={`inline-flex self-start rounded-full border px-4 py-1.5 text-sm font-semibold ${getStatusBadge(
                reclamation.statut
              )}`}
            >
              {formatStatus(reclamation.statut)}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickStat
              label="Date de création"
              value={formatDateTime(reclamation.dateCreation)}
              icon={<CalendarDays size={16} />}
            />
            <QuickStat
              label="Prise en charge"
              value={formatDateTime(reclamation.datePriseEnCharge)}
              icon={<Clock3 size={16} />}
            />
            <QuickStat
              label="Clôture"
              value={formatDateTime(reclamation.dateCloture)}
              icon={<ShieldCheck size={16} />}
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <Section
              title="Votre message"
              icon={<MessageSquare size={17} className="text-green-600" />}
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-800">
                  {reclamation.message || "—"}
                </p>
              </div>
            </Section>

            {reclamation.pieceJointePath && (
              <Section
                title="Pièce jointe"
                icon={<FileText size={17} className="text-green-600" />}
              >
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
              </Section>
            )}

            <Section
              title="Réponse de l'administration"
              icon={<CheckCircle2 size={17} className="text-green-600" />}
            >
              {reclamation.adminResponse ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-green-800">
                    {reclamation.adminResponse}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm text-slate-500">
                    Aucune réponse administrative n’est encore disponible.
                  </p>
                </div>
              )}
            </Section>
          </div>

          <div className="space-y-6">
            <Section
              title="Suivi"
              icon={<Clock3 size={17} className="text-green-600" />}
            >
              <InfoRow label="Statut" value={formatStatus(reclamation.statut)} />
              <InfoRow
                label="Date de création"
                value={formatDateTime(reclamation.dateCreation)}
              />
              <InfoRow
                label="Date de prise en charge"
                value={formatDateTime(reclamation.datePriseEnCharge)}
              />
              <InfoRow
                label="Date de clôture"
                value={formatDateTime(reclamation.dateCloture)}
              />
            </Section>

            <Section
              title="Information"
              icon={<Lock size={17} className="text-green-600" />}
            >
              <p className="text-sm leading-7 text-slate-500">
                Votre réclamation passe par les étapes :
                <span className="font-medium text-slate-700"> soumise</span>,
                <span className="font-medium text-slate-700"> en cours</span>,
                puis
                <span className="font-medium text-slate-700"> clôturée</span>.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-green-50">
          {icon}
        </div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}

function QuickStat({ label, value, icon }) {
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

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default MedecinReclamationDetailPage;