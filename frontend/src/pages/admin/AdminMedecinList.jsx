import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllMedecins } from "../../services/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Search,
  CalendarDays,
  Filter,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from "lucide-react";

const PAGE_SIZES = [10, 25, 50];

const getStatusClasses = (status) => {
  switch ((status || "").toUpperCase()) {
    case "ACTIF":
    case "VALIDÉ":
    case "VALIDE":
      return { pill: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800", dot: "bg-green-500" };
    case "SUSPENDU":
      return { pill: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800", dot: "bg-red-500" };
    default:
      return { pill: "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700", dot: "bg-slate-400" };
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

  const actifs    = medecins.filter(m => (m.statut || "").toUpperCase() === "ACTIF").length;
  const suspendus = medecins.filter(m => (m.statut || "").toUpperCase() === "SUSPENDU").length;

  if (loading) {
    return (
      <AdminLayout title="Gestion des Médecins">
        <div className="space-y-4">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800">
                <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-36 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestion des Médecins">
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
              <Stethoscope size={18} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Gestion des Médecins</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{medecins.length} médecin(s) au total</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { label: "Actifs",    count: actifs,    bg: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400", val: "ACTIF"    },
              { label: "Suspendus", count: suspendus, bg: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",         val: "SUSPENDU" },
            ].map(({ label, count, bg, val }) => (
              <button
                key={val}
                onClick={() => { setStatusFilter(statusFilter === val ? "" : val); setPage(1); }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${bg} ${statusFilter === val ? "ring-2 ring-offset-1 ring-current" : ""}`}
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
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="relative flex-1 min-w-48 max-w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un médecin…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="pl-8 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all appearance-none"
              >
                <option value="">Statut : Tous</option>
                <option value="ACTIF">Actif</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
            </div>

            <select
              value={sortFilter}
              onChange={(e) => { setSortFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all appearance-none"
            >
              <option value="recent">Plus récents</option>
              <option value="ancien">Plus anciens</option>
              <option value="oldest">Plus âgés</option>
              <option value="youngest">Plus jeunes</option>
            </select>

            <button className="flex items-center gap-2 px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <CalendarDays size={14} className="text-slate-400 dark:text-slate-500" />
              Filtrer par date
            </button>
          </div>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-225">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  {["NOM & PRÉNOM", "NNI", "GENRE", "TÉLÉPHONE", "DATE NAISS.", "ADRESSE", "STATUT"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <Stethoscope size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">Aucun médecin trouvé.</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((m, i) => {
                    const sc = getStatusClasses(m.statut);
                    return (
                      <motion.tr
                        key={m.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.28 + i * 0.04 }}
                        onClick={() => navigate(`/admin/medecins/${m.id}`)}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-xs font-bold text-green-700 dark:text-green-400">
                              {(m.nom?.[0] || "?").toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {m.nom} {m.prenom}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{m.nni || "—"}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{m.sexe || "—"}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{m.telephone || "—"}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{formatDate(m.dateNaissance)}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 max-w-35 truncate">{m.adresse || "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sc.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {m.statut || "—"}
                          </span>
                        </td>
                      </motion.tr>
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
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 outline-none focus:border-green-500"
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
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default AdminMedecinsList;
