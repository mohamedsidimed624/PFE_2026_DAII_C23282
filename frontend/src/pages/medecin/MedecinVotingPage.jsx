import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, CheckCircle2, Loader2, Shield, X,
  AlertCircle, Vote, Info, Circle, ChevronLeft, ChevronRight,
  Award, Building2, Hash, Users,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getElectionDetail, voter } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";
import CandidateAvatar from "../../components/elections/CandidateAvatar";
import { cn } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogClose,
} from "../../components/ui/dialog";

/* ── helpers ──────────────────────────────────────────────── */
const voteRuleText = (max) =>
  max <= 1
    ? "Vous disposez d'un vote pour ce poste"
    : `Vous pouvez sélectionner jusqu'à ${max} candidats`;

/* ── CandidateRow ─────────────────────────────────────────── */
function CandidateRow({ c, name, isRadio, isSelected, isDisabled, onToggle, onShowInfo }) {
  const isOwn = !!c.estMaCandidature;
  const effectiveDisabled = isDisabled || isOwn;
  return (
    <label
      className={cn(
        "flex min-h-[48px] items-center gap-3 rounded-xl border bg-white px-4 py-3 transition dark:bg-slate-900",
        isOwn
          ? "cursor-not-allowed border-amber-300 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/10"
          : isSelected
            ? "border-2 border-green-600 bg-green-50/60 shadow-sm dark:border-green-500 dark:bg-green-950/20"
            : effectiveDisabled
              ? "cursor-not-allowed border-slate-200 opacity-60 dark:border-slate-800"
              : "cursor-pointer border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
      )}
    >
      <input
        type={isRadio ? "radio" : "checkbox"}
        name={name}
        checked={isSelected}
        disabled={effectiveDisabled}
        onChange={() => !effectiveDisabled && onToggle()}
        className="sr-only"
        aria-label={`Dr. ${c.medecinPrenom} ${c.medecinNom}`}
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors",
          isRadio ? "rounded-full" : "rounded-md",
          isOwn
            ? "border-amber-400 bg-amber-100 dark:border-amber-700 dark:bg-amber-950/30"
            : isSelected
              ? "border-green-600 bg-green-600"
              : "border-slate-500 bg-white dark:bg-slate-900"
        )}
      >
        {isSelected && !isOwn && <Check size={16} strokeWidth={3} className="text-white" />}
      </span>

      <CandidateAvatar
        candidate={c}
        size={44}
        bgClass={isOwn ? "bg-amber-400" : isSelected ? "bg-green-600" : "bg-slate-300 dark:bg-slate-700"}
        imgClassName={isOwn ? "opacity-60" : ""}
      />

      <div className="min-w-0 flex-1">
        <p className={cn("text-[15px] font-semibold", isOwn ? "text-amber-700 dark:text-amber-300" : "text-slate-800 dark:text-slate-100")}>
          Dr. {c.medecinPrenom} {c.medecinNom}
        </p>
        <p className="truncate text-[12px] text-slate-500 dark:text-slate-400">
          {[c.specialite, c.region].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>

      {isOwn && (
        <span className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
          Votre candidature
        </span>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onShowInfo();
        }}
        aria-label={`Profil de Dr. ${c.medecinPrenom} ${c.medecinNom}`}
        className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-green-700 dark:hover:bg-slate-800"
      >
        <Info size={18} />
      </button>
    </label>
  );
}

