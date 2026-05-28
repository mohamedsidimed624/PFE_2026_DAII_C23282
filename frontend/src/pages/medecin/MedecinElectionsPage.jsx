import { useState, useEffect } from "react";
import { Loader2, Vote, FileText, CheckCircle2, Trophy } from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMesElections } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";
import ElectionCard from "../../components/elections/ElectionCard";
import StatCard from "../../components/elections/StatCard";
import EmptyState from "../../components/elections/EmptyState";

const TABS = [
  { key: "participer",      label: "Participer" },
  { key: "mesCandidatures", label: "Mes candidatures" },
  { key: "resultats",       label: "Résultats" },
  { key: "toutes",          label: "Toutes" },
];

const EMPTY_CONFIGS = [
  { title: "Aucune élection en cours",          subtitle: "Les prochaines élections apparaîtront ici." },
  { title: "Aucune candidature",                subtitle: "Vous n'avez pas encore déposé de candidature." },
  { title: "Aucun résultat disponible",         subtitle: "Les résultats seront affichés après publication officielle." },
  { title: "Aucune élection",                   subtitle: "Il n'y a pas encore d'élection enregistrée." },
];

const filterByTabIndex = (list, tabIndex) => {
  if (tabIndex === 0) return list.filter((e) => ["CANDIDATURE_OUVERTE", "VALIDATION_CANDIDATURES", "VOTE_EN_COURS", "DEPOUILLEMENT"].includes(e.statut));
  if (tabIndex === 1) return list.filter((e) => e.maCandidature != null);
  if (tabIndex === 2) return list.filter((e) => e.statut === "RESULTATS_PUBLIES" || (e.statut === "ARCHIVEE" && e.resultatsPublies));
  return list;
};

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

  const filtered = filterByTabIndex(elections, tab);

  const stats = {
    actives:         elections.filter((e) => ["CANDIDATURE_OUVERTE", "VALIDATION_CANDIDATURES", "VOTE_EN_COURS", "DEPOUILLEMENT"].includes(e.statut)).length,
    voteEnCours:     elections.filter((e) => e.statut === "VOTE_EN_COURS").length,
    mesCandidatures: elections.filter((e) => e.maCandidature != null).length,
    resultats:       elections.filter((e) => e.statut === "RESULTATS_PUBLIES" || (e.statut === "ARCHIVEE" && e.resultatsPublies)).length,
  };

  return (
    <MedecinLayout title="Élections">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-5">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Élections institutionnelles</h1>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              Participez aux processus électoraux de l'Ordre National des Médecins de Mauritanie
            </p>
          </div>

          {/* Stats */}
          {!loading && !error && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Élections actives"    value={stats.actives}         icon={Vote}         color="blue" />
              <StatCard label="Vote en cours"        value={stats.voteEnCours}     icon={CheckCircle2} color="green" />
              <StatCard label="Mes candidatures"     value={stats.mesCandidatures} icon={FileText}     color="amber" />
              <StatCard label="Résultats disponibles" value={stats.resultats}       icon={Trophy}       color="emerald" />
            </div>
          )}

          {/* Tabs + list */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Tab bar */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
              {TABS.map((t, i) => {
                const count = filterByTabIndex(elections, i).length;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(i)}
                    className={`flex shrink-0 items-center gap-1.5 border-b-2 px-5 py-3.5 text-[12px] font-semibold transition-colors ${
                      tab === i
                        ? "border-[#16A34A] text-[#16A34A]"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {t.label}
                    {count > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        tab === i
                          ? "bg-[#16A34A]/10 text-[#16A34A]"
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
              <div className="flex h-32 items-center justify-center px-6">
                <p className="text-[13px] text-red-500 text-center">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Vote}
                title={EMPTY_CONFIGS[tab]?.title ?? "Aucune élection"}
                subtitle={EMPTY_CONFIGS[tab]?.subtitle}
              />
            ) : (
              <div className="p-4 space-y-3">
                {filtered.map((e, i) => <ElectionCard key={e.id} e={e} index={i} />)}
              </div>
            )}
          </div>

        </div>
      </div>
    </MedecinLayout>
  );
}
