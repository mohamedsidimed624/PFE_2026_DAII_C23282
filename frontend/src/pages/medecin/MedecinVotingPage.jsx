import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Loader2, Vote, Shield, AlertTriangle,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getElectionDetail, voter } from "../../services/medecinElectionApi";

const VIEWS = ["intro", "selection", "confirmation", "success"];

function ProgressBar({ step, total }) {
  const pct = total > 0 ? ((step + 1) / total) * 100 : 0;
  return (
    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 fixed top-0 left-0 right-0 z-50">
      <motion.div
        className="h-1 bg-green-600"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ ease: "easeOut" }}
      />
    </div>
  );
}

function CandidateCard({ c, isSelected, isDisabled, isRadio, onToggle }) {
  const initials = `${c.medecinPrenom?.[0] ?? ""}${c.medecinNom?.[0] ?? ""}`.toUpperCase();
  const photo = c.medecinPhotoUrl;

  return (
    <button
      onClick={() => !isDisabled && onToggle(c.id)}
      className={`w-full text-left rounded-xl border p-4 transition ${
        isSelected
          ? "border-green-500 bg-green-50 dark:bg-green-900/10"
          : isDisabled
          ? "border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed"
          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 hover:bg-blue-50/40 dark:hover:bg-blue-900/10"
      }`}
    >
      <div className="flex items-center gap-4">
        {photo ? (
          <img src={photo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${
            isSelected ? "bg-green-600" : "bg-blue-700"
          }`}>
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            Dr. {c.medecinPrenom} {c.medecinNom}
          </p>
          {c.specialite && <p className="text-[12px] text-slate-400">{c.specialite}</p>}
          {c.region && <p className="text-[11px] text-slate-400">{c.region}</p>}
          {c.declarationCandidature && (
            <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {c.declarationCandidature}
            </p>
          )}
        </div>
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center ${
          isRadio ? "rounded-full" : "rounded"
        } border-2 ${
          isSelected
            ? "border-green-500 bg-green-500"
            : "border-slate-300 dark:border-slate-600"
        }`}>
          {isSelected && <CheckCircle2 size={12} className="text-white" />}
        </div>
      </div>
    </button>
  );
}

export default function MedecinVotingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("intro");
  const [positionVotes, setPositionVotes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getElectionDetail(id)
      .then((res) => setElection(res.data))
      .catch(() => setElection(null))
      .finally(() => setLoading(false));
  }, [id]);

  const candidates = election?.candidatures ?? [];
  const positions = election?.positions ?? [];
  const hasPositions = positions.length > 0;

  const byPosition = hasPositions
    ? positions.map((pos) => ({
        pos,
        candidates: candidates.filter((c) => c.position?.id === pos.id),
      })).filter((g) => g.candidates.length > 0)
    : [{ pos: null, candidates }];

  const toggleVote = (posId, cid, maxVotes) => {
    const key = posId ?? "flat";
    setPositionVotes((prev) => {
      const current = prev[key] ?? [];
      if (current.includes(cid)) return { ...prev, [key]: current.filter((x) => x !== cid) };
      if (current.length >= maxVotes) {
        if (maxVotes === 1) return { ...prev, [key]: [cid] };
        return prev;
      }
      return { ...prev, [key]: [...current, cid] };
    });
  };

  const totalSelected = Object.values(positionVotes).flat().length;

  const buildPayload = () => {
    if (hasPositions) {
      const votes = positions
        .map((pos) => ({ positionId: pos.id, candidatureIds: positionVotes[pos.id] ?? [] }))
        .filter((v) => v.candidatureIds.length > 0);
      return { votes };
    }
    return { candidatureIds: positionVotes["flat"] ?? [] };
  };

  const handleVote = async () => {
    setSubmitting(true);
    setError("");
    try {
      await voter(id, buildPayload());
      setView("success");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Erreur lors du vote");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MedecinLayout title="Vote">
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      </MedecinLayout>
    );
  }

  if (!election || election.statut !== "VOTE_EN_COURS" || election.aVote) {
    return (
      <MedecinLayout title="Vote">
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
          <Vote size={32} className="text-slate-200 dark:text-slate-700" />
          <p className="text-[13px]">
            {election?.aVote ? "Vous avez déjà voté pour cette élection." : "Le vote n'est pas disponible."}
          </p>
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

  const viewIndex = VIEWS.indexOf(view);

  return (
    <MedecinLayout title="Vote électronique">
      {view !== "success" && <ProgressBar step={viewIndex} total={VIEWS.length - 1} />}

      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-xl">
          <AnimatePresence mode="wait">

            {/* INTRO */}
            {view === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="space-y-5"
              >
                <button
                  onClick={() => navigate(`/medecin/elections/${id}`)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft size={13} /> Retour
                </button>

                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                      <Vote size={24} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{election.titre}</p>
                      <p className="text-[12px] text-slate-400">
                        {candidates.length} candidat(s) · {hasPositions ? `${positions.length} poste(s)` : `${election.seatsCount} siège(s)`}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 flex gap-3">
                    <Shield size={16} className="mt-0.5 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-[13px] font-semibold text-blue-800 dark:text-blue-300 mb-0.5">Confidentialité du vote</p>
                      <p className="text-[12px] text-blue-700 dark:text-blue-400">
                        Votre participation est enregistrée afin d'empêcher le double vote. Le contenu de votre vote reste confidentiel.
                      </p>
                    </div>
                  </div>

                  <div className="text-[13px] text-slate-600 dark:text-slate-400 space-y-1">
                    {hasPositions ? (
                      positions.map((pos) => (
                        <p key={pos.id}>
                          <strong>{pos.libelle}</strong> — sélectionnez {pos.nombreSieges === 1 ? "un candidat" : `jusqu'à ${pos.nombreSieges} candidats`}
                        </p>
                      ))
                    ) : (
                      <p>Sélectionnez jusqu'à <strong>{election.maxVotesParElecteur ?? election.seatsCount}</strong> candidat(s).</p>
                    )}
                    <p className="pt-1">Ce vote est <strong>définitif et irréversible</strong>.</p>
                  </div>

                  <button
                    onClick={() => setView("selection")}
                    className="w-full rounded-xl bg-green-700 py-3 text-[14px] font-semibold text-white hover:bg-green-800 transition"
                  >
                    Commencer le vote
                  </button>
                </div>
              </motion.div>
            )}

            {/* SELECTION */}
            {view === "selection" && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {byPosition.map(({ pos, candidates: posCandidates }) => {
                  const key = pos?.id ?? "flat";
                  const maxVotes = pos?.nombreSieges ?? election.maxVotesParElecteur ?? election.seatsCount;
                  const isRadio = maxVotes === 1;
                  const selected = positionVotes[key] ?? [];

                  return (
                    <div key={key} className="space-y-3">
                      {pos && (
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="font-bold text-slate-800 dark:text-slate-100">{pos.libelle}</h2>
                            <p className="text-[12px] text-slate-400">
                              {isRadio ? "Sélectionnez un candidat (bouton radio)" : `Sélectionnez jusqu'à ${maxVotes} candidats (cases à cocher)`}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                            selected.length > 0
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                          }`}>
                            {selected.length} / {maxVotes}
                          </span>
                        </div>
                      )}

                      {!pos && (
                        <div className="flex items-center justify-between">
                          <h2 className="font-bold text-slate-800 dark:text-slate-100">
                            Sélectionnez jusqu'à {maxVotes} candidat(s)
                          </h2>
                          <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                            selected.length > 0
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                          }`}>
                            {selected.length} / {maxVotes}
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        {posCandidates.length === 0 ? (
                          <p className="text-[13px] text-slate-400 text-center py-4">Aucun candidat pour ce poste</p>
                        ) : posCandidates.map((c) => (
                          <CandidateCard
                            key={c.id}
                            c={c}
                            isSelected={selected.includes(c.id)}
                            isDisabled={!selected.includes(c.id) && selected.length >= maxVotes && !isRadio}
                            isRadio={isRadio}
                            onToggle={(cid) => toggleVote(pos?.id ?? null, cid, maxVotes)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => setView("confirmation")}
                  disabled={totalSelected === 0}
                  className="w-full rounded-xl bg-green-700 py-3 text-[14px] font-semibold text-white hover:bg-green-800 disabled:opacity-40 transition"
                >
                  Confirmer ma sélection ({totalSelected} candidat(s))
                </button>
              </motion.div>
            )}

            {/* CONFIRMATION */}
            {view === "confirmation" && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="font-bold text-slate-800 dark:text-slate-100 text-[16px]">Votre bulletin de vote</h2>

                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  {byPosition.map(({ pos, candidates: posCandidates }) => {
                    const key = pos?.id ?? "flat";
                    const selected = positionVotes[key] ?? [];
                    if (selected.length === 0) return null;
                    return (
                      <div key={key}>
                        {pos && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] font-semibold uppercase text-slate-400">{pos.libelle}</p>
                          </div>
                        )}
                        {selected.map((cid) => {
                          const c = posCandidates.find((x) => x.id === cid);
                          if (!c) return null;
                          const initials = `${c.medecinPrenom?.[0] ?? ""}${c.medecinNom?.[0] ?? ""}`.toUpperCase();
                          return (
                            <div key={cid} className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 border-slate-50 dark:border-slate-800">
                              {c.medecinPhotoUrl ? (
                                <img src={c.medecinPhotoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white text-[12px] font-bold">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                  Dr. {c.medecinPrenom} {c.medecinNom}
                                </p>
                                {c.specialite && <p className="text-[11px] text-slate-400">{c.specialite}</p>}
                              </div>
                              <CheckCircle2 size={16} className="ml-auto text-green-500 shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 flex gap-3">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  <p className="text-[12px] text-amber-700 dark:text-amber-400">
                    Ce vote est <strong>définitif et irréversible</strong>. Assurez-vous de votre choix avant de confirmer.
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 flex gap-3">
                  <Shield size={14} className="mt-0.5 shrink-0 text-blue-600" />
                  <p className="text-[12px] text-blue-700 dark:text-blue-400">
                    Votre participation est enregistrée afin d'empêcher le double vote. Le contenu de votre vote reste confidentiel.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-[12px] text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setView("selection")}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleVote}
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-green-700 py-2.5 text-[13px] font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Confirmer mon vote"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* SUCCESS */}
            {view === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-6"
                >
                  <CheckCircle2 size={40} className="text-green-600" />
                </motion.div>

                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Vote enregistré avec succès
                </h2>
                <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-1">
                  Votre vote a bien été pris en compte.
                </p>
                <p className="text-[12px] text-slate-400 mb-8">
                  Votre participation a été enregistrée. Le contenu de votre vote reste confidentiel.
                </p>

                <button
                  onClick={() => navigate("/medecin/elections")}
                  className="rounded-xl bg-green-700 px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-green-800"
                >
                  Retour aux élections
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </MedecinLayout>
  );
}
