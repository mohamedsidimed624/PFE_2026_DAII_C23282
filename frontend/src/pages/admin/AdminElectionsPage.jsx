import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  Users,
  CheckCircle2,
  Calendar,
  Plus,
  Eye,
  Pencil,
  MoreVertical,
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
  Gavel,
  Trophy,
  ShieldCheck,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/shared/StatCard";

import {
  getAllElections,
  ouvrirCandidatures,
  cloturerCandidatures,
  ouvrirVotes,
  cloturerVotes,
  terminerDepouillement,
  publierResultats,
  archiverElection,
  annulerElection,
} from "../../services/adminElectionApi";

const PAGE_SIZE = 10;

const TYPE_LABELS = {
  CONSEIL_NATIONAL: "Conseil national",
  CONSEIL_REGIONAL: "Conseil régional",
  BUREAU_EXECUTIF: "Bureau exécutif",
  COMMISSION_SPECIALISEE: "Commission",
};

const CORPS_LABELS = {
  TOUS_MEDECINS_ACTIFS: "Tous les médecins actifs",
  MEDECINS_REGION: "Médecins de la région",
};

const NIVEAU_LABELS = {
  NATIONAL: "National",
  REGIONAL: "Régional",
  LOCAL: "Local",
};

const TYPE_COLORS = {
  CONSEIL_NATIONAL:
    "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  CONSEIL_REGIONAL:
    "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  BUREAU_EXECUTIF:
    "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  COMMISSION_SPECIALISEE:
    "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
};

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  CANDIDATURE_OUVERTE: "Candidatures ouvertes",
  VALIDATION_CANDIDATURES: "Validation candidatures",
  VOTE_EN_COURS: "Vote en cours",
  DEPOUILLEMENT: "Dépouillement",
  TERMINEE: "Terminée",
  RESULTATS_PUBLIES: "Résultats publiés",
  ARCHIVEE: "Archivée",
  ANNULEE: "Annulée",
};

const STATUT_STYLES = {
  BROUILLON:
    "bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400",
  CANDIDATURE_OUVERTE:
    "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  VALIDATION_CANDIDATURES:
    "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  VOTE_EN_COURS:
    "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  DEPOUILLEMENT:
    "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  TERMINEE:
    "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
  RESULTATS_PUBLIES:
    "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  ARCHIVEE:
    "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500",
  ANNULEE:
    "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400",
};

const ACTION_META = {
  ouvrirCandidatures: {
    title: "Ouvrir les candidatures",
    message:
      "Les médecins concernés pourront déposer leur candidature. Le backend vérifiera la configuration de l’élection avant l’ouverture.",
    confirmLabel: "Ouvrir",
    icon: PlayCircle,
    tone: "primary",
  },
  cloturerCandidatures: {
    title: "Clôturer les candidatures",
    message:
      "Aucune nouvelle candidature ne pourra être déposée. L’élection passera en phase de validation des candidatures.",
    confirmLabel: "Clôturer",
    icon: StopCircle,
    tone: "warning",
  },
  ouvrirVotes: {
    title: "Ouvrir le vote",
    message:
      "Les médecins éligibles pourront voter. Le backend vérifiera qu’il n’existe plus de candidatures en attente.",
    confirmLabel: "Ouvrir le vote",
    icon: Vote,
    tone: "primary",
  },
  cloturerVotes: {
    title: "Clôturer le vote",
    message:
      "Le vote sera fermé et l’élection passera en phase de dépouillement.",
    confirmLabel: "Clôturer",
    icon: StopCircle,
    tone: "warning",
  },
  terminerDepouillement: {
    title: "Terminer le dépouillement",
    message:
      "L’élection sera marquée comme terminée. Les résultats pourront ensuite être publiés officiellement.",
    confirmLabel: "Terminer",
    icon: Gavel,
    tone: "warning",
  },
  publierResultats: {
    title: "Publier les résultats",
    message:
      "Les résultats deviendront visibles officiellement. Le backend vérifiera le quorum et la validité des résultats.",
    confirmLabel: "Publier",
    icon: Trophy,
    tone: "primary",
  },
  archiver: {
    title: "Archiver l’élection",
    message:
      "L’élection sera conservée dans l’historique et ne pourra plus être modifiée.",
    confirmLabel: "Archiver",
    icon: Archive,
    tone: "neutral",
  },
  annuler: {
    title: "Annuler l’élection",
    message:
      "Cette action est sensible. Une raison d’annulation est obligatoire et sera enregistrée dans l’audit.",
    confirmLabel: "Annuler l’élection",
    icon: Ban,
    tone: "danger",
  },
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const extractApiError = (err) => {
  const data = err?.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.message ||
    data?.error ||
    data?.detail ||
    "Une erreur est survenue pendant l’action."
  );
};

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${
        TYPE_COLORS[type] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {TYPE_LABELS[type] ?? type ?? "—"}
    </span>
  );
}

