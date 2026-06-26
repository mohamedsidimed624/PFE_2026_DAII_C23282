import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  Search,
  Vote,
} from "lucide-react";

import MedecinLayout from "../../components/medecin/MedecinLayout";
import ElectionCard from "../../components/elections/ElectionCard";
import { getMesElections } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";

const ACTIVE_STATUSES = [
  "CANDIDATURE_OUVERTE",
  "VALIDATION_CANDIDATURES",
  "VOTE_EN_COURS",
  "DEPOUILLEMENT",
];

const TABS = [
  { key: "participer", label: "À participer" },
  { key: "candidatures", label: "Mes candidatures" },
  { key: "resultats", label: "Résultats" },
  { key: "toutes", label: "Toutes" },
];

const EMPTY_MESSAGES = {
  participer: {
    title: "Aucune action électorale en cours",
    subtitle:
      "Les élections ouvertes à la candidature ou au vote apparaîtront ici.",
  },
  candidatures: {
    title: "Aucune candidature déposée",
    subtitle:
      "Vos candidatures aux élections ordinales seront listées dans cet espace.",
  },
  resultats: {
    title: "Aucun résultat publié",
    subtitle:
      "Les résultats officiels seront disponibles après validation par l’administration.",
  },
  toutes: {
    title: "Aucune élection disponible",
    subtitle: "Aucune élection n’est encore enregistrée dans votre espace.",
  },
};

function isResultAvailable(election) {
  return (
    election.statut === "RESULTATS_PUBLIES" ||
    (election.statut === "ARCHIVEE" && election.resultatsPublies)
  );
}

function isActiveElection(election) {
  return ACTIVE_STATUSES.includes(election.statut);
}

function needsAction(election) {
  if (!isActiveElection(election)) return false;
  if (election.peutCandidater) return true;
  if (election.peutVoter) return true;
  const statutCandidature = election.maCandidature?.statut;
  return statutCandidature === "BROUILLON" || statutCandidature === "SOUMISE" || statutCandidature === "EN_REVUE";
}

function getVoteStart(election) {
  return (
    election.voteStartDate ||
    election.dateDebutVote ||
    election.voteDebut ||
    election.dateDebut ||
    election.startDate
  );
}

function getCandidatureStart(election) {
  return (
    election.candidatureStartDate ||
    election.dateDebutCandidature ||
    election.candidatureDebut
  );
}

function filterByTab(list, tabKey) {
  if (tabKey === "participer") {
    return list.filter(needsAction);
  }

  if (tabKey === "candidatures") {
    return list.filter((e) => e.maCandidature != null);
  }

  if (tabKey === "resultats") {
    return list.filter(isResultAvailable);
  }

  return list;
}

function sortElections(list) {
  return [...list].sort((a, b) => {
    const priority = {
      VOTE_EN_COURS: 1,
      CANDIDATURE_OUVERTE: 2,
      VALIDATION_CANDIDATURES: 3,
      DEPOUILLEMENT: 4,
      RESULTATS_PUBLIES: 5,
      ARCHIVEE: 6,
      ANNULEE: 7,
    };

    const pa = priority[a.statut] || 99;
    const pb = priority[b.statut] || 99;

    if (pa !== pb) return pa - pb;

    const da = new Date(getVoteStart(a) || getCandidatureStart(a) || 0).getTime();
    const db = new Date(getVoteStart(b) || getCandidatureStart(b) || 0).getTime();

    return db - da;
  });
}

function LoadingState() {
  return (
    <div className="flex h-44 items-center justify-center">
      <Loader2 size={22} className="animate-spin text-green-500" />
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400">
        <AlertCircle size={22} />
      </div>

      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">
        Impossible de charger les élections
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-slate-400 dark:text-slate-500">
        {message || "Une erreur est survenue lors du chargement des données."}
      </p>
    </div>
  );
}

