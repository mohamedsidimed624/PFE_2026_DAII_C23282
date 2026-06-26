import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../components/admin/AdminLayout";
import ContenuWizardModal from "../../components/admin/contenus/ContenuWizardModal";
import {
  getAdminContenus, createContenu, updateContenu,
  publishContenu, unpublishContenu, deleteContenu,
} from "../../services/adminContenuApi";
import { resolveFileUrl } from "../../config/api";
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
            className="absolute inset-0" 
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
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={cx("inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed", config.confirmClass)}
              >
                {loading && (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
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
/* ── Inline Actions avec icônes ─────────────────────────────────── */
function InlineActions({ contenu, onEdit, onConfirmAction }) {
  const isPublished = contenu.statut === "PUBLISHED";

  return (
    <div className="flex items-center gap-1.5">
      {/* Modifier */}
      <button
        type="button"
        onClick={() => onEdit(contenu)}
        title="Modifier"
        className="flex h-8 w-8 items-center justify-center rounded-md text-blue-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
      >
        <Pencil size={15} />
      </button>

      {/* Publier / Dépublier */}
      {isPublished ? (
        <button
          type="button"
          onClick={() => onConfirmAction("unpublish", contenu)}
          title="Dépublier"
          className="flex h-8 w-8 items-center justify-center rounded-md text-amber-500 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20"
        >
          <EyeOff size={15} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onConfirmAction("publish", contenu)}
          title="Publier"
          className="flex h-8 w-8 items-center justify-center rounded-md text-green-600 transition hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
        >
          <Send size={15} />
        </button>
      )}

      {/* Supprimer */}
      <button
        type="button"
        onClick={() => onConfirmAction("delete", contenu)}
        title="Supprimer"
        className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
      >
        <Trash2 size={15} />
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
        const imageSrc = resolveFileUrl(c.imageUrl);
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
function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="flex items-center justify-between px-7 py-5">
      <div className="flex items-center gap-2 text-[13px] text-slate-400">
        <span>Showing</span>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-9 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[13px] text-slate-600 dark:text-slate-400 outline-none"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <span>of {totalItems}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
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
              onClick={() => onPageChange(p)}
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
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 disabled:opacity-40"
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
  <AdminLayout title="Gestion des contenus">
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-7 py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-slate-700 dark:text-slate-200">
          Gestion des contenus
        </h1>

        <button
          onClick={handleCreate}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-green-500 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600"
        >
          <Plus size={15} />
          Nouveau contenu
        </button>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre..."
              className="h-10 w-[240px] rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 pr-10 text-[13px] text-slate-600 dark:text-slate-200 shadow-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-green-400"
            />
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-500 dark:text-slate-300 shadow-sm outline-none focus:border-green-400"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-500 dark:text-slate-300 shadow-sm outline-none focus:border-green-400"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value === "" ? "Tous les statuts" : o.label}
              </option>
            ))}
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-500 dark:text-slate-300 shadow-sm outline-none focus:border-green-400"
          >
            {VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setTypeFilter("");
                setVisibilityFilter("");
              }}
              className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-400 dark:text-slate-400 shadow-sm hover:text-slate-600 dark:hover:text-slate-200"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-sm">
          <button
            onClick={() => setViewMode("table")}
            className={`flex h-8 w-8 items-center justify-center rounded-md ${
              viewMode === "table"
                ? "bg-green-500 text-white"
                : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <List size={14} />
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-md ${
              viewMode === "grid"
                ? "bg-green-500 text-white"
                : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {viewMode === "table" && (
        <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] table-fixed text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="w-[24%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    TITRE & RÉSUMÉ
                  </th>
                  <th className="w-[11%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    TYPE
                  </th>
                  <th className="w-[11%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    STATUT
                  </th>
                  <th className="w-[11%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    VISIBILITÉ
                  </th>
                  <th className="w-[11%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    CRÉÉ LE
                  </th>
                  <th className="w-[11%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    PUBLIÉ LE
                  </th>
                  <th className="w-[11%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    EXPIRE LE
                  </th>
                  <th className="w-[16%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-7 py-4">
                          <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-7 py-14 text-center text-sm text-slate-400">
                      Aucun contenu trouvé.
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-7 py-4">
                        <p className="truncate text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                          {c.titre || "Sans titre"}
                        </p>
                        <p className="truncate text-[13px] text-slate-400 dark:text-slate-500">
                          {c.resume || "—"}
                        </p>
                      </td>

                      <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                        {c.type || "—"}
                      </td>

                      <td className="px-7 py-4">
                        <StatusBadge status={c.statut} />
                      </td>

                      <td className="px-7 py-4">
                        <VisibilityBadge visibility={c.visibilite} />
                      </td>

                      <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(c.dateCreation)}
                      </td>

                      <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(c.datePublication)}
                      </td>

                      <td className="px-7 py-4 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(c.dateExpiration)}
                      </td>

                      <td className="px-7 py-4">
                        <InlineActions
                          contenu={c}
                          onEdit={handleEdit}
                          onConfirmAction={openConfirm}
                        />
                      </td>
                    </tr>
                  ))
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
      )}

      {viewMode === "grid" && (
        <>
          <ContentGrid
            contenus={paginated}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onConfirmAction={openConfirm}
          />

          {!loading && filtered.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-md bg-white">
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
            </div>
          )}
        </>
      )}
    </div>

    <ContenuWizardModal
      isOpen={modalOpen}
      mode={modalMode}
      initialData={selectedContenu}
      loading={actionLoading}
      onClose={() => setModalOpen(false)}
      onSubmit={handleSubmit}
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