function StatutBadge({ statut }) {
  return (
    <span
      className={`inline-flex min-w-[120px] items-center justify-center rounded px-2 py-0.5 text-[11px] font-semibold ${
        STATUT_STYLES[statut] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {STATUT_LABELS[statut] ?? statut ?? "—"}
    </span>
  );
}

function SmallBadge({ children, color = "slate" }) {
  const colors = {
    slate:
      "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300",
    green:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    blue:
      "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  };

  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
        colors[color] ?? colors.slate
      }`}
    >
      {children}
    </span>
  );
}

function DropItem({ icon: Icon, label, onClick, danger, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50"
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function ActionMenu({ election, onAction }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const statut = election.statut;

  const goDetail = () => {
    setOpen(false);
    navigate(`/admin/processus/elections/${election.id}`);
  };

  const goEdit = () => {
    setOpen(false);
    navigate(`/admin/processus/elections/${election.id}/modifier`);
  };

  const run = (action) => {
    setOpen(false);
    onAction(action, election);
  };

  return (
    <div className="relative flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={goDetail}
        title="Voir le détail"
        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      >
        <Eye size={14} />
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Actions"
        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      >
        <MoreVertical size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-8 z-30 w-56 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
            >
              <DropItem icon={Eye} label="Voir détail" onClick={goDetail} />

              {statut === "BROUILLON" && (
                <>
                  <DropItem icon={Pencil} label="Modifier" onClick={goEdit} />
                  <DropItem
                    icon={PlayCircle}
                    label="Ouvrir candidatures"
                    onClick={() => run("ouvrirCandidatures")}
                  />
                </>
              )}

              {statut === "CANDIDATURE_OUVERTE" && (
                <DropItem
                  icon={StopCircle}
                  label="Clôturer candidatures"
                  onClick={() => run("cloturerCandidatures")}
                />
              )}

              {statut === "VALIDATION_CANDIDATURES" && (
                <DropItem
                  icon={Vote}
                  label="Ouvrir le vote"
                  onClick={() => run("ouvrirVotes")}
                />
              )}

              {statut === "VOTE_EN_COURS" && (
                <DropItem
                  icon={StopCircle}
                  label="Clôturer le vote"
                  onClick={() => run("cloturerVotes")}
                />
              )}

              {statut === "DEPOUILLEMENT" && (
                <DropItem
                  icon={Gavel}
                  label="Terminer dépouillement"
                  onClick={() => run("terminerDepouillement")}
                />
              )}

              {statut === "TERMINEE" && (
                <>
                  <DropItem
                    icon={Trophy}
                    label="Publier résultats"
                    onClick={() => run("publierResultats")}
                  />
                  <DropItem
                    icon={Archive}
                    label="Archiver"
                    onClick={() => run("archiver")}
                  />
                </>
              )}

              {statut === "RESULTATS_PUBLIES" && (
                <DropItem
                  icon={Archive}
                  label="Archiver"
                  onClick={() => run("archiver")}
                />
              )}

              {!["ARCHIVEE", "ANNULEE", "RESULTATS_PUBLIES"].includes(
                statut
              ) && (
                <DropItem
                  icon={Ban}
                  label="Annuler"
                  onClick={() => run("annuler")}
                  danger
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ElectionRow({ election, index, onAction }) {
  const candidats = election.nbCandidatsValides ?? 0;
  const votants = election.nbVotants ?? 0;
  const eligibles = election.nbElecteursEligibles ?? 0;
  const taux = Number(election.tauxParticipation ?? 0);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: index * 0.025 }}
      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
    >
      <td className="px-6 py-4">
        <p className="max-w-[280px] truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
          {election.titre || "Élection sans titre"}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {election.niveau && (
            <SmallBadge>{NIVEAU_LABELS[election.niveau] ?? election.niveau}</SmallBadge>
          )}

          {election.corpsElectoral && (
            <SmallBadge color="green">
              {CORPS_LABELS[election.corpsElectoral] ?? election.corpsElectoral}
              {election.corpsElectoral === "MEDECINS_REGION" && election.region
                ? ` · ${election.region}`
                : ""}
            </SmallBadge>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <TypeBadge type={election.type} />
      </td>

      <td className="px-6 py-4">
        <StatutBadge statut={election.statut} />
      </td>

      <td className="px-6 py-4 text-[13px] text-slate-600 dark:text-slate-400">
        <p className="font-semibold">
          {election.seatsCount ?? 0} siège
          {(election.seatsCount ?? 0) > 1 ? "s" : ""}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          {candidats} candidat{candidats > 1 ? "s" : ""} validé
          {candidats > 1 ? "s" : ""}
        </p>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(taux, 100)}%` }}
            />
          </div>

          <span className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
            {taux.toFixed(1)}%
          </span>
        </div>

        <p className="mt-1 text-[11px] text-slate-400">
          {votants} votant{votants > 1 ? "s" : ""}
          {eligibles > 0 ? ` / ${eligibles} éligibles` : ""}
        </p>
      </td>

      <td className="px-6 py-4 text-[12px] text-slate-500 dark:text-slate-400">
        <p>
          <span className="text-slate-400">Candidatures : </span>
          {formatDate(election.candidatureStartDate)} →{" "}
          {formatDate(election.candidatureEndDate)}
        </p>

        <p className="mt-1">
          <span className="text-slate-400">Vote : </span>
          {formatDate(election.voteStartDate)} →{" "}
          {formatDate(election.voteEndDate)}
        </p>
      </td>

      <td className="px-6 py-4">
        <ActionMenu election={election} onAction={onAction} />
      </td>
    </motion.tr>
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
  const Icon = meta?.icon ?? AlertTriangle;
  const isDanger = meta?.tone === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDanger
                ? "bg-red-50 text-red-500 dark:bg-red-900/30"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
            }`}
          >
            <Icon size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
              {meta?.title ?? "Confirmer l’action"}
            </h3>

            <p className="mt-1 text-[13px] leading-5 text-slate-500 dark:text-slate-400">
              {meta?.message}
            </p>

            {modal.election?.titre && (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {modal.election.titre}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {modal.action === "annuler" && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Raison d’annulation <span className="text-red-500">*</span>
            </label>

            <textarea
              rows={4}
              autoFocus
              placeholder="Expliquez pourquoi cette élection est annulée..."
              value={modal.raison}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none transition focus:border-red-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        )}

        {actionError && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {actionError}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={
              actionLoading ||
              (modal.action === "annuler" && !modal.raison.trim())
            }
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition disabled:opacity-40 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {actionLoading && <Loader2 size={14} className="animate-spin" />}
            {meta?.confirmLabel ?? "Confirmer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminElectionsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [statutFilter, setStatutFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

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
        page,
        size: PAGE_SIZE,
      };

      if (statutFilter) params.statut = statutFilter;
      if (typeFilter) params.type = typeFilter;

      const res = await getAllElections(params);
      setData(res.data);
    } catch (err) {
      setData(null);
      setLoadError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, statutFilter, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const elections = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const filteredElections = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return elections;

    return elections.filter((e) => {
      return (
        e.titre?.toLowerCase().includes(keyword) ||
        e.region?.toLowerCase().includes(keyword) ||
        TYPE_LABELS[e.type]?.toLowerCase().includes(keyword) ||
        STATUT_LABELS[e.statut]?.toLowerCase().includes(keyword)
      );
    });
  }, [elections, search]);

  const counts = useMemo(() => {
    return {
      total: totalElements,
      candidatures: elections.filter((e) => e.statut === "CANDIDATURE_OUVERTE")
        .length,
      vote: elections.filter((e) => e.statut === "VOTE_EN_COURS").length,
      publiees: elections.filter((e) => e.statut === "RESULTATS_PUBLIES")
        .length,
    };
  }, [elections, totalElements]);

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

      if (modal.action === "ouvrirCandidatures") {
        await ouvrirCandidatures(id);
      } else if (modal.action === "cloturerCandidatures") {
        await cloturerCandidatures(id);
      } else if (modal.action === "ouvrirVotes") {
        await ouvrirVotes(id);
      } else if (modal.action === "cloturerVotes") {
        await cloturerVotes(id);
      } else if (modal.action === "terminerDepouillement") {
        await terminerDepouillement(id);
      } else if (modal.action === "publierResultats") {
        await publierResultats(id);
      } else if (modal.action === "archiver") {
        await archiverElection(id);
      } else if (modal.action === "annuler") {
        await annulerElection(id, modal.raison.trim());
      }

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
      <div className="min-h-screen bg-[#FAFBFC] px-6 py-5 dark:bg-slate-950">
        <ConfirmModal
          modal={modal}
          actionLoading={actionLoading}
          actionError={actionError}
          onClose={closeModal}
          onConfirm={confirmAction}
          onReasonChange={(raison) =>
            setModal((m) => ({
              ...m,
              raison,
            }))
          }
        />

        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100">
              Processus électoral
            </h1>

            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              Gestion des élections, candidatures, votes et résultats.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/processus/elections/nouveau")}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={15} />
            Nouvelle élection
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            title="Total élections"
            value={counts.total}
            colorScheme="blue"
            icon={<Vote size={17} />}
          />

          <StatCard
            title="Candidatures ouvertes"
            value={counts.candidatures}
            colorScheme="green"
            icon={<Users size={17} />}
          />

          <StatCard
            title="Votes en cours"
            value={counts.vote}
            colorScheme="amber"
            icon={<ShieldCheck size={17} />}
          />

          <StatCard
            title="Résultats publiés"
            value={counts.publiees}
            colorScheme="slate"
            icon={<Trophy size={17} />}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans cette page..."
              className="h-10 w-64 rounded-lg border border-slate-100 bg-slate-50 pl-9 pr-3 text-[13px] text-slate-600 outline-none transition focus:border-emerald-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-900"
            />
          </div>

          <select
            value={statutFilter}
            onChange={(e) => {
              setStatutFilter(e.target.value);
              setPage(0);
            }}
            className="h-10 rounded-lg border border-slate-100 bg-slate-50 px-3 text-[13px] text-slate-600 outline-none transition focus:border-emerald-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Statut : Tous</option>
            {Object.entries(STATUT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            className="h-10 rounded-lg border border-slate-100 bg-slate-50 px-3 text-[13px] text-slate-600 outline-none transition focus:border-emerald-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Type : Tous</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {(search || statutFilter || typeFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatutFilter("");
                setTypeFilter("");
                setPage(0);
              }}
              className="h-10 rounded-lg border border-slate-100 bg-white px-3 text-[13px] font-medium text-slate-400 transition hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:text-slate-200"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {loadError && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
            {loadError}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] table-fixed text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
                  {[
                    { label: "Élection", cls: "w-[27%]" },
                    { label: "Type", cls: "w-[13%]" },
                    { label: "Statut", cls: "w-[15%]" },
                    { label: "Sièges", cls: "w-[10%]" },
                    { label: "Participation", cls: "w-[14%]" },
                    { label: "Calendrier", cls: "w-[15%]" },
                    { label: "Actions", cls: "w-[6%] text-right" },
                  ].map(({ label, cls }) => (
                    <th
                      key={label}
                      className={`${cls} px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <Loader2
                        size={22}
                        className="mx-auto animate-spin text-slate-300 dark:text-slate-600"
                      />
                    </td>
                  </tr>
                ) : filteredElections.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-20 text-center text-[13px] text-slate-400 dark:text-slate-500"
                    >
                      Aucune élection trouvée
                    </td>
                  </tr>
                ) : (
                  filteredElections.map((election, index) => (
                    <ElectionRow
                      key={election.id}
                      election={election}
                      index={index}
                      onAction={openModal}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 dark:border-slate-800">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Page {page + 1} / {totalPages} · {totalElements} élection
                {totalElements > 1 ? "s" : ""}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={15} />
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}