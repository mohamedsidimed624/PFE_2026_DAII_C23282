import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, CheckCircle2,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getElectionDetail, retirerCandidature } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";
import ElectionStatusBadge from "../../components/elections/ElectionStatusBadge";
import { ORGANE_LABELS } from "../../components/elections/ElectionTypeBadge";
import CandidatureStatusBadge from "../../components/elections/CandidatureStatusBadge";
import ElectionTimeline from "../../components/elections/ElectionTimeline";

const CORPS_LABELS = {
  TOUS_MEDECINS_ACTIFS:     "Tous les médecins actifs",
  MEDECINS_REGION:          "Médecins de la région",
  MEDECINS_PAR_SECTION:     "Médecins répartis selon leur section",
  MEMBRES_CONSEIL_NATIONAL: "Membres du Conseil National",
  CONSEIL_SECTION_A:        "Membres du conseil de Section A",
  CONSEIL_SECTION_B:        "Membres du conseil de Section B",
  CONSEIL_SECTION_C:        "Membres du conseil de Section C",
};

const STATUT_ORDER = [
  "BROUILLON", "CANDIDATURE_OUVERTE", "VALIDATION_CANDIDATURES",
  "VOTE_EN_COURS", "DEPOUILLEMENT", "RESULTATS_PUBLIES", "ARCHIVEE",
];

