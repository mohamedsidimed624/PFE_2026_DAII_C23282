import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Trophy, CheckCircle2, Users, BarChart2,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getElectionDetail } from "../../services/medecinElectionApi";
import CandidateAvatar from "../../components/elections/CandidateAvatar";
import ElectionStatusBadge from "../../components/elections/ElectionStatusBadge";
import ElectionTypeBadge from "../../components/elections/ElectionTypeBadge";
import StatCard from "../../components/elections/StatCard";

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

  if (!election ||
      (election.statut !== "RESULTATS_PUBLIES" &&
       !(election.statut === "ARCHIVEE" && election.resultatsPublies))) {
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
  const tauxParticipation = election.tauxParticipation ?? 0;
  const nbVotants = election.nbVotants ?? 0;
  const nbElecteursEligibles = election.nbElecteursEligibles ?? 0;

  return (
    <MedecinLayout title="Résultats de l'élection">
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
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
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-slate-800 dark:text-slate-100 text-[16px]">{election.titre}</h1>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <ElectionStatusBadge statut={election.statut} />
                  <ElectionTypeBadge type={election.type} />
                  {election.corpsElectoral && (
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {CORPS_LABELS[election.corpsElectoral] ?? election.corpsElectoral}
                      {election.corpsElectoral === "MEDECINS_REGION" && election.region
                        ? ` · ${election.region}`
                        : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Participation summary */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Votants"
                value={nbVotants}
                icon={Users}
                color="blue"
                sub={nbElecteursEligibles > 0 ? `sur ${nbElecteursEligibles}` : undefined}
              />
              <StatCard
                label="Participation"
                value={`${tauxParticipation.toFixed(1)}%`}
                icon={BarChart2}
                color="emerald"
              />
              <StatCard
                label="Sièges"
                value={election.seatsCount ?? "—"}
                icon={Trophy}
                color="amber"
              />
            </div>

            {/* Ex-aequo warning */}
            {contientExAequo && (
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 dark:bg-amber-900/10 dark:border-amber-700">
                <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-300">
                  Des candidats sont à égalité de voix. Une décision administrative peut être nécessaire selon les règles internes applicables.
                </p>
              </div>
            )}
          </div>

          {/* Results per position */}
          {byPosition.map(({ pos, candidates }, gi) => {
            const totalVotesPosition = candidates.reduce((sum, c) => sum + (c.nbVotes ?? 0), 0);
            return (
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
                    const nombreSieges = pos?.nombreSieges ?? election.seatsCount ?? 1;
                    const isWinner = c.estElu ?? c.elu ?? (rank < nombreSieges);
                    const votePct = totalVotesPosition > 0 ? ((c.nbVotes ?? 0) / totalVotesPosition) * 100 : 0;
                    return (
                      <div
                        key={c.id}
                        className={`flex items-center gap-4 px-5 py-4 border-b last:border-b-0 border-slate-50 dark:border-slate-800/60 transition-colors ${
                          isWinner
                            ? "bg-green-50/60 dark:bg-green-900/10"
                            : ""
                        }`}
                      >
                        <span className={`shrink-0 w-6 text-center text-[13px] font-bold ${
                          isWinner ? "text-green-700 dark:text-green-400" : "text-slate-400"
                        }`}>
                          {rank + 1}
                        </span>

                        <CandidateAvatar
                          candidate={c}
                          size={44}
                          bgClass={isWinner ? "bg-green-600" : "bg-slate-400"}
                        />

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
                            {c.nbVotes ?? 0}
                          </p>
                          <p className="text-[10px] text-slate-400">{votePct.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            );
          })}

          {/* Official ONMM footer */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center shadow-sm">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Résultats publiés officiellement par l'administration de l'Ordre National des Médecins de Mauritanie (ONMM).
            </p>
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}
