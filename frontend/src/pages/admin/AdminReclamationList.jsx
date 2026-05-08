import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAllReclamations } from "../../services/adminReclamationApi";
import {
  Search, ChevronRight, ChevronLeft, Inbox, AlertCircle,
  Filter, ChevronsLeft, ChevronsRight, RotateCcw, MessageSquareWarning,
} from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const STATUS_CONFIG = {
  SUBMITTED:   { label: "Soumise",   className: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  IN_PROGRESS: { label: "En cours",  className: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  CLOSED:      { label: "Clôturée",  className: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" },
};

const AUTEUR_CONFIG = {
  MEDECIN: { label: "Médecin", className: "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" },
  CITOYEN: { label: "Citoyen", className: "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400" },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[(status || "").toUpperCase()] || { label: status || "—", className: "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700" };
  return (
    <span className={cx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
}

function AuteurBadge({ type }) {
  const config = AUTEUR_CONFIG[(type || "").toUpperCase()] || { label: type || "—", className: "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400" };
  return (
    <span className={cx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-green-600 text-white"
          : disabled
          ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
          : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-green-300 hover:text-green-700 hover:bg-slate-50 dark:hover:bg-slate-800"
      )}
    >
      {children}
    </button>
  );
}

function Pagination({ page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems);

  const pages = useMemo(() => {
    const result = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (page > 3) result.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) result.push(i);
      if (page < totalPages - 2) result.push("...");
      result.push(totalPages);
    }
    return result;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 sm:flex-row transition-colors duration-200">
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <span>Affichage</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 outline-none focus:border-green-500 transition-all"
        >
          {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span>{from}–{to} sur {totalItems}</span>
      </div>
      <div className="flex items-center gap-1">
        <PagBtn onClick={() => onPageChange(1)} disabled={page === 1}><ChevronsLeft size={13} /></PagBtn>
        <PagBtn onClick={() => onPageChange(page - 1)} disabled={page === 1}><ChevronLeft size={13} /></PagBtn>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-xs text-slate-400 dark:text-slate-500">…</span>
          ) : (
            <PagBtn key={p} onClick={() => onPageChange(p)} active={p === page}>{p}</PagBtn>
          )
        )}
        <PagBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages}><ChevronRight size={13} /></PagBtn>
        <PagBtn onClick={() => onPageChange(totalPages)} disabled={page === totalPages}><ChevronsRight size={13} /></PagBtn>
      </div>
    </div>
  );
}

function AdminReclamationsList() {
  const navigate = useNavigate();
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [auteurFilter, setAuteurFilter] = useState("ALL");
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError("");
        const data = await getAllReclamations();
        setReclamations(data);
      } catch {
        setError("Impossible de charger les réclamations.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { setPage(1); }, [search, statusFilter, auteurFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return reclamations.filter((r) => {
      const matchStatus = statusFilter === "ALL" || (r.statut || "").toUpperCase() === statusFilter;
      const matchAuteur = auteurFilter === "ALL" || (r.typeAuteur || "").toUpperCase() === auteurFilter;
      const matchSearch = !q || (r.numeroReclamation || "").toLowerCase().includes(q) || (r.objet || "").toLowerCase().includes(q) || (r.auteurNom || "").toLowerCase().includes(q);
      return matchStatus && matchAuteur && matchSearch;
    });
  }, [reclamations, search, statusFilter, auteurFilter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated   = filtered.slice((page - 1) * pageSize, page * pageSize);
  const submittedCount = useMemo(() => reclamations.filter((r) => (r.statut || "").toUpperCase() === "SUBMITTED").length, [reclamations]);

  const handleResetFilters = () => { setSearch(""); setStatusFilter("ALL"); setAuteurFilter("ALL"); setPage(1); };

  const selectCls = "appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-3 pr-8 text-sm text-slate-700 dark:text-slate-300 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10";

  return (
    <AdminLayout title="Gestion des réclamations">
      <div className="space-y-4">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <MessageSquareWarning size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Gestion des réclamations</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Consultez, filtrez et traitez les réclamations déposées.</p>
            </div>
          </div>
          {!loading && submittedCount > 0 && (
            <div className="inline-flex items-center rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              {submittedCount} à traiter
            </div>
          )}
        </motion.div>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative min-w-0 flex-1 xl:max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher par numéro, objet ou auteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-9 pr-8 text-sm text-slate-700 dark:text-slate-300 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">×</button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
                  <option value="ALL">Tous les statuts</option>
                  <option value="SUBMITTED">Soumises</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="CLOSED">Clôturées</option>
                </select>
                <Filter size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              </div>

              <div className="relative">
                <select value={auteurFilter} onChange={(e) => setAuteurFilter(e.target.value)} className={selectCls}>
                  <option value="ALL">Tous les auteurs</option>
                  <option value="MEDECIN">Médecins</option>
                  <option value="CITOYEN">Citoyens</option>
                </select>
                <Filter size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              </div>

              {(search || statusFilter !== "ALL" || auteurFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <RotateCcw size={14} />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {!loading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-100">{filtered.length}</span>{" "}
              résultat{filtered.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-200"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                  {["N° réclamation","Objet","Auteur","Type","Date","Statut","Action"].map((col) => (
                    <th key={col} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3.5 rounded bg-slate-100 dark:bg-slate-800" style={{ width: `${60 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                          <Inbox size={20} />
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Aucune réclamation trouvée</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Modifiez vos filtres pour voir des résultats.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((r) => {
                    const isSubmitted = (r.statut || "").toUpperCase() === "SUBMITTED";
                    return (
                      <tr key={r.id} className="group transition hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{r.numeroReclamation || r.id}</span>
                        </td>
                        <td className="max-w-[260px] px-4 py-3">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{r.objet || "Sans objet"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-700 dark:text-slate-300">{r.auteurNom || "—"}</span>
                        </td>
                        <td className="px-4 py-3"><AuteurBadge type={r.typeAuteur} /></td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(r.dateCreation)}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={r.statut} /></td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/admin/reclamations/${r.id}`)}
                            className={cx(
                              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                              isSubmitted
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-green-300 hover:text-green-700 dark:hover:bg-slate-800"
                            )}
                          >
                            {isSubmitted ? "Traiter" : "Voir détail"}
                            <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <Pagination
              page={page} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default AdminReclamationsList;
