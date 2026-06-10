import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Filter,
  Loader2,
  RotateCcw,
  Search,
  UserCheck,
  Vote,
} from "lucide-react";

import MedecinLayout from "../../components/medecin/MedecinLayout";
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

const STATUS_META = {
  BROUILLON: {
    label: "Brouillon",
    className: "text-slate-500 dark:text-slate-400",
  },
  CANDIDATURE_OUVERTE: {
    label: "Candidature ouverte",
    className: "text-amber-500 dark:text-amber-400",
  },
  VALIDATION_CANDIDATURES: {
    label: "Validation candidatures",
    className: "text-purple-500 dark:text-purple-400",
  },
  VOTE_EN_COURS: {
    label: "Vote en cours",
    className: "text-green-600 dark:text-green-400",
  },
  DEPOUILLEMENT: {
    label: "Dépouillement",
    className: "text-cyan-600 dark:text-cyan-400",
  },
  RESULTATS_PUBLIES: {
    label: "Résultats publiés",
    className: "text-green-600 dark:text-green-400",
  },
  ARCHIVEE: {
    label: "Archivée",
    className: "text-slate-400 dark:text-slate-500",
  },
  ANNULEE: {
    label: "Annulée",
    className: "text-red-500 dark:text-red-400",
  },
};

const TYPE_LABELS = {
  CONSEIL_NATIONAL: "Conseil national",
  CONSEIL_REGIONAL: "Conseil régional",
  BUREAU_EXECUTIF: "Bureau exécutif",
  COMMISSION_SPECIALISEE: "Commission spécialisée",
};

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

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusMeta(status) {
  return (
    STATUS_META[status] || {
      label: status || "Statut inconnu",
      className: "text-slate-500 dark:text-slate-400",
    }
  );
}

function getElectionTitle(election) {
  return (
    election.titre ||
    election.nom ||
    election.libelle ||
    TYPE_LABELS[election.typeElection] ||
    "Élection ordinale"
  );
}

function getElectionType(election) {
  return (
    TYPE_LABELS[election.typeElection] ||
    TYPE_LABELS[election.type] ||
    election.typeElection ||
    election.type ||
    "Élection"
  );
}

function getElectionRegion(election) {
  return (
    election.region ||
    election.wilaya ||
    election.porteeRegion ||
    election.zone ||
    "Nationale"
  );
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

function getVoteEnd(election) {
  return (
    election.voteEndDate ||
    election.dateFinVote ||
    election.voteFin ||
    election.dateFin ||
    election.endDate
  );
}

function getCandidatureStart(election) {
  return (
    election.candidatureStartDate ||
    election.dateDebutCandidature ||
    election.candidatureDebut
  );
}

function getPrimaryAction(election) {
  if (election.statut === "VOTE_EN_COURS") {
    if (election.aVote || election.dejaVote) {
      return {
        label: "Vote enregistré",
        tone: "muted",
        disabled: true,
      };
    }

    return {
      label: "Voter",
      tone: "green",
      to: `/medecin/elections/${election.id}/voter`,
    };
  }

  if (election.statut === "CANDIDATURE_OUVERTE") {
    if (election.maCandidature) {
      return {
        label: "Candidature déposée",
        tone: "muted",
        to: `/medecin/elections/${election.id}`,
      };
    }

    return {
      label: "Candidater",
      tone: "blue",
      to: `/medecin/elections/${election.id}/candidater`,
    };
  }

  if (isResultAvailable(election)) {
    return {
      label: "Résultats",
      tone: "outline",
      to: `/medecin/elections/${election.id}/resultats`,
    };
  }

  return {
    label: "Détail",
    tone: "default",
    to: `/medecin/elections/${election.id}`,
  };
}

function filterByTab(list, tabKey) {
  if (tabKey === "participer") {
    return list.filter(isActiveElection);
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

function ActionButton({ action, onOpen }) {
  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={() => action.to && onOpen(action.to)}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-semibold transition ${
        action.tone === "green"
          ? "bg-green-600 text-white hover:bg-green-700"
          : action.tone === "blue"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : action.tone === "outline"
              ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              : action.tone === "muted"
                ? "cursor-default bg-slate-100 text-slate-400 dark:bg-slate-800"
                : "text-blue-500 hover:text-blue-600"
      }`}
    >
      {action.label}
      {!action.disabled && <ArrowRight size={12} />}
    </button>
  );
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

export default function MedecinElectionsPage() {
  const navigate = useNavigate();

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
        getElectionTitle(election),
        getElectionType(election),
        getElectionRegion(election),
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
          <h1 className="text-[20px] font-semibold text-slate-700 dark:text-slate-100">
            Centre électoral
          </h1>

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
                <option value="ALL">Status : All</option>
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
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-400 shadow-sm transition hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <RotateCcw size={14} />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Main register */}
          <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
            {/* Tabs */}
            <div className="overflow-x-auto border-b border-slate-100 px-7 dark:border-slate-800">
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

            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : filtered.length === 0 ? (
              <EmptyStateLocal title={empty.title} subtitle={empty.subtitle} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] table-fixed text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="w-[30%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Élection
                      </th>
                      <th className="w-[16%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Type
                      </th>
                      <th className="w-[14%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Région
                      </th>
                      <th className="w-[18%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Période
                      </th>
                      <th className="w-[12%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Statut
                      </th>
                      <th className="w-[10%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((election) => {
                      const statusMeta = getStatusMeta(election.statut);
                      const action = getPrimaryAction(election);

                      return (
                        <tr
                          key={election.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-7 py-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                                  {getElectionTitle(election)}
                                </p>

                                {election.maCandidature && (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <UserCheck size={10} />
                                    Candidat
                                  </span>
                                )}

                                {(election.aVote || election.dejaVote) && (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                    <CheckCircle2 size={10} />
                                    Voté
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 truncate text-[12px] text-slate-400 dark:text-slate-500">
                                {election.description ||
                                  "Élection ordinale organisée par l’ONMM."}
                              </p>
                            </div>
                          </td>

                          <td className="px-7 py-4 text-[14px] font-medium text-slate-600 dark:text-slate-300">
                            {getElectionType(election)}
                          </td>

                          <td className="px-7 py-4 text-[14px] font-medium text-slate-600 dark:text-slate-300">
                            {getElectionRegion(election)}
                          </td>

                          <td className="px-7 py-4 text-[14px] font-medium text-slate-600 dark:text-slate-300">
                            {formatDate(getVoteStart(election))} →{" "}
                            {formatDate(getVoteEnd(election))}
                          </td>

                          <td className="px-7 py-4">
                            <span className={`text-[14px] font-bold ${statusMeta.className}`}>
                              {statusMeta.label}
                            </span>
                          </td>

                          <td className="px-7 py-4">
                            <ActionButton action={action} onOpen={navigate} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}