/* ── PositionStep : affiche un seul poste avec sa liste ── */
function PositionStep({ pos, candidates, maxVotes, selected, onToggle, onShowInfo }) {
  const isRadio = maxVotes === 1;
  const key = pos?.id ?? "flat";
  const isCompleted = selected.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
              {pos?.libelle ?? "Sélection des candidats"}
            </h2>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                <CheckCircle2 size={11} /> Complété
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Circle size={11} /> À remplir
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
            {pos && (
              <>
                {pos.nombreSieges} siège{pos.nombreSieges > 1 ? "s" : ""} à pourvoir ·{" "}
              </>
            )}
            {voteRuleText(maxVotes)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold tabular-nums ${
            isCompleted
              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {selected.length}/{maxVotes}
        </span>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 mb-4" />

      {candidates.length === 0 ? (
        <p className="py-6 text-center text-[13px] italic text-slate-400">
          Aucun candidat validé pour ce poste.
        </p>
      ) : (
        <fieldset className="space-y-2">
          <legend className="sr-only">{pos?.libelle ?? "Candidats"}</legend>
          {candidates.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <CandidateRow
                c={c}
                name={`poste-${key}`}
                isRadio={isRadio}
                isSelected={selected.includes(c.id)}
                isDisabled={!selected.includes(c.id) && selected.length >= maxVotes && !isRadio}
                onToggle={() => onToggle(pos?.id ?? null, c.id, maxVotes)}
                onShowInfo={() => onShowInfo(c)}
              />
            </motion.div>
          ))}
        </fieldset>
      )}
    </div>
  );
}

/* ── Indicateur de progression globale ──────────────────── */
function ProgressIndicator({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>
          {completed}/{total} poste{completed > 1 ? "s" : ""} complété{completed > 1 ? "s" : ""}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Progression du vote"
        className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
      >
        <motion.div
          className="h-full rounded-full bg-green-500"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
    </div>
  );
}

/* ── Carte d'un candidat sélectionné (récapitulatif) ────── */
function SelectedCandidateCard({ candidate }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
      <CandidateAvatar candidate={candidate} size={32} bgClass="bg-green-600" />
      <span className="flex-1 text-[13px] font-semibold text-green-900 dark:text-green-300">
        Dr. {candidate.medecinPrenom} {candidate.medecinNom}
      </span>
      <CheckCircle2 size={16} className="shrink-0 text-green-600 dark:text-green-400" />
    </div>
  );
}

