import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  Loader2,
  Save,
  X,
  Vote,
  CalendarDays,
  ClipboardList,
  Users,
  MapPin,
  Building2,
  Briefcase,
  GraduationCap,
  BookOpen,
  Landmark,
  AlertCircle,
  FileCheck,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  getPositions,
  addPosition,
  deletePosition,
} from "../../services/adminElectionApi";

/* ─────────────────────────────────────────────────────────────
   Données métier — inchangées
───────────────────────────────────────────────────────────── */

const ELECTION_PRESETS = {
  CONSEIL_NATIONAL: {
    label: "Conseil National de l'Ordre",
    description:
      "Élection des 25 membres du Conseil National, organe délibérant suprême de l'ONMM.",
    type: "CONSEIL_NATIONAL",
    niveau: "NATIONAL",
    corpsElectoral: "MEDECINS_PAR_SECTION",
    requiresRegion: false,
    seatsCount: 25,
    maxVotesParElecteur: 25,
    positions: [
      { libelle: "Section A — Médecins généralistes", nombreSieges: 10, maxVotesParElecteur: 10, ordre: 1 },
      { libelle: "Section B — Médecins spécialistes", nombreSieges: 6, maxVotesParElecteur: 6, ordre: 2 },
      { libelle: "Section C — Médecins enseignants-chercheurs", nombreSieges: 6, maxVotesParElecteur: 6, ordre: 3 },
      { libelle: "Représentants des régions de l'intérieur", nombreSieges: 3, maxVotesParElecteur: 3, ordre: 4 },
    ],
  },
  BUREAU_EXECUTIF: {
    label: "Bureau Exécutif",
    description:
      "Élection des 8 membres du Bureau Exécutif par les membres du Conseil National.",
    type: "BUREAU_EXECUTIF",
    niveau: "NATIONAL",
    corpsElectoral: "MEMBRES_CONSEIL_NATIONAL",
    requiresRegion: false,
    seatsCount: 8,
    maxVotesParElecteur: 1,
    positions: [
      { libelle: "Président", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 1 },
      { libelle: "Vice-président", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 2 },
      { libelle: "Secrétaire général", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 3 },
      { libelle: "Secrétaire général adjoint", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 4 },
      { libelle: "Trésorier", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 5 },
      { libelle: "Trésorier adjoint", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 6 },
      { libelle: "Assesseur 1", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 7 },
      { libelle: "Assesseur 2", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 8 },
    ],
  },
  BUREAU_SECTION_A: {
    label: "Bureau de Section A",
    description: "Élection du bureau de la Section A — médecins généralistes.",
    type: "BUREAU_SECTION_A",
    niveau: "SECTION",
    corpsElectoral: "CONSEIL_SECTION_A",
    requiresRegion: false,
    seatsCount: 3,
    maxVotesParElecteur: 1,
    positions: [
      { libelle: "Président de la Section A", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 1 },
      { libelle: "Secrétaire général de la Section A", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 2 },
      { libelle: "Trésorier de la Section A", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 3 },
    ],
  },
  BUREAU_SECTION_B: {
    label: "Bureau de Section B",
    description: "Élection du bureau de la Section B — médecins spécialistes.",
    type: "BUREAU_SECTION_B",
    niveau: "SECTION",
    corpsElectoral: "CONSEIL_SECTION_B",
    requiresRegion: false,
    seatsCount: 3,
    maxVotesParElecteur: 1,
    positions: [
      { libelle: "Président de la Section B", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 1 },
      { libelle: "Secrétaire général de la Section B", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 2 },
      { libelle: "Trésorier de la Section B", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 3 },
    ],
  },
  BUREAU_SECTION_C: {
    label: "Bureau de Section C",
    description:
      "Élection du bureau de la Section C — médecins enseignants-chercheurs.",
    type: "BUREAU_SECTION_C",
    niveau: "SECTION",
    corpsElectoral: "CONSEIL_SECTION_C",
    requiresRegion: false,
    seatsCount: 3,
    maxVotesParElecteur: 1,
    positions: [
      { libelle: "Président de la Section C", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 1 },
      { libelle: "Secrétaire général de la Section C", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 2 },
      { libelle: "Trésorier de la Section C", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 3 },
    ],
  },
  REPRESENTANTS_REGIONAUX: {
    label: "Représentants des régions",
    description:
      "Élection du représentant d'une région de l'intérieur au Conseil National.",
    type: "REPRESENTANTS_REGIONAUX",
    niveau: "REGIONAL",
    corpsElectoral: "MEDECINS_REGION",
    requiresRegion: true,
    seatsCount: 1,
    maxVotesParElecteur: 1,
    positions: [
      { libelle: "Représentant de la région", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 1 },
    ],
  },
};

