import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Loader2, Vote, Shield, AlertTriangle,
  Lock, EyeOff, X, FileText,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getElectionDetail, voter } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";
import CandidateAvatar from "../../components/elections/CandidateAvatar";
import ElectionStatusBadge from "../../components/elections/ElectionStatusBadge";
import ElectionTypeBadge from "../../components/elections/ElectionTypeBadge";

const VIEWS = ["intro", "selection", "confirmation", "success"];

/* ---- Barre de progression raffinée ---- */
function ProgressBar({ step, total }) {
  const pct = total > 0 ? ((step + 1) / total) * 100 : 0;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-100 dark:bg-slate-800">
      <motion.div
        className="h-1 rounded-r-full bg-green-600"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ ease: "easeOut", duration: 0.5 }}
      />
    </div>
  );
}

/* ---- Badges de sécurité améliorés ---- */
function SecurityBadgesRow() {
  const items = [
    { icon: Lock, label: "Vote unique" },
    { icon: EyeOff, label: "Vote secret" },
    { icon: Shield, label: "Vote irréversible" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
        >
          <item.icon size={12} /> {item.label}
        </span>
      ))}
    </div>
  );
}

/* ---- En-tête du scrutin ---- */
function BallotHeader({ election, candidatesCount, positionsCount }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{election.titre}</h1>
        <ElectionStatusBadge statut={election.statut} />
        <ElectionTypeBadge type={election.type} />
      </div>
      <p className="text-sm text-slate-500">
        {positionsCount > 0 ? `${positionsCount} poste(s) · ` : ""}{candidatesCount} candidat(s)
      </p>
      <SecurityBadgesRow />
    </div>
  );
}

