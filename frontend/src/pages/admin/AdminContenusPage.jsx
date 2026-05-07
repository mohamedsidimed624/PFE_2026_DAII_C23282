import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../components/admin/AdminLayout";
import ContenuWizardModal from "../../components/admin/contenus/ContenuWizardModal";
import {
  getAdminContenus, createContenu, updateContenu,
  publishContenu, unpublishContenu, deleteContenu,
} from "../../services/adminContenuApi";
import {
  Search, RotateCcw, Plus, Pencil, Trash2, Send, EyeOff,
  FileText, ChevronLeft, ChevronRight, LayoutGrid, List,
  Filter, AlertTriangle, X, Eye, Globe, Lock,
  FileCheck, FileClock, FileX, TrendingUp,
} from "lucide-react";

/* ── Constants ──────────────────────────────────────── */
const PAGE_SIZES = [10, 25, 50];

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "ANNONCE",    label: "Annonce" },
  { value: "ACTUALITE",  label: "Actualité" },
  { value: "COMMUNIQUE", label: "Communiqué" },
  { value: "DECISION",   label: "Décision" },
  { value: "EVENEMENT",  label: "Événement" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "DRAFT",     label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "EXPIRED",   label: "Expiré" },
];

const VISIBILITY_OPTIONS = [
  { value: "",       label: "Visibilité" },
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVEE", label: "Médecins" },
];

