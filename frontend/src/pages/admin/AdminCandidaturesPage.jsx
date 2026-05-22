import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, CheckCircle2, Clock, ChevronLeft, ChevronRight,
  Loader2, Eye, XCircle,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import {
  getAllCandidatures, validerCandidature, rejeterCandidature,
} from "../../services/adminElectionApi";

const PAGE_SIZE = 15;

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  SOUMISE:   "Soumise",
  EN_REVUE:  "En revue",
  VALIDEE:   "Validée",
  REJETEE:   "Rejetée",
  RETIREE:   "Retirée",
};

const STATUT_STYLES = {
  BROUILLON: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  SOUMISE:   "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
  EN_REVUE:  "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  VALIDEE:   "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  REJETEE:   "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400",
  RETIREE:   "bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatutBadge({ statut }) {
  return (
    <span className={`inline-flex min-w-[72px] items-center justify-center rounded px-2 py-0.5 text-[11px] font-semibold ${STATUT_STYLES[statut] ?? "bg-slate-100 text-slate-400"}`}>
      {STATUT_LABELS[statut] ?? statut}
    </span>
  );
}

function CandidatureRow({ c, onAction }) {
  const navigate = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState("");
  const isPending = c.statut === "SOUMISE" || c.statut === "EN_REVUE";

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
      <td className="px-6 py-4">
        <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">
          Dr. {c.medecinPrenom} {c.medecinNom}
        </p>
        {c.medecinNumeroInscription && (
          <p className="text-[11px] text-slate-400">N° {c.medecinNumeroInscription}</p>
        )}
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => navigate(`/admin/processus/elections/${c.electionId}`)}
          className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline text-left"
        >
          {c.electionTitre ?? "—"}
        </button>
      </td>
      <td className="px-6 py-4">
        {c.position?.libelle ? (
          <span className="rounded bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
            {c.position.libelle}
          </span>
        ) : (
          <span className="text-[12px] text-slate-400">—</span>
        )}
      </td>
      <td className="px-6 py-4"><StatutBadge statut={c.statut} /></td>
      <td className="px-6 py-4 text-[12px] text-slate-500 dark:text-slate-400">{formatDate(c.dateDepot)}</td>
      <td className="px-6 py-4">
        {isPending ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAction("valider", c)}
              className="flex items-center gap-1 rounded-md bg-green-700 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-green-800"
            >
              <CheckCircle2 size={11} /> Valider
            </button>
            {!rejectOpen ? (
              <button
                onClick={() => setRejectOpen(true)}
                className="flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-50"
              >
                <XCircle size={11} /> Rejeter
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Motif…"
                  className="h-7 w-36 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => { onAction("rejeter", c, comment); setRejectOpen(false); setComment(""); }}
                  className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => { setRejectOpen(false); setComment(""); }}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            )}
            <button
              onClick={() => navigate(`/admin/processus/elections/${c.electionId}`)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Eye size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/admin/processus/elections/${c.electionId}`)}
            className="flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-slate-600"
          >
            <Eye size={13} /> Voir élection
          </button>
        )}
      </td>
    </tr>
  );
}

export default function AdminCandidaturesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statutFilter, setStatutFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: PAGE_SIZE };
      if (statutFilter) params.statut = statutFilter;
      const res = await getAllCandidatures(params);
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, statutFilter]);

  useEffect(() => { load(); }, [load]);

  const [actionError, setActionError] = useState(null);

  const handleAction = async (action, c, comment = "") => {
    setActionError(null);
    try {
      if (action === "valider") await validerCandidature(c.electionId, c.id);
      else if (action === "rejeter") await rejeterCandidature(c.electionId, c.id, comment);
      load();
    } catch (err) {
      setActionError(err?.response?.data?.message ?? "Une erreur est survenue");
    }
  };

  const candidatures = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.totalElements ?? 0;
  const enAttente = candidatures.filter((c) => c.statut === "SOUMISE" || c.statut === "EN_REVUE").length;
  const validees = candidatures.filter((c) => c.statut === "VALIDEE").length;

  return (
    <AdminLayout title="Gestion des Candidats">
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-7 py-6">
        {actionError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
            {actionError}
          </div>
        )}
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total candidatures", value: total, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "En attente", value: enAttente, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "Validées", value: validees, color: "text-green-700", bg: "bg-green-50 dark:bg-green-900/20" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="overflow-hidden rounded-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5">
              <p className="text-[11px] font-semibold uppercase text-slate-400">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex items-center gap-3">
          <select
            value={statutFilter}
            onChange={(e) => { setStatutFilter(e.target.value); setPage(0); }}
            className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[13px] text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          {statutFilter && (
            <button
              onClick={() => { setStatutFilter(""); setPage(0); }}
              className="text-[12px] font-semibold text-slate-400 hover:text-slate-600"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-sm">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <tr>
                  {["Candidat", "Élection", "Poste", "Statut", "Déposée le", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Loader2 size={20} className="mx-auto animate-spin text-slate-400" />
                    </td>
                  </tr>
                ) : candidatures.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[13px] text-slate-400">
                      Aucune candidature trouvée
                    </td>
                  </tr>
                ) : (
                  candidatures.map((c) => (
                    <CandidatureRow key={c.id} c={c} onAction={handleAction} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4">
              <span className="text-[12px] text-slate-400">Page {page + 1} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-slate-200 dark:border-slate-700 p-1.5 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-slate-200 dark:border-slate-700 p-1.5 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
