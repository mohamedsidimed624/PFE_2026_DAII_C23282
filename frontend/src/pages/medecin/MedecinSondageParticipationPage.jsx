import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Loader2, CheckCircle2, ShieldCheck, Clock, ClipboardList,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getSondageDetail, startParticipation, submitReponses } from "../../services/medecinSondageApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  CONSULTATION_INSTITUTIONNELLE: "Consultation institutionnelle",
  PULSE:                         "Pulse",
  QUESTIONNAIRE_SCIENTIFIQUE:    "Questionnaire scientifique",
  SATISFACTION:                  "Satisfaction",
  ETUDE_EFFECTIFS:               "Étude des effectifs",
};

const TYPE_COLORS = {
  CONSULTATION_INSTITUTIONNELLE: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
  PULSE:                         "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
  QUESTIONNAIRE_SCIENTIFIQUE:    "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  SATISFACTION:                  "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
  ETUDE_EFFECTIFS:               "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

function estimeDuree(n) {
  return Math.max(1, Math.ceil((n * 30) / 60));
}

// ── Question renderers ────────────────────────────────────────────────────────

function QuestionInput({ q, value, onChange }) {
  const type = q.typeQuestion;

  if (type === "OUI_NON") {
    return (
      <div className="flex gap-3">
        {["OUI", "NON"].map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 rounded-xl border-2 py-4 text-[15px] font-semibold transition-colors ${
              value === opt
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
            }`}
          >
            {opt === "OUI" ? "Oui" : "Non"}
          </button>
        ))}
      </div>
    );
  }

  if (type === "CHOIX_UNIQUE") {
    return (
      <div className="space-y-2.5">
        {(q.choix || []).filter(Boolean).map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[13px] transition-colors ${
              value === opt
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
            }`}
          >
            <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
              value === opt ? "border-green-500 bg-green-500" : "border-slate-300 dark:border-slate-600"
            }`} />
            <span className={value === opt ? "font-semibold text-green-700 dark:text-green-300" : "text-slate-700 dark:text-slate-200"}>
              {opt}
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (type === "CHOIX_MULTIPLE") {
    const selected = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const toggle = (opt) => {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];
      onChange(next.join(", "));
    };
    return (
      <div className="space-y-2.5">
        {(q.choix || []).filter(Boolean).map((opt) => {
          const checked = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[13px] transition-colors ${
                checked
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
              }`}
            >
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                checked ? "border-green-500 bg-green-500" : "border-slate-300 dark:border-slate-600"
              }`}>
                {checked && <CheckCircle2 size={10} className="text-white" />}
              </div>
              <span className={checked ? "font-semibold text-green-700 dark:text-green-300" : "text-slate-700 dark:text-slate-200"}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (type === "ECHELLE") {
    const min = q.echelleMin ?? 1;
    const max = q.echelleMax ?? 10;
    const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
      <div>
        <div className="flex flex-wrap gap-2">
          {nums.map((n) => (
            <button
              key={n}
              onClick={() => onChange(String(n))}
              className={`h-10 w-10 rounded-lg border-2 text-[13px] font-semibold transition-colors ${
                value === String(n)
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>{min} — Pas du tout</span>
          <span>Tout à fait — {max}</span>
        </div>
      </div>
    );
  }

  if (type === "TEXTE") {
    return (
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Votre réponse…"
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-[13px] text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300 focus:border-green-400 transition-colors"
      />
    );
  }

  if (type === "DATE") {
    return (
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-700 dark:text-slate-200 outline-none focus:border-green-400 transition-colors"
      />
    );
  }

  if (type === "NUMERIQUE") {
    return (
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Entrez un nombre"
        className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300 focus:border-green-400 transition-colors"
      />
    );
  }

  return null;
}

// ── Views ─────────────────────────────────────────────────────────────────────