/* ---- Ligne candidat retravaillée ---- */
function CandidateRow({ c, isSelected, isDisabled, isRadio, onToggle, isOwnCandidature, onShowProgramme }) {
  const effectiveDisabled = isDisabled || isOwnCandidature;
  const hasProgramme = !!(c.programmeElectoral || c.declarationCandidature);

  return (
    <div
      role="button"
      tabIndex={effectiveDisabled ? -1 : 0}
      onClick={() => !effectiveDisabled && onToggle(c.id)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !effectiveDisabled) {
          e.preventDefault();
          onToggle(c.id);
        }
      }}
      className={`flex items-center gap-4 px-4 py-3 transition-all duration-200 rounded-lg ${
        isOwnCandidature
          ? "bg-amber-50/80 dark:bg-amber-950/30 cursor-not-allowed"
          : isSelected
          ? "bg-green-50/70 dark:bg-green-950/40 border-l-4 border-green-600"
          : isDisabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-transparent"
      }`}
    >
      <CandidateAvatar
        candidate={c}
        size={36}
        bgClass={isOwnCandidature ? "bg-amber-400" : isSelected ? "bg-green-600" : "bg-slate-700"}
        imgClassName={isOwnCandidature ? "opacity-60" : ""}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className={`text-sm font-semibold truncate ${isOwnCandidature ? "text-amber-700 dark:text-amber-300" : "text-slate-800 dark:text-slate-100"}`}>
            Dr. {c.medecinPrenom} {c.medecinNom}
          </p>
          {isOwnCandidature && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
              Votre candidature
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">
          {[c.specialite, c.region].filter(Boolean).join(" · ") || "—"}
        </p>
        {isOwnCandidature ? (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Vous ne pouvez pas voter pour vous-même.
          </p>
        ) : (
          hasProgramme && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowProgramme(c);
              }}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:underline dark:text-green-400"
            >
              <FileText size={12} /> Voir le programme
            </button>
          )
        )}
      </div>
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center ${
          isRadio ? "rounded-full" : "rounded-md"
        } border-2 transition-all ${
          isOwnCandidature
            ? "border-amber-200 dark:border-amber-700"
            : isSelected
            ? "border-green-600 bg-green-600"
            : "border-slate-300 dark:border-slate-600"
        }`}
      >
        {isSelected && !isOwnCandidature && <CheckCircle2 size={14} className="text-white" />}
      </div>
    </div>
  );
}

/* ---- Section de poste ---- */
function BallotPositionSection({ pos, posCandidates, maxVotes, isRadio, selected, toggleVote, onShowProgramme }) {
  const instruction = isRadio ? "Choisir 1 candidat" : `Choisir jusqu'à ${maxVotes} candidats`;

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">{pos?.libelle ?? instruction}</p>
          {pos && <p className="text-xs text-slate-500">{instruction}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
          selected.length > 0
            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800"
        }`}>
          {selected.length} / {maxVotes}
        </span>
      </div>
      <div className="divide-y dark:divide-slate-800">
        {posCandidates.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400 text-center">Aucun candidat pour ce poste</p>
        ) : posCandidates.map((c) => (
          <CandidateRow
            key={c.id}
            c={c}
            isSelected={selected.includes(c.id)}
            isDisabled={!selected.includes(c.id) && selected.length >= maxVotes && !isRadio}
            isRadio={isRadio}
            onToggle={(cid) => toggleVote(pos?.id ?? null, cid, maxVotes)}
            isOwnCandidature={!!c.estMaCandidature}
            onShowProgramme={onShowProgramme}
          />
        ))}
      </div>
    </div>
  );
}

/* ---- Récapitulatif latéral ---- */
function SelectionSummarySidebar({ byPosition, positionVotes, getMaxVotes, totalSelected }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-8 rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Récapitulatif</p>
        <div className="space-y-2">
          {byPosition.map(({ pos }) => {
            const key = pos?.id ?? "flat";
            const max = getMaxVotes(pos);
            const selected = (positionVotes[key] ?? []).length;
            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="truncate text-slate-600 dark:text-slate-300">{pos?.libelle ?? "Liste des candidats"}</span>
                <span className={`ml-2 font-bold tabular-nums ${selected > 0 ? "text-green-600" : "text-slate-400"}`}>
                  {selected}/{max}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm font-bold dark:border-slate-800">
          <span className="text-slate-700 dark:text-slate-200">Total sélectionné</span>
          <span className="tabular-nums text-green-600">{totalSelected}</span>
        </div>
      </div>
    </aside>
  );
}

/* ---- Modale programme ---- */
function ProgrammeModal({ candidate, onClose }) {
  if (!candidate) return null;
  const content = candidate.programmeElectoral || candidate.declarationCandidature;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4 dark:border-slate-800">
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Dr. {candidate.medecinPrenom} {candidate.medecinNom}
          </p>
          <button onClick={onClose} aria-label="Fermer" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Programme électoral</p>
          <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{content}</p>
        </div>
        <div className="flex justify-end border-t px-5 py-4 dark:border-slate-800">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Pied collant (actions principales) ---- */
function StickyFooter({ view, submitting, onBack, onPrimary, primaryLabel, primaryDisabled }) {
  return (
    <div className="sticky bottom-0 z-40 -mx-4 mt-8 flex items-center justify-between gap-4 border-t bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:-mx-6 sm:px-8">
      <button
        onClick={onBack}
        className="rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {view === "confirmation" ? "Modifier" : "Retour"}
      </button>
      <button
        onClick={onPrimary}
        disabled={primaryDisabled || submitting}
        className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {primaryLabel}
      </button>
    </div>
  );
}

/* ============================= */
/* Composant principal amélioré  */
/* ============================= */
export default function MedecinVotingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("intro");
  const [positionVotes, setPositionVotes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [programmeCandidate, setProgrammeCandidate] = useState(null);

  useEffect(() => {
    getElectionDetail(id)
      .then((res) => setElection(res.data))
      .catch(() => setElection(null))
      .finally(() => setLoading(false));
  }, [id]);

  const peutVoter = election?.peutVoter ?? (election?.statut === "VOTE_EN_COURS" && !election?.aVote);
  const candidates = election?.candidaturesEligibles ?? election?.candidatures ?? [];
  const positions = election?.positionsEligibles ?? election?.positions ?? [];
  const hasPositions = positions.length > 0;

  const getMaxVotes = (pos) =>
    pos?.maxVotesParElecteur ?? pos?.nombreSieges ?? election?.maxVotesParElecteur ?? election?.seatsCount ?? 1;

  const byPosition = hasPositions
    ? positions.map((pos) => ({ pos, candidates: candidates.filter((c) => c.position?.id === pos.id) }))
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
    if (submitting || totalSelected === 0) return;
    setSubmitting(true);
    setError("");
    try {
      await voter(id, buildPayload());
      setView("success");
    } catch (err) {
      setError(extractApiError(err));
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

  if (!election || !peutVoter) {
    const alreadyVoted = election?.aVote === true;
    return (
      <MedecinLayout title={alreadyVoted ? "Vote déjà enregistré" : "Vote"}>
        <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-8 sm:px-6 flex items-start justify-center">
          <div className="w-full max-w-md mt-10">
            <button
              onClick={() => navigate(`/medecin/elections/${id}`)}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft size={14} /> Retour à l'élection
            </button>
            <div className="rounded-2xl border bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center text-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                alreadyVoted ? "bg-green-50 dark:bg-green-950" : "bg-amber-50 dark:bg-amber-950"
              }`}>
                {alreadyVoted ? <CheckCircle2 size={32} className="text-green-600" /> : <Shield size={32} className="text-amber-500" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {alreadyVoted ? "Vote déjà enregistré" : "Accès au vote impossible"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {alreadyVoted
                    ? "Vous avez déjà voté pour cette élection. Un seul vote est autorisé."
                    : (election?.raisonIneligibilite ?? "Le vote n'est pas disponible pour cette élection.")}
                </p>
              </div>
              <button
                onClick={() => navigate(`/medecin/elections/${id}`)}
                className="mt-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                Retour à l'élection
              </button>
            </div>
          </div>
        </div>
      </MedecinLayout>
    );
  }

  const viewIndex = VIEWS.indexOf(view);

  return (
    <MedecinLayout title="Vote électronique">
      {view !== "success" && <ProgressBar step={viewIndex} total={VIEWS.length - 1} />}

      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">

          {/* Introduction professionnelle */}
          {view === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-auto max-w-lg space-y-5"
            >
              <button
                onClick={() => navigate(`/medecin/elections/${id}`)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft size={14} /> Retour
              </button>

              <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950">
                    <Vote size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{election.titre}</p>
                    <p className="text-sm text-slate-500">
                      {candidates.length} candidat(s) · {hasPositions ? `${positions.length} poste(s)` : `${election.seatsCount ?? getMaxVotes(null)} siège(s)`}
                    </p>
                  </div>
                </div>

                <SecurityBadgesRow />

                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
                  <p>
                    Cette élection comporte <strong>{candidates.length} candidat(s)</strong>
                    {hasPositions ? ` répartis sur ${positions.length} poste(s)` : ""}.
                  </p>
                  {hasPositions ? (
                    positions.map((pos) => {
                      const max = getMaxVotes(pos);
                      return (
                        <p key={pos.id}>
                          <strong>{pos.libelle}</strong> — {max === 1 ? "1 candidat à sélectionner" : `jusqu'à ${max} candidats à sélectionner`}
                        </p>
                      );
                    })
                  ) : (
                    <p>Sélectionnez jusqu'à <strong>{getMaxVotes(null)}</strong> candidat(s).</p>
                  )}
                  <p className="pt-1">Vous pouvez laisser un poste sans sélection (vote partiel autorisé).</p>
                  <p>Ce vote est <strong>définitif et irréversible</strong>.</p>
                </div>

                <button
                  onClick={() => setView("selection")}
                  className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 transition"
                >
                  Commencer le vote
                </button>
              </div>
            </motion.div>
          )}

          {/* Sélection optimisée */}
          {view === "selection" && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-7xl"
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                <div className="space-y-5">
                  <BallotHeader election={election} candidatesCount={candidates.length} positionsCount={positions.length} />

                  {byPosition.map(({ pos, candidates: posCandidates }) => {
                    const key = pos?.id ?? "flat";
                    const maxVotes = getMaxVotes(pos);
                    const isRadio = maxVotes === 1;
                    const selected = positionVotes[key] ?? [];

                    return (
                      <BallotPositionSection
                        key={key}
                        pos={pos}
                        posCandidates={posCandidates}
                        maxVotes={maxVotes}
                        isRadio={isRadio}
                        selected={selected}
                        toggleVote={toggleVote}
                        onShowProgramme={setProgrammeCandidate}
                      />
                    );
                  })}
                </div>

                <SelectionSummarySidebar
                  byPosition={byPosition}
                  positionVotes={positionVotes}
                  getMaxVotes={getMaxVotes}
                  totalSelected={totalSelected}
                />
              </div>

              <StickyFooter
                view="selection"
                submitting={submitting}
                onBack={() => navigate(`/medecin/elections/${id}`)}
                onPrimary={() => setView("confirmation")}
                primaryLabel={`Vérifier mon bulletin (${totalSelected})`}
                primaryDisabled={totalSelected === 0}
              />
            </motion.div>
          )}

          {/* Confirmation plus claire */}
          {view === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-3xl space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Vérification finale du bulletin</h2>
                <p className="text-sm text-slate-500">Vérifiez vos sélections avant de confirmer. Ce vote est définitif.</p>
              </div>

              <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {byPosition.map(({ pos, candidates: posCandidates }) => {
                  const key = pos?.id ?? "flat";
                  const selected = positionVotes[key] ?? [];
                  return (
                    <div key={key} className="border-b last:border-b-0 dark:border-slate-800">
                      <div className="flex items-center justify-between border-b bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{pos?.libelle ?? "Sélection"}</p>
                        <span className="text-xs font-bold text-slate-400">{selected.length} sélection(s)</span>
                      </div>
                      {selected.length === 0 ? (
                        <p className="px-5 py-4 text-sm italic text-slate-400">Aucune sélection</p>
                      ) : (
                        <div className="divide-y dark:divide-slate-800">
                          {selected.map((cid) => {
                            const c = posCandidates.find((x) => x.id === cid);
                            if (!c) return null;
                            return (
                              <div key={cid} className="flex items-center gap-3 px-5 py-3">
                                <CandidateAvatar candidate={c} size={32} bgClass="bg-green-600" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                                    Dr. {c.medecinPrenom} {c.medecinNom}
                                  </p>
                                  {c.specialite && <p className="truncate text-xs text-slate-500">{c.specialite}</p>}
                                </div>
                                <CheckCircle2 size={16} className="shrink-0 text-green-600" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Ce vote est <strong>définitif et irréversible</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/40">
                <EyeOff size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Votre participation est enregistrée pour empêcher le double vote ; le contenu de votre vote reste confidentiel.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-start gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                <Lock size={16} className="mt-0.5 shrink-0 text-green-600" />
                <div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">Validation finale du vote</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    En confirmant, votre bulletin sera transmis et enregistré de façon définitive et irréversible. Aucune modification ne sera possible après confirmation.
                  </p>
                </div>
              </div>

              <StickyFooter
                view="confirmation"
                submitting={submitting}
                onBack={() => setView("selection")}
                onPrimary={handleVote}
                primaryLabel="Confirmer mon vote"
                primaryDisabled={false}
              />
            </motion.div>
          )}

          {/* Succès avec animation soignée */}
          {view === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto flex max-w-lg flex-col items-center py-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-950 mb-6"
              >
                <CheckCircle2 size={40} className="text-green-600" />
              </motion.div>

              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Vote enregistré avec succès
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-400 mb-1">
                Votre vote pour <strong>{election?.titre}</strong> a bien été enregistré.
              </p>
              <p className="text-sm text-slate-400 mb-8">
                Un seul vote est autorisé par élection. Votre participation est confirmée et ne peut pas être modifiée.
              </p>

              <button
                onClick={() => navigate("/medecin/elections")}
                className="rounded-xl bg-green-600 px-6 py-3 text-base font-semibold text-white hover:bg-green-700 transition shadow-md"
              >
                Retour aux élections
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <ProgrammeModal candidate={programmeCandidate} onClose={() => setProgrammeCandidate(null)} />
    </MedecinLayout>
  );
}