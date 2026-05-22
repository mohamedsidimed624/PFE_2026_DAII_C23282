import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, BarChart3, CheckCircle2, Users, Plus, Search,
  Eye, Pencil, Send, X, Archive, Loader2, ChevronLeft, ChevronRight,
  MoreVertical, Trash2, Calendar, Clock,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/shared/StatCard";
import {
  getAllSondages, publishSondage, closeSondage,
  archiveSondage, deleteSondage,
} from "../../services/adminSondageApi";

const PAGE_SIZE = 10;

const TYPE_LABELS = {
  CONSULTATION_INSTITUTIONNELLE: "Consultation",
  PULSE: "Pulse",
  QUESTIONNAIRE_SCIENTIFIQUE: "Scientifique",
  SATISFACTION: "Satisfaction",
  ETUDE_EFFECTIFS: "Étude effectifs",
};

const TYPE_COLORS = {
  CONSULTATION_INSTITUTIONNELLE: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  PULSE: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300",
  QUESTIONNAIRE_SCIENTIFIQUE: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  SATISFACTION: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  ETUDE_EFFECTIFS: "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300",
};

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  PLANIFIE: "Planifié",
  ACTIF: "Actif",
  CLOS: "Clôturé",
  ARCHIVE: "Archivé",
};

const STATUT_STYLES = {
  BROUILLON: "bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400",
  PLANIFIE:  "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  ACTIF:     "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  CLOS:      "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  ARCHIVE:   "bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

// datetime-local input value needs seconds appended for backend LocalDateTime
const toIso = (v) => (v ? (v.length === 16 ? v + ":00" : v) : null);

function TypeBadge({ type }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${TYPE_COLORS[type] ?? "bg-slate-100 text-slate-500"}`}>
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}

function StatutBadge({ statut }) {
  return (
    <span className={`inline-flex min-w-[76px] items-center justify-center rounded px-2 py-0.5 text-[11px] font-semibold ${STATUT_STYLES[statut] ?? "bg-slate-100 text-slate-500"}`}>
      {STATUT_LABELS[statut] ?? statut}
    </span>
  );
}

function DropItem({ icon, label, onClick, danger }) {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
        danger ? "text-red-500 hover:text-red-600" : "text-slate-700 dark:text-slate-200"
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

// ── Action menu ───────────────────────────────────────────────────────────────

function ActionMenu({ row, onRefresh, onOpenPublish }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const run = async (fn) => {
    setOpen(false);
    try { await fn(); onRefresh(); } catch (err) { console.error(err); }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full z-20 mb-1 w-48 overflow-hidden rounded-md border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">

            {/* BROUILLON */}
            {row.statut === "BROUILLON" && (
              <>
                <DropItem icon={Pencil} label="Modifier" onClick={() => { setOpen(false); navigate(`/admin/sondages/${row.id}/modifier`); }} />
                <DropItem icon={Send} label="Publier / Planifier" onClick={() => { setOpen(false); onOpenPublish(row); }} />
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <DropItem icon={Trash2} label="Supprimer" onClick={() => run(() => deleteSondage(row.id))} danger />
              </>
            )}

            {/* PLANIFIE */}
            {row.statut === "PLANIFIE" && (
              <>
                <DropItem icon={Eye} label="Voir détails" onClick={() => { setOpen(false); navigate(`/admin/sondages/${row.id}`); }} />
                <DropItem icon={Send} label="Activer maintenant" onClick={() => run(() => publishSondage(row.id, {}))} />
              </>
            )}

            {/* ACTIF */}
            {row.statut === "ACTIF" && (
              <>
                <DropItem icon={Eye} label="Voir résultats" onClick={() => { setOpen(false); navigate(`/admin/sondages/${row.id}`); }} />
                <DropItem icon={X} label="Clôturer" onClick={() => run(() => closeSondage(row.id))} />
              </>
            )}

            {/* CLOS */}
            {row.statut === "CLOS" && (
              <>
                <DropItem icon={Eye} label="Voir résultats" onClick={() => { setOpen(false); navigate(`/admin/sondages/${row.id}`); }} />
                <DropItem icon={Archive} label="Archiver" onClick={() => run(() => archiveSondage(row.id))} />
              </>
            )}

            {/* ARCHIVE */}
            {row.statut === "ARCHIVE" && (
              <DropItem icon={Eye} label="Voir résultats" onClick={() => { setOpen(false); navigate(`/admin/sondages/${row.id}`); }} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Publication modal ─────────────────────────────────────────────────────────

function PublishModal({ sondage, onClose, onDone }) {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin,   setDateFin]   = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const isFuture = dateDebut && new Date(dateDebut) > new Date();
  const buttonLabel = isFuture ? "Planifier" : "Publier maintenant";

  const handleSubmit = async () => {
    setError("");
    if (!dateFin) { setError("La date de clôture est obligatoire."); return; }
    if (dateDebut && dateFin && new Date(dateFin) <= new Date(dateDebut)) {
      setError("La date de clôture doit être postérieure à la date d'ouverture.");
      return;
    }
    setLoading(true);
    try {
      await publishSondage(sondage.id, {
        dateDebut: toIso(dateDebut) || null,
        dateFin:   toIso(dateFin),
      });
      onDone();
    } catch (err) {
      setError(err?.response?.data?.message || "Impossible de publier le sondage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
                <Send size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Publication du sondage</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[240px]">{sondage.titre}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Définissez la période de participation. Si vous ne renseignez pas de date d'ouverture, le sondage sera publié immédiatement.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Date d'ouverture <span className="text-slate-300 font-normal normal-case">(optionnelle)</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
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
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="datetime-local"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-[13px] font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {buttonLabel}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSondagesPage() {
  const navigate = useNavigate();

  const [sondages,       setSondages]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [filterType,     setFilterType]     = useState("");
  const [filterStatut,   setFilterStatut]   = useState("");
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [totalElements,  setTotalElements]  = useState(0);
  const [publishTarget,  setPublishTarget]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page - 1, size: PAGE_SIZE };
      if (filterType)   params.type   = filterType;
      if (filterStatut) params.statut = filterStatut;
      const res = await getAllSondages(params);
      setSondages(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch {
      setSondages([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterStatut]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filterType, filterStatut]);

  const pageData = sondages.filter(
    (s) => !search || s.titre?.toLowerCase().includes(search.toLowerCase())
  );

  const actifs     = sondages.filter((s) => s.statut === "ACTIF").length;
  const brouillons = sondages.filter((s) => s.statut === "BROUILLON" || s.statut === "PLANIFIE").length;
  const clos       = sondages.filter((s) => s.statut === "CLOS" || s.statut === "ARCHIVE").length;
  const totalPart  = sondages.reduce((acc, s) => acc + (s.nbCompletes ?? 0), 0);
  const hasFilters = search || filterType || filterStatut;

  return (
    <AdminLayout title="Sondages & Consultations">
      <div className="min-h-screen bg-[#FAFBFC] px-6 py-5 dark:bg-slate-950">

        {/* Header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-semibold text-slate-700 dark:text-slate-100">
              Sondages & Consultations
            </h1>
            <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
              {totalElements} sondage{totalElements !== 1 ? "s" : ""} au total
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/sondages/nouveau")}
            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600"
          >
            <Plus size={15} />
            Nouveau sondage
          </button>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard title="Actifs" value={actifs} icon={<BarChart3 size={16} />} colorScheme="green" />
          <StatCard title="En préparation" value={brouillons} icon={<ClipboardList size={16} />} colorScheme="slate" />
          <StatCard title="Clôturés / Archivés" value={clos} icon={<CheckCircle2 size={16} />} colorScheme="blue" />
          <StatCard title="Réponses complètes" value={totalPart} icon={<Users size={16} />} colorScheme="amber" />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans cette page…"
              className="h-10 w-60 rounded-lg border border-slate-100 bg-slate-50 pl-9 pr-3 text-[13px] text-slate-600 outline-none transition focus:border-green-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-900"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-lg border border-slate-100 bg-slate-50 px-3 text-[13px] text-slate-500 outline-none transition focus:border-green-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:bg-slate-900"
          >
            <option value="">Type : Tous</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="h-10 rounded-lg border border-slate-100 bg-slate-50 px-3 text-[13px] text-slate-500 outline-none transition focus:border-green-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:bg-slate-900"
          >
            <option value="">Statut : Tous</option>
            {Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setFilterType(""); setFilterStatut(""); setPage(1); }}
              className="h-10 rounded-lg border border-slate-100 bg-white px-3 text-[13px] font-medium text-slate-400 transition hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:text-slate-200"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="animate-spin text-slate-300 dark:text-slate-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
                    {[
                      { label: "Titre",         cls: "w-[28%]" },
                      { label: "Type",          cls: "w-[14%]" },
                      { label: "Statut",        cls: "w-[11%]" },
                      { label: "Période",       cls: "w-[16%]" },
                      { label: "Questions",     cls: "w-[9%]"  },
                      { label: "Participation", cls: "w-[13%]" },
                      { label: "Actions",       cls: "w-[9%]"  },
                    ].map(({ label, cls }) => (
                      <th key={label} className={`${cls} px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[13px] text-slate-400 dark:text-slate-500">
                        Aucun sondage trouvé
                      </td>
                    </tr>
                  ) : (
                    pageData.map((s, i) => {
                      const started = s.nbParticipationsDemarrees ?? s.nbParticipants ?? 0;
                      return (
                        <motion.tr
                          key={s.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0 dark:border-slate-800 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-6 py-4">
                            <p className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                              {s.titre}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                              {s.anonyme ? "Anonyme" : "Nominatif"}
                            </p>
                          </td>
                          <td className="px-6 py-4"><TypeBadge type={s.type} /></td>
                          <td className="px-6 py-4"><StatutBadge statut={s.statut} /></td>
                          <td className="px-6 py-4 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {s.statut === "BROUILLON"
                              ? <span className="text-slate-300 dark:text-slate-600 italic">Non planifié</span>
                              : <>{formatDate(s.dateDebut)} → {formatDate(s.dateFin)}</>
                            }
                          </td>
                          <td className="px-6 py-4 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                            {s.nbQuestions}
                          </td>
                          <td className="px-6 py-4">
                            {s.statut === "BROUILLON" ? (
                              <span className="text-[11px] text-slate-300 dark:text-slate-600 italic">—</span>
                            ) : (
                              <>
                                <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                                  {s.nbCompletes ?? 0}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                                  {started > 0 ? `/ ${started} démarrés` : "participant(s)"}
                                </p>
                              </>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <ActionMenu row={s} onRefresh={load} onOpenPublish={setPublishTarget} />
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 dark:border-slate-800">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalElements)} sur {totalElements}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publication modal */}
      {publishTarget && (
        <PublishModal
          sondage={publishTarget}
          onClose={() => setPublishTarget(null)}
          onDone={() => { setPublishTarget(null); load(); }}
        />
      )}
    </AdminLayout>
  );
}
