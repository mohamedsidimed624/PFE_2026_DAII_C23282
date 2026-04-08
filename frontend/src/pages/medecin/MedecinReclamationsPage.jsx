import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyReclamations } from "../../services/medecinReclamationApi";
import {
  Search,
  Plus,
  ChevronRight,
  Inbox,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

function MedecinReclamationsPage() {
  const navigate = useNavigate();

  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyReclamations();
        setReclamations(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos réclamations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReclamations();
  }, []);

  const filteredReclamations = useMemo(() => {
    const term = search.toLowerCase();

    return reclamations.filter((r) => {
      return (
        (r.numeroReclamation || "").toLowerCase().includes(term) ||
        (r.objet || "").toLowerCase().includes(term) ||
        (r.statut || "").toLowerCase().includes(term)
      );
    });
  }, [reclamations, search]);

  const stats = useMemo(() => {
    const total = reclamations.length;
    const submitted = reclamations.filter(
      (r) => (r.statut || "").toUpperCase() === "SUBMITTED"
    ).length;
    const inProgress = reclamations.filter(
      (r) => (r.statut || "").toUpperCase() === "IN_PROGRESS"
    ).length;
    const closed = reclamations.filter(
      (r) => (r.statut || "").toUpperCase() === "CLOSED"
    ).length;

    return { total, submitted, inProgress, closed };
  }, [reclamations]);

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

  return (
    <MedecinLayout
      title="Mes réclamations"
      subtitle="Suivez l’état de vos demandes et consultez les réponses de l’administration."
    >
      <div className="space-y-6">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-green-600">
                Suivi
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Mes réclamations
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Consultez vos réclamations, vérifiez leur statut et accédez au
                détail des réponses administratives.
              </p>
            </div>

            <button
              onClick={() => navigate("/medecin/reclamations/nouvelle")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Plus size={16} />
              Nouvelle réclamation
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total"
              value={stats.total}
              icon={<Inbox size={16} />}
              iconClass="bg-slate-100 text-slate-700"
            />
            <StatCard
              label="Soumises"
              value={stats.submitted}
              icon={<FileText size={16} />}
              iconClass="bg-amber-100 text-amber-700"
            />
            <StatCard
              label="En cours"
              value={stats.inProgress}
              icon={<Clock3 size={16} />}
              iconClass="bg-blue-100 text-blue-700"
            />
            <StatCard
              label="Clôturées"
              value={stats.closed}
              icon={<CheckCircle2 size={16} />}
              iconClass="bg-green-100 text-green-700"
            />
          </div>
        </section>

        {/* Search */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative w-full md:max-w-xl">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Rechercher par numéro, objet ou statut..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15"
            />
          </div>

          {!loading && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">
                  {filteredReclamations.length}
                </span>{" "}
                résultat{filteredReclamations.length > 1 ? "s" : ""}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-sm font-medium text-green-700 transition hover:text-green-800"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          )}
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-5">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-slate-100 p-4"
                  >
                    <div className="space-y-3">
                      <div className="h-4 w-32 rounded bg-slate-200" />
                      <div className="h-4 w-56 rounded bg-slate-100" />
                      <div className="h-4 w-24 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredReclamations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Inbox size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Aucune réclamation trouvée
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Vous n’avez pas encore soumis de réclamation ou aucun résultat
                ne correspond à votre recherche.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-4">
              {filteredReclamations.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-green-200 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {r.numeroReclamation}
                        </p>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                            r.statut
                          )}`}
                        >
                          {formatStatus(r.statut)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-slate-800">
                        {r.objet || "Sans objet"}
                      </h3>

                      <p className="mt-2 text-xs text-slate-400">
                        Créée le{" "}
                        {r.dateCreation
                          ? new Date(r.dateCreation).toLocaleDateString("fr-FR")
                          : "—"}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/medecin/reclamations/${r.id}`)}
                      className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Voir détail
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </MedecinLayout>
  );
}

function StatCard({ label, value, icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default MedecinReclamationsPage;