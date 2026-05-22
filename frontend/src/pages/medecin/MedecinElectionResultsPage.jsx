import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Trophy, CheckCircle2, Users,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getElectionDetail } from "../../services/medecinElectionApi";

export default function MedecinElectionResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElectionDetail(id)
      .then((res) => setElection(res.data))
      .catch(() => setElection(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MedecinLayout title="Résultats">
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      </MedecinLayout>
    );
  }

  if (!election || (election.statut !== "RESULTATS_PUBLIES" && election.statut !== "ARCHIVEE")) {
    return (
      <MedecinLayout title="Résultats">
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
          <Trophy size={32} className="text-slate-200 dark:text-slate-700" />
          <p className="text-[13px]">Les résultats ne sont pas encore disponibles.</p>
          <button
            onClick={() => navigate(`/medecin/elections/${id}`)}
            className="text-[12px] font-semibold text-blue-600 hover:underline"
          >
            Retour à l'élection
          </button>
        </div>
      </MedecinLayout>
    );
  }

  const candidatures = election.candidatures ?? [];
  const positions = election.positions ?? [];
  const hasPositions = positions.length > 0;

  const byPosition = hasPositions
    ? positions.map((pos) => ({
        pos,
        candidates: [...candidatures.filter((c) => c.position?.id === pos.id)]
          .sort((a, b) => b.nbVotes - a.nbVotes),
      }))
    : [{ pos: null, candidates: [...candidatures].sort((a, b) => b.nbVotes - a.nbVotes) }];

  const contientExAequo = candidatures.some((c) => c.exAequo);
  const quorumPourcentage = election.quorumPourcentage;
  const tauxParticipation = election.tauxParticipation ?? 0;
  const quorumAtteint = quorumPourcentage == null || tauxParticipation >= quorumPourcentage;
  const nbVotants = election.nbVotants ?? 0;
  const nbElecteursEligibles = election.nbElecteursEligibles ?? 0;

  return (
    <MedecinLayout title="Résultats de l'élection">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
          <button
            onClick={() => navigate(`/medecin/elections/${id}`)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={13} /> Retour à l'élection
          </button>

          {/* Header */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                <Trophy size={22} className="text-amber-600" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 dark:text-slate-100 text-[16px]">{election.titre}</h1>
                <span className="inline-block rounded bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                  Résultats publiés
                </span>
              </div>
            </div>

            {/* Participation summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
                <p className="text-[11px] text-slate-400 mb-0.5">Votants</p>
                <p className="text-[18px] font-bold text-[#0F172A] dark:text-slate-100">{nbVotants}</p>
                {nbElecteursEligibles > 0 && (
                  <p className="text-[10px] text-slate-400">sur {nbElecteursEligibles}</p>
                )}
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
                <p className="text-[11px] text-slate-400 mb-0.5">Participation</p>
                <p className="text-[18px] font-bold text-[#0F172A] dark:text-slate-100">
                  {tauxParticipation.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
                <p className="text-[11px] text-slate-400 mb-0.5">Sièges</p>
                <p className="text-[18px] font-bold text-[#0F172A] dark:text-slate-100">{election.seatsCount}</p>
              </div>
            </div>

            {/* Quorum banner */}
            {quorumPourcentage != null && (
              <div className={`mt-3 rounded-xl px-4 py-3 flex items-center gap-2 ${
                quorumAtteint
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-orange-50 border border-orange-200 text-orange-800"
              }`}>
                <CheckCircle2 size={14} className={quorumAtteint ? "text-green-600" : "text-orange-500"} />
                <p className="text-[12px] font-semibold">
                  {quorumAtteint
                    ? `Quorum atteint (${tauxParticipation.toFixed(1)}% ≥ ${quorumPourcentage}%)`
                    : `Quorum non atteint (${tauxParticipation.toFixed(1)}% < ${quorumPourcentage}% requis)`
                  }
                </p>
              </div>
            )}

            {/* Ex-aequo warning */}
            {contientExAequo && (
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-[12px] font-semibold text-amber-800">
                  Des candidats sont à égalité de voix. Un tirage au sort ou une procédure complémentaire peut être nécessaire.
                </p>
              </div>
            )}
          </div>

          {/* Results per position */}
          {byPosition.map(({ pos, candidates }, gi) => (
            <motion.div
              key={pos?.id ?? "flat"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {pos && (
                <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between">
                  <h2 className="font-bold text-[14px] text-slate-800 dark:text-slate-100">{pos.libelle}</h2>
                  <span className="text-[11px] text-slate-400">{pos.nombreSieges} siège(s)</span>
                </div>
              )}

              {candidates.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-[13px] text-slate-400">
                  <Users size={18} className="mr-2 text-slate-300" /> Aucun candidat
                </div>
              ) : (
                candidates.map((c, rank) => {
                  const isWinner = pos ? rank < (pos.nombreSieges ?? 1) : rank < election.seatsCount;
                  const initials = `${c.medecinPrenom?.[0] ?? ""}${c.medecinNom?.[0] ?? ""}`.toUpperCase();
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center gap-4 px-5 py-4 border-b last:border-b-0 border-slate-50 dark:border-slate-800/60 ${
                        isWinner ? "bg-green-50/40 dark:bg-green-900/5" : ""
                      }`}
                    >
                      <span className={`shrink-0 w-6 text-center text-[13px] font-bold ${
                        isWinner ? "text-green-700 dark:text-green-400" : "text-slate-400"
                      }`}>
                        {rank + 1}
                      </span>

                      {c.medecinPhotoUrl ? (
                        <img src={c.medecinPhotoUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white ${
                          isWinner ? "bg-green-600" : "bg-slate-400"
                        }`}>
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            Dr. {c.medecinPrenom} {c.medecinNom}
                          </p>
                          {isWinner && (
                            <span className="flex items-center gap-1 rounded bg-green-100 dark:bg-green-900/20 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                              <CheckCircle2 size={9} /> Élu(e)
                            </span>
                          )}
                          {c.exAequo && (
                            <span className="rounded bg-amber-100 dark:bg-amber-900/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                              Ex-æquo
                            </span>
                          )}
                        </div>
                        {c.specialite && <p className="text-[11px] text-slate-400">{c.specialite}</p>}
                        {c.region && <p className="text-[11px] text-slate-400">{c.region}</p>}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className={`text-[15px] font-bold ${isWinner ? "text-green-700 dark:text-green-400" : "text-slate-500"}`}>
                          {c.nbVotes}
                        </p>
                        <p className="text-[10px] text-slate-400">vote(s)</p>
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </MedecinLayout>
  );
}
