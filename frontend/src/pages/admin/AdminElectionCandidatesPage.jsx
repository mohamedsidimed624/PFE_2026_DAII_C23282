import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, CheckCircle2, XCircle, Users, AlertCircle,
  CalendarDays, FileText, ExternalLink, Clock, X, Search, RotateCcw,
  Building2, Award, ChevronLeft, ChevronRight,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getCandidaturesForElection,
  validerCandidature,
  rejeterCandidature,
  getElectionById,
} from "../../services/adminElectionApi";
import CandidateAvatar from "../../components/elections/CandidateAvatar";
import CandidatureStatusBadge from "../../components/elections/CandidatureStatusBadge";

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 15;

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  SOUMISE:   "Soumise",
  EN_REVUE:  "En revue",
  VALIDEE:   "Validée",
  REJETEE:   "Rejetée",
  RETIREE:   "Retirée",
};

const TYPE_DOC_LABELS = {
  PHOTO:               "Photo",
  LETTRE_CANDIDATURE:  "Lettre de candidature",
  PROGRAMME_ELECTORAL: "Programme électoral",
  CV_OPTIONNEL:        "CV",
  AUTRE:               "Autre document",
};

const FILTER_STATUTS = ["SOUMISE", "EN_REVUE", "VALIDEE", "REJETEE", "BROUILLON", "RETIREE"];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fullName = (c) => `${c.medecinPrenom ?? ""} ${c.medecinNom ?? ""}`.trim();

/* ─────────────────────────────────────────────────────────────
   KPI Card
───────────────────────────────────────────────────────────── */

