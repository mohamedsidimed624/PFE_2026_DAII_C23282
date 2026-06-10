import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
  BookOpen,
  Zap,
  FlaskConical,
  Star,
  Users,
  Search,
  RotateCcw,
} from "lucide-react";

import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMesSondages } from "../../services/medecinSondageApi";

const TYPE_META = {
  CONSULTATION_INSTITUTIONNELLE: {
    label: "Consultation",
    icon: BookOpen,
    badge: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  PULSE: {
    label: "Pulse",
    icon: Zap,
    badge: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    iconBg: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  QUESTIONNAIRE_SCIENTIFIQUE: {
    label: "Scientifique",
    icon: FlaskConical,
    badge: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  SATISFACTION: {
    label: "Satisfaction",
    icon: Star,
    badge: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  ETUDE_EFFECTIFS: {
    label: "Étude",
    icon: Users,
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-500 dark:text-slate-400",
  },
};

const TABS = [
  { key: "disponibles", label: "Disponibles" },
  { key: "en_cours", label: "En cours" },
  { key: "completes", label: "Complétés" },
  { key: "fermes", label: "Fermés" },
];

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function estimeDuree(nbQuestions) {
  const min = Math.max(1, Math.ceil(((nbQuestions || 0) * 30) / 60));
  return `~${min} min`;
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800">
        <ClipboardList size={22} className="text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-[13px] font-medium text-slate-400 dark:text-slate-500">
        {label}
      </p>
    </div>
  );
}

export default function MedecinSondagesPage() {
  const navigate = useNavigate();

  const [sondages, setSondages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("disponibles");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMesSondages();
      setSondages(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSondages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const buckets = {
    disponibles: sondages.filter((s) => s.statut === "ACTIF" && !s.participation),
    en_cours: sondages.filter((s) => s.participation?.statut === "EN_COURS"),
    completes: sondages.filter((s) => s.participation?.statut === "COMPLETE"),
    fermes: sondages.filter((s) => s.statut === "CLOS"),
  };

  const tabCount = {
    disponibles: buckets.disponibles.length,
    en_cours: buckets.en_cours.length,
    completes: buckets.completes.length,
    fermes: buckets.fermes.length,
  };

  const emptyLabels = {
    disponibles: "Aucun sondage disponible pour l'instant",
    en_cours: "Vous n'avez aucune participation en cours",
    completes: "Vous n'avez encore complété aucun sondage",
    fermes: "Aucun sondage clôturé",
  };

  const currentList = buckets[activeTab].filter((s) =>
    !search.trim()
      ? true
      : `${s.titre || ""} ${s.description || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
  );

  const resetSearch = () => setSearch("");

  return (
    <MedecinLayout title="Sondages & Consultations">
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
        <div className="space-y-5">
          {/* Header */}
          <div className="">
            {/* <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Sondages & Consultations
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Participez aux consultations officielles de l'ONMM.
              </p>
            </div> */}

            {/* <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <ClipboardList size={22} />
            </div> */}
          </div>

          {/* Stats
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <SmallStat label="Disponibles" value={tabCount.disponibles} active={activeTab === "disponibles"} />
            <SmallStat label="En cours" value={tabCount.en_cours} active={activeTab === "en_cours"} />
            <SmallStat label="Complétés" value={tabCount.completes} active={activeTab === "completes"} />
            <SmallStat label="Fermés" value={tabCount.fermes} active={activeTab === "fermes"} />
          </div> */}

          {/* Filters */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((tab) => {
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold transition ${
                      active
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      {tabCount[tab.key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un sondage..."
                  className="h-10 w-full rounded-lg border border-slate-100 bg-white px-4 pr-10 text-[13px] text-slate-600 shadow-sm outline-none placeholder:text-slate-300 focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 sm:w-[260px]"
                />
                <Search
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
              </div>

              {search && (
                <button
                  onClick={resetSearch}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2
                  size={24}
                  className="animate-spin text-slate-400 dark:text-slate-600"
                />
              </div>
            ) : currentList.length === 0 ? (
              <EmptyState label={emptyLabels[activeTab]} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] table-fixed text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="w-[36%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Sondage
                      </th>
                      <th className="w-[15%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Type
                      </th>
                      <th className="w-[18%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Période
                      </th>
                      <th className="w-[14%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Questions
                      </th>
                      <th className="w-[17%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentList.map((s, i) => (
                      <SurveyTableRow
                        key={s.id}
                        sondage={s}
                        index={i}
                        navigate={navigate}
                      />
                    ))}
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

function SurveyTableRow({ sondage: s, index, navigate }) {
  const meta = TYPE_META[s.type] ?? TYPE_META.ETUDE_EFFECTIFS;
  const Icon = meta.icon;

  const participation = s.participation;
  const isCompleted = participation?.statut === "COMPLETE";
  const isInProgress = participation?.statut === "EN_COURS";
  const isClosed = s.statut === "CLOS";

  const canNavigate = !isCompleted && !isClosed;

  const hasResults = s.resultatsPublies && isCompleted && isClosed;
  const canSeeResults = hasResults;

  const rowClickable = canNavigate || canSeeResults;

  const ctaLabel = hasResults
    ? "Voir résultats"
    : isCompleted
    ? "Complété"
    : isClosed
    ? "Clôturé"
    : isInProgress
    ? "Reprendre"
    : "Participer";

  const handleClick = () => {
    if (canNavigate) navigate(`/medecin/sondages/${s.id}`);
    else if (canSeeResults) navigate(`/medecin/sondages/${s.id}/resultats`);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={rowClickable ? handleClick : undefined}
      className={`border-b border-slate-100 transition last:border-0 dark:border-slate-800 ${
        rowClickable
          ? "cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
          : ""
      }`}
    >
      <td className="px-7 py-4">
        <div className="flex items-center gap-3">
          

          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-slate-700 dark:text-slate-200">
              {s.titre || "Sondage sans titre"}
            </p>

            {s.description && (
              <p className="mt-0.5 truncate text-[12px] text-slate-400 dark:text-slate-500">
                {s.description}
              </p>
            )}

            {s.anonyme && (
              <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Anonyme
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-7 py-4">
        <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${meta.badge}`}>
          {meta.label}
        </span>
      </td>

      <td className="whitespace-nowrap px-7 py-4">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400">
          <Calendar size={13} className="text-slate-300 dark:text-slate-600" />
          {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
        </div>
      </td>

      <td className="px-7 py-4">
        <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
          {s.nbQuestions || 0} question{(s.nbQuestions || 0) !== 1 ? "s" : ""}
        </p>

        {/* <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <Clock size={11} />
          {estimeDuree(s.nbQuestions)}
        </p> */}
      </td>

      <td className="px-7 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            disabled={!canNavigate && !canSeeResults}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-4 text-[12px] font-semibold transition ${
              canSeeResults
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : isCompleted || isClosed
                ? "cursor-default bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                : isInProgress
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {ctaLabel}
            {(canNavigate || canSeeResults) && <ChevronRight size={13} />}
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

function SmallStat({ label, value, active }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition ${
        active
          ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10"
          : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          active
            ? "text-green-600 dark:text-green-400"
            : "text-slate-800 dark:text-slate-100"
        }`}
      >
        {value ?? 0}
      </p>
    </div>
  );
}