function EmptyStateLocal({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Vote size={22} />
      </div>

      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-slate-400 dark:text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function FlatGrid({ elections }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {elections.map((e, i) => (
        <ElectionCard key={e.id} e={e} index={i} />
      ))}
    </div>
  );
}

const GROUPS = [
  {
    key: "actives",
    title: "Élections en cours",
    subtitle: "Candidatures ouvertes, vote en cours ou en dépouillement",
    match: (e) => isActiveElection(e),
  },
  {
    key: "resultats",
    title: "Résultats",
    subtitle: "Résultats publiés et disponibles à la consultation",
    match: (e) => isResultAvailable(e),
  },
  {
    key: "archives",
    title: "Archives",
    subtitle: "Élections terminées, annulées ou en préparation",
    match: (e) => !isActiveElection(e) && !isResultAvailable(e),
  },
];

function GroupedGrid({ elections }) {
  return (
    <div className="space-y-8">
      {GROUPS.map((group) => {
        const items = elections.filter(group.match);
        if (items.length === 0) return null;

        return (
          <section key={group.key}>
            <div className="mb-3">
              <h2 className="text-[15px] font-bold text-slate-700 dark:text-slate-100">
                {group.title}
              </h2>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                {group.subtitle}
              </p>
            </div>

            <FlatGrid elections={items} />
          </section>
        );
      })}
    </div>
  );
}

export default function MedecinElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("participer");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const loadElections = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getMesElections({ size: 100 });
        setElections(res.data?.content ?? []);
      } catch (err) {
        setError(extractApiError(err));
        setElections([]);
      } finally {
        setLoading(false);
      }
    };

    loadElections();
  }, []);

  const sortedElections = useMemo(() => {
    return sortElections(elections);
  }, [elections]);

  const tabCounts = useMemo(() => {
    return TABS.reduce((acc, tab) => {
      acc[tab.key] = filterByTab(sortedElections, tab.key).length;
      return acc;
    }, {});
  }, [sortedElections]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return filterByTab(sortedElections, activeTab).filter((election) => {
      const haystack = [
        election.titre,
        election.type,
        election.region,
        election.description,
        election.statut,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !term || haystack.includes(term);
      const matchStatus =
        statusFilter === "ALL" || election.statut === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [sortedElections, activeTab, search, statusFilter]);

  const empty = EMPTY_MESSAGES[activeTab] || EMPTY_MESSAGES.toutes;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  return (
    <MedecinLayout title="Élections">
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
        <div className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-[20px] font-semibold text-slate-700 dark:text-slate-100">
              Centre électoral
            </h1>
            <p className="text-[13px] text-slate-400 dark:text-slate-500">
              Suivez vos candidatures, votes et résultats électoraux
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par titre, type ou région"
                  className="h-10 w-full rounded-md border border-slate-100 bg-white px-4 pr-10 text-[13px] text-slate-600 shadow-sm outline-none placeholder:text-slate-300 focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 sm:w-[280px]"
                />

                <Search
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-500 shadow-sm outline-none focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-[190px]"
              >
                <option value="ALL">Statut : Tous</option>
                <option value="CANDIDATURE_OUVERTE">Candidature ouverte</option>
                <option value="VOTE_EN_COURS">Vote en cours</option>
                <option value="DEPOUILLEMENT">Dépouillement</option>
                <option value="RESULTATS_PUBLIES">Résultats publiés</option>
                <option value="ARCHIVEE">Archivée</option>
              </select>

              {(search || statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-100 bg-white px-4 text-[13px] text-slate-400 shadow-sm transition hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <RotateCcw size={14} />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
            <div className="overflow-x-auto px-7">
              <div className="flex min-w-max">
                {TABS.map((tab) => {
                  const active = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`inline-flex items-center gap-2 border-b-2 px-4 py-4 text-[13px] font-semibold transition ${
                        active
                          ? "border-green-500 text-green-600 dark:border-green-400 dark:text-green-400"
                          : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab.label}

                      {tabCounts[tab.key] > 0 && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            active
                              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                          }`}
                        >
                          {tabCounts[tab.key]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-5">
            {loading ? (
              <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
                <LoadingState />
              </div>
            ) : error ? (
              <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
                <ErrorState message={error} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
                <EmptyStateLocal title={empty.title} subtitle={empty.subtitle} />
              </div>
            ) : activeTab === "toutes" ? (
              <GroupedGrid elections={filtered} />
            ) : (
              <FlatGrid elections={filtered} />
            )}
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}