const WILAYAS = [
  "Hodh Ech Chargui", "Hodh El Gharbi", "Assaba", "Gorgol", "Brakna",
  "Trarza", "Adrar", "Dakhlet Nouadhibou", "Tagant", "Guidimagha",
  "Tiris Zemmour", "Inchiri", "Nouakchott Nord", "Nouakchott Ouest", "Nouakchott Sud",
];

const CORPS_LABELS = {
  TOUS_MEDECINS_ACTIFS:       "Tous les médecins actifs",
  MEDECINS_REGION:            "Médecins de la région",
  MEDECINS_PAR_SECTION:       "Médecins inscrits par section",
  MEMBRES_CONSEIL_NATIONAL:   "Membres du Conseil National",
  CONSEIL_SECTION_A:          "Membres du conseil — Section A",
  CONSEIL_SECTION_B:          "Membres du conseil — Section B",
  CONSEIL_SECTION_C:          "Membres du conseil — Section C",
};

const NIVEAU_LABELS = {
  NATIONAL: "National",
  REGIONAL: "Régional",
  SECTION:  "Section",
};

const STEPS         = ["Type d'élection", "Informations", "Calendrier", "Récapitulatif"];
const STEP_TYPE     = 0;
const STEP_INFO     = 1;
const STEP_CALENDRIER = 2;
const STEP_APERCU   = 3;

/* ─────────────────────────────────────────────────────────────
   Config UI
───────────────────────────────────────────────────────────── */

/* Subtle niveau colors — accent bar + badge only */
const NIVEAU_CFG = {
  NATIONAL: {
    accent: "bg-blue-500",
    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    badge:  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
  },
  REGIONAL: {
    accent: "bg-amber-500",
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    badge:  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
  },
  SECTION: {
    accent: "bg-teal-500",
    iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
    badge:  "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900",
  },
};

const PRESET_ICONS = {
  CONSEIL_NATIONAL:        Landmark,
  BUREAU_EXECUTIF:         Briefcase,
  BUREAU_SECTION_A:        Users,
  BUREAU_SECTION_B:        GraduationCap,
  BUREAU_SECTION_C:        BookOpen,
  REPRESENTANTS_REGIONAUX: MapPin,
};

/* ─────────────────────────────────────────────────────────────
   Helpers — inchangés
───────────────────────────────────────────────────────────── */

const toISO   = (dt) => (dt ? `${dt}:00` : null);
const fromISO = (dt) => (dt ? String(dt).slice(0, 16) : "");

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

/* ─────────────────────────────────────────────────────────────
   Tokens
───────────────────────────────────────────────────────────── */

const inputCls =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-green-400 focus:ring-2 focus:ring-green-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:placeholder:text-slate-600";

const textareaCls =
  "w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[13px] leading-6 text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-green-400 focus:ring-2 focus:ring-green-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:placeholder:text-slate-600";

/* ─────────────────────────────────────────────────────────────
   Atoms
───────────────────────────────────────────────────────────── */

