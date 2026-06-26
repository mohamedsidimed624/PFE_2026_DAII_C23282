import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  BarChart3,
  CheckCircle2,
  Users,
  Plus,
  Search,
  Eye,
  Pencil,
  Send,
  X,
  Archive,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Calendar,
  Clock,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import {
  getAllSondages,
  publishSondage,
  closeSondage,
  archiveSondage,
  deleteSondage,
} from "../../services/adminSondageApi";

const PAGE_SIZE = 10;

const TYPE_LABELS = {
  CONSULTATION_INSTITUTIONNELLE: "Consultation",
  PULSE: "Pulse",
  QUESTIONNAIRE_SCIENTIFIQUE: "Scientifique",
  SATISFACTION: "Satisfaction",
  ETUDE_EFFECTIFS: "Étude effectifs",
};

const TYPE_STYLES = {
  CONSULTATION_INSTITUTIONNELLE:
    "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  PULSE:
    "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  QUESTIONNAIRE_SCIENTIFIQUE:
    "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  SATISFACTION:
    "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  ETUDE_EFFECTIFS:
    "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  PLANIFIE: "Planifié",
  ACTIF: "Actif",
  CLOS: "Clôturé",
  ARCHIVE: "Archivé",
};

const STATUT_STYLES = {
  BROUILLON: "text-slate-500 dark:text-slate-400",
  PLANIFIE: "text-blue-500 dark:text-blue-400",
  ACTIF: "text-green-600 dark:text-green-400",
  CLOS: "text-amber-500 dark:text-amber-400",
  ARCHIVE: "text-slate-400 dark:text-slate-500",
};

const STATUT_DOTS = {
  BROUILLON: "bg-slate-400",
  PLANIFIE: "bg-blue-500",
  ACTIF: "bg-green-500",
  CLOS: "bg-amber-500",
  ARCHIVE: "bg-slate-300",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const toIso = (value) => {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
};

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-semibold ${
        TYPE_STYLES[type] || "bg-slate-100 text-slate-500 dark:bg-slate-800"
      }`}
    >
      {TYPE_LABELS[type] || type || "—"}
    </span>
  );
}

function StatutBadge({ statut }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[14px] font-bold ${
        STATUT_STYLES[statut] || "text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          STATUT_DOTS[statut] || "bg-slate-300"
        }`}
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

