import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  Users,
  Plus,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  PlayCircle,
  StopCircle,
  Archive,
  Ban,
  Search,
  AlertTriangle,
  Trophy,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getAllElections,
  ouvrirCandidatures,
  cloturerCandidatures,
  ouvrirVotes,
  cloturerVotes,
  publierResultats,
  archiverElection,
  annulerElection,
} from "../../services/adminElectionApi";

const PAGE_SIZE = 10;

const TYPE_LABELS = {
  CONSEIL_NATIONAL: "Conseil National",
  BUREAU_EXECUTIF: "Bureau exécutif",
  BUREAU_SECTION_A: "Bureau Section A",
  BUREAU_SECTION_B: "Bureau Section B",
  BUREAU_SECTION_C: "Bureau Section C",
  REPRESENTANTS_REGIONAUX: "Représentants régionaux",
};

const TYPE_STYLES = {
  CONSEIL_NATIONAL:
    "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  BUREAU_EXECUTIF:
    "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  BUREAU_SECTION_A:
    "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  BUREAU_SECTION_B:
    "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
  BUREAU_SECTION_C:
    "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
  REPRESENTANTS_REGIONAUX:
    "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
};

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  CANDIDATURE_OUVERTE: "Candidatures ouvertes",
  VALIDATION_CANDIDATURES: "Validation",
  VOTE_EN_COURS: "Vote en cours",
  DEPOUILLEMENT: "Dépouillement",
  RESULTATS_PUBLIES: "Résultats publiés",
  ARCHIVEE: "Archivée",
  ANNULEE: "Annulée",
};

const STATUT_STYLES = {
  BROUILLON: "text-slate-500 dark:text-slate-400",
  CANDIDATURE_OUVERTE: "text-blue-500 dark:text-blue-400",
  VALIDATION_CANDIDATURES: "text-amber-500 dark:text-amber-400",
  VOTE_EN_COURS: "text-green-600 dark:text-green-400",
  DEPOUILLEMENT: "text-purple-500 dark:text-purple-400",
  RESULTATS_PUBLIES: "text-green-600 dark:text-green-400",
  ARCHIVEE: "text-slate-400 dark:text-slate-500",
  ANNULEE: "text-red-500 dark:text-red-400",
};

const STATUT_DOTS = {
  BROUILLON: "bg-slate-400",
  CANDIDATURE_OUVERTE: "bg-blue-500",
  VALIDATION_CANDIDATURES: "bg-amber-500",
  VOTE_EN_COURS: "bg-green-500",
  DEPOUILLEMENT: "bg-purple-500",
  RESULTATS_PUBLIES: "bg-green-500",
  ARCHIVEE: "bg-slate-300",
  ANNULEE: "bg-red-500",
};

const CORPS_LABELS = {
  TOUS_MEDECINS_ACTIFS: "Tous les médecins actifs",
  MEDECINS_REGION: "Médecins de la région",
  MEDECINS_PAR_SECTION: "Médecins par section",
  MEMBRES_CONSEIL_NATIONAL: "Membres du Conseil National",
  CONSEIL_SECTION_A: "Conseil Section A",
  CONSEIL_SECTION_B: "Conseil Section B",
  CONSEIL_SECTION_C: "Conseil Section C",
};

const NIVEAU_LABELS = {
  NATIONAL: "National",
  REGIONAL: "Régional",
  SECTION: "Section",
};

const ACTION_META = {
  ouvrirCandidatures: {
    title: "Ouvrir les candidatures",
    message:
      "Les médecins concernés pourront déposer leur candidature pour cette élection.",
    confirmLabel: "Ouvrir",
    icon: PlayCircle,
    tone: "green",
  },
  cloturerCandidatures: {
    title: "Clôturer les candidatures",
    message:
      "Aucune nouvelle candidature ne pourra être déposée après cette action.",
    confirmLabel: "Clôturer",
    icon: StopCircle,
    tone: "amber",
  },
  ouvrirVotes: {
    title: "Ouvrir le vote",
    message:
      "Les médecins éligibles pourront voter. Vérifiez que les candidatures sont validées.",
    confirmLabel: "Ouvrir le vote",
    icon: Vote,
    tone: "green",
  },
  cloturerVotes: {
    title: "Clôturer le vote",
    message: "Le vote sera fermé et l’élection passera au dépouillement.",
    confirmLabel: "Clôturer",
    icon: StopCircle,
    tone: "amber",
  },
  publierResultats: {
    title: "Publier les résultats",
    message:
      "Les résultats deviendront visibles officiellement pour les utilisateurs concernés.",
    confirmLabel: "Publier",
    icon: Trophy,
    tone: "green",
  },
  archiver: {
    title: "Archiver l’élection",
    message:
      "L’élection sera conservée dans l’historique et ne pourra plus être modifiée.",
    confirmLabel: "Archiver",
    icon: Archive,
    tone: "slate",
  },
  annuler: {
    title: "Annuler l’élection",
    message:
      "Cette action est sensible. Une raison d’annulation est obligatoire.",
    confirmLabel: "Annuler l’élection",
    icon: Ban,
    tone: "red",
  },
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function extractApiError(err) {
  const data = err?.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.message ||
    data?.error ||
    data?.detail ||
    "Une erreur est survenue pendant l’action."
  );
}

