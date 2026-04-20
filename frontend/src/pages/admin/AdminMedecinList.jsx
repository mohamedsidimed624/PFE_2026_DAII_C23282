import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMedecins } from "../../services/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Search,
  CalendarDays,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZES = [10, 25, 50];

const getStatusClasses = (status) => {
  switch ((status || "").toUpperCase()) {
    case "ACTIF":
    case "VALIDÉ":
    case "VALIDE":
      return { pill: "text-green-600 font-semibold", dot: "bg-green-500" };
    case "SUSPENDU":
      return { pill: "text-red-600 font-semibold", dot: "bg-red-500" };
    default:
      return { pill: "text-slate-500 font-semibold", dot: "bg-slate-400" };
  }
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
};

const calculateAge = (dateNaissance) => {
  if (!dateNaissance) return null;
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return age;
};

function AdminMedecinsList() {
  const [medecins,     setMedecins]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortFilter,   setSortFilter]   = useState("recent");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllMedecins();
        setMedecins(data);
      } catch (e) {
        console.error("Erreur chargement médecins", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = medecins.filter((m) => {
      const hay = `${m.nom} ${m.prenom} ${m.email} ${m.nni} ${m.telephone} ${m.specialite} ${m.numeroInscription}`.toLowerCase();
      const matchSearch  = hay.includes(search.toLowerCase());
      const matchStatus  = !statusFilter || (m.statut || "").toUpperCase() === statusFilter;
      return matchSearch && matchStatus;
    });

    result = [...result].sort((a, b) => {
      switch (sortFilter) {
        case "recent":   return (b.id || 0) - (a.id || 0);
        case "ancien":   return (a.id || 0) - (b.id || 0);
        case "oldest": {
          const [ageA, ageB] = [calculateAge(a.dateNaissance), calculateAge(b.dateNaissance)];
          if (ageA == null && ageB == null) return 0;
          if (ageA == null) return 1;
          if (ageB == null) return -1;
          return ageB - ageA;
        }
        case "youngest": {
          const [ageA, ageB] = [calculateAge(a.dateNaissance), calculateAge(b.dateNaissance)];
          if (ageA == null && ageB == null) return 0;
          if (ageA == null) return 1;
          if (ageB == null) return -1;
          return ageA - ageB;
        }
        default: return 0;
      }
    });

    return result;
  }, [medecins, search, statusFilter, sortFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <AdminLayout title="Gestion des Médecins">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          Chargement des médecins…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestion des Médecins">
      <div className="space-y-4">

        {/* ── Barre d'outils ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-48 max-w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order id"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Statut */}
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all appearance-none"
              >
                <option value="">Statut : All</option>
                <option value="ACTIF">ACTIF</option>
                <option value="SUSPENDU">SUSPENDU</option>
              </select>
            </div>

            {/* Tri */}
            <select
              value={sortFilter}
              onChange={(e) => { setSortFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all appearance-none"
            >
              <option value="recent">Plus récents</option>
              <option value="ancien">Plus anciens</option>
              <option value="oldest">Plus âgés</option>
              <option value="youngest">Plus jeunes</option>
            </select>

            {/* Date range */}
            <button className="flex items-center gap-2 px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <CalendarDays size={14} className="text-slate-400" />
              Filter by date range
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {[
                    "NOM & PRÉNOM",
                    "NNI",
                    "GENRE",
                    "TÉLÉPHONE",
                    "DATE DE NAISSANCE",
                    "ADRESSE POSTAL",
                    "STATUT",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                      Aucun médecin trouvé.
                    </td>
                  </tr>
                ) : (
                  paginated.map((m) => {
                    const sc = getStatusClasses(m.statut);
                    return (
                      <tr
                        key={m.id}
                        onClick={() => navigate(`/admin/medecins/${m.id}`)}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {m.nom} {m.prenom}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                          {m.nni || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                          {m.sexe || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                          {m.telephone || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(m.dateNaissance)}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                          {m.adresse || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-sm ${sc.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {m.statut || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Showing</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 bg-white outline-none focus:border-green-500 transition-all"
              >
                {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>of {filtered.length}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                    page === p
                      ? "bg-green-600 text-white"
                      : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminMedecinsList;