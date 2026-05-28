import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  FileText, ExternalLink, Users,
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
import EmptyState from "../../components/elections/EmptyState";

const STATUT_STYLES = {
  BROUILLON:  "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  SOUMISE:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  EN_REVUE:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  VALIDEE:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  REJETEE:    "bg-red-100 text-red-500 dark:bg-red-900/20",
  RETIREE:    "bg-slate-100 text-slate-400 dark:bg-slate-800",
};

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  SOUMISE:   "Soumise",
  EN_REVUE:  "En revue",
  VALIDEE:   "Validée",
  REJETEE:   "Rejetée",
  RETIREE:   "Retirée",
};

const TYPE_DOC_LABELS = {
  PHOTO:              "Photo",
  LETTRE_CANDIDATURE: "Lettre de candidature",
  PROGRAMME_ELECTORAL:"Programme électoral",
  CV_OPTIONNEL:       "CV",
  AUTRE:              "Autre",
};

function RejectModal({ onClose, onConfirm }) {
  const [commentaire, setCommentaire] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 p-6 space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Rejeter la candidature</h3>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-[13px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-400"
          placeholder="Motif du rejet (visible par le candidat)…"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(commentaire)}
            className="flex-1 rounded-lg bg-red-500 py-2 text-[13px] font-semibold text-white hover:bg-red-600"
          >
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  );
}

function CandidatureCard({ c, electionId, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState(null);
  const handleValider = async () => {
    setError(null);
    setLoading(true);
    try { await validerCandidature(electionId, c.id); onRefresh(); }
    catch (err) { setError(err?.response?.data?.message ?? "Erreur lors de la validation"); }
    finally { setLoading(false); }
  };

  const handleRejeter = async (commentaire) => {
    setError(null);
    setLoading(true);
    setShowReject(false);
    try { await rejeterCandidature(electionId, c.id, commentaire); onRefresh(); }
    catch (err) { setError(err?.response?.data?.message ?? "Erreur lors du rejet"); }
    finally { setLoading(false); }
  };

  const canAct = c.statut === "SOUMISE" || c.statut === "EN_REVUE";

  return (
    <div className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
      {showReject && <RejectModal onClose={() => setShowReject(false)} onConfirm={handleRejeter} />}

      <div className="flex items-start gap-4 px-5 py-4">
        <CandidateAvatar candidate={c} size={44} />

        <div className="min-w-0 flex-1">
          {error && (
            <div className="mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-slate-800 dark:text-slate-100">
              Dr. {c.medecinPrenom} {c.medecinNom}
            </p>
            <CandidatureStatusBadge statut={c.statut} />
          </div>
          {c.medecinNumeroInscription && (
            <p className="text-[11px] text-slate-400">N° {c.medecinNumeroInscription}</p>
          )}
          {c.specialite && <p className="text-[11px] text-slate-400">{c.specialite}</p>}
          {c.region && <p className="text-[11px] text-slate-400">{c.region}</p>}
          <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
            Soumise le {new Date(c.dateDepot).toLocaleDateString("fr-FR")}
          </p>

          {c.commentaireValidation && c.statut === "REJETEE" && (
            <p className="mt-1 text-[12px] text-red-500 italic">{c.commentaireValidation}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canAct && (
            <>
              <button
                onClick={handleValider}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle2 size={12} /> Valider
              </button>
              <button
                onClick={() => setShowReject(true)}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={12} /> Rejeter
              </button>
            </>
          )}
          {(c.declarationCandidature || c.programmeElectoral || c.documents?.length > 0) && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-400 hover:text-slate-600"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="ml-[72px] mr-5 pb-4 space-y-3">
          {c.declarationCandidature && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Déclaration</p>
              <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">{c.declarationCandidature}</p>
            </div>
          )}
          {c.programmeElectoral && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Programme</p>
              <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">{c.programmeElectoral}</p>
            </div>
          )}
          {c.documents?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Documents</p>
              <div className="flex flex-wrap gap-2">
                {c.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition"
                  >
                    <FileText size={11} />
                    {TYPE_DOC_LABELS[doc.typeDocument] ?? doc.typeDocument}
                    <ExternalLink size={9} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminElectionCandidatesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState("ALL");

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

  const positions = election?.positions ?? [];
  const hasPositions = positions.length > 0;

  const filtered = filterStatut === "ALL"
    ? candidatures
    : candidatures.filter((c) => c.statut === filterStatut);

  const byPosition = hasPositions
    ? positions.map((pos) => ({
        pos,
        candidates: filtered.filter((c) => c.position?.id === pos.id),
      }))
    : [{ pos: null, candidates: filtered }];

  const noPosition = hasPositions
    ? filtered.filter((c) => !c.position)
    : [];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/admin/processus/elections/${id}`)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft size={13} /> Retour à l'élection
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Candidatures</h1>
              {election && (
                <p className="text-[13px] text-slate-400">{election.titre}</p>
              )}
            </div>

            <select
              className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-[12px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="ALL">Tous les statuts ({candidatures.length})</option>
              {Object.entries(STATUT_LABELS).map(([k, v]) => {
                const count = candidatures.filter((c) => c.statut === k).length;
                return count > 0 ? <option key={k} value={k}>{v} ({count})</option> : null;
              })}
            </select>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {byPosition.map(({ pos, candidates }, gi) => (
                <motion.div
                  key={pos?.id ?? "flat"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.05 }}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  {pos && (
                    <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex items-center justify-between">
                      <h2 className="font-bold text-[13px] text-slate-800 dark:text-slate-100">{pos.libelle}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{pos.nombreSieges} siège(s)</span>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          {candidates.length} candidat(s)
                        </span>
                      </div>
                    </div>
                  )}

                  {candidates.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="Aucune candidature"
                      subtitle={filterStatut !== "ALL" ? "Essayez un autre filtre de statut." : "Aucune candidature n'a encore été déposée."}
                    />
                  ) : (
                    candidates.map((c) => (
                      <CandidatureCard key={c.id} c={c} electionId={id} onRefresh={load} />
                    ))
                  )}
                </motion.div>
              ))}

              {hasPositions && noPosition.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
                    <h2 className="font-bold text-[13px] text-slate-500">Sans poste attribué</h2>
                  </div>
                  {noPosition.map((c) => (
                    <CandidatureCard key={c.id} c={c} electionId={id} onRefresh={load} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
