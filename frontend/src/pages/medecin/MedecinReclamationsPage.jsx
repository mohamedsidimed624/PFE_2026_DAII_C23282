import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyReclamations } from "../../services/medecinReclamationApi";
import StatusBadge from "../../components/shared/StatusBadge";

import {
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  Inbox,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Tag,
  X,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

const STATUTS = [
  { key: "ALL", label: "Toutes" },
  { key: "SUBMITTED", label: "Soumises" },
  { key: "IN_PROGRESS", label: "En cours" },
  { key: "CLOSED", label: "Clôturées" },
];

const CATEGORY_LABELS = {
  RETARD_TRAITEMENT: "Retard de traitement",
  ERREUR_DOSSIER: "Erreur sur dossier",
  DEMANDE_INFORMATION: "Demande d'information",
  QUALITE_SOINS: "Qualité des soins",
  INFORMATION_CONSENTEMENT: "Information et consentement",
  SECRET_PROFESSIONNEL: "Secret professionnel",
  COMPORTEMENT_INAPPROPRIE: "Comportement inapproprié",
  CERTIFICAT_MEDICAL: "Certificat médical",
  PRESCRIPTION_ABUSIVE: "Prescription abusive",
  CONFRATERNITE: "Confraternité",
  PUBLICITE_CHARLATANISME: "Publicité / charlatanisme",
  DECONSIDERATION_PROFESSION: "Déconsidération de la profession",
  AUTRE: "Autre",
};

const STATUS_ALIASES = {
  SUBMITTED: ["SUBMITTED", "SOUMISE", "SOUMIS", "PENDING", "EN_ATTENTE"],
  IN_PROGRESS: ["IN_PROGRESS", "EN_COURS", "PROCESSING", "TRAITEMENT"],
  CLOSED: [
    "CLOSED",
    "CLOTUREE",
    "CLOTURÉE",
    "CLOTURE",
    "RESOLVED",
    "TERMINEE",
  ],
};

function normalizeStatus(status) {
  const value = String(status || "").toUpperCase();

  for (const [key, aliases] of Object.entries(STATUS_ALIASES)) {
    if (aliases.includes(value)) return key;
  }

  return value || "UNKNOWN";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getReclamationsArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.content)) return response.content;

  return [];
}

const listVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      staggerChildren: 0.035,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18 },
  },
};

function ReclamationItem({ reclamation, onClick }) {
  const status = normalizeStatus(reclamation.statut);

  const hasResponse =
    Boolean(reclamation.reponse) ||
    Boolean(reclamation.reponseAdmin) ||
    Boolean(reclamation.response) ||
    Boolean(reclamation.dateTraitement);

  const categoryLabel =
    CATEGORY_LABELS[reclamation.categorie] || reclamation.categorie || "—";

  return (
    <motion.div
      variants={itemVariants}
      className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
    >
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
      >
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700 ring-1 ring-green-100 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-800">
          <Clock3 size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">
              {reclamation.numeroReclamation || `#${reclamation.id}`}
            </span>

            <StatusBadge preset={status} />

            {status === "CLOSED" && hasResponse && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 size={11} />
                Réponse disponible
              </span>
            )}
          </div>

          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {reclamation.objet || "Sans objet"}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(reclamation.dateCreation || reclamation.createdAt)}
            </span>

            {reclamation.categorie && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <Tag size={11} />
                <span className="truncate">{categoryLabel}</span>
              </span>
            )}
          </div>
        </div>

        <span className="mt-1 hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition group-hover:border-green-200 group-hover:bg-green-50 group-hover:text-green-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:border-green-800 dark:group-hover:bg-green-900/20 dark:group-hover:text-green-400 sm:inline-flex">
          Détail
          <ChevronRight size={12} />
        </span>
      </button>
    </motion.div>
  );
}

