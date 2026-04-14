import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyReclamations } from "../../services/medecinReclamationApi";
import {
  Search,
  Plus,
  ChevronRight,
  Inbox,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Tag,
  FolderClock,
} from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

/* ── Animation ───────────────────────────────────────── */
const listVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

/* ── Config ──────────────────────────────────────────── */
const STATUTS = [
  { key: "ALL", label: "Toutes" },
  { key: "SUBMITTED", label: "Soumises" },
  { key: "IN_PROGRESS", label: "En cours" },
  { key: "CLOSED", label: "Clôturées" },
];

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Soumise",
    badgeClass: "badge-warning badge-outline",
  },
  IN_PROGRESS: {
    label: "En cours",
    badgeClass: "badge-info badge-outline",
  },
  CLOSED: {
    label: "Clôturée",
    badgeClass: "badge-success badge-outline",
  },
};

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

/* ── Helpers ─────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[(status || "").toUpperCase()] || {
    label: status || "—",
    badgeClass: "badge-neutral badge-outline",
  };

  return (
    <span className={cx("badge badge-sm font-medium", config.badgeClass)}>
      {config.label}
    </span>
  );
}

function StatCard({ title, value, icon, className = "" }) {
  return (
    <div className={cx("card border border-base-200 bg-base-100 shadow-sm", className)}>
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold leading-none">{value}</p>
          </div>

          <div className="rounded-xl border border-base-200 bg-base-100/80 p-2">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReclamationItem({ reclamation, onClick }) {
  const isClosed = (reclamation.statut || "").toUpperCase() === "CLOSED";

  return (
    <motion.div
      variants={itemVariants}
      className="border-b border-base-200 last:border-b-0"
    >
      <div
        onClick={onClick}
        className="group flex cursor-pointer flex-col gap-4 p-4 transition hover:bg-base-200/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-500">
              {reclamation.numeroReclamation || "—"}
            </span>

            <StatusBadge status={reclamation.statut} />

            {isClosed && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle2 size={12} />
                Réponse disponible
              </span>
            )}
          </div>

          <h3 className="truncate text-sm font-semibold text-slate-800">
            {reclamation.objet || "Sans objet"}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(reclamation.dateCreation)}
            </span>

            {reclamation.categorie && (
              <span className="inline-flex items-center gap-1">
                <Tag size={12} />
                {CATEGORY_LABELS[reclamation.categorie] || reclamation.categorie}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="btn btn-sm btn-outline self-start sm:self-center group-hover:border-success group-hover:text-success"
        >
          Voir détail
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function LoadingList() {
  return (
    <div className="divide-y divide-base-200">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3 p-4 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-5 w-16 rounded-full bg-slate-200" />
          </div>
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="flex gap-3">
            <div className="h-3 w-20 rounded bg-slate-100" />
            <div className="h-3 w-28 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch, onClearSearch }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-slate-100 p-3 text-slate-400">
        <Inbox size={24} />
      </div>

      <h3 className="text-base font-semibold text-slate-800">
        Aucune réclamation trouvée
      </h3>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {hasSearch
          ? "Aucun résultat ne correspond à votre recherche actuelle."
          : "Vous n’avez pas encore soumis de réclamation."}
      </p>

      {hasSearch && (
        <button onClick={onClearSearch} className="btn btn-sm btn-outline mt-4">
          Effacer la recherche
        </button>
      )}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="alert alert-error shadow-sm">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */
function MedecinReclamationsPage() {
  const navigate = useNavigate();

  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyReclamations();
        setReclamations(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos réclamations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReclamations();
  }, []);

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

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return reclamations.filter((r) => {
      const matchTab =
        activeTab === "ALL" || (r.statut || "").toUpperCase() === activeTab;

      const matchSearch =
        !term ||
        (r.numeroReclamation || "").toLowerCase().includes(term) ||
        (r.objet || "").toLowerCase().includes(term) ||
        (r.categorie || "").toLowerCase().includes(term);

      return matchTab && matchSearch;
    });
  }, [reclamations, search, activeTab]);

  const tabCount = useMemo(
    () => ({
      ALL: reclamations.length,
      SUBMITTED: stats.submitted,
      IN_PROGRESS: stats.inProgress,
      CLOSED: stats.closed,
    }),
    [reclamations, stats]
  );

  return (
    <MedecinLayout
      title="Mes réclamations"
      subtitle="Suivez vos demandes et consultez les réponses."
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mes réclamations</h1>
            <p className="mt-1 text-sm text-slate-500">
              Consultez vos demandes et les réponses de l’administration.
            </p>
          </div>

          <button
            onClick={() => navigate("/medecin/reclamations/nouvelle")}
            className="btn btn-success"
          >
            <Plus size={16} />
            Nouvelle réclamation
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard
              title="Total"
              value={stats.total}
              icon={<FolderClock size={18} className="text-slate-600" />}
            />
            <StatCard
              title="Soumises"
              value={stats.submitted}
              icon={<FileText size={18} className="text-amber-600" />}
              className="border-amber-200 bg-amber-50/60 text-amber-700"
            />
            <StatCard
              title="En cours"
              value={stats.inProgress}
              icon={<Clock3 size={18} className="text-blue-600" />}
              className="border-blue-200 bg-blue-50/60 text-blue-700"
            />
            <StatCard
              title="Clôturées"
              value={stats.closed}
              icon={<CheckCircle2 size={18} className="text-green-600" />}
              className="border-green-200 bg-green-50/60 text-green-700"
            />
          </div>
        )}

        {/* Toolbar */}
        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body p-0">
            <div className="border-b border-base-200 p-4">
              <label className="input input-bordered flex items-center gap-2">
                <Search size={15} className="text-slate-400" />
                <input
                  type="text"
                  className="grow"
                  placeholder="Rechercher par numéro, objet ou catégorie..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600"
                  >
                    Effacer
                  </button>
                )}
              </label>
            </div>

            <div className="border-b border-base-200 px-2">
              <div role="tablist" className="tabs tabs-bordered">
                {STATUTS.map((tab) => (
                  <button
                    key={tab.key}
                    role="tab"
                    onClick={() => setActiveTab(tab.key)}
                    className={cx(
                      "tab gap-2",
                      activeTab === tab.key && "tab-active text-success"
                    )}
                  >
                    {tab.label}
                    <span
                      className={cx(
                        "badge badge-sm",
                        activeTab === tab.key ? "badge-success" : "badge-ghost"
                      )}
                    >
                      {tabCount[tab.key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {!loading && (
              <div className="px-4 py-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-700">
                  {filtered.length}
                </span>{" "}
                réclamation{filtered.length !== 1 ? "s" : ""}
                {search && ` · "${search}"`}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && <ErrorState message={error} />}

        {/* List */}
        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <LoadingList />
            ) : filtered.length === 0 ? (
              <EmptyState
                hasSearch={!!search}
                onClearSearch={() => setSearch("")}
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${search}-${filtered.length}`}
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="divide-y divide-base-200"
                >
                  {filtered.map((r) => (
                    <ReclamationItem
                      key={r.id}
                      reclamation={r}
                      onClick={() => navigate(`/medecin/reclamations/${r.id}`)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}

export default MedecinReclamationsPage;