const STATUS_CONFIG = {
  PUBLISHED: { label: "Publié",    badge: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",  dot: "bg-green-500" },
  DRAFT:     { label: "Brouillon", badge: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",     dot: "bg-slate-400 dark:bg-slate-500" },
  EXPIRED:   { label: "Expiré",    badge: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",              dot: "bg-red-500"   },
};

const formatDate = (v) => {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const cx = (...c) => c.filter(Boolean).join(" ");

/* ── Confirm Modal ──────────────────────────────────── */
function ConfirmModal({ open, onClose, onConfirm, loading, config }) {
  if (!config) return null;
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40" 
            onClick={onClose}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
          >
            {/* Header */}
            <div className={cx("flex items-center gap-3 px-5 py-4 border-b dark:border-slate-700", config.headerBg)}>
              <div className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", config.iconBg)}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{config.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{config.subtitle}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">{config.message}</p>
              {config.warning && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">{config.warning}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-5 py-3.5">
              <button
                onClick={onClose}
                disabled={loading}
                className="btn btn-ghost btn-sm text-slate-600"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={cx("btn btn-sm gap-2 text-white", config.confirmClass)}
              >
                {loading && <span className="loading loading-spinner loading-xs" />}
                {config.confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Status Badge ───────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.badge)}>
      <span className={cx("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

/* ── Visibility Badge ───────────────────────────────── */
function VisibilityBadge({ visibility }) {
  const isPublic = visibility === "PUBLIC";
  return (
    <span className={cx(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
      isPublic
        ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
        : "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
    )}>
      {isPublic ? <Globe size={10} /> : <Lock size={10} />}
      {isPublic ? "Public" : "Médecins"}
    </span>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ label, value, icon, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex items-center gap-3 rounded-xl border p-4 text-left transition",
        active ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-200 dark:ring-green-800" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
      )}
    >
      <div className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", color)}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </button>
  );
}

/* ── Inline Actions ─────────────────────────────────── */
function InlineActions({ contenu, onEdit, onConfirmAction }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onEdit(contenu)}
        title="Modifier"
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <Pencil size={13} />
      </button>

      {contenu.statut === "PUBLISHED" ? (
        <button
          onClick={() => onConfirmAction("unpublish", contenu)}
          title="Dépublier"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 transition hover:bg-amber-100 dark:hover:bg-amber-900/30"
        >
          <EyeOff size={13} />
        </button>
      ) : (
        <button
          onClick={() => onConfirmAction("publish", contenu)}
          title="Publier"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 transition hover:bg-green-100 dark:hover:bg-green-900/30"
        >
          <Send size={13} />
        </button>
      )}

      <button
        onClick={() => onConfirmAction("delete", contenu)}
        title="Supprimer"
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 transition hover:bg-red-100 dark:hover:bg-red-900/30"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

/* ── Content Grid ───────────────────────────────────── */
function ContentGrid({ contenus, loading, error, onEdit, onConfirmAction }) {
  if (loading) return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
      ))}
    </div>
  );

  if (error) return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">{error}</div>
  );

  if (contenus.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {contenus.map((c) => {
        const imageSrc = c.imageUrl ? `http://localhost:8080${c.imageUrl}` : null;
        return (
          <article
            key={c.id}
            className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* Image */}
            <div className="relative h-36 bg-slate-100 dark:bg-slate-800">
              {imageSrc ? (
                <img src={imageSrc} alt={c.titre} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
                  <FileText size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute left-3 top-3">
                <StatusBadge status={c.statut} />
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {c.type || "—"}
                </span>
                <VisibilityBadge visibility={c.visibilite} />
              </div>

              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                {c.titre || "Sans titre"}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {c.resume || "Aucun résumé"}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(c.dateCreation)}</span>
                <InlineActions contenu={c} onEdit={onEdit} onConfirmAction={onConfirmAction} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ── Empty State ────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-20 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
        <FileText size={22} />
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aucun contenu trouvé</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Créez un contenu ou modifiez vos filtres.</p>
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────── */
function Pagination({ page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-5 py-3.5">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Lignes</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 text-xs outline-none focus:border-green-500"
        >
          {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-slate-400 dark:text-slate-500">{from}–{to} sur {totalItems}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="px-3 text-xs font-semibold text-slate-600 dark:text-slate-400">{page} / {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────── */
function AdminContenusPage() {
  const [contenus, setContenus]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]           = useState("");

  const [search, setSearch]                 = useState("");
  const [statusFilter, setStatusFilter]     = useState("");
  const [typeFilter, setTypeFilter]         = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState("table");

  const [modalOpen, setModalOpen]         = useState(false);
  const [modalMode, setModalMode]         = useState("create");
  const [selectedContenu, setSelectedContenu] = useState(null);

  // Confirm modal
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type, contenu }
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadContenus = async () => {
    try {
      setLoading(true); setError("");
      const data = await getAdminContenus({ page: 0, size: 200 });
      setContenus(data.content || []);
    } catch { setError("Impossible de charger les contenus."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadContenus(); }, []);
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter, visibilityFilter]);

  const stats = useMemo(() => ({
    total:     contenus.length,
    published: contenus.filter((c) => c.statut === "PUBLISHED").length,
    draft:     contenus.filter((c) => c.statut === "DRAFT").length,
    expired:   contenus.filter((c) => c.statut === "EXPIRED").length,
  }), [contenus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contenus.filter((c) => {
      const matchQ = !q || (c.titre||"").toLowerCase().includes(q) || (c.resume||"").toLowerCase().includes(q);
      return matchQ &&
        (!statusFilter     || c.statut     === statusFilter) &&
        (!typeFilter       || c.type       === typeFilter) &&
        (!visibilityFilter || c.visibilite === visibilityFilter);
    });
  }, [contenus, search, statusFilter, typeFilter, visibilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ── Confirm action system ── */
  const CONFIRM_CONFIGS = {
    publish: (c) => ({
      title:        "Publier le contenu",
      subtitle:     c.titre,
      message:      `"${c.titre}" sera immédiatement visible sur la plateforme par les utilisateurs concernés.`,
      icon:         <Send size={16} className="text-green-700" />,
      iconBg:       "bg-green-100",
      headerBg:     "border-slate-100 bg-slate-50/60",
      confirmLabel: "Publier",
      confirmClass: "bg-green-600 hover:bg-green-700",
    }),
    unpublish: (c) => ({
      title:        "Dépublier le contenu",
      subtitle:     c.titre,
      message:      `"${c.titre}" ne sera plus visible sur la plateforme. Il passera en brouillon.`,
      icon:         <EyeOff size={16} className="text-amber-700" />,
      iconBg:       "bg-amber-100",
      headerBg:     "border-slate-100 bg-slate-50/60",
      confirmLabel: "Dépublier",
      confirmClass: "bg-amber-500 hover:bg-amber-600",
    }),
    delete: (c) => ({
      title:        "Supprimer le contenu",
      subtitle:     c.titre,
      message:      `Vous êtes sur le point de supprimer définitivement "${c.titre}".`,
      warning:      "Cette action est irréversible. Le contenu et ses données associées seront perdus.",
      icon:         <Trash2 size={16} className="text-red-600" />,
      iconBg:       "bg-red-100",
      headerBg:     "border-red-100 bg-red-50/40",
      confirmLabel: "Supprimer",
      confirmClass: "bg-red-600 hover:bg-red-700",
    }),
  };

  const openConfirm = (type, contenu) => {
    setConfirmAction({ type, contenu });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, contenu } = confirmAction;
    try {
      setConfirmLoading(true);
      if (type === "publish")   await publishContenu(contenu.id);
      if (type === "unpublish") await unpublishContenu(contenu.id);
      if (type === "delete")    await deleteContenu(contenu.id);
      setConfirmOpen(false);
      await loadContenus();
    } catch { /* handle */ }
    finally { setConfirmLoading(false); }
  };

  const handleCreate = () => { setModalMode("create"); setSelectedContenu(null); setModalOpen(true); };
  const handleEdit   = (c) => { setModalMode("edit"); setSelectedContenu(c); setModalOpen(true); };

  const handleSubmit = async (payload) => {
    try {
      setActionLoading(true);
      if (modalMode === "create") await createContenu(payload.data, payload.image, 1);
      else await updateContenu(selectedContenu.id, payload.data, payload.image);
      setModalOpen(false);
      await loadContenus();
    } catch { alert("Erreur lors de l'enregistrement."); }
    finally { setActionLoading(false); }
  };

  const confirmConfig = confirmAction
    ? CONFIRM_CONFIGS[confirmAction.type]?.(confirmAction.contenu)
    : null;

  const hasFilters = search || statusFilter || typeFilter || visibilityFilter;

  return (
    <AdminLayout title="Gestion des contenus" subtitle="Créez, publiez et gérez les informations diffusées.">
      <div className="space-y-5">

        {/* ── HEADER ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Contenus</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {stats.total} contenu{stats.total !== 1 ? "s" : ""} —{" "}
              <span className="text-green-700 dark:text-green-400 font-medium">{stats.published} publié{stats.published !== 1 ? "s" : ""}</span>,{" "}
              <span className="text-slate-600 dark:text-slate-400">{stats.draft} brouillon{stats.draft !== 1 ? "s" : ""}</span>,{" "}
              <span className="text-red-600 dark:text-red-400">{stats.expired} expiré{stats.expired !== 1 ? "s" : ""}</span>
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            <Plus size={15} />
            Nouveau contenu
          </button>
        </div>

        {/* ── STAT CARDS (cliquables) ──
        {!loading && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Total" value={stats.total}
              icon={<TrendingUp size={16} />} color="bg-slate-100 text-slate-600"
              active={!statusFilter} onClick={() => setStatusFilter("")}
            />
            <StatCard
              label="Publiés" value={stats.published}
              icon={<FileCheck size={16} />} color="bg-green-100 text-green-600"
              active={statusFilter === "PUBLISHED"} onClick={() => setStatusFilter(statusFilter === "PUBLISHED" ? "" : "PUBLISHED")}
            />
            <StatCard
              label="Brouillons" value={stats.draft}
              icon={<FileClock size={16} />} color="bg-slate-100 text-slate-500"
              active={statusFilter === "DRAFT"} onClick={() => setStatusFilter(statusFilter === "DRAFT" ? "" : "DRAFT")}
            />
            <StatCard
              label="Expirés" value={stats.expired}
              icon={<FileX size={16} />} color="bg-red-100 text-red-500"
              active={statusFilter === "EXPIRED"} onClick={() => setStatusFilter(statusFilter === "EXPIRED" ? "" : "EXPIRED")}
            />
          </div>
        )} */}

        {/* ── TOOLBAR ── */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            {/* Search */}
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Titre, résumé, catégorie..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 pl-9 pr-8 text-sm outline-none transition focus:border-green-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-green-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  ×
                </button>
              )}
            </div>

            {/* Filters */}
            {[
              { value: typeFilter, onChange: setTypeFilter, options: TYPE_OPTIONS },
              { value: visibilityFilter, onChange: setVisibilityFilter, options: VISIBILITY_OPTIONS },
            ].map((f, i) => (
              <div key={i} className="relative">
                <Filter size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={f.value} onChange={(e) => f.onChange(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-7 pr-7 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                >
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}

            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setStatusFilter(""); setTypeFilter(""); setVisibilityFilter(""); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}

            <div className="ml-auto flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
              {[
                { mode: "table", icon: <List size={14} /> },
                { mode: "grid",  icon: <LayoutGrid size={14} /> },
              ].map(({ mode, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cx(
                    "flex h-7 w-7 items-center justify-center rounded-md transition",
                    viewMode === mode ? "bg-slate-900 dark:bg-slate-600 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {!loading && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> résultat{filtered.length !== 1 ? "s" : ""}
                {search && <span> · "<em>{search}</em>"</span>}
              </p>
            </div>
          )}
        </div>

        {/* ── TABLE VIEW ── */}
        {viewMode === "table" && (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                    {["Titre & résumé","Type","Statut","Visibilité","Créé le","Publié le","Expire le","Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} className="px-4 py-3.5">
                            <div className="h-3 rounded bg-slate-100 dark:bg-slate-800" style={{ width: `${50 + (j*13)%45}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={8}><EmptyState /></td></tr>
                  ) : (
                    paginated.map((c) => (
                      <tr key={c.id} className="group transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        {/* Titre */}
                        <td className="max-w-[260px] px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {c.imageUrl ? (
                              <img
                                src={`http://localhost:8080${c.imageUrl}`}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                <FileText size={14} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{c.titre}</p>
                              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{c.resume || "—"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5">
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                            {c.type || "—"}
                          </span>
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={c.statut} />
                        </td>

                        {/* Visibilité */}
                        <td className="px-4 py-3.5">
                          <VisibilityBadge visibility={c.visibilite} />
                        </td>

                        {/* Dates */}
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">{formatDate(c.dateCreation)}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">{formatDate(c.datePublication)}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">{formatDate(c.dateExpiration)}</td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <InlineActions contenu={c} onEdit={handleEdit} onConfirmAction={openConfirm} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <Pagination
                page={page} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            )}
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (
          <>
            <ContentGrid
              contenus={paginated} loading={loading} error={error}
              onEdit={handleEdit} onConfirmAction={openConfirm}
            />
            {!loading && filtered.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <Pagination
                  page={page} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                />
              </div>
            )}
          </>
        )}

      </div>

      {/* ── Modals ── */}
      <ContenuWizardModal
        isOpen={modalOpen} mode={modalMode}
        initialData={selectedContenu} loading={actionLoading}
        onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={confirmOpen}
        onClose={() => !confirmLoading && setConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={confirmLoading}
        config={confirmConfig}
      />
    </AdminLayout>
  );
}

export default AdminContenusPage;