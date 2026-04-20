import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import SpecialiteFormModal from "../../components/admin/specialites/SpecialiteFormModal";
import SousSpecialiteFormModal from "../../components/admin/specialites/SousSpecialiteFormModal";
import ConfirmActionModal from "../../components/admin/ConfirmActionModal";
import {
  getAdminSpecialites,
  getSousSpecialitesBySpecialite,
  toggleSpecialiteStatus,
  toggleSousSpecialiteStatus,
  deleteSpecialite,
  deleteSousSpecialite,
  createSpecialite,
  updateSpecialite,
  createSousSpecialite,
  updateSousSpecialite,
} from "../../services/adminSpecialiteApi";
import {
  Search,
  Filter,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  Stethoscope,
  HeartPulse,
} from "lucide-react";

const STATUS_OPTIONS = [
  { label: "Tous", value: "" },
  { label: "Actives", value: "true" },
  { label: "Inactives", value: "false" },
];

const SORT_OPTIONS = [
  { label: "Libellé A → Z", value: "libelle_asc" },
  { label: "Libellé Z → A", value: "libelle_desc" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function AdminSpecialitesPage() {
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("libelle_asc");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [expandedRows, setExpandedRows] = useState({});
  const [sousSpecialitesMap, setSousSpecialitesMap] = useState({});
  const [rowLoading, setRowLoading] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);

  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedSpecialite, setSelectedSpecialite] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [isSousModalOpen, setIsSousModalOpen] = useState(false);
  const [sousModalMode, setSousModalMode] = useState("create");
  const [selectedSousSpecialite, setSelectedSousSpecialite] = useState(null);
  const [selectedParentSpecialite, setSelectedParentSpecialite] = useState(null);
  const [sousFormLoading, setSousFormLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    action: null,
    confirmLabel: "Confirmer",
    variant: "danger",
  });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const clearFeedback = () => {
    setFeedback({ type: "", message: "" });
  };

  const openConfirmModal = (config) => {
    setConfirmModal({
      open: true,
      title: "",
      message: "",
      action: null,
      confirmLabel: "Confirmer",
      variant: "danger",
      ...config,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      title: "",
      message: "",
      action: null,
      confirmLabel: "Confirmer",
      variant: "danger",
    });
  };

  const loadSpecialites = async (
    customSearch = search,
    customStatus = statusFilter,
    customPage = page
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: customPage,
        size,
        sortBy,
      };

      if (customSearch?.trim()) params.search = customSearch.trim();
      if (customStatus !== "") params.active = customStatus;

      const data = await getAdminSpecialites(params);

      setSpecialites(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(data.number || 0);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les spécialités.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialites(search, statusFilter, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sortBy]);

  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!feedback.message) return;

    const timer = setTimeout(() => {
      clearFeedback();
    }, 3500);

    return () => clearTimeout(timer);
  }, [feedback]);

  const summary = useMemo(() => {
    const totalSousSpecialites = specialites.reduce(
      (sum, s) => sum + (s.nombreSousSpecialites || 0),
      0
    );

    return {
      totalSpecialites: totalElements,
      totalSousSpecialites,
    };
  }, [specialites, totalElements]);

  const handleSearchSubmit = async () => {
    setPage(0);
    await loadSpecialites(search, statusFilter, 0);
  };

  const handleStatusChange = async (value) => {
    setStatusFilter(value);
    setPage(0);
    await loadSpecialites(search, value, 0);
  };

  const handleReset = async () => {
    setSearch("");
    setStatusFilter("");
    setSortBy("libelle_asc");
    setExpandedRows({});
    setSousSpecialitesMap({});
    setPage(0);
    clearFeedback();
    await loadSpecialites("", "", 0);
  };

  const handleToggleExpand = async (specialiteId) => {
    const isExpanded = expandedRows[specialiteId];

    if (isExpanded) {
      setExpandedRows((prev) => ({ ...prev, [specialiteId]: false }));
      return;
    }

    if (!sousSpecialitesMap[specialiteId]) {
      try {
        setRowLoading((prev) => ({ ...prev, [specialiteId]: true }));
        const data = await getSousSpecialitesBySpecialite(specialiteId);

        setSousSpecialitesMap((prev) => ({
          ...prev,
          [specialiteId]: data || [],
        }));
      } catch (err) {
        console.error(err);
        showFeedback("error", "Impossible de charger les sous-spécialités.");
      } finally {
        setRowLoading((prev) => ({ ...prev, [specialiteId]: false }));
      }
    }

    setExpandedRows((prev) => ({ ...prev, [specialiteId]: true }));
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelectedSpecialite(null);
    setIsModalOpen(true);
  };

  const handleEdit = (specialite) => {
    setModalMode("edit");
    setSelectedSpecialite(specialite);
    setIsModalOpen(true);
  };

  const handleSubmitSpecialite = async (data) => {
    try {
      setFormLoading(true);

      if (modalMode === "create") {
        await createSpecialite(data);
        showFeedback("success", "Spécialité créée avec succès.");
      } else {
        await updateSpecialite(selectedSpecialite.id, data);
        showFeedback("success", "Spécialité mise à jour avec succès.");
      }

      setIsModalOpen(false);
      await loadSpecialites(search, statusFilter, page);
    } catch (err) {
      console.error(err);
      showFeedback(
        "error",
        err?.response?.data?.message || "Erreur lors de l’enregistrement."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateSousSpecialite = (specialite) => {
    setSousModalMode("create");
    setSelectedSousSpecialite(null);
    setSelectedParentSpecialite(specialite);
    setIsSousModalOpen(true);
  };

  const handleEditSousSpecialite = (sous, parentSpecialite) => {
    setSousModalMode("edit");
    setSelectedSousSpecialite(sous);
    setSelectedParentSpecialite(parentSpecialite);
    setIsSousModalOpen(true);
  };

  const handleSubmitSousSpecialite = async (data) => {
    try {
      setSousFormLoading(true);

      if (sousModalMode === "create") {
        await createSousSpecialite(data);
        showFeedback("success", "Sous-spécialité créée avec succès.");
      } else {
        await updateSousSpecialite(selectedSousSpecialite.id, data);
        showFeedback("success", "Sous-spécialité mise à jour avec succès.");
      }

      const updatedSous = await getSousSpecialitesBySpecialite(data.specialiteId);

      setSousSpecialitesMap((prev) => ({
        ...prev,
        [data.specialiteId]: updatedSous || [],
      }));

      setExpandedRows((prev) => ({
        ...prev,
        [data.specialiteId]: true,
      }));

      setIsSousModalOpen(false);
      await loadSpecialites(search, statusFilter, page);
    } catch (err) {
      console.error(err);
      showFeedback(
        "error",
        err?.response?.data?.message ||
          "Erreur lors de l’enregistrement de la sous-spécialité."
      );
    } finally {
      setSousFormLoading(false);
    }
  };

  const handleToggleSpecialiteStatus = async (id) => {
    try {
      setActionLoading(true);
      await toggleSpecialiteStatus(id);
      showFeedback("success", "Statut de la spécialité mis à jour.");
      await loadSpecialites(search, statusFilter, page);
    } catch (err) {
      console.error(err);
      showFeedback(
        "error",
        err?.response?.data?.message ||
          "Erreur lors du changement de statut."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSousSpecialiteStatus = async (specialiteId, sousSpecialiteId) => {
    try {
      setActionLoading(true);
      await toggleSousSpecialiteStatus(sousSpecialiteId);

      const updatedSous = await getSousSpecialitesBySpecialite(specialiteId);
      setSousSpecialitesMap((prev) => ({
        ...prev,
        [specialiteId]: updatedSous || [],
      }));

      showFeedback("success", "Statut de la sous-spécialité mis à jour.");
      await loadSpecialites(search, statusFilter, page);
    } catch (err) {
      console.error(err);
      showFeedback(
        "error",
        err?.response?.data?.message ||
          "Erreur lors du changement de statut."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSpecialite = (id, canDelete) => {
    if (!canDelete) {
      openConfirmModal({
        title: "Suppression impossible",
        message:
          "Cette spécialité est utilisée ou contient des sous-spécialités.",
        confirmLabel: "Compris",
        variant: "warning",
        action: closeConfirmModal,
      });
      return;
    }

    openConfirmModal({
      title: "Supprimer la spécialité",
      message: "Cette action est irréversible.",
      confirmLabel: "Supprimer",
      variant: "danger",
      action: async () => {
        try {
          setActionLoading(true);
          await deleteSpecialite(id);
          showFeedback("success", "Spécialité supprimée avec succès.");
          await loadSpecialites(search, statusFilter, page);
        } catch (err) {
          console.error(err);
          showFeedback(
            "error",
            err?.response?.data?.message || "Erreur lors de la suppression."
          );
        } finally {
          setActionLoading(false);
          closeConfirmModal();
        }
      },
    });
  };

  const handleDeleteSousSpecialite = (specialiteId, sousSpecialiteId, canDelete) => {
    if (!canDelete) {
      openConfirmModal({
        title: "Suppression impossible",
        message:
          "Cette sous-spécialité est utilisée et ne peut pas être supprimée.",
        confirmLabel: "Compris",
        variant: "warning",
        action: closeConfirmModal,
      });
      return;
    }

    openConfirmModal({
      title: "Supprimer la sous-spécialité",
      message: "Cette action est irréversible.",
      confirmLabel: "Supprimer",
      variant: "danger",
      action: async () => {
        try {
          setActionLoading(true);
          await deleteSousSpecialite(sousSpecialiteId);

          const updatedSous = await getSousSpecialitesBySpecialite(specialiteId);
          setSousSpecialitesMap((prev) => ({
            ...prev,
            [specialiteId]: updatedSous || [],
          }));

          showFeedback("success", "Sous-spécialité supprimée avec succès.");
          await loadSpecialites(search, statusFilter, page);
        } catch (err) {
          console.error(err);
          showFeedback(
            "error",
            err?.response?.data?.message || "Erreur lors de la suppression."
          );
        } finally {
          setActionLoading(false);
          closeConfirmModal();
        }
      },
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Gestion des spécialités">
        <MedicalLoading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestion des spécialités"
      subtitle="Administration du référentiel des spécialités médicales."
    >
      <div className="space-y-4">
        {feedback.message && (
          <FeedbackBanner type={feedback.type} message={feedback.message} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-[260px] max-w-full">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Code ou libellé"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all"
              />
            </div>

            <div className="relative">
              <Filter
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all appearance-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all appearance-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all appearance-none"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={14} />
              Réinitialiser
            </button>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 px-3.5 py-2 text-sm rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <Plus size={14} />
            Ajouter une spécialité
          </button>
        </div>

        <div className="text-sm text-slate-500">
          <p>
            {summary.totalSpecialites} spécialité
            {summary.totalSpecialites > 1 ? "s" : ""},{" "}
            {summary.totalSousSpecialites} sous-spécialité
            {summary.totalSousSpecialites > 1 ? "s" : ""}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {error ? (
            <ErrorState message={error} onRetry={() => loadSpecialites(search, statusFilter, page)} />
          ) : specialites.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      LIBELLÉ
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      CODE
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      STATUT
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      SOUS-SPÉC.
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      MÉDECINS
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      DEMANDES
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {specialites.map((specialite) => {
                    const isExpanded = expandedRows[specialite.id];
                    const sousSpecialites = sousSpecialitesMap[specialite.id] || [];
                    const isSousLoading = rowLoading[specialite.id];

                    return (
                      <SpecialiteRows
                        key={specialite.id}
                        specialite={specialite}
                        isExpanded={isExpanded}
                        sousSpecialites={sousSpecialites}
                        isSousLoading={isSousLoading}
                        actionLoading={actionLoading}
                        openMenu={openMenu}
                        setOpenMenu={setOpenMenu}
                        onToggleExpand={() => handleToggleExpand(specialite.id)}
                        onEdit={handleEdit}
                        onAddSousSpecialite={() => handleCreateSousSpecialite(specialite)}
                        onToggleStatus={() => handleToggleSpecialiteStatus(specialite.id)}
                        onDelete={() =>
                          handleDeleteSpecialite(specialite.id, specialite.canDelete)
                        }
                        onEditSous={(sous) =>
                          handleEditSousSpecialite(sous, specialite)
                        }
                        onToggleSousStatus={(sousId) =>
                          handleToggleSousSpecialiteStatus(specialite.id, sousId)
                        }
                        onDeleteSous={(sousId, canDelete) =>
                          handleDeleteSousSpecialite(
                            specialite.id,
                            sousId,
                            canDelete
                          )
                        }
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
       

        {!error && totalElements > 0 && (
            <div className="border-t border-slate-100 bg-white px-5 py-3.5">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Showing</span>
                    <select
                    value={size}
                    onChange={(e) => {
                        setSize(Number(e.target.value));
                        setPage(0);
                    }}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 bg-white outline-none focus:border-green-500 transition-all"
                    >
                    {PAGE_SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                        {s}
                        </option>
                    ))}
                    </select>
                    <span>of {totalElements}</span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    disabled={page === 0 || loading}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                    <ChevronLeft size={14} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageIndex = i;
                    return (
                        <button
                        key={pageIndex}
                        type="button"
                        onClick={() => setPage(pageIndex)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                            page === pageIndex
                            ? "bg-green-600 text-white"
                            : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                        >
                        {pageIndex + 1}
                        </button>
                    );
                    })}

                    <button
                    type="button"
                    onClick={() =>
                        setPage((prev) => Math.min(totalPages - 1, prev + 1))
                    }
                    disabled={page >= totalPages - 1 || loading}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                    <ChevronRight size={14} />
                    </button>
                </div>
                </div>
            </div>
            )}
             </div>
      </div>

      <SpecialiteFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedSpecialite}
        loading={formLoading}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitSpecialite}
      />

      <SousSpecialiteFormModal
        isOpen={isSousModalOpen}
        mode={sousModalMode}
        parentSpecialite={selectedParentSpecialite}
        initialData={selectedSousSpecialite}
        loading={sousFormLoading}
        onClose={() => setIsSousModalOpen(false)}
        onSubmit={handleSubmitSousSpecialite}
      />

      <ConfirmActionModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        loading={actionLoading}
        onConfirm={confirmModal.action}
        onClose={closeConfirmModal}
      />
    </AdminLayout>
  );
}

function SpecialiteRows({
  specialite,
  isExpanded,
  sousSpecialites,
  isSousLoading,
  actionLoading,
  openMenu,
  setOpenMenu,
  onToggleExpand,
  onEdit,
  onAddSousSpecialite,
  onToggleStatus,
  onDelete,
  onEditSous,
  onToggleSousStatus,
  onDeleteSous,
}) {
  return (
    <>
      <tr className="hover:bg-slate-50/60 transition-colors">
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleExpand}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {specialite.libelle}
              </p>
              {specialite.description && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {specialite.description}
                </p>
              )}
            </div>
          </div>
        </td>

        <td className="px-5 py-3.5 text-sm text-slate-500">{specialite.code}</td>

        <td className="px-5 py-3.5">
          <StatusBadge active={specialite.active} />
        </td>

        <td className="px-5 py-3.5 text-sm font-medium text-slate-600">
          {specialite.nombreSousSpecialites ?? 0}
        </td>

        <td className="px-5 py-3.5 text-sm font-medium text-slate-600">
          {specialite.nombreMedecins ?? 0}
        </td>

        <td className="px-5 py-3.5 text-sm font-medium text-slate-600">
          {specialite.nombreDemandes ?? 0}
        </td>

        <td className="px-5 py-3.5">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onEdit(specialite)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              <Pencil size={14} />
              Modifier
            </button>

            <RowMenu
              menuKey={`specialite-${specialite.id}`}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              items={[
                {
                  label: "Ajouter sous-spécialité",
                  icon: <Plus size={14} />,
                  onClick: onAddSousSpecialite,
                },
                {
                  label: specialite.active ? "Désactiver" : "Activer",
                  icon: <Power size={14} />,
                  onClick: onToggleStatus,
                  disabled: actionLoading,
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 size={14} />,
                  onClick: onDelete,
                  danger: true,
                  disabled: actionLoading,
                },
              ]}
            />
          </div>
        </td>
      </tr>

      {isExpanded && (
        <>
          {isSousLoading ? (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-4 bg-slate-50 text-sm text-slate-500"
              >
                <div className="flex items-center gap-2">
                  <HeartPulse size={16} className="text-green-600 animate-pulse" />
                  Chargement des sous-spécialités...
                </div>
              </td>
            </tr>
          ) : sousSpecialites.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-4 bg-slate-50 text-sm text-slate-400"
              >
                Aucune sous-spécialité.
              </td>
            </tr>
          ) : (
            sousSpecialites.map((sous) => (
              <tr
                key={sous.id}
                className="bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3 pl-10">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {sous.libelle}
                      </p>
                      {sous.description && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {sous.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-3.5 text-sm text-slate-500">{sous.code}</td>

                <td className="px-5 py-3.5">
                  <StatusBadge active={sous.active} />
                </td>

                <td className="px-5 py-3.5 text-sm text-slate-400">—</td>

                <td className="px-5 py-3.5 text-sm font-medium text-slate-600">
                  {sous.nombreMedecins ?? 0}
                </td>

                <td className="px-5 py-3.5 text-sm font-medium text-slate-600">
                  {sous.nombreDemandes ?? 0}
                </td>

                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditSous(sous)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Pencil size={14} />
                      Modifier
                    </button>

                    <RowMenu
                      menuKey={`sous-${sous.id}`}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                      items={[
                        {
                          label: sous.active ? "Désactiver" : "Activer",
                          icon: <Power size={14} />,
                          onClick: () => onToggleSousStatus(sous.id),
                          disabled: actionLoading,
                        },
                        {
                          label: "Supprimer",
                          icon: <Trash2 size={14} />,
                          onClick: () => onDeleteSous(sous.id, sous.canDelete),
                          danger: true,
                          disabled: actionLoading,
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </>
      )}
    </>
  );
}

function RowMenu({ menuKey, openMenu, setOpenMenu, items }) {
  const isOpen = openMenu === menuKey;

  const toggle = (e) => {
    e.stopPropagation();
    setOpenMenu(isOpen ? null : menuKey);
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    setOpenMenu(null);
    if (!item.disabled) item.onClick();
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <MoreHorizontal size={15} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-20 min-w-[190px] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              disabled={item.disabled}
              onClick={(e) => handleItemClick(e, item)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-green-500" : "bg-slate-400"
        }`}
      />
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

function FeedbackBanner({ type, message }) {
  const classes =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${classes}`}>
      {message}
    </div>
  );
}

function MedicalLoading() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[240px] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
        <Stethoscope size={26} className="text-green-600 animate-pulse" />
      </div>
      <h3 className="text-base font-bold text-slate-800">
        Chargement des spécialités…
      </h3>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        Préparation du référentiel médical.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-[220px] flex flex-col items-center justify-center text-center px-6">
      <h3 className="text-lg font-bold text-slate-800">
        Une erreur est survenue
      </h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
      >
        <RotateCcw size={14} />
        Réessayer
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-[220px] flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
        <Stethoscope size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-800">
        Aucune spécialité disponible
      </h3>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        Commencez par ajouter une spécialité pour structurer le référentiel
        médical.
      </p>
    </div>
  );
}

export default AdminSpecialitesPage;