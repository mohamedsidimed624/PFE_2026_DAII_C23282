import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Loader2, Save, Send, X,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  createElection, getElectionById, updateElection,
  ouvrirCandidatures, getPositions, addPosition, deletePosition,
} from "../../services/adminElectionApi";

// ─── Modèles d'élection ONMM ─────────────────────────────────────────────────
const ELECTION_PRESETS = {
  CONSEIL_NATIONAL: {
    label: "Conseil National de l'Ordre",
    description: "Élection des 25 membres du Conseil National, organe délibérant suprême de l'ONMM.",
    type: "CONSEIL_NATIONAL",
    niveau: "NATIONAL",
    corpsElectoral: "TOUS_MEDECINS_ACTIFS",
    requiresRegion: false,
    seatsCount: 25,
    maxVotesParElecteur: 10,
    positions: [
      { libelle: "Section A — Médecins généralistes",           nombreSieges: 10, maxVotesParElecteur: 10, ordre: 1 },
      { libelle: "Section B — Médecins spécialistes",           nombreSieges: 6,  maxVotesParElecteur: 6,  ordre: 2 },
      { libelle: "Section C — Médecins enseignants-chercheurs", nombreSieges: 6,  maxVotesParElecteur: 6,  ordre: 3 },
      { libelle: "Représentants des régions de l'intérieur",    nombreSieges: 3,  maxVotesParElecteur: 3,  ordre: 4 },
    ],
  },
  BUREAU_EXECUTIF: {
    label: "Bureau Exécutif",
    description: "Élection des 8 membres du Bureau Exécutif, organe de direction de l'ONMM.",
    type: "BUREAU_EXECUTIF",
    niveau: "NATIONAL",
    corpsElectoral: "TOUS_MEDECINS_ACTIFS",
    requiresRegion: false,
    seatsCount: 8,
    maxVotesParElecteur: 1,
    positions: [
      { libelle: "Président",                  nombreSieges: 1, maxVotesParElecteur: 1, ordre: 1 },
      { libelle: "Vice-président",             nombreSieges: 1, maxVotesParElecteur: 1, ordre: 2 },
      { libelle: "Secrétaire général",         nombreSieges: 1, maxVotesParElecteur: 1, ordre: 3 },
      { libelle: "Secrétaire général adjoint", nombreSieges: 1, maxVotesParElecteur: 1, ordre: 4 },
      { libelle: "Trésorier",                  nombreSieges: 1, maxVotesParElecteur: 1, ordre: 5 },
      { libelle: "Trésorier adjoint",          nombreSieges: 1, maxVotesParElecteur: 1, ordre: 6 },
      { libelle: "Assesseur 1",                nombreSieges: 1, maxVotesParElecteur: 1, ordre: 7 },
      { libelle: "Assesseur 2",                nombreSieges: 1, maxVotesParElecteur: 1, ordre: 8 },
    ],
  },
  CONSEIL_SECTION_A: {
    label: "Conseil de Section A",
    description: "Élection des 10 représentants de la Section A — médecins généralistes.",
    type: "COMMISSION_SPECIALISEE",
    niveau: "NATIONAL",
    corpsElectoral: "TOUS_MEDECINS_ACTIFS",
    requiresRegion: false,
    seatsCount: 10,
    maxVotesParElecteur: 10,
    positions: [
      { libelle: "Membre du Conseil — Section A", nombreSieges: 10, maxVotesParElecteur: 10, ordre: 1 },
    ],
  },
  CONSEIL_SECTION_B: {
    label: "Conseil de Section B",
    description: "Élection des 6 représentants de la Section B — médecins spécialistes.",
    type: "COMMISSION_SPECIALISEE",
    niveau: "NATIONAL",
    corpsElectoral: "MEMBRES_SPECIALISTE",
    requiresRegion: false,
    seatsCount: 6,
    maxVotesParElecteur: 6,
    positions: [
      { libelle: "Membre du Conseil — Section B", nombreSieges: 6, maxVotesParElecteur: 6, ordre: 1 },
    ],
  },
  CONSEIL_SECTION_C: {
    label: "Conseil de Section C",
    description: "Élection des 6 représentants de la Section C — médecins enseignants-chercheurs.",
    type: "COMMISSION_SPECIALISEE",
    niveau: "NATIONAL",
    corpsElectoral: "TOUS_MEDECINS_ACTIFS",
    requiresRegion: false,
    seatsCount: 6,
    maxVotesParElecteur: 6,
    positions: [
      { libelle: "Membre du Conseil — Section C", nombreSieges: 6, maxVotesParElecteur: 6, ordre: 1 },
    ],
  },
  REPRESENTANT_REGIONAL: {
    label: "Représentant Régional",
    description: "Élection du représentant d'une région de l'intérieur au Conseil National.",
    type: "CONSEIL_REGIONAL",
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
  TOUS_MEDECINS_ACTIFS: "Tous les médecins actifs",
  MEDECINS_REGION:      "Médecins de la région",
  MEMBRES_SPECIALISTE:  "Médecins spécialistes (Section B)",
};

const NIVEAU_LABELS = {
  NATIONAL: "National",
  REGIONAL: "Régional",
  LOCAL:    "Local",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toISO   = (dt) => (dt ? `${dt}:00` : null);
const fromISO = (dt) => (dt ? String(dt).slice(0, 16) : "");
const dayDiff = (a, b) => (new Date(b) - new Date(a)) / 86_400_000;
const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

// ─── Steps ───────────────────────────────────────────────────────────────────
const STEPS         = ["Type d'élection", "Informations", "Calendrier", "Aperçu"];
const STEP_TYPE       = 0;
const STEP_INFO       = 1;
const STEP_CALENDRIER = 2;
const STEP_APERCU     = 3;

// ─── Styles partagés ─────────────────────────────────────────────────────────
const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 " +
  "outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
const labelCls = "block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5";

// ─── Composants UI ────────────────────────────────────────────────────────────
function Field({ label, error, required, children, help }) {
  return (
    <div>
      <label className={labelCls}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error   && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
      {!error && help && <p className="mt-1 text-[11px] text-slate-400">{help}</p>}
    </div>
  );
}

function StepperBar({ current }) {
  return (
    <div className="flex items-start gap-0 mb-7">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all
              ${i < current  ? "bg-emerald-600 text-white"
              : i === current ? "border-2 border-emerald-600 bg-white text-emerald-600 dark:bg-slate-900"
              :                 "border border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-800"}`}
            >
              {i < current ? <Check size={13} /> : i + 1}
            </div>
            <span className={`mt-1 text-[10px] font-semibold whitespace-nowrap hidden sm:block
              ${i === current ? "text-emerald-600" : "text-slate-400"}`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 -mt-3 ${i < current ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CalendarTimeline({ form }) {
  const points = [
    { label: "Ouv. candidatures", v: form.candidatureStartDate },
    { label: "Clôt. candidatures", v: form.candidatureEndDate },
    { label: "Ouverture vote",     v: form.voteStartDate },
    { label: "Clôture vote",       v: form.voteEndDate },
  ];
  return (
    <div className="flex items-start mt-5">
      {points.map((p, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full">
            <div className={`flex-1 h-px ${i === 0 ? "opacity-0" : p.v ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />
            <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${p.v ? "bg-emerald-500" : "border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`} />
            <div className={`flex-1 h-px ${i === points.length - 1 ? "opacity-0" : p.v && points[i + 1]?.v ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />
          </div>
          <p className="mt-1.5 text-center text-[10px] font-semibold text-slate-400 leading-tight px-1">{p.label}</p>
          {p.v && <p className="text-center text-[10px] text-slate-500">{fmtDate(`${p.v}:00`)}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Panneau résumé latéral ───────────────────────────────────────────────────
function SideSummary({ presetKey, form }) {
  const preset = presetKey ? ELECTION_PRESETS[presetKey] : null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-4 sticky top-6">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-3">Résumé</p>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-slate-400 mb-0.5">Organe</p>
          {preset
            ? <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">{preset.label}</p>
            : <p className="text-[12px] text-slate-300 dark:text-slate-600">Non sélectionné</p>
          }
        </div>

        {preset && (
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400">
              {NIVEAU_LABELS[preset.niveau] ?? preset.niveau}
            </span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              {preset.seatsCount} siège{preset.seatsCount > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {form.titre && (
          <div>
            <p className="text-[10px] text-slate-400 mb-0.5">Titre</p>
            <p className="text-[12px] text-slate-600 dark:text-slate-300 wrap-break-word leading-snug">{form.titre}</p>
          </div>
        )}

        {form.region && (
          <div>
            <p className="text-[10px] text-slate-400 mb-0.5">Région</p>
            <p className="text-[12px] text-slate-600 dark:text-slate-300">{form.region}</p>
          </div>
        )}

        {form.candidatureStartDate && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1">Calendrier</p>
            <div className="space-y-0.5">
              {[
                ["Cand. ouv.", form.candidatureStartDate],
                ["Cand. clôt.", form.candidatureEndDate],
                ["Vote ouv.", form.voteStartDate],
                ["Vote clôt.", form.voteEndDate],
              ].map(([lbl, val]) => val && (
                <div key={lbl} className="flex justify-between text-[10px]">
                  <span className="text-slate-400">{lbl}</span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {new Date(`${val}:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {preset && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1.5">Postes à pourvoir</p>
            <div className="space-y-1">
              {preset.positions.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-700/40 px-2.5 py-1.5">
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 truncate pr-2 leading-snug">{p.libelle}</span>
                  <span className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-px text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    {p.nombreSieges}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Étape 0 : Type d'élection ────────────────────────────────────────────────
function StepType({ presetKey, setPresetKey, error, locked }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Type d'élection</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Choisissez l'organe concerné. Les postes et le corps électoral sont déduits automatiquement.
        </p>
      </div>

      {locked && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10 px-4 py-3 text-[12px] text-amber-700 dark:text-amber-400">
          Le type d'élection est verrouillé — les candidatures ont déjà été ouvertes.
        </div>
      )}

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(ELECTION_PRESETS).map(([key, p]) => {
          const selected = presetKey === key;
          return (
            <button
              key={key}
              type="button"
              disabled={locked}
              onClick={() => setPresetKey(selected ? "" : key)}
              className={`text-left rounded-xl border p-4 transition-all
                ${selected
                  ? "border-2 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"}
                ${locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug">{p.label}</p>
                {selected && <Check size={14} className="shrink-0 text-emerald-600 mt-0.5" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-2.5">{p.description}</p>
              <div className="flex flex-wrap gap-1">
                <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {p.positions.length} poste{p.positions.length > 1 ? "s" : ""}
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {NIVEAU_LABELS[p.niveau] ?? p.niveau}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Étape 1 : Informations générales ────────────────────────────────────────
function StepInfo({ form, setForm, preset, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Informations générales</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">Nommez l'élection et rédigez une description publique.</p>
      </div>

      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-4 py-3">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
          <span className="text-slate-500">Organe : <span className="font-semibold text-slate-700 dark:text-slate-200">{preset.label}</span></span>
          <span className="text-slate-500">Corps : <span className="font-semibold text-slate-700 dark:text-slate-200">{CORPS_LABELS[preset.corpsElectoral]}</span></span>
          <span className="text-slate-500">Portée : <span className="font-semibold text-slate-700 dark:text-slate-200">{NIVEAU_LABELS[preset.niveau]}</span></span>
        </div>
      </div>

      <Field label="Titre de l'élection" required error={errors.titre} help="Entre 5 et 120 caractères.">
        <input
          type="text"
          maxLength={120}
          value={form.titre}
          onChange={(e) => setForm("titre", e.target.value)}
          placeholder={`ex. Élection du ${preset.label} — 2025`}
          className={inputCls}
        />
      </Field>

      <Field label="Description publique" help="Optionnel. Visible par les médecins sur leur espace.">
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm("description", e.target.value)}
          placeholder="Contexte, enjeux, informations pratiques..."
          className={`${inputCls} h-auto py-2.5`}
        />
      </Field>

      {preset.requiresRegion && (
        <Field label="Région concernée" required error={errors.region}>
          <select
            value={form.region}
            onChange={(e) => setForm("region", e.target.value)}
            className={inputCls}
          >
            <option value="">— Sélectionner une région —</option>
            {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </Field>
      )}
    </div>
  );
}

// ─── Étape 2 : Calendrier ─────────────────────────────────────────────────────
function StepCalendrier({ form, setForm, errors }) {
  const fields = [
    { key: "candidatureStartDate", label: "Ouverture des candidatures" },
    { key: "candidatureEndDate",   label: "Clôture des candidatures" },
    { key: "voteStartDate",        label: "Ouverture du vote" },
    { key: "voteEndDate",          label: "Clôture du vote" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Calendrier électoral</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">Définissez les 4 dates clés du processus électoral.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label }) => (
          <Field key={key} label={label} required error={errors[key]}>
            <input
              type="datetime-local"
              value={form[key]}
              onChange={(e) => setForm(key, e.target.value)}
              className={inputCls}
            />
          </Field>
        ))}
      </div>

      {errors.calendar && (
        <div className="rounded-xl border border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 px-4 py-3 text-[12px] text-red-600 dark:text-red-400">
          {errors.calendar}
        </div>
      )}

      <CalendarTimeline form={form} />
    </div>
  );
}

// ─── Étape 3 : Aperçu & Confirmation ─────────────────────────────────────────
function StepApercu({ preset, form, onDraft, onOpen, saving }) {
  const fmtDt = (v) => (v ? fmtDate(`${v}:00`) : "—");
  const rows = [
    ["Organe",             preset.label],
    ["Corps électoral",    CORPS_LABELS[preset.corpsElectoral]],
    ["Portée",             NIVEAU_LABELS[preset.niveau]],
    ["Titre",              form.titre || "—"],
    form.region ? ["Région", form.region] : null,
    ["Description",        form.description || "—"],
    ["Ouv. candidatures",  fmtDt(form.candidatureStartDate)],
    ["Clôt. candidatures", fmtDt(form.candidatureEndDate)],
    ["Ouverture vote",     fmtDt(form.voteStartDate)],
    ["Clôture vote",       fmtDt(form.voteEndDate)],
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Aperçu & Confirmation</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">Vérifiez les informations avant d'enregistrer.</p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map(([lbl, val]) => (
          <div key={lbl} className="flex gap-4 px-4 py-2.5">
            <span className="w-44 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{lbl}</span>
            <span className="text-[13px] text-slate-700 dark:text-slate-200 wrap-break-word">{val}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
          Postes générés automatiquement
        </p>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Poste</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sièges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {preset.positions.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{p.libelle}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-700 dark:text-slate-200">{p.nombreSieges}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          ⚠ Les postes seront verrouillés après l'ouverture des candidatures.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="button"
          disabled={saving}
          onClick={onDraft}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Enregistrer en brouillon
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onOpen}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enregistrer et ouvrir les candidatures
        </button>
      </div>
    </div>
  );
}

// ─── Modal de confirmation ────────────────────────────────────────────────────
function ConfirmModal({ openAfterSave, onCancel, onConfirm, saving }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5">
          <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
            {openAfterSave ? "Ouvrir les candidatures" : "Enregistrer en brouillon"}
          </p>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {openAfterSave && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10 px-4 py-3 text-[12px] text-amber-700 dark:text-amber-400">
              L'ouverture des candidatures est irréversible. Les postes seront verrouillés immédiatement.
            </div>
          )}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600"
            />
            <span className="text-[13px] text-slate-600 dark:text-slate-300">
              J'ai vérifié toutes les informations et je confirme{" "}
              {openAfterSave ? "l'ouverture des candidatures." : "l'enregistrement."}
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Annuler
          </button>
          <button
            disabled={!checked || saving}
            onClick={onConfirm}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40
              ${openAfterSave ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-700 hover:bg-slate-800"}`}
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {openAfterSave ? "Ouvrir" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminElectionCreationPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [step, setStep]                     = useState(STEP_TYPE);
  const [presetKey, setPresetKey]           = useState("");
  const [form, setFormState]                = useState({
    titre: "", description: "", region: "",
    candidatureStartDate: "", candidatureEndDate: "",
    voteStartDate: "", voteEndDate: "",
  });
  const [electionStatut, setElectionStatut] = useState(null);
  const [loading, setLoading]               = useState(isEdit);
  const [saving, setSaving]                 = useState(false);
  const [errors, setErrors]                 = useState({});
  const [saveError, setSaveError]           = useState(null);
  const [showModal, setShowModal]           = useState(false);
  const [openAfterSave, setOpenAfterSave]   = useState(false);

  const setForm = (key, value) => setFormState((prev) => ({ ...prev, [key]: value }));
  const preset  = presetKey ? ELECTION_PRESETS[presetKey] : null;
  const typeLocked = isEdit && !!electionStatut && electionStatut !== "BROUILLON";

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getElectionById(id)
      .then(({ data }) => {
        const key = Object.keys(ELECTION_PRESETS).find((k) => {
          const p = ELECTION_PRESETS[k];
          return p.type === data.type && p.corpsElectoral === data.corpsElectoral && p.niveau === data.niveau;
        }) ?? "";
        setPresetKey(key);
        setElectionStatut(data.statut);
        setFormState({
          titre:                data.titre ?? "",
          description:          data.description ?? "",
          region:               data.region ?? "",
          candidatureStartDate: fromISO(data.candidatureStartDate),
          candidatureEndDate:   fromISO(data.candidatureEndDate),
          voteStartDate:        fromISO(data.voteStartDate),
          voteEndDate:          fromISO(data.voteEndDate),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function validateStep(targetStep) {
    const e = {};
    if (targetStep > STEP_TYPE) {
      if (!presetKey) e.presetKey = "Veuillez sélectionner un type d'élection.";
    }
    if (targetStep > STEP_INFO) {
      if (form.titre.trim().length < 5) e.titre = "Le titre doit comporter au moins 5 caractères.";
      if (preset?.requiresRegion && !form.region) e.region = "La région est obligatoire pour ce type d'élection.";
    }
    if (targetStep > STEP_CALENDRIER) {
      const { candidatureStartDate: cs, candidatureEndDate: ce, voteStartDate: vs, voteEndDate: ve } = form;
      if (!cs) e.candidatureStartDate = "Date requise.";
      if (!ce) e.candidatureEndDate   = "Date requise.";
      if (!vs) e.voteStartDate        = "Date requise.";
      if (!ve) e.voteEndDate          = "Date requise.";
      if (cs && ce && vs && ve) {
        if (new Date(cs) >= new Date(ce))
          e.calendar = "La clôture des candidatures doit être après l'ouverture.";
        else if (new Date(ce) >= new Date(vs))
          e.calendar = "L'ouverture du vote doit être après la clôture des candidatures.";
        else if (new Date(vs) >= new Date(ve))
          e.calendar = "La clôture du vote doit être après son ouverture.";
        else if (dayDiff(cs, ce) < 3)
          e.calendar = "La période de candidatures doit durer au moins 3 jours.";
        else if (dayDiff(vs, ve) < 1)
          e.calendar = "La période de vote doit durer au moins 1 jour.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goTo(target) {
    if (target > step && !validateStep(target)) return;
    setErrors({});
    setStep(target);
  }

  async function syncPositions(electionId) {
    const existing = (await getPositions(electionId)).data ?? [];
    for (const p of existing) await deletePosition(electionId, p.id);
    for (const p of preset.positions) await addPosition(electionId, p);
  }

  async function submit() {
    if (!validateStep(STEP_APERCU + 1)) { setShowModal(false); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        titre:                form.titre.trim(),
        description:          form.description.trim() || null,
        type:                 preset.type,
        niveau:               preset.niveau,
        region:               preset.requiresRegion ? form.region : null,
        seatsCount:           preset.seatsCount,
        maxVotesParElecteur:  preset.maxVotesParElecteur,
        corpsElectoral:       preset.corpsElectoral,
        quorumPourcentage:    null,
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
      if (openAfterSave) await ouvrirCandidatures(electionId);
      navigate(`/admin/processus/elections/${electionId}`);
    } catch (err) {
      setSaveError(err?.response?.data?.message ?? "Une erreur est survenue. Veuillez réessayer.");
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-6">
        <div className="mx-auto max-w-5xl">

          {/* En-tête */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/elections")}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-600 transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {isEdit ? "Modifier l'élection" : "Nouvelle élection"}
              </h1>
              <p className="text-[12px] text-slate-400">
                Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
              </p>
            </div>
          </div>

          {/* Layout 2 colonnes */}
          <div className="flex gap-5 items-start">

            {/* Formulaire principal */}
            <div className="flex-1 min-w-0">
              <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-6">
                <StepperBar current={step} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {step === STEP_TYPE && (
                      <StepType
                        presetKey={presetKey}
                        setPresetKey={setPresetKey}
                        error={errors.presetKey}
                        locked={typeLocked}
                      />
                    )}
                    {step === STEP_INFO && preset && (
                      <StepInfo form={form} setForm={setForm} preset={preset} errors={errors} />
                    )}
                    {step === STEP_CALENDRIER && (
                      <StepCalendrier form={form} setForm={setForm} errors={errors} />
                    )}
                    {step === STEP_APERCU && preset && (
                      <StepApercu
                        preset={preset}
                        form={form}
                        saving={saving}
                        onDraft={() => { setOpenAfterSave(false); setShowModal(true); }}
                        onOpen={()  => { setOpenAfterSave(true);  setShowModal(true); }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {saveError && (
                  <div className="mt-4 rounded-xl border border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 px-4 py-3 text-[12px] text-red-600 dark:text-red-400">
                    {saveError}
                  </div>
                )}

                {/* Boutons de navigation */}
                {step < STEP_APERCU && (
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => goTo(step - 1)}
                      disabled={step === 0}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ArrowLeft size={14} /> Précédent
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo(step + 1)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
                    >
                      Suivant <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Panneau résumé */}
            <div className="hidden lg:block w-64 shrink-0">
              <SideSummary presetKey={presetKey} form={form} />
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <ConfirmModal
          openAfterSave={openAfterSave}
          onCancel={() => setShowModal(false)}
          onConfirm={submit}
          saving={saving}
        />
      )}
    </AdminLayout>
  );
}
