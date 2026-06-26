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
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-7 py-6">
      {/* Titre */}
      {/* <h1 className="mb-8 text-[17px] font-semibold text-slate-700">
        Gestion des demandes
      </h1> */}

      {/* Filtres */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom, NNI..."
              value={search}
              onChange={handleSearch}
              className="h-10 w-[240px] rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 pr-10 text-[13px] text-slate-600 dark:text-slate-200 shadow-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-green-400"
            />
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleStatus(e.target.value)}
            className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-500 dark:text-slate-300 shadow-sm outline-none focus:border-green-400"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "Tous" ? "Tous les statuts" : s}
              </option>
            ))}
          </select>
        </div>

        <button className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-400 dark:text-slate-400 shadow-sm hover:text-slate-600 dark:hover:text-slate-200">
          Filtrer par période
        </button>
      </div>

      {/* Table wrapper */}
      <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="w-[20%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                ID
              </th>
              <th className="w-[25%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                DATE
              </th>
              <th className="w-[25%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                DEMANDEUR
              </th>
              <th className="w-[15%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                STATUS
              </th>
              <th className="w-[15%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                ACTION
              </th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-7 py-14 text-center text-sm text-slate-400"
                >
                  Aucune demande trouvée.
                </td>
              </tr>
            ) : (
              paginated.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <td className="px-7 py-4 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                    #{d.id}
                  </td>

                  <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(d.dateCreation || d.submissionDate)}
                  </td>

                  <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                    {d.nom} {d.prenom}
                  </td>

                  <td className="px-7 py-4">
                    <span
                      className={`inline-flex min-w-[95px] items-center justify-center rounded-md px-3 py-1.5 text-[13px] font-semibold ${
                        d.statut === "APPROUVED"
                          ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : d.statut === "REJECTED"
                          ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          : "bg-yellow-50 dark:bg-amber-900/30 text-yellow-500 dark:text-amber-400"
                      }`}
                    >
                      {d.statut === "APPROUVED"
                        ? "Approved"
                        : d.statut === "REJECTED"
                        ? "Rejected"
                        : "Pending"}
                    </span>
                  </td>

                  <td className="px-7 py-4">
                    <button
                      onClick={() => navigate(`/admin/demandes/${d.id}`)}
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

        {/* Pagination */}
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
              {PAGE_SIZES.map((s) => (
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
      </div>
    </div>
  </AdminLayout>
);
}
export default AdminDemandesList;
