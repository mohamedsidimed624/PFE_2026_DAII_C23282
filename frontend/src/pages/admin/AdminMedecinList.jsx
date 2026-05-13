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
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-7 py-6">
      

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by order id"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-[240px] rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 pr-10 text-[13px] text-slate-600 dark:text-slate-200 shadow-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-green-400"
            />
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-500 dark:text-slate-300 shadow-sm outline-none focus:border-green-400"
          >
            <option value="">Status : All</option>
            <option value="ACTIF">Actif</option>
            <option value="SUSPENDU">Suspendu</option>
          </select>
        </div>

        <button className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-400 dark:text-slate-400 shadow-sm hover:text-slate-600 dark:hover:text-slate-200">
          Filter by date range
        </button>
      </div>

      <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="w-[16%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                NOM & PRÉNOM
              </th>
              <th className="w-[14%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                NNI
              </th>
              <th className="w-[12%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                GENRE
              </th>
              <th className="w-[14%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                TÉLÉPHONE
              </th>
              <th className="w-[18%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                DATE DE NAISSANCE
              </th>
              <th className="w-[16%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                ADRESSE POSTAL
              </th>
              <th className="w-[10%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                STATUT
              </th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-7 py-14 text-center text-sm text-slate-400"
                >
                  Aucun médecin trouvé.
                </td>
              </tr>
            ) : (
              paginated.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => navigate(`/admin/medecins/${m.id}`)}
                  className="cursor-pointer border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <td className="px-7 py-4 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                    {m.nom} {m.prenom}
                  </td>

                  <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                    {m.nni || "—"}
                  </td>

                  <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                    {m.sexe || "—"}
                  </td>

                  <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                    {m.telephone || "—"}
                  </td>

                  <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(m.dateNaissance)}
                  </td>

                  <td className="truncate px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                    {m.adresse || "—"}
                  </td>

                  <td className="px-7 py-4 text-[14px] font-bold text-green-600">
                    {m.statut || "Validée"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
                      : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
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

export default AdminMedecinsList;
