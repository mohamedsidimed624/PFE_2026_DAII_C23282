import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Calendar, Award } from "lucide-react";
import ElectionStatusBadge from "./ElectionStatusBadge";
import { ORGANE_LABELS } from "./ElectionTypeBadge";
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
  const nbPostes       = e.positions?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/medecin/elections/${e.id}`)}
      className="group cursor-pointer rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="min-w-0 flex-1">
          {/* Status */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <ElectionStatusBadge statut={s} />
            {e.region && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {e.region}
              </span>
            )}
          </div>

          {/* Organe + titre */}
          {ORGANE_LABELS[e.type] && (
            <p className="text-[11px] font-semibold text-green-600 dark:text-green-400 mb-0.5">
              {ORGANE_LABELS[e.type]}
            </p>
          )}
          <h3 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 leading-snug mb-2">
            {e.titre}
          </h3>

          {/* Postes + date limite */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 mb-2">
            {nbPostes > 0 && (
              <span className="flex items-center gap-1">
                <Award size={11} /> {nbPostes} poste{nbPostes > 1 ? "s" : ""} à pourvoir
              </span>
            )}
            {e.voteEndDate ? (
              <span className="flex items-center gap-1">
                <Calendar size={11} /> Vote jusqu'au {formatDate(e.voteEndDate)}
              </span>
            ) : e.voteStartDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} /> Vote à partir du {formatDate(e.voteStartDate)}
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
            {/* {!canCandidater && !canVote && !hasVoted && e.raisonIneligibilite && (
              <span className="inline-flex rounded-full bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                Non éligible
              </span>
            )} */}
          </div>

          {/* {e.raisonIneligibilite && !canCandidater && !canVote && (
            <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 leading-snug">
              {e.raisonIneligibilite}
            </p>
          )} */}
        </div>

        {/* CTAs */}
        <div className="flex w-full shrink-0 flex-row flex-wrap items-center gap-2 sm:ml-2 sm:mt-0.5 sm:w-auto sm:flex-col sm:items-end">
          {canCandidater && (
            <button
              onClick={(ev) => { ev.stopPropagation(); navigate(`/medecin/elections/${e.id}/candidater`); }}
              className="rounded-full bg-blue-600 px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700 transition whitespace-nowrap"
            >
              Candidater
            </button>
          )}
          {canVote && (
            <button
              onClick={(ev) => { ev.stopPropagation(); navigate(`/medecin/elections/${e.id}/voter`); }}
              className="rounded-full bg-green-600 px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-green-700 transition whitespace-nowrap"
            >
              Commencer le vote
            </button>
          )}
          {hasResultats && (
            <button
              onClick={(ev) => { ev.stopPropagation(); navigate(`/medecin/elections/${e.id}/resultats`); }}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition whitespace-nowrap"
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
