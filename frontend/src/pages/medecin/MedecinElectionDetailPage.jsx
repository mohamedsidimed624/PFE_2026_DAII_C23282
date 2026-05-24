import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, ChevronDown, ChevronUp, CheckCircle2,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getElectionDetail, retirerCandidature } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";

const STATUT_LABELS = {
  BROUILLON:               "Brouillon",
  CANDIDATURE_OUVERTE:     "Candidatures ouvertes",
  VALIDATION_CANDIDATURES: "Candidatures en validation",
  VOTE_EN_COURS:           "Vote en cours",
  DEPOUILLEMENT:           "Dépouillement",
  TERMINEE:                "Terminée",
  RESULTATS_PUBLIES:       "Résultats publiés",
  ARCHIVEE:                "Archivée",
  ANNULEE:                 "Annulée",
};

const STATUT_STYLES = {
  BROUILLON:               "bg-slate-100 text-slate-500",
  CANDIDATURE_OUVERTE:     "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  VALIDATION_CANDIDATURES: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  VOTE_EN_COURS:           "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DEPOUILLEMENT:           "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  TERMINEE:                "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  RESULTATS_PUBLIES:       "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ARCHIVEE:                "bg-slate-100 text-slate-400",
  ANNULEE:                 "bg-red-100 text-red-500",
};

const TYPE_LABELS = {
  CONSEIL_NATIONAL:        "Conseil National de l'Ordre",
  BUREAU_EXECUTIF:         "Bureau exécutif",
  BUREAU_SECTION_A:        "Bureau de Section A",
  BUREAU_SECTION_B:        "Bureau de Section B",
  BUREAU_SECTION_C:        "Bureau de Section C",
  REPRESENTANTS_REGIONAUX: "Représentants régionaux",
};

const CORPS_LABELS = {
  TOUS_MEDECINS_ACTIFS:     "Tous les médecins actifs",
  MEDECINS_REGION:          "Médecins de la région",
  MEDECINS_PAR_SECTION:     "Médecins répartis selon leur section",
  MEMBRES_CONSEIL_NATIONAL: "Membres du Conseil National",
  CONSEIL_SECTION_A:        "Membres du conseil de Section A",
  CONSEIL_SECTION_B:        "Membres du conseil de Section B",
  CONSEIL_SECTION_C:        "Membres du conseil de Section C",
};

const CANDIDATURE_LABELS = {
  BROUILLON: "Brouillon",
  SOUMISE:   "Soumise",
  EN_REVUE:  "En revue",
  VALIDEE:   "Validée",
  REJETEE:   "Rejetée",
  RETIREE:   "Retirée",
};

const CAND_STYLES = {
  BROUILLON: "bg-slate-100 text-slate-400",
  SOUMISE:   "bg-slate-100 text-slate-500",
  EN_REVUE:  "bg-amber-100 text-amber-600",
  VALIDEE:   "bg-green-100 text-green-700",
  REJETEE:   "bg-red-100 text-red-500",
  RETIREE:   "bg-slate-50 text-slate-400",
};

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