function DropItem({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium transition hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
        danger
          ? "text-red-500 hover:text-red-600"
          : "text-slate-600 dark:text-slate-300"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger = false, primary = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
        primary
          ? "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
          : danger
          ? "text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}

function ActionMenu({ row, onRefresh, onOpenPublish }) {
  const navigate = useNavigate();

  const run = async (fn) => {
    try {
      await fn();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Voir détails / résultats */}
      {["PLANIFIE", "ACTIF", "CLOS", "ARCHIVE"].includes(row.statut) && (
        <ActionButton
          icon={Eye}
          label="Voir détails"
          primary
          onClick={() => navigate(`/admin/sondages/${row.id}`)}
        />
      )}

      {/* Modifier */}
      {row.statut === "BROUILLON" && (
        <ActionButton
          icon={Pencil}
          label="Modifier"
          onClick={() => navigate(`/admin/sondages/${row.id}/modifier`)}
        />
      )}

      {/* Publier / Planifier */}
      {row.statut === "BROUILLON" && (
        <ActionButton
          icon={Send}
          label="Publier / Planifier"
          primary
          onClick={() => onOpenPublish(row)}
        />
      )}

      {/* Activer maintenant */}
      {row.statut === "PLANIFIE" && (
        <ActionButton
          icon={Send}
          label="Activer maintenant"
          onClick={() => run(() => publishSondage(row.id, {}))}
        />
      )}

      {/* Clôturer */}
      {row.statut === "ACTIF" && (
        <ActionButton
          icon={X}
          label="Clôturer"
          onClick={() => run(() => closeSondage(row.id))}
        />
      )}

      {/* Archiver */}
      {row.statut === "CLOS" && (
        <ActionButton
          icon={Archive}
          label="Archiver"
          onClick={() => run(() => archiveSondage(row.id))}
        />
      )}

      {/* Supprimer */}
      {row.statut === "BROUILLON" && (
        <ActionButton
          icon={Trash2}
          label="Supprimer"
          danger
          onClick={() => run(() => deleteSondage(row.id))}
        />
      )}
    </div>
  );
}

function PublishModal({ sondage, onClose, onDone }) {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFuture = dateDebut && new Date(dateDebut) > new Date();
  const buttonLabel = isFuture ? "Planifier" : "Publier maintenant";

  const handleSubmit = async () => {
    setError("");

    if (!dateFin) {
      setError("La date de clôture est obligatoire.");
      return;
    }

    if (dateDebut && dateFin && new Date(dateFin) <= new Date(dateDebut)) {
      setError("La date de clôture doit être postérieure à la date d'ouverture.");
      return;
    }

    setLoading(true);

    try {
      await publishSondage(sondage.id, {
        dateDebut: toIso(dateDebut) || null,
        dateFin: toIso(dateFin),
      });

      onDone();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Impossible de publier le sondage."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
                <Send size={16} className="text-green-600 dark:text-green-400" />
              </div>

              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
                  Publication du sondage
                </p>
                <p className="max-w-[240px] truncate text-[11px] text-slate-400 dark:text-slate-500">
                  {sondage.titre}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-5 px-6 py-5">
            <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              Définissez la période de participation. Sans date d'ouverture, le
              sondage sera publié immédiatement.
            </p>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Date d'ouverture{" "}
                <span className="font-normal normal-case text-slate-300">
                  (optionnelle)
                </span>
              </label>

              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  type="datetime-local"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              {isFuture && (
                <p className="mt-1 text-[11px] text-blue-500">
                  Le sondage sera planifié et activé automatiquement à cette date.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Date de clôture <span className="text-red-400">*</span>
              </label>

              <div className="relative">
                <Clock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  type="datetime-local"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-[13px] font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {buttonLabel}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function AdminSondagesPage() {
  const navigate = useNavigate();

  const [sondages, setSondages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [publishTarget, setPublishTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page: page - 1,
        size: PAGE_SIZE,
      };

      if (filterType) params.type = filterType;
      if (filterStatut) params.statut = filterStatut;

      const res = await getAllSondages(params);

      setSondages(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || 0);
    } catch (err) {
      console.error(err);
      setSondages([]);
      setTotalPages(1);
      setTotalElements(0);
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

  const pageData = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return sondages;

    return sondages.filter((item) =>
      `${item.titre || ""} ${item.description || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [sondages, search]);

  const stats = useMemo(() => {
    return {
      actifs: sondages.filter((s) => s.statut === "ACTIF").length,
      preparation: sondages.filter((s) =>
        ["BROUILLON", "PLANIFIE"].includes(s.statut)
      ).length,
      termines: sondages.filter((s) =>
        ["CLOS", "ARCHIVE"].includes(s.statut)
      ).length,
      reponses: sondages.reduce((sum, s) => sum + (s.nbCompletes || 0), 0),
    };
  }, [sondages]);

  const hasFilters = Boolean(search || filterType || filterStatut);

  return (
    <AdminLayout title="Sondages & Consultations">
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-semibold text-slate-700 dark:text-slate-100">
              Sondages & Consultations
            </h1>
            <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
              {totalElements} sondage{totalElements !== 1 ? "s" : ""} au total
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/sondages/nouveau")}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-green-500 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600"
          >
            <Plus size={15} />
            Nouveau sondage
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <DashboardStatCard
            title="Actifs"
            value={stats.actifs}
            icon={BarChart3}
          />

          <DashboardStatCard
            title="En préparation"
            value={stats.preparation}
            icon={ClipboardList}
          />

          <DashboardStatCard
            title="Terminés"
            value={stats.termines}
            icon={CheckCircle2}
          />

          <DashboardStatCard
            title="Réponses"
            value={stats.reponses}
            icon={Users}
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
              <option value="">Tous les types</option>
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
              <option value="">Tous les statuts</option>
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
                className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-400 shadow-sm transition hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Réinitialiser
              </button>
            )}
          </div>

          
        </div>

        <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="w-[28%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Titre
                  </th>
                  <th className="w-[13%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Type
                  </th>
                  <th className="w-[12%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Statut
                  </th>
                  <th className="w-[17%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Période
                  </th>
                  <th className="w-[10%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Questions
                  </th>
                  <th className="w-[12%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Réponses
                  </th>
                  <th className="w-[12%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-7 py-4">
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
                      Aucun sondage trouvé.
                    </td>
                  </tr>
                ) : (
                  pageData.map((s, index) => {
                    const started =
                      s.nbParticipationsDemarrees ?? s.nbParticipants ?? 0;

                    return (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-100 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-7 py-4">
                          <p className="truncate text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                            {s.titre || "Sans titre"}
                          </p>
                          <p className="mt-1 text-[12px] text-slate-400">
                            {s.anonyme ? "Anonyme" : "Nominatif"}
                          </p>
                        </td>

                        <td className="px-7 py-4">
                          <TypeBadge type={s.type} />
                        </td>

                        <td className="px-7 py-4">
                          <StatutBadge statut={s.statut} />
                        </td>

                        <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                          {s.statut === "BROUILLON" ? (
                            <span className="text-slate-300">Non planifié</span>
                          ) : (
                            <>
                              {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
                            </>
                          )}
                        </td>

                        <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                          {s.nbQuestions ?? 0}
                        </td>

                        <td className="px-7 py-4">
                          {s.statut === "BROUILLON" ? (
                            <span className="text-[13px] text-slate-300">—</span>
                          ) : (
                            <div>
                              <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                                {s.nbCompletes ?? 0}
                              </p>
                              <p className="text-[12px] text-slate-400">
                                {started > 0
                                  ? `${started} démarré${started > 1 ? "s" : ""}`
                                  : "participant(s)"}
                              </p>
                            </div>
                          )}
                        </td>

                        <td className="px-7 py-4">
                          <ActionMenu
                            row={s}
                            onRefresh={load}
                            onOpenPublish={setPublishTarget}
                          />
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
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                        page === pageNumber
                          ? "bg-green-500 text-white"
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
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

      {publishTarget && (
        <PublishModal
          sondage={publishTarget}
          onClose={() => setPublishTarget(null)}
          onDone={() => {
            setPublishTarget(null);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}