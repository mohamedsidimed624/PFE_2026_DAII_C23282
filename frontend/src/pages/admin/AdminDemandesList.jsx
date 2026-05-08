import { useEffect, useState } from "react";
import { getAllDemandes } from "../../services/adminApi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Search,
  Filter,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  ClipboardList,
} from "lucide-react";

const STATUS_OPTIONS = ["Tous", "PENDING", "APPROUVED", "REJECTED"];
const PAGE_SIZES     = [10, 25, 50];

const getStatusClasses = (status) => {
  switch (status) {
    case "APPROUVED": return { pill: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", dot: "bg-green-500" };
    case "REJECTED":  return { pill: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",         dot: "bg-red-500" };
    default:          return { pill: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", dot: "bg-amber-400" };
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

function AdminDemandesList() {
  const [demandes,    setDemandes]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("Tous");
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllDemandes();
        setDemandes(data);
      } catch (e) {
        console.error("Erreur chargement demandes", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = demandes.filter((d) => {
    const matchSearch =
      `${d.nom} ${d.prenom} ${d.email} ${d.id}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "Tous" || d.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatus = (s)  => { setStatusFilter(s); setPage(1); };

  if (loading) {
    return (
      <AdminLayout title="Gestion des demandes">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm p-4">
          <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          Chargement…
        </div>
      </AdminLayout>
    );
  }

  const pending   = demandes.filter(d => d.statut === "PENDING").length;
  const accepted  = demandes.filter(d => d.statut === "APPROUVED").length;
  const rejected  = demandes.filter(d => d.statut === "REJECTED").length;

  return (
    <AdminLayout title="Gestion des demandes">
      <div className="space-y-4">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
              <ClipboardList size={18} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Gestion des demandes</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{demandes.length} demande(s) au total</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "En attente", count: pending,  bg: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400", status: "PENDING"  },
              { label: "Acceptées",  count: accepted, bg: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400", status: "APPROUVED" },
              { label: "Rejetées",   count: rejected, bg: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",         status: "REJECTED"  },
            ].map(({ label, count, bg, status }) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(statusFilter === status ? "Tous" : status); setPage(1); }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${bg} ${statusFilter === status ? "ring-2 ring-offset-1 ring-current" : ""}`}
              >
                {label} · {count}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Barre d'outils ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex flex-wrap items-center gap-3 justify-between"
        >

          {/* Recherche */}
          <div className="relative flex-1 min-w-48 max-w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtre statut */}
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatus(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all appearance-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === "Tous" ? "Statut : Tous" : s}</option>
                ))}
              </select>
            </div>

            {/* Filtre date (UI only) */}
            <button className="flex items-center gap-2 px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <CalendarDays size={14} className="text-slate-400 dark:text-slate-500" />
              Filtrer par date
            </button>
          </div>
        </motion.div>

        {/* ── Table ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["ID", "DATE", "DEMANDEUR", "STATUS", "ACTION"].map((h) => (
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
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                      Aucune demande trouvée.
                    </td>
                  </tr>
                ) : (
                  paginated.map((d) => {
                    const sc = getStatusClasses(d.statut);
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors group">
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          #{d.id}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(d.dateCreation || d.date)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                              {d.nom} {d.prenom}
                            </p>
                            {d.email && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{d.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {d.statut || "PENDING"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => navigate(`/admin/demandes/${d.id}`)}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                          >
                            <Eye size={14} />
                            Voir détail
                          </button>
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
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>Affichage</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 outline-none focus:border-green-500 transition-all"
              >
                {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>sur {filtered.length}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return (
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
                );
              })}

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

export default AdminDemandesList;
