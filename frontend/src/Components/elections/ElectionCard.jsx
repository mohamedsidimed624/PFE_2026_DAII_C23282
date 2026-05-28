import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Users, Calendar } from "lucide-react";
import ElectionStatusBadge from "./ElectionStatusBadge";
import ElectionTypeBadge from "./ElectionTypeBadge";
import CandidatureStatusBadge from "./CandidatureStatusBadge";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";

export default function ElectionCard({ e, index = 0 }) {
  const navigate = useNavigate();
  const s = e.statut;

  const canCandidater  = e.peutCandidater ?? false;
  const canVote        = e.peutVoter ?? false;
  const hasVoted       = !!e.aVote;
  const hasResultats   = s === "RESULTATS_PUBLIES" || (s === "ARCHIVEE" && e.resultatsPublies);
  const hasCandidature = !!e.maCandidature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/medecin/elections/${e.id}`)}
      className="group cursor-pointer rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all p-5"
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <ElectionStatusBadge statut={s} />
            <ElectionTypeBadge type={e.type} />
            {e.region && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {e.region}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 leading-snug mb-2">
            {e.titre}
          </h3>

          {/* Calendar */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 mb-2">
            {e.candidatureStartDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                Candidatures : {formatDate(e.candidatureStartDate)} → {formatDate(e.candidatureEndDate)}
              </span>
            )}
            {e.voteStartDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                Vote : {formatDate(e.voteStartDate)} → {formatDate(e.voteEndDate)}
              </span>
            )}
            {e.seatsCount > 0 && (
              <span className="flex items-center gap-1">
                <Users size={11} /> {e.seatsCount} siège(s)
              </span>
            )}
          </div>

          {/* Personal state chips */}
          <div className="flex flex-wrap gap-1.5">
            {hasCandidature && (
              <CandidatureStatusBadge statut={e.maCandidature.statut} />
            )}
            {hasVoted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                <CheckCircle2 size={10} /> Déjà voté
              </span>
            )}
            {!canCandidater && !canVote && !hasVoted && e.raisonIneligibilite && (
              <span className="inline-flex rounded-full bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                Non éligible
              </span>
            )}
          </div>

          {e.raisonIneligibilite && !canCandidater && !canVote && (
            <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 leading-snug">
              {e.raisonIneligibilite}
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="flex shrink-0 flex-col items-end gap-2 ml-2 mt-0.5">
          {canCandidater && (
            <button
              onClick={(ev) => { ev.stopPropagation(); navigate(`/medecin/elections/${e.id}/candidater`); }}
              className="rounded-xl bg-blue-700 px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-800 transition whitespace-nowrap"
            >
              Candidater
            </button>
          )}
          {canVote && (
            <button
              onClick={(ev) => { ev.stopPropagation(); navigate(`/medecin/elections/${e.id}/voter`); }}
              className="rounded-xl bg-[#16A34A] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#15803d] transition whitespace-nowrap"
            >
              Voter
            </button>
          )}
          {hasResultats && (
            <button
              onClick={(ev) => { ev.stopPropagation(); navigate(`/medecin/elections/${e.id}/resultats`); }}
              className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-amber-700 transition whitespace-nowrap"
            >
              Résultats
            </button>
          )}
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 mt-1 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition" />
        </div>
      </div>
    </motion.div>
  );
}
