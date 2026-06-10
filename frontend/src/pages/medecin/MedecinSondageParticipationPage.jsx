import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

import MedecinLayout from "../../components/medecin/MedecinLayout";
import {
  getSondageDetail,
  startParticipation,
  submitReponses,
} from "../../services/medecinSondageApi";

const TYPE_LABELS = {
  CONSULTATION_INSTITUTIONNELLE: "Consultation institutionnelle",
  PULSE: "Pulse",
  QUESTIONNAIRE_SCIENTIFIQUE: "Questionnaire scientifique",
  SATISFACTION: "Satisfaction",
  ETUDE_EFFECTIFS: "Étude des effectifs",
};

const TYPE_COLORS = {
  CONSULTATION_INSTITUTIONNELLE:
    "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  PULSE:
    "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  QUESTIONNAIRE_SCIENTIFIQUE:
    "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  SATISFACTION:
    "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  ETUDE_EFFECTIFS:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function estimeDuree(n) {
  return Math.max(1, Math.ceil(((n || 0) * 30) / 60));
}

function QuestionInput({ q, value, onChange }) {
  const type = q.typeQuestion;

  if (type === "OUI_NON") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {["OUI", "NON"].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`h-12 rounded-lg border text-sm font-semibold transition ${
              value === opt
                ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "border-slate-100 bg-white text-slate-500 hover:border-green-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
      <div className="space-y-2">
        {(q.choix || []).filter(Boolean).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
              value === opt
                ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "border-slate-100 bg-white text-slate-600 hover:border-green-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full border-2 ${
                value === opt
                  ? "border-green-500 bg-green-500"
                  : "border-slate-300 dark:border-slate-600"
              }`}
            />
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (type === "CHOIX_MULTIPLE") {
    const selected = value
      ? value.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const toggle = (opt) => {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];

      onChange(next.join(", "));
    };

    return (
      <div className="space-y-2">
        {(q.choix || []).filter(Boolean).map((opt) => {
          const checked = selected.includes(opt);

          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                checked
                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "border-slate-100 bg-white text-slate-600 hover:border-green-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                  checked
                    ? "border-green-500 bg-green-500"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              >
                {checked && <CheckCircle2 size={10} className="text-white" />}
              </span>
              {opt}
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
              type="button"
              onClick={() => onChange(String(n))}
              className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${
                value === String(n)
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-slate-100 bg-white text-slate-600 hover:border-green-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-2 flex justify-between text-xs text-slate-400">
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
        rows={5}
        placeholder="Votre réponse…"
        className="w-full resize-none rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      />
    );
  }

  if (type === "DATE") {
    return (
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-slate-100 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
        className="h-11 w-full rounded-lg border border-slate-100 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      />
    );
  }

  return null;
}

function IntroView({ sondage, onStart, starting }) {
  const duree = estimeDuree(sondage.nbQuestions);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-7 py-6 dark:border-slate-800">
        <div className="mb-3 flex flex-wrap gap-2">
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
              TYPE_COLORS[sondage.type] || "bg-slate-100 text-slate-500"
            }`}
          >
            {TYPE_LABELS[sondage.type] ?? sondage.type}
          </span>

          {sondage.anonyme && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <ShieldCheck size={12} />
              Anonyme
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {sondage.titre}
        </h1>

        {sondage.description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {sondage.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 border-b border-slate-100 dark:border-slate-800 sm:grid-cols-2">
        <div className="flex items-center gap-3 px-7 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <ClipboardList size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Questions
            </p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {sondage.nbQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 px-7 py-5 dark:border-slate-800 sm:border-l sm:border-t-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Durée estimée
            </p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              ~{duree} min
            </p>
          </div>
        </div>
      </div>

      {sondage.anonyme && (
        <div className="mx-7 mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/10">
          <div className="flex gap-2">
            <ShieldCheck size={15} className="mt-0.5 text-blue-500" />
            <p className="text-sm leading-6 text-blue-700 dark:text-blue-300">
              Ce sondage est anonyme. Vos réponses ne seront pas associées à
              votre profil une fois soumises.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end px-7 py-6">
        <button
          onClick={onStart}
          disabled={starting}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-green-500 px-5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {starting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Chargement…
            </>
          ) : (
            "Commencer la consultation"
          )}
        </button>
      </div>
    </div>
  );
}

function ParticipationView({ sondage, participationId, onSuccess }) {
  const questions = sondage.questions ?? [];
  const total = questions.length;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const current = questions[idx];
  const value = answers[current?.ordre] ?? "";
  const isLast = idx === total - 1;
  const progress = total > 0 ? ((idx + 1) / total) * 100 : 0;

  const canAdvance = !current?.obligatoire || value !== "";

  const go = (delta) => {
    setDir(delta);
    setIdx((i) => Math.max(0, Math.min(total - 1, i + delta)));
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const reponses = Object.entries(answers).map(([questionOrdre, valeur]) => ({
        questionOrdre: Number(questionOrdre),
        valeur: String(valeur),
      }));

      await submitReponses({ participationId, reponses });
      onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Une erreur s'est produite. Réessayez."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 28 : -28, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -28 : 28, opacity: 0 }),
  };

  if (!current) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
        Aucune question disponible.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>
            Question {idx + 1} sur {total}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-green-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={idx}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.16, ease: "easeInOut" }}
            className="px-7 py-7"
          >
            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">
              Question {idx + 1}
            </p>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {current.titre}
              {current.obligatoire && (
                <span className="ml-1 text-red-400">*</span>
              )}
            </h2>

            {current.description && (
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {current.description}
              </p>
            )}

            <div className="mt-6">
              <QuestionInput
                q={current}
                value={value}
                onChange={(val) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [current.ordre]: val,
                  }))
                }
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-slate-100 px-7 py-5 dark:border-slate-800">
          <button
            onClick={() => go(-1)}
            disabled={idx === 0}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-100 bg-white px-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <ChevronLeft size={14} />
            Précédent
          </button>

          {isLast ? (
            <button
              onClick={submit}
              disabled={!canAdvance || submitting}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-green-500 px-5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Envoi…
                </>
              ) : (
                "Soumettre"
              )}
            </button>
          ) : (
            <button
              onClick={() => go(1)}
              disabled={!canAdvance}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-green-500 px-5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suivant
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/10 dark:text-red-400">
          <AlertCircle size={15} />
          {error}
        </div>
      )}
    </div>
  );
}

function SuccessView() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-100 bg-white px-8 py-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle2 size={34} />
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Participation enregistrée
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Merci pour votre participation. Vos réponses ont été transmises à
        l'ONMM.
      </p>

      <button
        onClick={() => navigate("/medecin/sondages")}
        className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-green-500 text-sm font-semibold text-white transition hover:bg-green-600"
      >
        Retour aux sondages
      </button>
    </div>
  );
}

export default function MedecinSondageParticipationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sondage, setSondage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("intro");
  const [participationId, setParticipationId] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

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

      if (res.data.sondage?.questions) {
        setSondage((prev) => ({
          ...prev,
          questions: res.data.sondage.questions,
        }));
      }

      setView("participation");
    } catch (err) {
      setError(
        err?.response?.status === 409
          ? "Vous avez déjà complété ce sondage."
          : err?.response?.data?.message ||
              "Impossible de démarrer. Réessayez."
      );
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <MedecinLayout title="Chargement…">
        <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] dark:bg-slate-950">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout title={sondage?.titre ?? "Sondage"}>
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl space-y-5">
          {view === "intro" && (
            <button
              onClick={() => navigate("/medecin/sondages")}
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ChevronLeft size={15} />
              Retour aux sondages
            </button>
          )}

          {error && view === "intro" && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/10 dark:text-red-400">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {view === "intro" && sondage && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
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