function KpiCard({ label, value, icon: Icon, colorCls, bgCls, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="overflow-hidden rounded-md border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className={`mt-1.5 text-[26px] font-semibold leading-none ${colorCls}`}>{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${bgCls}`}>
          <Icon size={17} />
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Reject modal
───────────────────────────────────────────────────────────── */

function RejectModal({ candidate, onClose, onConfirm, zIndex = 50 }) {
  const [commentaire, setCommentaire] = useState("");

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/35 p-4"
      style={{ zIndex }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
            Rejeter la candidature
          </h3>
          {candidate && (
            <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">
              Dr. {candidate.medecinPrenom} {candidate.medecinNom}
            </p>
          )}
        </div>

        <div className="px-6 py-5">
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Motif du rejet *
          </label>
          <textarea
            rows={4}
            autoFocus
            className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[13px] leading-6 text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            placeholder="Expliquez la raison du rejet. Ce motif sera communiqué au candidat."
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Ce motif sera visible par le candidat après notification.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(commentaire)}
            disabled={!commentaire.trim()}
            className="rounded-md bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirmer le rejet
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Validate confirm modal
───────────────────────────────────────────────────────────── */

function ValidateConfirmModal({ candidate, onClose, onConfirm, loading, zIndex = 50 }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/35 p-4"
      style={{ zIndex }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
            Valider la candidature
          </h3>
          {candidate && (
            <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">
              Dr. {candidate.medecinPrenom} {candidate.medecinNom}
            </p>
          )}
        </div>

        <div className="px-6 py-5">
          <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
            Cette candidature sera marquée comme validée et le candidat sera notifié. Voulez-vous continuer ?
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-green-600 px-4 text-[13px] font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Confirmer la validation
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Candidate detail modal — centrée
───────────────────────────────────────────────────────────── */

function CandidateModal({ candidate, electionId, onClose, onRefresh }) {
  const [showReject, setShowReject] = useState(false);
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const canAct = candidate.statut === "SOUMISE" || candidate.statut === "EN_REVUE";

  const handleValider = async () => {
    setError(null);
    setLoading(true);
    setShowValidateConfirm(false);
    try {
      await validerCandidature(electionId, candidate.id);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Erreur lors de la validation.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejeter = async (commentaire) => {
    setError(null);
    setLoading(true);
    setShowReject(false);
    try {
      await rejeterCandidature(electionId, candidate.id, commentaire);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Erreur lors du rejet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showReject && (
        <RejectModal
          candidate={candidate}
          zIndex={60}
          onClose={() => setShowReject(false)}
          onConfirm={handleRejeter}
        />
      )}

      {showValidateConfirm && (
        <ValidateConfirmModal
          candidate={candidate}
          zIndex={60}
          loading={loading}
          onClose={() => setShowValidateConfirm(false)}
          onConfirm={handleValider}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <CandidateAvatar candidate={candidate} size={44} />
              <div>
                <p className="text-[16px] font-bold text-slate-900 dark:text-slate-100">
                  Dr. {candidate.medecinPrenom} {candidate.medecinNom}
                </p>
                {candidate.medecinNumeroInscription && (
                  <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                    N° {candidate.medecinNumeroInscription}
                  </p>
                )}
                <div className="mt-2">
                  <CandidatureStatusBadge statut={candidate.statut} />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100 border-b border-slate-100 dark:divide-slate-800 dark:border-slate-800">
              {[
                { icon: Award,        label: "Poste",       value: candidate.position?.libelle ?? "—" },
                { icon: Users,        label: "Spécialité",  value: candidate.specialite ?? "—" },
                { icon: Building2,    label: "Région",      value: candidate.region ?? "—" },
                { icon: CalendarDays, label: "Déposée le",  value: fmtDate(candidate.dateDepot) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 px-5 py-3">
                  <Icon size={13} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-700 dark:text-slate-200">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {candidate.commentaireValidation && candidate.statut === "REJETEE" && (
              <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-red-500">Motif du rejet</p>
                <p className="text-[13px] italic leading-relaxed text-red-700 dark:text-red-300">
                  {candidate.commentaireValidation}
                </p>
              </div>
            )}

            {candidate.declarationCandidature && (
              <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Déclaration de candidature
                </p>
                <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {candidate.declarationCandidature}
                </p>
              </div>
            )}

            {candidate.programmeElectoral && (
              <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Programme électoral
                </p>
                <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {candidate.programmeElectoral}
                </p>
              </div>
            )}

            {candidate.documents?.length > 0 && (
              <div className="px-6 py-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Documents joints ({candidate.documents.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {candidate.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <FileText size={13} className="shrink-0" />
                      {TYPE_DOC_LABELS[doc.typeDocument] ?? doc.typeDocument}
                      <ExternalLink size={10} className="ml-0.5 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mx-6 mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
            <button
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Fermer
            </button>

            {canAct && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowValidateConfirm(true)}
                  disabled={loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-green-600 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Valider
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  disabled={loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-200 px-4 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800/50 dark:text-red-400"
                >
                  <XCircle size={14} />
                  Rejeter
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Table row — style identique à AdminMedecinList
───────────────────────────────────────────────────────────── */

function CandidatureRow({ c, electionId, onRefresh, onViewDossier }) {
  const [loading, setLoading]       = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [error, setError]           = useState(null);

  const canAct = c.statut === "SOUMISE" || c.statut === "EN_REVUE";

  const handleValider = async () => {
    setError(null);
    setLoading(true);
    setShowValidateConfirm(false);
    try {
      await validerCandidature(electionId, c.id);
      onRefresh();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Erreur lors de la validation.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejeter = async (commentaire) => {
    setError(null);
    setLoading(true);
    setShowReject(false);
    try {
      await rejeterCandidature(electionId, c.id, commentaire);
      onRefresh();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Erreur lors du rejet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showReject && (
        <RejectModal
          candidate={c}
          onClose={() => setShowReject(false)}
          onConfirm={handleRejeter}
        />
      )}

      {showValidateConfirm && (
        <ValidateConfirmModal
          candidate={c}
          loading={loading}
          onClose={() => setShowValidateConfirm(false)}
          onConfirm={handleValider}
        />
      )}

      <tr className="border-b border-slate-100 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
        {/* Candidat */}
        <td className="px-7 py-4">
          <div className="flex items-center gap-3">
            <CandidateAvatar candidate={c} size={34} />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                Dr. {c.medecinPrenom} {c.medecinNom}
              </p>
              {c.medecinNumeroInscription && (
                <p className="text-[12px] text-slate-400 dark:text-slate-500">
                  N° {c.medecinNumeroInscription}
                </p>
              )}
              {error && (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <AlertCircle size={10} />
                  {error}
                </p>
              )}
            </div>
          </div>
        </td>

        {/* Poste */}
        <td className="px-7 py-4">
          {c.position?.libelle ? (
            <span className="inline-block max-w-[200px] truncate rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[12px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              {c.position.libelle}
            </span>
          ) : (
            <span className="text-[13px] text-slate-400">—</span>
          )}
        </td>

        {/* Statut */}
        <td className="px-7 py-4">
          <CandidatureStatusBadge statut={c.statut} />
        </td>

        {/* Date */}
        <td className="px-7 py-4 text-[13px] text-slate-500 dark:text-slate-400">
          {fmtDate(c.dateDepot)}
        </td>

        {/* Actions */}
        <td className="px-7 py-4">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => onViewDossier(c)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400"
              title="Voir le dossier"
              aria-label="Voir le dossier"
            >
              <FileText size={14} />
            </button>

            {canAct && (
              <>
                <button
                  onClick={() => setShowValidateConfirm(true)}
                  disabled={loading}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 dark:bg-green-900/20"
                  title="Valider"
                  aria-label="Valider"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  disabled={loading}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                  title="Rejeter"
                  aria-label="Rejeter"
                >
                  <XCircle size={14} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page principale — logique inchangée
───────────────────────────────────────────────────────────── */

export default function AdminElectionCandidatesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [election, setElection]             = useState(null);
  const [candidatures, setCandidatures]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filterStatut, setFilterStatut]     = useState("ALL");
  const [searchQuery, setSearchQuery]       = useState("");
  const [posteFilter, setPosteFilter]       = useState("");
  const [page, setPage]                     = useState(1);
  const [modalCandidate, setModalCandidate] = useState(null);

  /* Load */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [elRes, candRes] = await Promise.all([
        getElectionById(id),
        getCandidaturesForElection(id),
      ]);
      setElection(elRes.data);
      setCandidatures(candRes.data);
    } catch {
      setCandidatures([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /* Reset page on filter change */
  useEffect(() => { setPage(1); }, [searchQuery, posteFilter, filterStatut]);

  /* KPI counts */
  const kpiTotal     = candidatures.length;
  const kpiEnAttente = candidatures.filter((c) => c.statut === "SOUMISE" || c.statut === "EN_REVUE").length;
  const kpiValidees  = candidatures.filter((c) => c.statut === "VALIDEE").length;
  const kpiRejetees  = candidatures.filter((c) => c.statut === "REJETEE").length;

  /* Client-side filtering */
  const countByStatut = (s) =>
    s === "ALL" ? candidatures.length : candidatures.filter((c) => c.statut === s).length;

  const filtered = candidatures
    .filter((c) => !searchQuery || fullName(c).toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((c) => !posteFilter || c.position?.id === posteFilter)
    .filter((c) => filterStatut === "ALL" || c.statut === filterStatut);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageNumbers = (() => {
    const range = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  })();

  const positions        = election?.positions ?? [];
  const hasActiveFilters = Boolean(searchQuery || posteFilter || filterStatut !== "ALL");

  /* ── Render ─────────────────────────────────────────── */
  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">

        {/* Back + page title */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/admin/processus/elections/${id}`)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft size={14} />
            Retour à l'élection
          </button>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[17px] font-semibold text-slate-700 dark:text-slate-100">
                Candidatures
              </h1>
              {election && (
                <p className="mt-0.5 text-[13px] text-slate-400 dark:text-slate-500">
                  {election.titre}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* KPI cards */}
        {!loading && (
          <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Total"      value={kpiTotal}     icon={Users}        colorCls="text-slate-700 dark:text-slate-100"  bgCls="bg-slate-100 text-slate-500 dark:bg-slate-800"              delay={0}    />
            <KpiCard label="En attente" value={kpiEnAttente} icon={Clock}        colorCls="text-amber-600 dark:text-amber-400"  bgCls="bg-amber-50 text-amber-600 dark:bg-amber-900/20"            delay={0.05} />
            <KpiCard label="Validées"   value={kpiValidees}  icon={CheckCircle2} colorCls="text-green-700 dark:text-green-400"  bgCls="bg-green-50 text-green-600 dark:bg-green-900/20"            delay={0.1}  />
            <KpiCard label="Rejetées"   value={kpiRejetees}  icon={XCircle}      colorCls="text-red-600 dark:text-red-400"      bgCls="bg-red-50 text-red-500 dark:bg-red-900/20"                  delay={0.15} />
          </div>
        )}

        {/* Filter bar — search + poste + statut + reset */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Search by name */}
          <div className="relative w-[240px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom…"
              className="h-10 w-full rounded-md border border-slate-100 bg-white pl-8 pr-3 text-[13px] text-slate-600 shadow-sm outline-none focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Poste filter */}
          {positions.length > 1 && (
            <select
              value={posteFilter}
              onChange={(e) => setPosteFilter(e.target.value)}
              className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-500 shadow-sm outline-none focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">Tous les postes</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>{pos.libelle}</option>
              ))}
            </select>
          )}

          {/* Statut filter */}
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-500 shadow-sm outline-none focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Tous les statuts ({kpiTotal})</option>
            {FILTER_STATUTS.filter((s) => countByStatut(s) > 0).map((s) => (
              <option key={s} value={s}>{STATUT_LABELS[s]} ({countByStatut(s)})</option>
            ))}
          </select>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSearchQuery(""); setPosteFilter(""); setFilterStatut("ALL"); }}
              className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-400 shadow-sm transition hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Table — style identique à AdminMedecinList */}
        <div className="overflow-hidden rounded-md bg-white shadow-sm dark:bg-slate-900">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="w-[28%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                      Candidat
                    </th>
                    <th className="w-[24%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                      Poste
                    </th>
                    <th className="w-[14%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                      Statut
                    </th>
                    <th className="w-[16%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                      Déposée le
                    </th>
                    <th className="w-[18%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-7 py-16 text-center text-[13px] text-slate-400">
                        {hasActiveFilters
                          ? "Aucune candidature ne correspond aux filtres sélectionnés."
                          : "Aucune candidature enregistrée pour cette élection."}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((c) => (
                      <CandidatureRow
                        key={c.id}
                        c={c}
                        electionId={id}
                        onRefresh={load}
                        onViewDossier={setModalCandidate}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination — style identique à AdminMedecinList */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-7 py-5">
              <div className="text-[13px] text-slate-400">
                {filtered.length} candidature{filtered.length !== 1 ? "s" : ""}
                {filtered.length !== candidatures.length && (
                  <span className="ml-1 text-slate-300">/ {candidatures.length} au total</span>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Page précédente"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 disabled:opacity-40 dark:text-slate-600"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={page === p ? "page" : undefined}
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                        page === p
                          ? "bg-green-600 text-white"
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Page suivante"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 disabled:opacity-40 dark:text-slate-600"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Candidate detail modal */}
      <AnimatePresence>
        {modalCandidate && (
          <CandidateModal
            candidate={modalCandidate}
            electionId={id}
            onClose={() => setModalCandidate(null)}
            onRefresh={load}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