function computeTimelineStatus(currentStatut, targetStatut) {
  const curr = STATUT_ORDER.indexOf(currentStatut);
  const tgt  = STATUT_ORDER.indexOf(targetStatut);
  if (curr < 0 || tgt < 0) return "pending";
  if (curr > tgt) return "done";
  if (curr === tgt) return "active";
  return "pending";
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : null;

export default function MedecinElectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getElectionDetail(id);
      setElection(res.data);
    } catch (err) {
      setLoadError(extractApiError(err));
      setElection(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleRetirer = async () => {
    if (!window.confirm("Confirmer le retrait de votre candidature ?")) return;
    setActionError(null);
    try {
      await retirerCandidature(id);
      load();
    } catch (err) {
      setActionError(extractApiError(err));
    }
  };

  if (loading) {
    return (
      <MedecinLayout title="Chargement…">
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      </MedecinLayout>
    );
  }

  if (!election) {
    return (
      <MedecinLayout title="Introuvable">
        <div className="px-4 py-12 text-center text-slate-400">
          {loadError
            ? <span className="text-red-500">{loadError}</span>
            : "Élection introuvable."}
        </div>
      </MedecinLayout>
    );
  }

  const s = election.statut;
  const canCandidater = election.peutCandidater ?? (s === "CANDIDATURE_OUVERTE" && !election.maCandidature);
  const canVote       = election.peutVoter       ?? (s === "VOTE_EN_COURS"       && !election.aVote);
  const candidatures  = election.candidatures ?? [];
  const positions     = election.positions ?? [];

  return (
    <MedecinLayout title={election.titre}>
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Election card */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6">
            <button
              onClick={() => navigate("/medecin/elections")}
              className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft size={13} /> Retour aux élections
            </button>

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <ElectionStatusBadge statut={s} />
                  {election.aVote && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                      <CheckCircle2 size={10} /> Votre vote est enregistré
                    </span>
                  )}
                </div>

                {ORGANE_LABELS[election.type] && (
                  <p className="text-[12px] font-semibold text-green-600 dark:text-green-400 mb-1">
                    {ORGANE_LABELS[election.type]}
                  </p>
                )}
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{election.titre}</h1>

                {/* Corps */}
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {election.corpsElectoral && (
                    <span className="inline-flex rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400">
                      {CORPS_LABELS[election.corpsElectoral] ?? election.corpsElectoral}
                      {election.corpsElectoral === "MEDECINS_REGION" && election.region ? ` · ${election.region}` : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions — top-right */}
              {(canCandidater || canVote || s === "RESULTATS_PUBLIES" || positions.length > 0 || candidatures.length > 0) && (
                <div className="flex flex-wrap gap-2 shrink-0">
                  {canCandidater && (
                    <button
                      onClick={() => navigate(`/medecin/elections/${id}/candidater`)}
                      className="rounded-full bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-blue-700 transition"
                    >
                      Candidater
                    </button>
                  )}
                  {(positions.length > 0 || candidatures.length > 0) && (
                    <button
                      onClick={() => navigate(`/medecin/elections/${id}/candidats`)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                    >
                      Voir les candidatures
                    </button>
                  )}
                  {canVote && (
                    <button
                      onClick={() => navigate(`/medecin/elections/${id}/voter`)}
                      className="rounded-full bg-green-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-green-700 transition"
                    >
                      Commencer le vote
                    </button>
                  )}
                  {s === "RESULTATS_PUBLIES" && (
                    <button
                      onClick={() => navigate(`/medecin/elections/${id}/resultats`)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                    >
                      Voir les résultats
                    </button>
                  )}
                </div>
              )}
            </div>

            {election.description && (
              <p className="mt-4 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">{election.description}</p>
            )}

            {/* Already voted */}
            {election.aVote && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10 p-4">
                <CheckCircle2 size={20} className="shrink-0 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300 text-[14px]">
                    Votre vote a été enregistré
                  </p>
                  <p className="text-[12px] text-green-700 dark:text-green-400 mt-0.5">
                    Votre participation à cette élection est confirmée. Un seul vote est autorisé par élection.
                  </p>
                </div>
              </div>
            )}

            {/* Process timeline */}
            <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-5">
              <p className="text-[11px] font-bold uppercase text-slate-400 mb-3">Processus électoral</p>
              <ElectionTimeline steps={[
                { label: "Candidatures",  date: formatDate(election.candidatureStartDate), status: computeTimelineStatus(s, "CANDIDATURE_OUVERTE") },
                { label: "Validation",    date: formatDate(election.candidatureEndDate),   status: computeTimelineStatus(s, "VALIDATION_CANDIDATURES") },
                { label: "Vote",          date: formatDate(election.voteStartDate),        status: computeTimelineStatus(s, "VOTE_EN_COURS") },
                { label: "Dépouillement", date: null,                                      status: computeTimelineStatus(s, "DEPOUILLEMENT") },
                { label: "Résultats",     date: null,                                      status: computeTimelineStatus(s, "RESULTATS_PUBLIES") },
              ]} />
            </div>

            {/* Candidature section */}
            {/* {(canCandidater || election.maCandidature || election.raisonIneligibilite) && (
              <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                {actionError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
                    {actionError}
                  </div>
                )}
                {election.maCandidature ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-[14px]">Votre candidature</p>
                        <div className="mt-1">
                          <CandidatureStatusBadge statut={election.maCandidature.statut} />
                        </div>
                      </div>
                      {(election.maCandidature.statut === "SOUMISE" || election.maCandidature.statut === "BROUILLON") && (
                        <button
                          onClick={handleRetirer}
                          className="rounded-full border border-red-200 px-3 py-1.5 text-[12px] font-semibold text-red-500 hover:bg-red-50"
                        >
                          Retirer ma candidature
                        </button>
                      )}
                    </div>
                    {election.maCandidature.statut === "REJETEE" && election.maCandidature.commentaireValidation && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">
                        <span className="font-semibold">Motif du rejet : </span>{election.maCandidature.commentaireValidation}
                      </div>
                    )}
                  </div>
                ) : canCandidater ? (
                  <p className="text-[13px] text-slate-600 dark:text-slate-400">
                    Les candidatures sont ouvertes. Soumettez votre dossier de candidature.
                  </p>
                ) : null}
                {!canCandidater && !election.maCandidature && election.raisonIneligibilite && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-800 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400">
                    <span className="font-semibold">Non éligible : </span>{election.raisonIneligibilite}
                  </div>
                )}
              </div>
            )} */}

            {/* Campaign period */}
            {/* {s === "VALIDATION_CANDIDATURES" && (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10 p-4">
                <p className="font-semibold text-blue-800 dark:text-blue-300 text-[14px] mb-1">Validation des candidatures en cours</p>
                <p className="text-[12px] text-blue-700 dark:text-blue-400">
                  L'administration de l'ONMM examine les dossiers soumis. Les candidats validés seront publiés avant l'ouverture du vote.
                </p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}
