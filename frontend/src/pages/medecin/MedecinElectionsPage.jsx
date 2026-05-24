import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Vote, ChevronRight, Loader2 } from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMesElections } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";

const STATUT_LABELS = {
  BROUILLON:               "Brouillon",
  CANDIDATURE_OUVERTE:     "Candidatures ouvertes",
  VALIDATION_CANDIDATURES: "Validation",
  VOTE_EN_COURS:           "Vote en cours",
  DEPOUILLEMENT:           "Dépouillement",
  TERMINEE:                "Terminée",
  RESULTATS_PUBLIES:       "Résultats publiés",
  ARCHIVEE:                "Archivée",
  ANNULEE:                 "Annulée",
};

const TYPE_LABELS = {
  CONSEIL_NATIONAL:        "Conseil National de l'Ordre",
  BUREAU_EXECUTIF:         "Bureau exécutif",
  BUREAU_SECTION_A:        "Bureau de Section A",
  BUREAU_SECTION_B:        "Bureau de Section B",
  BUREAU_SECTION_C:        "Bureau de Section C",
  REPRESENTANTS_REGIONAUX: "Représentants régionaux",
};

const STATUT_STYLES = {
  BROUILLON:               "bg-slate-100 text-slate-500",
  CANDIDATURE_OUVERTE:     "bg-blue-100 text-blue-700",
  VALIDATION_CANDIDATURES: "bg-amber-100 text-amber-700",
  VOTE_EN_COURS:           "bg-green-100 text-green-700",
  DEPOUILLEMENT:           "bg-purple-100 text-purple-700",
  TERMINEE:                "bg-slate-200 text-slate-600",
  RESULTATS_PUBLIES:       "bg-emerald-100 text-emerald-700",
  ARCHIVEE:                "bg-slate-100 text-slate-400",
  ANNULEE:                 "bg-red-100 text-red-500",
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

const TABS = [
  { key: "participer",      label: "Participer" },
  { key: "mesCandidatures", label: "Mes candidatures" },
  { key: "resultats",       label: "Résultats" },
];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";

function ElectionRow({ e, i }) {
  const navigate = useNavigate();
  const s = e.statut;

  const canCandidater = e.peutCandidater ?? (s === "CANDIDATURE_OUVERTE" && !e.maCandidature);
  const canVote       = e.peutVoter       ?? (s === "VOTE_EN_COURS"       && !e.aVote);
  const hasVoted      = !!e.aVote;
  const hasResultats  = s === "RESULTATS_PUBLIES" || (s === "ARCHIVEE" && e.resultatsPublies);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
    >
      <div
        className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        onClick={() => navigate(`/medecin/elections/${e.id}`)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 mt-0.5">
          <Vote size={18} className="text-blue-600 dark:text-blue-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className="font-semibold text-[14px] text-slate-800 dark:text-slate-100">{e.titre}</p>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${STATUT_STYLES[s] ?? "bg-slate-100 text-slate-500"}`}>
              {STATUT_LABELS[s] ?? s}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400">
            <span>{TYPE_LABELS[e.type] ?? e.type}</span>
            {e.region && <span>· {e.region}</span>}
            <span>· {e.seatsCount} siège(s)</span>
          </div>

          <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-slate-400">
            <span>Candidatures : {formatDate(e.candidatureStartDate)} → {formatDate(e.candidatureEndDate)}</span>
            <span>Vote : {formatDate(e.voteStartDate)} → {formatDate(e.voteEndDate)}</span>
          </div>

          {e.maCandidature && (
            <div className="mt-1.5">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${CAND_STYLES[e.maCandidature.statut] ?? "bg-slate-100 text-slate-400"}`}>
                Ma candidature : {CANDIDATURE_LABELS[e.maCandidature.statut] ?? e.maCandidature.statut}
              </span>
            </div>
          )}

          {!canCandidater && !canVote && e.raisonIneligibilite && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              Non éligible : {e.raisonIneligibilite}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canCandidater && (
            <button
              onClick={(ev) => { ev.stopPropagation(); navigate(`/medecin/elections/${e.id}/candidater`); }}
              className="rounded-lg bg-blue-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-800 transition"
            >
              Candidater
            </button>
          )}
          {canVote && (
            <button
              onClick={(ev) => { ev.stopPropagation(); navigate(`/medecin/elections/${e.id}/voter`); }}
              className="rounded-lg bg-green-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-green-800 transition"
            >
              Voter
            </button>
          )}
          {hasVoted && !canVote && (
            <span className="rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-[12px] font-semibold text-green-700 dark:text-green-400">
              ✓ Voté
            </span>
          )}
          {hasResultats && (
            <button
              onClick={(ev) => { ev.stopPropagation(); navigate(`/medecin/elections/${e.id}/resultats`); }}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-amber-600 transition"
            >
              Résultats
            </button>
          )}
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
        </div>
      </div>
    </motion.div>
  );
}

export default function MedecinElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    getMesElections({ size: 100 })
      .then((res) => setElections(res.data?.content ?? []))
      .catch((err) => setError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filterByTabIndex = (list, tabIndex) => {
    if (tabIndex === 0) {
      return list.filter((e) =>
        ["CANDIDATURE_OUVERTE", "VALIDATION_CANDIDATURES", "VOTE_EN_COURS", "DEPOUILLEMENT"].includes(e.statut)
      );
    }
    if (tabIndex === 1) {
      return list.filter((e) => e.maCandidature != null);
    }
    if (tabIndex === 2) {
      return list.filter((e) =>
        e.statut === "RESULTATS_PUBLIES" || (e.statut === "ARCHIVEE" && e.resultatsPublies)
      );
    }
    return list;
  };

  const filtered = filterByTabIndex(elections, tab);

  return (
    <MedecinLayout title="Élections">
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Élections institutionnelles</h1>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              Participez aux processus électoraux de l'ONMM
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Tab bar */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              {TABS.map((t, i) => {
                const count = filterByTabIndex(elections, i).length;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(i)}
                    className={`flex items-center gap-1.5 border-b-2 px-5 py-3.5 text-[12px] font-semibold transition-colors ${
                      tab === i
                        ? "border-[#0F766E] text-[#0F766E] dark:border-teal-500 dark:text-teal-400"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {t.label}
                    {count > 0 && (
                      <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        tab === i
                          ? "bg-[#0F766E]/10 text-[#0F766E]"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            ) : error ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-[13px] text-red-500">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                <Vote size={32} className="mb-3 text-slate-200 dark:text-slate-700" />
                <p className="text-[13px]">Aucune élection dans cette catégorie</p>
              </div>
            ) : (
              filtered.map((e, i) => <ElectionRow key={e.id} e={e} i={i} />)
            )}
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}
