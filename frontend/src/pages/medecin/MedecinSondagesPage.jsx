import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList, Calendar, Clock, ChevronRight, Loader2,
  BookOpen, Zap, FlaskConical, Star, Users,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMesSondages } from "../../services/medecinSondageApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_META = {
  CONSULTATION_INSTITUTIONNELLE: { label: "Consultation", icon: BookOpen,    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",   iconBg: "bg-blue-50 dark:bg-blue-900/20" },
  PULSE:                         { label: "Pulse",        icon: Zap,          color: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400", iconBg: "bg-green-50 dark:bg-green-900/20" },
  QUESTIONNAIRE_SCIENTIFIQUE:    { label: "Scientifique", icon: FlaskConical, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400", iconBg: "bg-purple-50 dark:bg-purple-900/20" },
  SATISFACTION:                  { label: "Satisfaction", icon: Star,         color: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400", iconBg: "bg-amber-50 dark:bg-amber-900/20" },
  ETUDE_EFFECTIFS:               { label: "Étude",        icon: Users,        color: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",   iconBg: "bg-slate-100 dark:bg-slate-700" },
};

const TABS = [
  { key: "disponibles", label: "Disponibles" },
  { key: "completes",   label: "Complétés"   },
  { key: "fermes",      label: "Fermés"      },
];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function estimeDuree(n) {
  const min = Math.max(1, Math.ceil((n * 30) / 60));
  return `~${min} min`;
}

// ── Survey row ────────────────────────────────────────────────────────────────

function SurveyRow({ s, i }) {
  const navigate = useNavigate();
  const meta     = TYPE_META[s.type] ?? TYPE_META.ETUDE_EFFECTIFS;
  const Icon     = meta.icon;

  const participation = s.participation;
  const isCompleted   = participation?.statut === "COMPLETE";
  const isInProgress  = participation?.statut === "EN_COURS";
  const isClosed      = s.statut === "CLOS";

  const canNavigate = !isCompleted && !isClosed;

  const ctaLabel = isCompleted
    ? "Complété"
    : isClosed
    ? "Clôturé"
    : isInProgress
    ? "Reprendre"
    : "Participer";

  const ctaCls = isCompleted || isClosed
    ? "rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-[12px] font-semibold text-slate-400 dark:text-slate-500 cursor-default"
    : isInProgress
    ? "rounded-lg bg-amber-500 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-amber-600 transition-colors"
    : "rounded-lg bg-green-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-green-800 transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
    >
      <div
        className={`flex items-center gap-4 px-5 py-4 ${canNavigate ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60" : ""} transition`}
        onClick={() => canNavigate && navigate(`/medecin/sondages/${s.id}`)}
      >
        {/* Icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconBg}`}>
          <Icon size={18} className={meta.color.split(" ").slice(2).join(" ")} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.color}`}>
              {meta.label}
            </span>
            {s.anonyme && (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Anonyme
              </span>
            )}
          </div>
          <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
            {s.titre}
          </p>
          {s.description && (
            <p className="mt-0.5 truncate text-[12px] text-slate-500 dark:text-slate-400">
              {s.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {estimeDuree(s.nbQuestions)}
            </span>
            <span className="flex items-center gap-1">
              <ClipboardList size={10} />
              {s.nbQuestions} question{s.nbQuestions !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); canNavigate && navigate(`/medecin/sondages/${s.id}`); }}
            disabled={isCompleted || isClosed}
            className={ctaCls}
          >
            {ctaLabel}
          </button>
          {canNavigate && <ChevronRight size={15} className="text-slate-300 dark:text-slate-600" />}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
        <ClipboardList size={20} className="text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-[13px] font-medium text-slate-400">{label}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MedecinSondagesPage() {
  const navigate     = useNavigate();
  const [sondages,   setSondages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("disponibles");

  const load = useCallback(async () => {
    try {
      const res = await getMesSondages();
      setSondages(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSondages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Bucket each survey into a tab
  const buckets = {
    disponibles: sondages.filter((s) => s.statut === "ACTIF" && !s.participation),
    en_cours:    sondages.filter((s) => s.participation?.statut === "EN_COURS"),
    completes:   sondages.filter((s) => s.participation?.statut === "COMPLETE"),
    fermes:      sondages.filter((s) => s.statut === "CLOS"),
  };

  const tabCount = {
    disponibles: buckets.disponibles.length,
    en_cours:    buckets.en_cours.length,
    completes:   buckets.completes.length,
    fermes:      buckets.fermes.length,
  };

  const emptyLabels = {
    disponibles: "Aucun sondage disponible pour l'instant",
    en_cours:    "Vous n'avez aucune participation en cours",
    completes:   "Vous n'avez encore complété aucun sondage",
    fermes:      "Aucun sondage clôturé",
  };

  return (
  <MedecinLayout title="Sondages & Consultations">
    <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[17px] font-semibold text-slate-700 dark:text-slate-100">
              Sondages & Consultations
            </h1>
            <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
              Participez aux consultations officielles de l'ONMM
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`h-10 rounded-md border px-4 text-[13px] font-semibold shadow-sm transition ${
                activeTab === tab.key
                  ? "border-green-400 bg-green-50 text-green-600 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "border-slate-100 bg-white text-slate-400 hover:text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}{" "}
              <span className="ml-1">
                ({tabCount[tab.key]})
              </span>
            </button>
          ))}
        </div>

        {/* Table-like list */}
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2
                size={22}
                className="animate-spin text-slate-300 dark:text-slate-600"
              />
            </div>
          ) : buckets[activeTab].length === 0 ? (
            <EmptyState label={emptyLabels[activeTab]} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="w-[38%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Sondage
                    </th>
                    <th className="w-[14%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Type
                    </th>
                    <th className="w-[18%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Période
                    </th>
                    <th className="w-[14%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Questions
                    </th>
                    <th className="w-[16%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {buckets[activeTab].map((s, i) => {
                    const participation = s.participation;
                    const isCompleted = participation?.statut === "COMPLETE";
                    const isInProgress = participation?.statut === "EN_COURS";
                    const isClosed = s.statut === "CLOS";
                    const canNavigate = !isCompleted && !isClosed;

                    const hasResults = s.resultatsPublies && isCompleted && isClosed;
                    const ctaLabel = hasResults
                      ? "Voir les résultats"
                      : isCompleted
                      ? "Complété"
                      : isClosed
                      ? "Clôturé"
                      : isInProgress
                      ? "Reprendre"
                      : "Participer";

                    const canSeeResults = hasResults;
                    const rowClickable = canNavigate || canSeeResults;

                    return (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => {
                          if (canNavigate) navigate(`/medecin/sondages/${s.id}`);
                          else if (canSeeResults) navigate(`/medecin/sondages/${s.id}/resultats`);
                        }}
                        className={`border-b border-slate-100 transition last:border-0 dark:border-slate-800 ${
                          rowClickable
                            ? "cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <p className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                            {s.titre}
                          </p>
                          {s.description && (
                            <p className="mt-1 truncate text-[12px] text-slate-400 dark:text-slate-500">
                              {s.description}
                            </p>
                          )}
                          {s.anonyme && (
                            <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                              Anonyme
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
                            {TYPE_META[s.type]?.label || "Étude"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-[12px] text-slate-500 dark:text-slate-400">
                          {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
                            {s.nbQuestions} question{s.nbQuestions !== 1 ? "s" : ""}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                            {estimeDuree(s.nbQuestions)}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canNavigate) navigate(`/medecin/sondages/${s.id}`);
                              else if (canSeeResults) navigate(`/medecin/sondages/${s.id}/resultats`);
                            }}
                            disabled={!canNavigate && !canSeeResults}
                            className={`h-8 rounded-md px-4 text-[12px] font-semibold transition ${
                              canSeeResults
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : isCompleted || isClosed
                                ? "cursor-default bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                : isInProgress
                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          >
                            {ctaLabel}
                          </button>
                        </td>
                      </motion.tr>
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