function CandidatCard({ c, showVotes }) {
  const [expanded, setExpanded] = useState(false);
  const initials = `${c.medecinPrenom?.[0] ?? ""}${c.medecinNom?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="border-b border-slate-100 last:border-b-0 dark:border-slate-800 px-5 py-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white text-[15px] font-bold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 dark:text-slate-100">
            Dr. {c.medecinPrenom} {c.medecinNom}
          </p>
          {c.position?.libelle && (
            <span className="inline-block rounded bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
              {c.position.libelle}
            </span>
          )}
          {c.specialite && <p className="text-[12px] text-slate-400">{c.specialite}</p>}
          {c.region && <p className="text-[12px] text-slate-400">{c.region}</p>}
          {showVotes && (
            <p className="mt-1 text-[13px] font-semibold text-blue-700 dark:text-blue-400">
              {c.nbVotes} vote(s)
            </p>
          )}
        </div>
      </div>

      {(c.declarationCandidature || c.programmeElectoral) && (
        <div className="mt-3 ml-16">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Réduire" : "Voir déclaration & programme"}
          </button>
          {expanded && (
            <div className="mt-3 space-y-3">
              {c.declarationCandidature && (
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400 mb-1">Déclaration</p>
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">{c.declarationCandidature}</p>
                </div>
              )}
              {c.programmeElectoral && (
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400 mb-1">Programme</p>
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">{c.programmeElectoral}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

  return (
    <MedecinLayout title={election.titre}>
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Header */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6">
            <button
              onClick={() => navigate("/medecin/elections")}
              className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft size={13} /> Retour aux élections
            </button>

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`rounded px-2.5 py-0.5 text-[11px] font-bold ${STATUT_STYLES[s] ?? "bg-slate-100 text-slate-500"}`}>
                    {STATUT_LABELS[s] ?? s}
                  </span>
                  {election.aVote && (
                    <span className="flex items-center gap-1 rounded bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 text-[11px] font-bold text-green-700 dark:text-green-400">
                      <CheckCircle2 size={11} /> J'ai voté
                    </span>
                  )}
                </div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{election.titre}</h1>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500">
                  {election.type && (
                    <span>{TYPE_LABELS[election.type] ?? election.type}</span>
                  )}
                  {election.corpsElectoral && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      {CORPS_LABELS[election.corpsElectoral] ?? election.corpsElectoral}
                      {election.corpsElectoral === "MEDECINS_REGION" && election.region
                        ? ` · ${election.region}`
                        : ""}
                    </span>
                  )}
                  <span>{election.seatsCount} siège(s)</span>
                </div>

                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-400">
                  {election.candidatureStartDate && (
                    <span>
                      Candidatures : {formatDateTime(election.candidatureStartDate)} → {formatDateTime(election.candidatureEndDate)}
                    </span>
                  )}
                  {election.voteStartDate && (
                    <span>
                      Vote : {formatDateTime(election.voteStartDate)} → {formatDateTime(election.voteEndDate)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                {canCandidater && (
                  <button
                    onClick={() => navigate(`/medecin/elections/${id}/candidater`)}
                    className="rounded-xl bg-[#16A34A] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#15803d]"
                  >
                    Candidater
                  </button>
                )}
                {canVote && (
                  <button
                    onClick={() => navigate(`/medecin/elections/${id}/voter`)}
                    className="rounded-xl bg-green-700 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-green-800"
                  >
                    Voter maintenant
                  </button>
                )}
                {s === "RESULTATS_PUBLIES" && (
                  <button
                    onClick={() => navigate(`/medecin/elections/${id}/resultats`)}
                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-amber-600"
                  >
                    Voir les résultats
                  </button>
                )}
              </div>
            </div>

            {election.description && (
              <p className="mt-4 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">{election.description}</p>
            )}
          </div>

          {/* Candidature section */}
          {(canCandidater || election.maCandidature || election.raisonIneligibilite) && (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-5 space-y-3">
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
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${CAND_STYLES[election.maCandidature.statut] ?? "bg-slate-100 text-slate-400"}`}>
                          {CANDIDATURE_LABELS[election.maCandidature.statut] ?? election.maCandidature.statut}
                        </span>
                      </div>
                    </div>
                    {(election.maCandidature.statut === "SOUMISE" || election.maCandidature.statut === "BROUILLON") && (
                      <button
                        onClick={handleRetirer}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-[12px] font-semibold text-red-500 hover:bg-red-50"
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
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] text-slate-600 dark:text-slate-400">
                    Les candidatures sont ouvertes. Soumettez votre dossier de candidature.
                  </p>
                  <button
                    onClick={() => navigate(`/medecin/elections/${id}/candidater`)}
                    className="shrink-0 rounded-lg bg-[#16A34A] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#15803d]"
                  >
                    Candidater
                  </button>
                </div>
              ) : null}
              {!canCandidater && !election.maCandidature && election.raisonIneligibilite && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-800 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400">
                  <span className="font-semibold">Non éligible : </span>{election.raisonIneligibilite}
                </div>
              )}
            </div>
          )}

          {/* Campaign period */}
          {s === "VALIDATION_CANDIDATURES" && (
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10 p-5">
              <p className="font-semibold text-blue-800 dark:text-blue-300 text-[14px] mb-1">Validation des candidatures en cours</p>
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                L'administration de l'ONMM examine les dossiers soumis. Les candidats validés seront publiés avant l'ouverture du vote.
              </p>
            </div>
          )}

          {/* Candidates list */}
          {candidatures.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-3.5">
                <h2 className="font-bold text-[14px] text-slate-800 dark:text-slate-100">
                  Candidats validés ({candidatures.length})
                </h2>
              </div>
              {candidatures.map((c) => (
                <CandidatCard key={c.id} c={c} showVotes={election.resultatsPublies} />
              ))}
            </div>
          )}

          {/* Sticky vote bar */}
          {canVote && (
            <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between">
              <p className="text-[13px] text-slate-600 dark:text-slate-400">Le vote est ouvert</p>
              <button
                onClick={() => navigate(`/medecin/elections/${id}/voter`)}
                className="rounded-xl bg-green-700 px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-green-800"
              >
                Voter maintenant →
              </button>
            </div>
          )}
        </div>
      </div>
    </MedecinLayout>
  );
}
