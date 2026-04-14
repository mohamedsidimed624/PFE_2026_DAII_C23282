import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAllReclamations } from "../../services/adminReclamationApi";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Inbox,
  AlertCircle,
  Filter,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  FileText,
  Clock3,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Soumise",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  IN_PROGRESS: {
    label: "En cours",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  CLOSED: {
    label: "Clôturée",
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

const AUTEUR_CONFIG = {
  MEDECIN: {
    label: "Médecin",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  CITOYEN: {
    label: "Citoyen",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[(status || "").toUpperCase()] || {
    label: status || "—",
    className: "bg-slate-50 text-slate-500 border-slate-200",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

function AuteurBadge({ type }) {
  const config = AUTEUR_CONFIG[(type || "").toUpperCase()] || {
    label: type || "—",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

function StatCard({ label, value, icon, iconClass, highlight = false }) {
  return (
    <div
      className={cx(
        "rounded-xl border bg-white p-4 shadow-sm transition",
        highlight ? "border-amber-200 ring-1 ring-amber-100" : "border-slate-200"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            iconClass
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const pages = useMemo(() => {
    const p = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) p.push(i);
    } else {
      p.push(1);
      if (page > 3) p.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        p.push(i);
      }
      if (page < totalPages - 2) p.push("...");
      p.push(totalPages);
    }
    return p;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Lignes par page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-green-500"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span>
          {from}–{to} sur {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <PagBtn onClick={() => onPageChange(1)} disabled={page === 1}>
          <ChevronsLeft size={13} />
        </PagBtn>

        <PagBtn onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <ChevronLeft size={13} />
        </PagBtn>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-xs text-slate-400">
              …
            </span>
          ) : (
            <PagBtn key={p} onClick={() => onPageChange(p)} active={p === page}>
              {p}
            </PagBtn>
          )
        )}

        <PagBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight size={13} />
        </PagBtn>

        <PagBtn
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <ChevronsRight size={13} />
        </PagBtn>
      </div>
    </div>
  );
}

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-medium transition",
        active
          ? "bg-green-600 text-white"
          : disabled
          ? "cursor-not-allowed text-slate-300"
          : "border border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:text-green-700"
      )}
    >
      {children}
    </button>
  );
}

function AdminReclamationsList() {
  const navigate = useNavigate();

  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [auteurFilter, setAuteurFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAllReclamations();
        setReclamations(data);
      } catch {
        setError("Impossible de charger les réclamations.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, auteurFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return reclamations.filter((r) => {
      const matchStatus =
        statusFilter === "ALL" || (r.statut || "").toUpperCase() === statusFilter;

      const matchAuteur =
        auteurFilter === "ALL" ||
        (r.typeAuteur || "").toUpperCase() === auteurFilter;

      const matchSearch =
        !q ||
        (r.numeroReclamation || "").toLowerCase().includes(q) ||
        (r.objet || "").toLowerCase().includes(q) ||
        (r.auteurNom || "").toLowerCase().includes(q);

      return matchStatus && matchAuteur && matchSearch;
    });
  }, [reclamations, search, statusFilter, auteurFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(
    () => ({
      total: reclamations.length,
      submitted: reclamations.filter(
        (r) => (r.statut || "").toUpperCase() === "SUBMITTED"
      ).length,
      inProgress: reclamations.filter(
        (r) => (r.statut || "").toUpperCase() === "IN_PROGRESS"
      ).length,
      closed: reclamations.filter(
        (r) => (r.statut || "").toUpperCase() === "CLOSED"
      ).length,
    }),
    [reclamations]
  );

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setAuteurFilter("ALL");
    setPage(1);
  };

  return (
    <AdminLayout title="Gestion des réclamations">
      <div className="space-y-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Gestion des réclamations
            </h1>
            <p className="text-sm text-slate-500">
              Consultez, filtrez et traitez les réclamations déposées par les médecins et les citoyens.
            </p>
          </div>

          {!loading && stats.submitted > 0 && (
            <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200">
              {stats.submitted} à traiter
            </div>
          )}
        </div>

        {!loading && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Total"
              value={stats.total}
              icon={<ClipboardList size={16} />}
              iconClass="bg-slate-100 text-slate-700"
            />
            <StatCard
              label="Soumises"
              value={stats.submitted}
              icon={<FileText size={16} />}
              iconClass="bg-amber-100 text-amber-700"
              highlight
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
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1 xl:max-w-md">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Rechercher par numéro, objet ou auteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="SUBMITTED">Soumises</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="CLOSED">Clôturées</option>
                </select>
                <Filter
                  size={12}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="relative">
                <select
                  value={auteurFilter}
                  onChange={(e) => setAuteurFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                >
                  <option value="ALL">Tous les auteurs</option>
                  <option value="MEDECIN">Médecins</option>
                  <option value="CITOYEN">Citoyens</option>
                </select>
                <Filter
                  size={12}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {(search || statusFilter !== "ALL" || auteurFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <RotateCcw size={14} />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {!loading && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">{filtered.length}</span>{" "}
                résultat{filtered.length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {[
                    "N° réclamation",
                    "Objet",
                    "Auteur",
                    "Type",
                    "Date",
                    "Statut",
                    "Action",
                  ].map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div
                            className="h-3.5 rounded bg-slate-100"
                            style={{ width: `${60 + Math.random() * 40}%` }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          <Inbox size={20} />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          Aucune réclamation trouvée
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Modifiez vos filtres pour voir des résultats.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((r) => {
                    const isSubmitted = (r.statut || "").toUpperCase() === "SUBMITTED";

                    return (
                      <tr
                        key={r.id}
                        className="group transition hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-slate-600">
                            {r.numeroReclamation || r.id}
                          </span>
                        </td>

                        <td className="max-w-[260px] px-4 py-3">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {r.objet || "Sans objet"}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-700">
                            {r.auteurNom || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <AuteurBadge type={r.typeAuteur} />
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500">
                            {formatDate(r.dateCreation)}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={r.statut} />
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/admin/reclamations/${r.id}`)}
                            className={cx(
                              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                              isSubmitted
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "border border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:text-green-700"
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
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminReclamationsList;