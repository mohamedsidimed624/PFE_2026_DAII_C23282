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

const STATUTS = [
  { key: "ALL",         label: "Toutes"    },
  { key: "SUBMITTED",   label: "Soumises"  },
  { key: "IN_PROGRESS", label: "En cours"  },
  { key: "CLOSED",      label: "Clôturées" },
];

const STATUS_CONFIG = {
  SUBMITTED:   { label: "Soumise",   cls: "border-amber-200 bg-amber-50 text-amber-700"  },
  IN_PROGRESS: { label: "En cours",  cls: "border-blue-200 bg-blue-50 text-blue-700"     },
  CLOSED:      { label: "Clôturée",  cls: "border-green-200 bg-green-50 text-green-700"  },
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

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }) {
  const key = (status || "").toUpperCase();
  const cfg = STATUS_CONFIG[key] || { label: status || "—", cls: "border-slate-200 bg-slate-50 text-slate-600" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function StatCard({ title, value, icon, border = "", bg = "" }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${border || "border-slate-200"} ${bg || "bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 leading-none">{value}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-2">{icon}</div>
      </div>
    </div>
  );
}

const listVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, staggerChildren: 0.04 } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

function ReclamationItem({ reclamation, onClick }) {
  return (
    <motion.div variants={itemVariants} className="border-b border-slate-100 last:border-b-0">
      <div
        onClick={onClick}
        className="group flex cursor-pointer flex-col gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-400">
              {reclamation.numeroReclamation || "—"}
            </span>
            <StatusBadge status={reclamation.statut} />
            {(reclamation.statut || "").toUpperCase() === "CLOSED" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle2 size={11} /> Réponse disponible
              </span>
            )}
          </div>

          <p className="truncate text-sm font-semibold text-slate-800">
            {reclamation.objet || "Sans objet"}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />{formatDate(reclamation.dateCreation)}
            </span>
            {reclamation.categorie && (
              <span className="inline-flex items-center gap-1">
                <Tag size={11} />{CATEGORY_LABELS[reclamation.categorie] || reclamation.categorie}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 sm:self-center"
        >
          Détail <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

function LoadingList() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2.5 p-4 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-5 w-14 rounded-full bg-slate-200" />
          </div>
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="flex gap-3">
            <div className="h-3 w-16 rounded bg-slate-100" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MedecinReclamationsPage() {
  const navigate = useNavigate();

  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState("ALL");

  useEffect(() => {
    getMyReclamations()
      .then(setReclamations)
      .catch(() => setError("Impossible de charger vos réclamations."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total:      reclamations.length,
    submitted:  reclamations.filter((r) => (r.statut || "").toUpperCase() === "SUBMITTED").length,
    inProgress: reclamations.filter((r) => (r.statut || "").toUpperCase() === "IN_PROGRESS").length,
    closed:     reclamations.filter((r) => (r.statut || "").toUpperCase() === "CLOSED").length,
  }), [reclamations]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return reclamations.filter((r) => {
      const matchTab = activeTab === "ALL" || (r.statut || "").toUpperCase() === activeTab;
      const matchSearch = !term
        || (r.numeroReclamation || "").toLowerCase().includes(term)
        || (r.objet || "").toLowerCase().includes(term)
        || (r.categorie || "").toLowerCase().includes(term);
      return matchTab && matchSearch;
    });
  }, [reclamations, search, activeTab]);

  const tabCount = {
    ALL: reclamations.length,
    SUBMITTED: stats.submitted,
    IN_PROGRESS: stats.inProgress,
    CLOSED: stats.closed,
  };

  return (
    <MedecinLayout title="Mes réclamations" subtitle="Consultez vos demandes et les réponses de l'administration.">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mes réclamations</h1>
            <p className="text-sm text-slate-500 mt-0.5">Consultez et suivez l'état de vos demandes.</p>
          </div>
          <button
            onClick={() => navigate("/medecin/reclamations/nouvelle")}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 self-start"
          >
            <Plus size={15} /> Nouvelle réclamation
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard title="Total"     value={stats.total}      icon={<FolderClock size={17} className="text-slate-500" />} />
            <StatCard title="Soumises"  value={stats.submitted}  icon={<FileText size={17} className="text-amber-500" />}   border="border-amber-200" bg="bg-amber-50/60" />
            <StatCard title="En cours"  value={stats.inProgress} icon={<Clock3 size={17} className="text-blue-500" />}      border="border-blue-200"  bg="bg-blue-50/60"  />
            <StatCard title="Clôturées" value={stats.closed}     icon={<CheckCircle2 size={17} className="text-green-500" />} border="border-green-200" bg="bg-green-50/60" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* List card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Search */}
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par numéro, objet ou catégorie…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-4">
            {STATUTS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold transition ${
                  activeTab === tab.key
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === tab.key ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tabCount[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Count line */}
          {!loading && (
            <div className="px-4 py-2.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-700">{filtered.length}</span>{" "}
              réclamation{filtered.length !== 1 ? "s" : ""}
              {search && ` · "${search}"`}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <LoadingList />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-400">
                <Inbox size={22} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Aucune réclamation trouvée</h3>
              <p className="mt-1.5 text-xs text-slate-500">
                {search
                  ? "Aucun résultat pour votre recherche."
                  : "Vous n'avez pas encore soumis de réclamation."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${search}-${filtered.length}`}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
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
    </MedecinLayout>
  );
}

export default MedecinReclamationsPage;