function TypeBadge({ type }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-semibold",
        TYPE_STYLES[type] || "bg-slate-100 text-slate-500 dark:bg-slate-800"
      )}
    >
      {TYPE_LABELS[type] || type || "—"}
    </span>
  );
}

function StatutBadge({ statut }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 text-[14px] font-bold",
        STATUT_STYLES[statut] || "text-slate-500"
      )}
    >
      <span
        className={cx(
          "h-1.5 w-1.5 rounded-full",
          STATUT_DOTS[statut] || "bg-slate-300"
        )}
      />
      {STATUT_LABELS[statut] || statut || "—"}
    </span>
  );
}

function DashboardStatCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-md bg-white px-5 py-4 shadow-sm dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={15} className="text-slate-400 dark:text-slate-500" />
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>
      </div>

      <p className="text-[26px] font-semibold text-slate-700 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
  primary = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cx(
        "flex h-8 w-8 items-center justify-center rounded-md transition",
        primary
          ? "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
          : danger
          ? "text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      )}
    >
      <Icon size={15} />
    </button>
  );
}

function SmallBadge({ children }) {
  return (
    <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {children}
    </span>
  );
}

function getMainAction(status) {
  switch (status) {
    case "BROUILLON":
      return "ouvrirCandidatures";
    case "CANDIDATURE_OUVERTE":
      return "cloturerCandidatures";
    case "VALIDATION_CANDIDATURES":
      return "ouvrirVotes";
    case "VOTE_EN_COURS":
      return "cloturerVotes";
    case "DEPOUILLEMENT":
      return "publierResultats";
    case "RESULTATS_PUBLIES":
      return "archiver";
    default:
      return null;
  }
}

function ElectionActions({ election, onAction }) {
  const navigate = useNavigate();

  const mainAction = getMainAction(election.statut);
  const mainActionMeta = mainAction ? ACTION_META[mainAction] : null;
  const MainIcon = mainActionMeta?.icon;

  const canEdit = election.statut === "BROUILLON";
  const canCancel = !["ARCHIVEE", "ANNULEE", "RESULTATS_PUBLIES"].includes(
    election.statut
  );

  return (
    <div className="flex items-center gap-1">
      <ActionButton
        icon={Eye}
        label="Voir détails"
        primary
        onClick={() => navigate(`/admin/processus/elections/${election.id}`)}
      />

      {canEdit && (
        <ActionButton
          icon={Pencil}
          label="Modifier"
          onClick={() =>
            navigate(`/admin/processus/elections/${election.id}/modifier`)
          }
        />
      )}

      {mainAction && MainIcon && (
        <ActionButton
          icon={MainIcon}
          label={mainActionMeta.title}
          primary={mainActionMeta.tone === "green"}
          onClick={() => onAction(mainAction, election)}
        />
      )}

      {canCancel && (
        <ActionButton
          icon={Ban}
          label="Annuler"
          danger
          onClick={() => onAction("annuler", election)}
        />
      )}
    </div>
  );
}

