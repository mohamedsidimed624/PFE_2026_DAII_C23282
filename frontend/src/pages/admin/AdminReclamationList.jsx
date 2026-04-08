import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAllReclamations } from "../../services/adminReclamationApi";
import {
  Search,
  ChevronRight,
  Filter,
  Inbox,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserRound,
} from "lucide-react";

function AdminReclamationsList() {
  const navigate = useNavigate();

  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAllReclamations();
        setReclamations(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les réclamations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReclamations();
  }, []);

  const filteredReclamations = useMemo(() => {
    return reclamations.filter((r) => {
      const q = search.toLowerCase();

      const matchesSearch =
        (r.numeroReclamation || "").toLowerCase().includes(q) ||
        (r.objet || "").toLowerCase().includes(q) ||
        (r.auteurNom || "").toLowerCase().includes(q);

      const matchesStatus =
        !statusFilter || (r.statut || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reclamations, search, statusFilter]);

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

  const formatAuteurType = (type) => {
    return type === "MEDECIN" ? "Médecin" : "Citoyen";
  };

  return (
    <AdminLayout title="Réclamations">
      <div className="space-y-6">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-green-600">
                Administration
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Gestion des réclamations
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Suivez, traitez et clôturez les réclamations déposées par les
                médecins et les citoyens depuis un seul espace de gestion.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
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
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Rechercher par numéro, objet ou auteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2 px-1 text-sm text-slate-500">
                <Filter size={15} />
                <span className="font-medium">Statut</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/15"
              >
                <option value="">Tous les statuts</option>
                <option value="SUBMITTED">Soumise</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="CLOSED">Clôturée</option>
              </select>
            </div>
          </div>

          {!loading && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">
                  {filteredReclamations.length}
                </span>{" "}
                résultat{filteredReclamations.length > 1 ? "s" : ""}
              </p>

              {(search || statusFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                  }}
                  className="text-sm font-medium text-green-700 transition hover:text-green-800"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </section>

        {/* Error */}
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
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-slate-100 p-4"
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                      <div className="h-4 rounded bg-slate-200 md:col-span-1" />
                      <div className="h-4 rounded bg-slate-200 md:col-span-1" />
                      <div className="h-4 rounded bg-slate-200 md:col-span-1" />
                      <div className="h-4 rounded bg-slate-200 md:col-span-1" />
                      <div className="h-4 rounded bg-slate-200 md:col-span-1" />
                      <div className="h-10 rounded bg-slate-200 md:col-span-1" />
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
                Aucun résultat ne correspond à votre recherche actuelle. Essayez
                un autre mot-clé ou modifiez le filtre de statut.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto xl:block">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">Numéro</th>
                      <th className="px-5 py-4">Auteur</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Objet</th>
                      <th className="px-5 py-4">Statut</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReclamations.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {r.numeroReclamation}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <UserRound size={15} />
                            </span>
                            <span className="font-medium text-slate-800">
                              {r.auteurNom || "—"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatAuteurType(r.typeAuteur)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-xs truncate font-medium text-slate-700">
                            {r.objet || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                              r.statut
                            )}`}
                          >
                            {formatStatus(r.statut)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {r.dateCreation
                            ? new Date(r.dateCreation).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/reclamations/${r.id}`)}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                          >
                            Voir
                            <ChevronRight size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="grid gap-4 p-4 xl:hidden">
                {filteredReclamations.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {r.numeroReclamation}
                        </p>
                        <h3 className="mt-1 text-sm font-bold text-slate-900">
                          {r.objet || "Sans objet"}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                          r.statut
                        )}`}
                      >
                        {formatStatus(r.statut)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <InfoMini label="Auteur" value={r.auteurNom || "—"} />
                      <InfoMini
                        label="Type"
                        value={formatAuteurType(r.typeAuteur)}
                      />
                      <InfoMini
                        label="Date"
                        value={
                          r.dateCreation
                            ? new Date(r.dateCreation).toLocaleDateString("fr-FR")
                            : "—"
                        }
                      />
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => navigate(`/admin/reclamations/${r.id}`)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                      >
                        Voir le détail
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </AdminLayout>
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

function InfoMini({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-medium text-slate-700">{value}</p>
    </div>
  );
}

export default AdminReclamationsList;