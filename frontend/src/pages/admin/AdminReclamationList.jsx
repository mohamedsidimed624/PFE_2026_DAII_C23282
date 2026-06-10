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
  const s = (status || "").toUpperCase();

  const label =
    s === "SUBMITTED"
      ? "Soumise"
      : s === "IN_PROGRESS"
      ? "En cours"
      : s === "CLOSED"
      ? "Clôturée"
      : status || "—";

  const cls =
    s === "CLOSED"
      ? "text-green-600 dark:text-green-400"
      : s === "IN_PROGRESS"
      ? "text-blue-500 dark:text-blue-400"
      : "text-yellow-500 dark:text-amber-400";

  return <span className={`text-[14px] font-bold ${cls}`}>{label}</span>;
}

function AuteurBadge({ type }) {
  const label =
    (type || "").toUpperCase() === "MEDECIN"
      ? "Médecin"
      : (type || "").toUpperCase() === "CITOYEN"
      ? "Citoyen"
      : type || "—";

  return <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{label}</span>;
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
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-7 py-6">

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by order id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-[240px] rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 pr-10 text-[13px] text-slate-600 dark:text-slate-200 shadow-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-green-400"
            />
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-500 dark:text-slate-300 shadow-sm outline-none focus:border-green-400"
          >
            <option value="ALL">Status : All</option>
            <option value="SUBMITTED">Soumises</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="CLOSED">Clôturées</option>
          </select>

          <select
            value={auteurFilter}
            onChange={(e) => setAuteurFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-500 dark:text-slate-300 shadow-sm outline-none focus:border-green-400"
          >
            <option value="ALL">Auteur : All</option>
            <option value="MEDECIN">Médecins</option>
            <option value="CITOYEN">Citoyens</option>
          </select>

          {(search || statusFilter !== "ALL" || auteurFilter !== "ALL") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-400 dark:text-slate-400 shadow-sm hover:text-slate-600 dark:hover:text-slate-200"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* <button className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-400 dark:text-slate-400 shadow-sm hover:text-slate-600 dark:hover:text-slate-200">
          Filter by date range
        </button> */}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] table-fixed text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="w-[16%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                  N° RÉCLAMATION
                </th>
                <th className="w-[22%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                  OBJET
                </th>
                <th className="w-[16%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                  AUTEUR
                </th>
                <th className="w-[12%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                  TYPE
                </th>
                <th className="w-[12%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                  DATE
                </th>
                <th className="w-[12%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                  STATUT
                </th>
                <th className="w-[10%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-7 py-4">
                        <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-7 py-14 text-center text-sm text-slate-400"
                  >
                    Aucune réclamation trouvée.
                  </td>
                </tr>
              ) : (
                paginated.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-7 py-4 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                      {r.numeroReclamation || r.id}
                    </td>

                    <td className="truncate px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                      {r.objet || "Sans objet"}
                    </td>

                    <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                      {r.auteurNom || "—"}
                    </td>

                    <td className="px-7 py-4">
                      <AuteurBadge type={r.typeAuteur} />
                    </td>

                    <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(r.dateCreation)}
                    </td>

                    <td className="px-7 py-4">
                      <StatusBadge status={r.statut} />
                    </td>

                    <td className="px-7 py-4">
                      <button
                        onClick={() => navigate(`/admin/reclamations/${r.id}`)}
                        className="text-[14px] font-semibold text-blue-500 hover:text-blue-600"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-7 py-5">
            <div className="flex items-center gap-2 text-[13px] text-slate-400">
              <span>Showing</span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-9 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[13px] text-slate-600 dark:text-slate-400 outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <span>of {filtered.length}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;

                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                      page === p
                        ? "bg-green-500 text-white"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </AdminLayout>
);
}

export default AdminReclamationsList;