function LoadingList() {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-start gap-4 px-5 py-4">
          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800" />

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />

            <div className="flex gap-3">
              <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
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
    const result = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
      return result;
    }

    result.push(1);

    if (page > 3) result.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) result.push(i);

    if (page < totalPages - 2) result.push("...");

    result.push(totalPages);

    return result;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <span>Affichage</span>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <span>
          {from}–{to} sur {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((item, index) =>
          item === "..." ? (
            <span
              key={`dots-${index}`}
              className="px-1 text-xs text-slate-400"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                page === item
                  ? "bg-green-600 text-white"
                  : "border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function MedecinReclamationsPage() {
  const navigate = useNavigate();

  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const loadReclamations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyReclamations();
        const data = getReclamationsArray(response);

        setReclamations(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos réclamations.");
        setReclamations([]);
      } finally {
        setLoading(false);
      }
    };

    loadReclamations();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  const sortedReclamations = useMemo(() => {
    return [...reclamations].sort((a, b) => {
      const da = new Date(a.dateCreation || a.createdAt || 0).getTime();
      const db = new Date(b.dateCreation || b.createdAt || 0).getTime();

      return db - da;
    });
  }, [reclamations]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return sortedReclamations.filter((r) => {
      const status = normalizeStatus(r.statut);
      const categoryLabel = CATEGORY_LABELS[r.categorie] || r.categorie || "";

      const matchTab = activeTab === "ALL" || status === activeTab;

      const matchSearch =
        !term ||
        String(r.numeroReclamation || "").toLowerCase().includes(term) ||
        String(r.objet || "").toLowerCase().includes(term) ||
        String(r.categorie || "").toLowerCase().includes(term) ||
        String(categoryLabel).toLowerCase().includes(term);

      return matchTab && matchSearch;
    });
  }, [sortedReclamations, search, activeTab]);

  const statusCounts = useMemo(() => {
    return {
      ALL: sortedReclamations.length,
      SUBMITTED: sortedReclamations.filter(
        (r) => normalizeStatus(r.statut) === "SUBMITTED"
      ).length,
      IN_PROGRESS: sortedReclamations.filter(
        (r) => normalizeStatus(r.statut) === "IN_PROGRESS"
      ).length,
      CLOSED: sortedReclamations.filter(
        (r) => normalizeStatus(r.statut) === "CLOSED"
      ).length,
    };
  }, [sortedReclamations]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleResetFilters = () => {
    setSearch("");
    setActiveTab("ALL");
    setPage(1);
  };

  return (
    <MedecinLayout title="Mes réclamations">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Mes réclamations
            </h1>

            {/* <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Consultez l’état de vos réclamations, suivez leur traitement et
              accédez aux réponses de l’Ordre.
            </p> */}
          </div>

          <button
            type="button"
            onClick={() => navigate("/medecin/reclamations/nouvelle")}
            className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-green-700 px-4 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            <Plus size={15} />
            Nouvelle réclamation
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-[420px]">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par numéro, objet ou catégorie…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-green-600"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  title="Effacer la recherche"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex overflow-x-auto">
              <div className="flex min-w-max gap-2">
                {STATUTS.map((tab) => {
                  const active = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${
                        active
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-slate-200 bg-white text-slate-500 hover:border-green-300 hover:text-green-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-green-700 dark:hover:text-green-400"
                      }`}
                    >
                      {tab.label}

                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {statusCounts[tab.key]}
                      </span>
                    </button>
                  );
                })}

                {(search || activeTab !== "ALL") && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-400 transition hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Count */}
          {!loading && (
            <div className="border-b border-slate-100 px-5 py-3 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {filtered.length}
              </span>{" "}
              réclamation{filtered.length !== 1 ? "s" : ""}
              {search && (
                <>
                  {" "}
                  · recherche :{" "}
                  <span className="font-medium text-slate-500 dark:text-slate-300">
                    “{search}”
                  </span>
                </>
              )}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <LoadingList />
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Inbox size={22} />
              </div>

              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Aucune réclamation trouvée
              </h3>

              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {search
                  ? "Aucun résultat ne correspond à votre recherche."
                  : activeTab !== "ALL"
                  ? "Aucune réclamation ne correspond à ce statut."
                  : "Vous n'avez pas encore soumis de réclamation."}
              </p>

              {(search || activeTab !== "ALL") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${search}-${page}-${pageSize}-${filtered.length}`}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {paginated.map((r) => (
                  <ReclamationItem
                    key={r.id}
                    reclamation={r}
                    onClick={() => navigate(`/medecin/reclamations/${r.id}`)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && filtered.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={(nextPage) => {
                if (nextPage < 1 || nextPage > totalPages) return;
                setPage(nextPage);
              }}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
    </MedecinLayout>
  );
}

export default MedecinReclamationsPage;