function ConfirmModal({
  modal,
  actionLoading,
  actionError,
  onClose,
  onConfirm,
  onReasonChange,
}) {
  if (!modal.open) return null;

  const meta = ACTION_META[modal.action];
  const Icon = meta?.icon || AlertTriangle;
  const isDanger = meta?.tone === "red";

  return (
    <AnimatePresence>
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={cx(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    isDanger
                      ? "bg-red-50 text-red-500 dark:bg-red-900/20"
                      : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                  )}
                >
                  <Icon size={16} />
                </div>

                <div>
                  <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
                    {meta?.title || "Confirmer l’action"}
                  </p>
                  <p className="max-w-[240px] truncate text-[11px] text-slate-400 dark:text-slate-500">
                    {modal.election?.titre || "Élection"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={actionLoading}
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                {meta?.message}
              </p>

              {modal.action === "annuler" && (
                <div>
                  <label htmlFor="annuler-raison" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Raison d’annulation <span className="text-red-400">*</span>
                  </label>

                  <textarea
                    id="annuler-raison"
                    rows={4}
                    autoFocus
                    value={modal.raison}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="Expliquez pourquoi cette élection est annulée..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none transition focus:border-red-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              )}

              {actionError && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
                  {actionError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={actionLoading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={
                  actionLoading ||
                  (modal.action === "annuler" && !modal.raison.trim())
                }
                className={cx(
                  "inline-flex items-center gap-2 rounded-lg px-5 py-2 text-[13px] font-semibold text-white disabled:opacity-50",
                  isDanger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-500 hover:bg-green-600"
                )}
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Icon size={14} />
                )}
                {meta?.confirmLabel || "Confirmer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function AdminElectionsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    action: null,
    election: null,
    raison: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const params = {
        page: page - 1,
        size: PAGE_SIZE,
      };

      if (filterType) params.type = filterType;
      if (filterStatut) params.statut = filterStatut;

      const res = await getAllElections(params);
      setData(res.data);
    } catch (err) {
      setData(null);
      setLoadError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterStatut]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [filterType, filterStatut]);

  const elections = data?.content ?? [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const pageData = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return elections;

    return elections.filter((item) =>
      `${item.titre || ""} ${item.region || ""} ${
        TYPE_LABELS[item.type] || ""
      } ${STATUT_LABELS[item.statut] || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [elections, search]);

  const stats = useMemo(() => {
    return {
      actives: elections.filter((e) =>
        [
          "CANDIDATURE_OUVERTE",
          "VALIDATION_CANDIDATURES",
          "VOTE_EN_COURS",
          "DEPOUILLEMENT",
        ].includes(e.statut)
      ).length,
      candidatures: elections.filter((e) => e.statut === "CANDIDATURE_OUVERTE")
        .length,
      votes: elections.filter((e) => e.statut === "VOTE_EN_COURS").length,
      resultats: elections.filter((e) => e.statut === "RESULTATS_PUBLIES")
        .length,
    };
  }, [elections]);

  const hasFilters = Boolean(search || filterType || filterStatut);

  const openModal = (action, election) => {
    setActionError("");
    setModal({
      open: true,
      action,
      election,
      raison: "",
    });
  };

  const closeModal = () => {
    if (actionLoading) return;

    setActionError("");
    setModal({
      open: false,
      action: null,
      election: null,
      raison: "",
    });
  };

  const confirmAction = async () => {
    if (!modal.action || !modal.election?.id) return;

    setActionLoading(true);
    setActionError("");

    try {
      const id = modal.election.id;

      if (modal.action === "ouvrirCandidatures") await ouvrirCandidatures(id);
      if (modal.action === "cloturerCandidatures") await cloturerCandidatures(id);
      if (modal.action === "ouvrirVotes") await ouvrirVotes(id);
      if (modal.action === "cloturerVotes") await cloturerVotes(id);
      if (modal.action === "publierResultats") await publierResultats(id);
      if (modal.action === "archiver") await archiverElection(id);
      if (modal.action === "annuler")
        await annulerElection(id, modal.raison.trim());

      closeModal();
      await load();
    } catch (err) {
      setActionError(extractApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Processus électoral">
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-semibold text-slate-700 dark:text-slate-100">
              Processus électoral
            </h1>
            <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
              {totalElements} élection{totalElements !== 1 ? "s" : ""} au total
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/processus/elections/nouveau")}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-green-500 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600"
          >
            <Plus size={15} />
            Nouvelle élection
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <DashboardStatCard
            title="Actives"
            value={stats.actives}
            icon={Vote}
          />

          <DashboardStatCard
            title="Candidatures"
            value={stats.candidatures}
            icon={Users}
          />

          <DashboardStatCard
            title="Votes en cours"
            value={stats.votes}
            icon={ShieldCheck}
          />

          <DashboardStatCard
            title="Résultats"
            value={stats.resultats}
            icon={Trophy}
          />
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-[260px] rounded-md border border-slate-100 bg-white px-4 pr-10 text-[13px] text-slate-600 shadow-sm outline-none placeholder:text-slate-300 focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600"
              />

              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-500 shadow-sm outline-none focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">Type : All</option>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-500 shadow-sm outline-none focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">Status : All</option>
              {Object.entries(STATUT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterType("");
                  setFilterStatut("");
                  setPage(1);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-400 shadow-sm transition hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <RotateCcw size={13} />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {loadError && (
          <div className="mb-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
            {loadError}
          </div>
        )}

        <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="w-[27%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Élection
                  </th>
                  <th className="w-[13%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Type
                  </th>
                  <th className="w-[13%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Statut
                  </th>
                  <th className="w-[11%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Sièges
                  </th>
                  <th className="w-[13%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Participation
                  </th>
                  <th className="w-[15%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Calendrier
                  </th>
                  <th className="w-[12%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      {Array.from({ length: 7 }).map((__, colIndex) => (
                        <td key={colIndex} className="px-7 py-4">
                          <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pageData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-7 py-14 text-center text-sm text-slate-400"
                    >
                      Aucune élection trouvée.
                    </td>
                  </tr>
                ) : (
                  pageData.map((e, index) => {
                    const candidats = e.nbCandidatsValides ?? 0;
                    const votants = e.nbVotants ?? 0;
                    const eligibles = e.nbElecteursEligibles ?? 0;
                    const taux = Number(e.tauxParticipation ?? 0);

                    return (
                      <motion.tr
                        key={e.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-100 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-7 py-4">
                          <p className="truncate text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                            {e.titre || "Élection sans titre"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {e.niveau && (
                              <SmallBadge>
                                {NIVEAU_LABELS[e.niveau] || e.niveau}
                              </SmallBadge>
                            )}

                            {e.corpsElectoral && (
                              <SmallBadge>
                                {CORPS_LABELS[e.corpsElectoral] ||
                                  e.corpsElectoral}
                                {e.corpsElectoral === "MEDECINS_REGION" &&
                                e.region
                                  ? ` · ${e.region}`
                                  : ""}
                              </SmallBadge>
                            )}
                          </div>
                        </td>

                        <td className="px-7 py-4">
                          <TypeBadge type={e.type} />
                        </td>

                        <td className="px-7 py-4">
                          <StatutBadge statut={e.statut} />
                        </td>

                        <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                          <p>
                            {e.seatsCount ?? 0} siège
                            {(e.seatsCount ?? 0) > 1 ? "s" : ""}
                          </p>
                          <p className="mt-1 text-[12px] text-slate-400">
                            {candidats} candidat{candidats > 1 ? "s" : ""}
                          </p>
                        </td>

                        <td className="px-7 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                              <div
                                className="h-full rounded-full bg-green-500 transition-all"
                                style={{ width: `${Math.min(taux, 100)}%` }}
                              />
                            </div>

                            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                              {taux.toFixed(1)}%
                            </span>
                          </div>

                          <p className="mt-1 text-[12px] text-slate-400">
                            {votants} votant{votants > 1 ? "s" : ""}
                            {eligibles > 0 ? ` / ${eligibles}` : ""}
                          </p>
                        </td>

                        <td className="px-7 py-4 text-[13px] text-slate-600 dark:text-slate-300">
                          <p>
                            <span className="text-slate-400">Cand. </span>
                            {formatDate(e.candidatureStartDate)} →{" "}
                            {formatDate(e.candidatureEndDate)}
                          </p>

                          <p className="mt-1">
                            <span className="text-slate-400">Vote </span>
                            {formatDate(e.voteStartDate)} →{" "}
                            {formatDate(e.voteEndDate)}
                          </p>
                        </td>

                        <td className="px-7 py-4">
                          <ElectionActions election={e} onAction={openModal} />
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && (
            <div className="flex items-center justify-between px-7 py-5">
              <div className="flex items-center gap-2 text-[13px] text-slate-400">
                <span>Showing</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {pageData.length}
                </span>
                <span>of {totalElements}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Page précédente"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      aria-label={`Page ${pageNumber}`}
                      aria-current={page === pageNumber ? "page" : undefined}
                      className={cx(
                        "flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold",
                        page === pageNumber
                          ? "bg-green-600 text-white"
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      )}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Page suivante"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <ConfirmModal
          modal={modal}
          actionLoading={actionLoading}
          actionError={actionError}
          onClose={closeModal}
          onConfirm={confirmAction}
          onReasonChange={(raison) =>
            setModal((prev) => ({
              ...prev,
              raison,
            }))
          }
        />
      </div>
    </AdminLayout>
  );
}