/* ── Review Step (récapitulatif avant envoi) ────────────── */
function ReviewStep({
  filledPositions,
  positionVotes,
  totalSelected,
  completedPositionsCount,
  skippedPositionsCount,
  error,
  submitting,
  onConfirm,
  onBack,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-5">
      <h2 className="text-[14px] font-bold text-slate-800 dark:text-slate-100 mb-1">Récapitulatif de votre bulletin</h2>
      <p className="mb-5 text-[12px] text-slate-500 dark:text-slate-400">
        Vérifiez vos choix avant de confirmer. Ce vote est définitif.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <p className="text-[22px] font-bold tabular-nums text-green-600 dark:text-green-400">{totalSelected}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Sélectionné{totalSelected > 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <p className="text-[22px] font-bold tabular-nums text-slate-800 dark:text-slate-100">{completedPositionsCount}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Poste{completedPositionsCount > 1 ? "s" : ""} complété{completedPositionsCount > 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <p className="text-[22px] font-bold tabular-nums text-slate-400">{skippedPositionsCount}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Non renseigné{skippedPositionsCount > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="space-y-5">
        {filledPositions.map(({ pos, candidates: posCandidates }) => {
          const key = pos?.id ?? "flat";
          const selected = positionVotes[key] ?? [];
          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {pos?.libelle ?? "Sélection"}
                </p>
                {selected.length > 0 ? (
                  <Badge className="border-green-200 bg-green-50 text-[10px] font-bold text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
                    Complété
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Vote blanc
                  </Badge>
                )}
              </div>
              {selected.length === 0 ? (
                <p className="py-2 text-[12px] italic text-slate-400">Aucun vote (Vote Blanc)</p>
              ) : (
                <div className="space-y-2 pt-2">
                  {selected.map((cid) => {
                    const c = posCandidates.find((x) => x.id === cid);
                    if (!c) return null;
                    return <SelectedCandidateCard key={cid} candidate={c} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {skippedPositionsCount > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
          <p>
            Vous n'avez fait aucune sélection pour {skippedPositionsCount} poste{skippedPositionsCount > 1 ? "s" : ""}. Vote blanc possible.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-[12px] text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600 dark:text-red-500" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronLeft size={14} /> Revenir aux postes
        </button>
        <button
          onClick={onConfirm}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-[13px] font-bold text-white transition hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Vote size={16} />}
          Confirmer mon vote
        </button>
      </div>
    </div>
  );
}

/* ── Dialogue d'informations sur un candidat ────────────── */
function CandidateInfoDialog({ candidate, open, onClose }) {
  if (!candidate) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-lg gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader className="flex-row items-center gap-3 border-b border-slate-100 px-6 py-5 text-left dark:border-slate-800">
          <CandidateAvatar candidate={candidate} size={48} bgClass="bg-green-600" />
          <div className="min-w-0">
            <DialogTitle className="text-[15px] font-bold text-slate-900 dark:text-white">
              Dr. {candidate.medecinPrenom} {candidate.medecinNom}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">Informations du candidat</DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100 border-b border-slate-100 dark:divide-slate-800 dark:border-slate-800">
          {[
            { icon: Award, label: "Poste", value: candidate.position?.libelle ?? "—" },
            { icon: Users, label: "Spécialité", value: candidate.specialite ?? "—" },
            { icon: Building2, label: "Région / Ville d'exercice", value: candidate.region ?? "—" },
            { icon: Hash, label: "N° d'inscription", value: candidate.medecinNumeroInscription ?? "—" },
          ].map(({ icon, label, value }) => {
            const Icon = icon;
            return (
              <div key={label} className="flex items-start gap-3 px-5 py-3">
                <Icon size={13} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
                  <p className="mt-0.5 text-[13px] font-medium text-slate-700 dark:text-slate-200">{value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-h-[50vh] space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Déclaration de candidature
            </h3>
            <p className="text-[13px] leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
              {candidate.declarationCandidature || "Aucune déclaration fournie."}
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Programme électoral
            </h3>
            <p className="text-[13px] leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
              {candidate.programmeElectoral || "Aucun programme fourni."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  Composant principal : wizard étape par étape              */
/* ═══════════════════════════════════════════════════════════ */
export default function MedecinVotingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [positionVotes, setPositionVotes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [infoCandidate, setInfoCandidate] = useState(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0); // 0 = premier poste, N = review (dernier step)

  useEffect(() => {
    getElectionDetail(id)
      .then((res) => setElection(res.data))
      .catch(() => setElection(null))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── données dérivées ── */
  const peutVoter = election?.peutVoter ?? (election?.statut === "VOTE_EN_COURS" && !election?.aVote);
  const candidates = election?.candidaturesEligibles ?? election?.candidatures ?? [];
  const positions = election?.positionsEligibles ?? election?.positions ?? [];
  const hasPositions = positions.length > 0;

  const getMaxVotes = (pos) =>
    pos?.maxVotesParElecteur ?? pos?.nombreSieges ?? election?.maxVotesParElecteur ?? election?.seatsCount ?? 1;

  const byPosition = hasPositions
    ? positions.map((pos) => ({
        pos,
        candidates: candidates.filter((c) => c.position?.id === pos.id),
      }))
    : [{ pos: null, candidates }];

  const filledPositions = byPosition.filter(({ candidates: pc }) =>
    pc.some((c) => !c.estMaCandidature)
  );

  const totalSteps = filledPositions.length + 1; // +1 pour la review
  const isReviewStep = currentStep === filledPositions.length;
  const isFirstStep = currentStep === 0;
  const isLastPostStep = currentStep === filledPositions.length - 1;

  /* ── gestion du vote ── */
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
  const completedPositionsCount = filledPositions.filter(
    ({ pos }) => (positionVotes[pos?.id ?? "flat"] ?? []).length > 0
  ).length;
  const skippedPositionsCount = filledPositions.length - completedPositionsCount;

  const buildPayload = () => {
    if (hasPositions) {
      const votes = positions
        .map((pos) => ({ positionId: pos.id, candidatureIds: positionVotes[pos.id] ?? [] }))
        .filter((v) => v.candidatureIds.length > 0);
      return { votes };
    }
    return { candidatureIds: positionVotes["flat"] ?? [] };
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleVote = async () => {
    if (submitting || (totalSelected === 0 && !window.confirm("Vous n'avez sélectionné aucun candidat. Confirmez-vous ce vote blanc ?"))) return;
    setSubmitting(true);
    setError("");
    try {
      await voter(id, buildPayload());
      showToast("Vote enregistré avec succès.");
      setTimeout(() => navigate("/medecin/elections"), 1800);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── navigation ── */
  const goToNext = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const goToPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const goToReview = () => setCurrentStep(filledPositions.length);

  /* ── chargement ── */
  if (loading) {
    return (
      <MedecinLayout title="Vote">
        <div className="min-h-screen bg-[#FAFBFC] px-4 py-6 dark:bg-slate-950 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="h-10 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </MedecinLayout>
    );
  }

  /* ── non éligible / déjà voté ── */
  if (!election || !peutVoter) {
    const alreadyVoted = election?.aVote === true;
    return (
      <MedecinLayout title={alreadyVoted ? "A voté" : "Vote"}>
        <div className="min-h-screen bg-[#FAFBFC] px-4 py-6 dark:bg-slate-950 sm:px-6">
          <div className="mx-auto mt-12 max-w-md text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900">
              {alreadyVoted ? (
                <CheckCircle2 size={40} className="text-green-500" />
              ) : (
                <Shield size={40} className="text-slate-400" />
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {alreadyVoted ? "Vote déjà enregistré" : "Accès restreint"}
            </h2>
            <p className="mt-3 text-[13px] text-slate-500 dark:text-slate-400">
              {alreadyVoted
                ? "Votre vote a bien été pris en compte pour cette élection. Un seul vote est autorisé."
                : (election?.raisonIneligibilite ?? "Vous ne pouvez pas participer à ce vote.")}
            </p>
            <button
              onClick={() => navigate(`/medecin/elections/${id}`)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-green-700"
            >
              Retour à l'élection
            </button>
          </div>
        </div>
      </MedecinLayout>
    );
  }

  const currentPos = isReviewStep ? null : filledPositions[currentStep];

  return (
    <MedecinLayout title="Bulletin de vote">
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
            {/* Bouton retour */}
            <button
              onClick={() => navigate(`/medecin/elections/${id}`)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft size={13} /> Quitter le vote
            </button>

            {/* Barre de progression globale */}
            <ProgressIndicator completed={completedPositionsCount} total={filledPositions.length} />

            {/* Contenu de l'étape */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                className="space-y-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
              {isReviewStep ? (
              <ReviewStep
                filledPositions={filledPositions}
                positionVotes={positionVotes}
                totalSelected={totalSelected}
                completedPositionsCount={completedPositionsCount}
                skippedPositionsCount={skippedPositionsCount}
                error={error}
                submitting={submitting}
                onConfirm={handleVote}
                onBack={goToPrev}
              />
            ) : (
              <>
                <PositionStep
                  pos={currentPos.pos}
                  candidates={currentPos.candidates}
                  maxVotes={getMaxVotes(currentPos.pos)}
                  selected={positionVotes[currentPos.pos?.id ?? "flat"] ?? []}
                  onToggle={toggleVote}
                  onShowInfo={(c) => setInfoCandidate(c)}
                />

                {/* Navigation entre postes */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={goToPrev}
                    disabled={isFirstStep || submitting}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft size={14} /> Poste précédent
                  </button>
                  <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                    Poste {currentStep + 1} sur {filledPositions.length}
                  </span>
                  {isLastPostStep ? (
                    <button
                      onClick={goToReview}
                      className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-green-700 transition disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                      Voir le récapitulatif <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={goToNext}
                      className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-green-700 transition disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                      Poste suivant <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </>
            )}
              </motion.div>
            </AnimatePresence>
        </div>
      </div>

      {/* Dialogue info candidat */}
      <CandidateInfoDialog
        candidate={infoCandidate}
        open={!!infoCandidate}
        onClose={() => setInfoCandidate(null)}
      />

      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-4 text-[13px] font-medium text-white shadow-xl"
        >
          <CheckCircle2 size={20} className="text-green-400" />
          {toastMsg}
        </div>
      )}
    </MedecinLayout>
  );
}