function IntroView({ sondage, onStart, starting }) {
  const duree = estimeDuree(sondage.nbQuestions ?? 0);
  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_COLORS[sondage.type] ?? "bg-slate-100 text-slate-500"}`}>
              {TYPE_LABELS[sondage.type] ?? sondage.type}
            </span>
            {sondage.anonyme && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <ShieldCheck size={10} /> Anonyme
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
            {sondage.titre}
          </h1>
          {sondage.description && (
            <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {sondage.description}
            </p>
          )}
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 px-6 py-4">
            <ClipboardList size={16} className="text-slate-400" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Questions</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{sondage.nbQuestions}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 border-l border-slate-100 dark:border-slate-800 px-6 py-4">
            <Clock size={16} className="text-slate-400" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Durée estimée</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">~{duree} min</p>
            </div>
          </div>
        </div>

        {/* Anonyme notice */}
        {sondage.anonyme && (
          <div className="mx-6 mb-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 px-4 py-3">
            <div className="flex items-start gap-2">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-[12px] text-blue-700 dark:text-blue-300 leading-relaxed">
                Ce sondage est <strong>anonyme</strong> — vos réponses ne seront pas associées à votre profil une fois soumises.
              </p>
            </div>
          </div>
        )}

        {/* Start button */}
        <div className="px-6 pb-6">
          <button
            onClick={onStart}
            disabled={starting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            {starting
              ? <><Loader2 size={16} className="animate-spin" /> Chargement…</>
              : "Commencer la consultation"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticipationView({ sondage, participationId, onSuccess }) {
  const questions    = sondage.questions ?? [];
  const total        = questions.length;
  const [idx, setIdx]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [dir, setDir]        = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]          = useState("");

  const current = questions[idx];
  const value   = answers[current?.ordre] ?? "";
  const isLast  = idx === total - 1;
  const progress = total > 0 ? ((idx + 1) / total) * 100 : 0;

  const canAdvance = !current?.obligatoire || (value !== "" && value !== null);

  const go = (delta) => {
    setDir(delta);
    setIdx((i) => Math.max(0, Math.min(total - 1, i + delta)));
  };

  const setAnswer = (val) => {
    setAnswers((prev) => ({ ...prev, [current.ordre]: val }));
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const reponses = Object.entries(answers).map(([questionOrdre, valeur]) => ({
        questionOrdre: Number(questionOrdre),
        valeur:        String(valeur),
      }));
      await submitReponses({ participationId, reponses });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Une erreur s'est produite. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 30 : -30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d) => ({ x: d > 0 ? -30 : 30, opacity: 0 }),
  };

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress bar */}
      <div className="mb-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 h-1.5">
        <motion.div
          className="h-full rounded-full bg-green-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="mb-4 text-center text-[12px] text-slate-400">
        Question {idx + 1} sur {total}
      </p>

      {/* Question card */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={idx}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="p-6"
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {idx + 1} / {total}
            </p>
            <h2 className="mb-1 text-[16px] font-bold text-slate-800 dark:text-slate-100 leading-snug">
              {current?.titre}
              {current?.obligatoire && <span className="ml-1 text-red-400">*</span>}
            </h2>
            {current?.description && (
              <p className="mb-4 text-[12px] text-slate-500 dark:text-slate-400">{current.description}</p>
            )}
            <div className="mt-5">
              <QuestionInput
                q={current}
                value={value}
                onChange={setAnswer}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-5 py-4">
          <button
            onClick={() => go(-1)}
            disabled={idx === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[13px] font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30"
          >
            <ChevronLeft size={14} /> Précédent
          </button>

          {isLast ? (
            <button
              onClick={submit}
              disabled={!canAdvance || submitting}
              className="flex items-center gap-1.5 rounded-lg bg-green-700 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? <><Loader2 size={14} className="animate-spin" /> Envoi…</>
                : "Soumettre"
              }
            </button>
          ) : (
            <button
              onClick={() => go(1)}
              disabled={!canAdvance}
              className="flex items-center gap-1.5 rounded-lg bg-green-700 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suivant <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 px-4 py-3">
          <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

function SuccessView() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-sm text-center">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 px-8 py-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
        >
          <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-[18px] font-bold text-slate-800 dark:text-slate-100">
            Participation enregistrée
          </h2>
          <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Merci pour votre participation. Vos réponses ont été transmises à l'ONMM.
          </p>
          <button
            onClick={() => navigate("/medecin/sondages")}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-green-800"
          >
            Retour aux sondages
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MedecinSondageParticipationPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [sondage,    setSondage]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState("intro"); // intro | participation | success
  const [participationId, setParticipationId] = useState(null);
  const [starting,   setStarting]   = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    getSondageDetail(id)
      .then((res) => setSondage(res.data))
      .catch(() => navigate("/medecin/sondages"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      const res = await startParticipation(id);
      setParticipationId(res.data.participationId);
      // Merge detailed questions from the start response
      if (res.data.sondage?.questions) {
        setSondage((prev) => ({ ...prev, questions: res.data.sondage.questions }));
      }
      setView("participation");
    } catch (err) {
      if (err?.response?.status === 409) {
        setError("Vous avez déjà complété ce sondage.");
      } else {
        setError(err?.response?.data?.message ?? "Impossible de démarrer. Réessayez.");
      }
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <MedecinLayout title="Chargement…">
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-300" />
        </div>
      </MedecinLayout>
    );
  }

  return (
  <MedecinLayout title={sondage?.titre ?? "Sondage"}>
    <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl space-y-5">
        {view === "intro" && (
          <button
            onClick={() => navigate("/medecin/sondages")}
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
          >
            <ChevronLeft size={14} />
            Retour aux sondages
          </button>
        )}

        {error && view === "intro" && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/10">
            <p className="text-[13px] text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === "intro" && sondage && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <IntroView
                sondage={sondage}
                onStart={handleStart}
                starting={starting}
              />
            </motion.div>
          )}

          {view === "participation" && sondage && (
            <motion.div
              key="participation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ParticipationView
                sondage={sondage}
                participationId={participationId}
                onSuccess={() => setView("success")}
              />
            </motion.div>
          )}

          {view === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SuccessView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </MedecinLayout>
);
}