function Alert({ type, children }) {
  const s = {
    warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300",
    error:   "border-red-200   bg-red-50   text-red-700   dark:border-red-800/60   dark:bg-red-950/30   dark:text-red-400",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-[13px] leading-snug ${s[type]}`}>
      <AlertCircle size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Field({ label, required, error, help, counter, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="block text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {counter !== undefined && (
          <span className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500">{counter}</span>
        )}
      </div>

      {children}

      {error && (
        <p className="flex items-center gap-1 text-[12px] font-medium text-red-600 dark:text-red-400">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
      {!error && help && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{help}</p>
      )}
    </div>
  );
}

/* Section divider inside a step */
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3">
      <p className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {children}
      </p>
      <div className="flex-1 border-t border-slate-100 dark:border-slate-800" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Stepper — horizontal, en haut de la carte
───────────────────────────────────────────────────────────── */

function Stepper({ current, onGoTo }) {
  return (
    <div className="border-b border-slate-100 px-8 py-5 dark:border-slate-800">
      <div className="flex items-center">
        {STEPS.map((label, i) => {
          const done   = i < current;
          const active = i === current;

          return (
            <div key={label} className="flex flex-1 items-center">
              {/* Step button */}
              <button
                type="button"
                onClick={() => done && onGoTo(i)}
                disabled={!done && !active}
                className={`flex items-center gap-2.5 ${done ? "cursor-pointer" : "cursor-default"}`}
              >
                {/* Circle indicator */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    done
                      ? "bg-green-500 text-white"
                      : active
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  }`}
                >
                  {done ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                </div>

                {/* Label */}
                <div className="hidden min-w-0 md:block">
                  <p
                    className={`truncate text-[13px] font-semibold ${
                      active
                        ? "text-slate-900 dark:text-slate-100"
                        : done
                        ? "text-slate-500 dark:text-slate-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              </button>

              {/* Connecting line */}
              {i < STEPS.length - 1 && (
                <div className="mx-3 h-px flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div
                    className="h-full rounded-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: done ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Étape 1 — Type d'élection
───────────────────────────────────────────────────────────── */

function StepType({ presetKey, setPresetKey, error, locked, blockedTypes }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">
          Type d'élection
        </h2>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Sélectionnez l'organe concerné. Les postes associés seront générés automatiquement.
        </p>
      </div>

      {locked  && <Alert type="warning">Le type est verrouillé — l'élection n'est plus en brouillon.</Alert>}
      {error   && <Alert type="error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(ELECTION_PRESETS).map(([key, preset]) => {
          const selected  = presetKey === key;
          const cfg       = NIVEAU_CFG[preset.niveau];
          const isBlocked =
            preset.type !== "REPRESENTANTS_REGIONAUX" &&
            blockedTypes.has(preset.type);
          const disabled  = locked || isBlocked;
          const Icon      = PRESET_ICONS[key] || Vote;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setPresetKey(selected ? "" : key)}
              className={`group relative flex flex-col overflow-hidden rounded-lg border text-left transition-all duration-150 ${
                selected
                  ? "border-green-300 bg-green-50/60 ring-1 ring-green-300 dark:border-green-700 dark:bg-green-950/20 dark:ring-green-700"
                  : disabled
                  ? "cursor-not-allowed border-slate-100 bg-slate-50/60 opacity-55 dark:border-slate-800 dark:bg-slate-800/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              }`}
            >
              {/* Top accent bar — colored by niveau */}
              <div className={`h-[3px] w-full shrink-0 ${cfg.accent} opacity-80`} />

              <div className="flex flex-1 flex-col p-4">
                {/* Icon + check */}
                <div className="mb-3 flex items-start justify-between">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${cfg.iconBg}`}>
                    <Icon size={15} strokeWidth={1.5} />
                  </div>

                  {selected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check size={10} strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Niveau badge */}
                <span className={`mb-2 inline-flex w-fit items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
                  {NIVEAU_LABELS[preset.niveau]}
                </span>

                {/* Title */}
                <h3 className="text-[13px] font-semibold leading-snug text-slate-800 dark:text-slate-100">
                  {preset.label}
                </h3>

                {/* Description */}
                <p className="mt-1 line-clamp-2 flex-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {preset.description}
                </p>

                {/* Stats */}
                <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-2.5 dark:border-slate-700/50">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {preset.seatsCount} siège{preset.seatsCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {preset.positions.length} poste{preset.positions.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Blocked notice */}
                {isBlocked && (
                  <div className="mt-2.5 flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400">
                    <AlertCircle size={10} />
                    Élection active déjà existante
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Étape 2 — Informations générales
───────────────────────────────────────────────────────────── */

function StepInfo({ form, setForm, preset, errors, blockedRegions }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">
          Informations générales
        </h2>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Définissez le titre public et la description de l'élection.
        </p>
      </div>

      {/* Context summary */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/70 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-800/30">
        {[
          { Icon: Building2, label: "Organe",          value: preset.label },
          { Icon: Users,     label: "Corps électoral", value: CORPS_LABELS[preset.corpsElectoral] },
          { Icon: MapPin,    label: "Portée",           value: NIVEAU_LABELS[preset.niveau] },
        ].map(({ Icon: RowIcon, label, value }) => (
          <div key={label} className="flex items-start gap-3 px-4 py-3">
            <RowIcon size={13} className="mt-0.5 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {label}
              </p>
              <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-5">
        <Field
          label="Titre de l'élection"
          required
          error={errors.titre}
          help="Minimum 5 caractères, maximum 120."
          counter={`${form.titre.length} / 120`}
        >
          <input
            type="text"
            maxLength={120}
            value={form.titre}
            onChange={(e) => setForm("titre", e.target.value)}
            placeholder={`Ex : Élection du ${preset.label} — 2025`}
            className={inputCls}
          />
        </Field>

        <Field
          label="Description publique"
          help="Optionnel — visible par les médecins après publication."
          counter={`${form.description.length} / 600`}
        >
          <textarea
            rows={5}
            maxLength={600}
            value={form.description}
            onChange={(e) => setForm("description", e.target.value)}
            placeholder="Contexte, objectifs, modalités pratiques…"
            className={textareaCls}
          />
        </Field>

        {preset.requiresRegion && (
          <Field label="Région concernée" required error={errors.region}>
            <select
              value={form.region}
              onChange={(e) => setForm("region", e.target.value)}
              className={inputCls}
            >
              <option value="">Sélectionner une région…</option>
              {WILAYAS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            {!errors.region &&
              form.region &&
              blockedRegions.has(form.region.toLowerCase()) && (
                <Alert type="error">
                  Une élection active existe déjà pour cette région.
                </Alert>
              )}
          </Field>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Étape 3 — Calendrier électoral
───────────────────────────────────────────────────────────── */

function StepCalendrier({ form, setForm, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">
          Calendrier électoral
        </h2>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Définissez les dates de chaque phase dans l'ordre chronologique.
        </p>
      </div>

      {/* Phase 1 — Candidatures */}
      <div className="space-y-4">
        <SectionLabel>Phase 1 — Dépôt des candidatures</SectionLabel>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Ouverture des candidatures" required error={errors.candidatureStartDate}>
            <div className="relative">
              <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="datetime-local"
                value={form.candidatureStartDate}
                onChange={(e) => setForm("candidatureStartDate", e.target.value)}
                className={`${inputCls} pl-9`}
              />
            </div>
          </Field>

          <Field label="Clôture des candidatures" required error={errors.candidatureEndDate}>
            <div className="relative">
              <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="datetime-local"
                value={form.candidatureEndDate}
                onChange={(e) => setForm("candidatureEndDate", e.target.value)}
                className={`${inputCls} pl-9`}
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Phase separator */}
      <div className="flex items-center justify-center py-1">
        <div className="flex flex-col items-center gap-0.5 text-slate-300 dark:text-slate-600">
          <div className="h-3 w-px bg-current" />
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Phase 2 — Vote */}
      <div className="space-y-4">
        <SectionLabel>Phase 2 — Vote</SectionLabel>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Ouverture du vote" required error={errors.voteStartDate}>
            <div className="relative">
              <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="datetime-local"
                value={form.voteStartDate}
                onChange={(e) => setForm("voteStartDate", e.target.value)}
                className={`${inputCls} pl-9`}
              />
            </div>
          </Field>

          <Field label="Clôture du vote" required error={errors.voteEndDate}>
            <div className="relative">
              <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="datetime-local"
                value={form.voteEndDate}
                onChange={(e) => setForm("voteEndDate", e.target.value)}
                className={`${inputCls} pl-9`}
              />
            </div>
          </Field>
        </div>
      </div>

      {errors.calendar && <Alert type="error">{errors.calendar}</Alert>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Étape 4 — Récapitulatif
───────────────────────────────────────────────────────────── */

function ReviewRow({ label, value }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="text-[13px] text-slate-700 dark:text-slate-200">{value || "—"}</p>
    </div>
  );
}

function StepApercu({ preset, form }) {
  const cfg = NIVEAU_CFG[preset.niveau];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">
          Récapitulatif
        </h2>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Vérifiez les informations avant d'enregistrer l'élection.
        </p>
      </div>

      {/* Election title block */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className={`h-[3px] ${cfg.accent}`} />
        <div className="px-5 py-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold ${cfg.badge}`}>
              {NIVEAU_LABELS[preset.niveau]}
            </span>
            <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              {preset.seatsCount} siège{preset.seatsCount > 1 ? "s" : ""}
            </span>
            {form.region && (
              <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                <MapPin size={10} /> {form.region}
              </span>
            )}
          </div>
          <h3 className="text-[18px] font-bold text-slate-900 dark:text-slate-100">
            {form.titre || preset.label}
          </h3>
          {form.description && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              {form.description}
            </p>
          )}
        </div>
      </div>

      {/* Details + Calendar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Identification */}
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Identification
            </p>
          </div>
          <div className="px-4 py-1">
            <ReviewRow label="Organe"          value={preset.label} />
            <ReviewRow label="Corps électoral" value={CORPS_LABELS[preset.corpsElectoral]} />
            <ReviewRow label="Portée"          value={NIVEAU_LABELS[preset.niveau]} />
            {form.region && <ReviewRow label="Région" value={form.region} />}
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Calendrier
            </p>
          </div>
          <div className="px-4 py-1">
            <ReviewRow
              label="Ouverture candidatures"
              value={form.candidatureStartDate ? fmtDate(`${form.candidatureStartDate}:00`) : ""}
            />
            <ReviewRow
              label="Clôture candidatures"
              value={form.candidatureEndDate ? fmtDate(`${form.candidatureEndDate}:00`) : ""}
            />
            <ReviewRow
              label="Ouverture du vote"
              value={form.voteStartDate ? fmtDate(`${form.voteStartDate}:00`) : ""}
            />
            <ReviewRow
              label="Clôture du vote"
              value={form.voteEndDate ? fmtDate(`${form.voteEndDate}:00`) : ""}
            />
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Postes générés — {preset.positions.length} au total
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Verrouillés à l'ouverture des candidatures
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/30">
              <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Libellé
              </th>
              <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Sièges
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {preset.positions.map((p, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-200">
                  {p.libelle}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-[11px] font-bold text-green-600 dark:bg-green-950/30 dark:text-green-400">
                    {p.nombreSieges}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Modal de confirmation
───────────────────────────────────────────────────────────── */

function ConfirmModal({ onCancel, onConfirm, saving }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
              Enregistrer l'élection
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-400 dark:text-slate-500">
              L'élection sera créée en statut Brouillon.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-green-500"
            />
            <span className="text-[13px] leading-5 text-slate-600 dark:text-slate-300">
              J'ai vérifié toutes les informations et confirme l'enregistrement de cette élection.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Annuler
          </button>
          <button
            disabled={!checked || saving}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Enregistrer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page principale — logique inchangée
───────────────────────────────────────────────────────────── */

export default function AdminElectionCreationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [step, setStep] = useState(STEP_TYPE);
  const [presetKey, setPresetKey] = useState("");

  const [form, setFormState] = useState({
    titre: "",
    description: "",
    region: "",
    candidatureStartDate: "",
    candidatureEndDate: "",
    voteStartDate: "",
    voteEndDate: "",
  });

  const [electionStatut, setElectionStatut] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [blockedTypes, setBlockedTypes] = useState(new Set());
  const [blockedRegions, setBlockedRegions] = useState(new Set());

  const preset = presetKey ? ELECTION_PRESETS[presetKey] : null;
  const typeLocked = isEdit && electionStatut && electionStatut !== "BROUILLON";

  const setForm = (key, value) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  /* Load blocked types */
  useEffect(() => {
    if (isEdit) return;
    const INACTIFS = ["ARCHIVEE", "ANNULEE"];
    getAllElections({ size: 200 })
      .then(({ data }) => {
        const list = data?.content ?? [];
        const types = new Set();
        const regions = new Set();
        for (const e of list) {
          if (!INACTIFS.includes(e.statut)) {
            types.add(e.type);
            if (e.type === "REPRESENTANTS_REGIONAUX" && e.region)
              regions.add(e.region.toLowerCase());
          }
        }
        setBlockedTypes(types);
        setBlockedRegions(regions);
      })
      .catch(() => {});
  }, [isEdit]);

  /* Load election on edit */
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getElectionById(id)
      .then(({ data }) => {
        const key =
          data.presetCode && ELECTION_PRESETS[data.presetCode]
            ? data.presetCode
            : Object.keys(ELECTION_PRESETS).find((k) => {
                const p = ELECTION_PRESETS[k];
                return (
                  p.type === data.type &&
                  p.corpsElectoral === data.corpsElectoral &&
                  p.niveau === data.niveau
                );
              }) || "";
        setPresetKey(key);
        setElectionStatut(data.statut);
        setFormState({
          titre:                data.titre || "",
          description:          data.description || "",
          region:               data.region || "",
          candidatureStartDate: fromISO(data.candidatureStartDate),
          candidatureEndDate:   fromISO(data.candidatureEndDate),
          voteStartDate:        fromISO(data.voteStartDate),
          voteEndDate:          fromISO(data.voteEndDate),
        });
      })
      .catch(() => setSaveError("Impossible de charger l'élection."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  /* Validation — identique */
  const validateStep = (targetStep) => {
    const e = {};

    if (targetStep > STEP_TYPE) {
      if (!presetKey) {
        e.presetKey = "Veuillez sélectionner un type d'élection.";
      } else {
        const selectedType = ELECTION_PRESETS[presetKey]?.type;
        if (
          selectedType !== "REPRESENTANTS_REGIONAUX" &&
          blockedTypes.has(selectedType)
        )
          e.presetKey =
            "Une élection active de ce type existe déjà. Veuillez l'archiver ou l'annuler.";
      }
    }

    if (targetStep > STEP_INFO) {
      if (!form.titre.trim() || form.titre.trim().length < 5)
        e.titre = "Le titre doit comporter au moins 5 caractères.";
      if (preset?.requiresRegion && !form.region)
        e.region = "La région est obligatoire.";
      if (
        preset?.requiresRegion &&
        form.region &&
        blockedRegions.has(form.region.toLowerCase())
      )
        e.region = "Une élection active existe déjà pour cette région.";
    }

    if (targetStep > STEP_CALENDRIER) {
      const cs = form.candidatureStartDate;
      const ce = form.candidatureEndDate;
      const vs = form.voteStartDate;
      const ve = form.voteEndDate;

      if (!cs) e.candidatureStartDate = "Date requise.";
      if (!ce) e.candidatureEndDate   = "Date requise.";
      if (!vs) e.voteStartDate        = "Date requise.";
      if (!ve) e.voteEndDate          = "Date requise.";

      if (cs && ce && vs && ve) {
        const cS = new Date(cs), cE = new Date(ce);
        const vS = new Date(vs), vE = new Date(ve);
        if (cS >= cE)
          e.calendar = "La clôture des candidatures doit être après l'ouverture.";
        else if (cE >= vS)
          e.calendar = "L'ouverture du vote doit être après la clôture des candidatures.";
        else if (vS >= vE)
          e.calendar = "La clôture du vote doit être après son ouverture.";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step + 1)) return;
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    setErrors({});
    setSaveError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const goTo = (i) => {
    setErrors({});
    setSaveError("");
    setStep(i);
  };

  const syncPositions = async (electionId) => {
    if (!preset) return;
    const existing = (await getPositions(electionId)).data ?? [];
    for (const p of existing) await deletePosition(electionId, p.id);
    for (const p of preset.positions) await addPosition(electionId, p);
  };

  const submit = async () => {
    if (!validateStep(STEP_APERCU + 1)) { setShowModal(false); return; }

    if (isEdit && electionStatut !== "BROUILLON") {
      setSaveError("Cette élection ne peut plus être modifiée car elle n'est plus en brouillon.");
      setShowModal(false);
      return;
    }
    if (!preset) {
      setSaveError("Veuillez sélectionner un type d'élection.");
      setShowModal(false);
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const payload = {
        titre:               form.titre.trim(),
        description:         form.description.trim() || null,
        type:                preset.type,
        niveau:              preset.niveau,
        region:              preset.requiresRegion ? form.region : null,
        seatsCount:          preset.seatsCount,
        maxVotesParElecteur: preset.maxVotesParElecteur,
        corpsElectoral:      preset.corpsElectoral,
        presetCode:          presetKey,
        quorumPourcentage:   null,
        candidatureStartDate: toISO(form.candidatureStartDate),
        candidatureEndDate:   toISO(form.candidatureEndDate),
        voteStartDate:        toISO(form.voteStartDate),
        voteEndDate:          toISO(form.voteEndDate),
      };

      let electionId = id;
      if (isEdit) {
        await updateElection(id, payload);
      } else {
        const res = await createElection(payload);
        electionId = res.data.id;
      }

      await syncPositions(electionId);
      navigate(`/admin/processus/elections/${electionId}`);
    } catch (err) {
      setSaveError(
        err?.response?.data?.message || "Une erreur est survenue. Veuillez réessayer."
      );
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  /* Loading skeleton */
  if (loading) {
    return (
      <AdminLayout title="Chargement">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 size={22} className="animate-spin text-slate-400" />
        </div>
      </AdminLayout>
    );
  }

  /* ── Render ────────────────────────────────────────────── */
  return (
    <AdminLayout title={isEdit ? "Modifier l'élection" : "Nouvelle élection"}>
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">

        {/* Back navigation */}
        <button
          onClick={() => navigate("/admin/processus/elections")}
          className="mb-5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft size={14} />
          Retour aux élections
        </button>

        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-[19px] font-bold text-slate-900 dark:text-slate-100">
            {isEdit ? "Modifier l'élection" : "Créer une élection"}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400 dark:text-slate-500">
            Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* Horizontal stepper */}
          <Stepper current={step} onGoTo={goTo} />

          {/* Step content */}
          <div className="min-h-[520px] px-8 py-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                {step === STEP_TYPE && (
                  <StepType
                    presetKey={presetKey}
                    setPresetKey={setPresetKey}
                    error={errors.presetKey}
                    locked={typeLocked}
                    blockedTypes={blockedTypes}
                  />
                )}

                {step === STEP_INFO && preset && (
                  <StepInfo
                    form={form}
                    setForm={setForm}
                    preset={preset}
                    errors={errors}
                    blockedRegions={blockedRegions}
                  />
                )}

                {step === STEP_CALENDRIER && (
                  <StepCalendrier
                    form={form}
                    setForm={setForm}
                    errors={errors}
                  />
                )}

                {step === STEP_APERCU && preset && (
                  <StepApercu preset={preset} form={form} />
                )}
              </motion.div>
            </AnimatePresence>

            {saveError && (
              <div className="mt-6">
                <Alert type="error">{saveError}</Alert>
              </div>
            )}
          </div>

          {/* Navigation footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-8 py-4 dark:border-slate-800 dark:bg-slate-800/20">
            <button
              onClick={step === 0 ? () => navigate("/admin/processus/elections") : goPrev}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronLeft size={14} />
              {step === 0 ? "Annuler" : "Précédent"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-green-600 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                Suivant
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                disabled={saving}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-green-600 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                Enregistrer l'élection
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <ConfirmModal
            onCancel={() => setShowModal(false)}
            onConfirm={submit}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
