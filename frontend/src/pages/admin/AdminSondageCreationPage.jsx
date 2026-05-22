import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  SquareCheck,
  ThumbsUp,
  Star,
  AlignLeft,
  Calendar,
  Hash,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  X,
  Send,
  Save,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import { createSondage, updateSondage, getSondageById, publishSondage } from "../../services/adminSondageApi";
import { getSpecialites } from "../../services/api";

const toIso = (v) => (v ? (v.length === 16 ? v + ":00" : v) : null);

const STEPS = ["Informations", "Audience", "Questions", "Aperçu"];

const TYPE_OPTIONS = [
  { value: "CONSULTATION_INSTITUTIONNELLE", label: "Consultation institutionnelle" },
  { value: "PULSE", label: "Pulse" },
  { value: "QUESTIONNAIRE_SCIENTIFIQUE", label: "Questionnaire scientifique" },
  { value: "SATISFACTION", label: "Satisfaction" },
  { value: "ETUDE_EFFECTIFS", label: "Étude des effectifs" },
];

const QUESTION_TYPES = [
  { value: "CHOIX_UNIQUE", label: "Choix unique", icon: Circle },
  { value: "CHOIX_MULTIPLE", label: "Choix multiple", icon: SquareCheck },
  { value: "OUI_NON", label: "Oui / Non", icon: ThumbsUp },
  { value: "ECHELLE", label: "Échelle", icon: Star },
  { value: "TEXTE", label: "Texte libre", icon: AlignLeft },
  { value: "DATE", label: "Date", icon: Calendar },
  { value: "NUMERIQUE", label: "Numérique", icon: Hash },
];

const WILAYAS = [
  "Adrar",
  "Assaba",
  "Brakna",
  "Dakhlet Nouadhibou",
  "Gorgol",
  "Guidimakha",
  "Hodh Ech Chargui",
  "Hodh El Gharbi",
  "Inchiri",
  "Nouakchott Nord",
  "Nouakchott Ouest",
  "Nouakchott Sud",
  "Tagant",
  "Tiris Zemmour",
  "Trarza",
];

const DEFAULT_FORM = {
  titre: "",
  description: "",
  type: "",
  anonyme: true,
  filtreStatut: "",
  filtreGenre: "",
  filtreWilaya: "",
  filtreSpecialite: "",
};

const EMPTY_QUESTION = {
  typeQuestion: "CHOIX_UNIQUE",
  titre: "",
  description: "",
  obligatoire: true,
  echelleMin: 1,
  echelleMax: 10,
  choix: ["", ""],
};

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

const textAreaCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Stepper({ current }) {
  return (
    <div className="mb-8 border-b border-slate-100 pb-7 dark:border-slate-800">
      <div className="flex items-center justify-between gap-4">
        {STEPS.map((label, i) => {
          const active = i === current;
          const done = i < current;

          return (
            <div key={i} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    active || done
                      ? "bg-green-500 text-white"
                      : "bg-slate-300 text-white dark:bg-slate-700"
                  }`}
                >
                  {done ? <CheckCircle2 size={16} /> : i + 1}
                </div>

                <span
                  className={`hidden text-sm font-semibold md:block ${
                    active
                      ? "text-green-600 dark:text-green-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <ChevronRight
                  size={18}
                  className="mx-6 shrink-0 text-slate-300 dark:text-slate-600"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepInfo({ form, setForm, errors }) {
  return (
    <section>
      <h2 className="mb-6 text-lg font-bold text-slate-800 dark:text-slate-100">
        Informations générales
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Titre du sondage" required error={errors.titre}>
          <input
            className={inputCls}
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            placeholder="Ex : Consultation sur la formation continue"
          />
        </Field>

        <Field label="Type de sondage" required error={errors.type}>
          <select
            className={inputCls}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="">Sélectionner un type</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mode de réponse">
          <select
            className={inputCls}
            value={form.anonyme ? "true" : "false"}
            onChange={(e) => setForm({ ...form, anonyme: e.target.value === "true" })}
          >
            <option value="true">Anonyme</option>
            <option value="false">Nominatif</option>
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field label="Description">
            <textarea
              rows={5}
              className={textAreaCls}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Expliquez l’objectif du sondage et le contexte de consultation."
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function StepAudience({ form, setForm, specialites }) {
  return (
    <section>
      <h2 className="mb-6 text-lg font-bold text-slate-800 dark:text-slate-100">
        Audience ciblée
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Statut du médecin">
          <select
            className={inputCls}
            value={form.filtreStatut}
            onChange={(e) => setForm({ ...form, filtreStatut: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="SUSPENDU">Suspendu</option>
          </select>
        </Field>

        <Field label="Genre">
          <select
            className={inputCls}
            value={form.filtreGenre}
            onChange={(e) => setForm({ ...form, filtreGenre: e.target.value })}
          >
            <option value="">Tous les genres</option>
            <option value="M">Hommes</option>
            <option value="F">Femmes</option>
          </select>
        </Field>

        <Field label="Wilaya d’exercice">
          <select
            className={inputCls}
            value={form.filtreWilaya}
            onChange={(e) => setForm({ ...form, filtreWilaya: e.target.value })}
          >
            <option value="">Toutes les wilayas</option>
            {WILAYAS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Spécialité">
          <select
            className={inputCls}
            value={form.filtreSpecialite}
            onChange={(e) => setForm({ ...form, filtreSpecialite: e.target.value })}
          >
            <option value="">Toutes les spécialités</option>
            {specialites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.libelle}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
        Les champs laissés vides signifient que le sondage sera visible pour tous
        les médecins concernés.
      </p>
    </section>
  );
}

function QuestionForm({ value, onChange, onCancel, onSave, editing }) {
  const needsChoices = ["CHOIX_UNIQUE", "CHOIX_MULTIPLE"].includes(value.typeQuestion);
  const needsScale = value.typeQuestion === "ECHELLE";

  const updateChoice = (index, text) => {
    const choix = [...value.choix];
    choix[index] = text;
    onChange({ ...value, choix });
  };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 dark:border-emerald-900/40 dark:bg-emerald-900/10">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">
          {editing ? "Modifier la question" : "Nouvelle question"}
        </h3>

        <button onClick={onCancel} className="text-slate-400 hover:text-red-500">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <Field label="Titre de la question" required>
          <input
            className={inputCls}
            value={value.titre}
            onChange={(e) => onChange({ ...value, titre: e.target.value })}
            placeholder="Saisir la question"
          />
        </Field>

        <Field label="Description / aide">
          <input
            className={inputCls}
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            placeholder="Texte d’aide optionnel"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Type de réponse">
            <select
              className={inputCls}
              value={value.typeQuestion}
              onChange={(e) =>
                onChange({
                  ...value,
                  typeQuestion: e.target.value,
                  choix: ["CHOIX_UNIQUE", "CHOIX_MULTIPLE"].includes(e.target.value)
                    ? value.choix?.length >= 2
                      ? value.choix
                      : ["", ""]
                    : [],
                })
              }
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Obligation">
            <label className="flex h-10 items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={value.obligatoire}
                onChange={(e) => onChange({ ...value, obligatoire: e.target.checked })}
                className="h-4 w-4 accent-emerald-600"
              />
              Réponse obligatoire
            </label>
          </Field>
        </div>

        {needsScale && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Valeur minimale">
              <input
                type="number"
                className={inputCls}
                value={value.echelleMin}
                onChange={(e) => onChange({ ...value, echelleMin: Number(e.target.value) })}
              />
            </Field>

            <Field label="Valeur maximale">
              <input
                type="number"
                className={inputCls}
                value={value.echelleMax}
                onChange={(e) => onChange({ ...value, echelleMax: Number(e.target.value) })}
              />
            </Field>
          </div>
        )}

        {needsChoices && (
          <Field label="Options de réponse" required>
            <div className="space-y-2">
              {value.choix.map((choice, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={inputCls}
                    value={choice}
                    onChange={(e) => updateChoice(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />

                  {value.choix.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...value,
                          choix: value.choix.filter((_, i) => i !== index),
                        })
                      }
                      className="rounded-lg border border-red-100 px-3 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => onChange({ ...value, choix: [...value.choix, ""] })}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
              >
                <Plus size={15} />
                Ajouter une option
              </button>
            </div>
          </Field>
        )}

        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            Annuler
          </button>

          <button
            onClick={onSave}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {editing ? "Enregistrer la modification" : "Ajouter la question"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepQuestions({
  questions,
  setQuestions,
  questionDraft,
  setQuestionDraft,
  editingIndex,
  setEditingIndex,
  questionError,
  setQuestionError,
}) {
  const showForm = Boolean(questionDraft);

  const validateQuestionDraft = () => {
    if (!questionDraft.titre.trim()) {
      setQuestionError("Le titre de la question est obligatoire.");
      return false;
    }

    if (["CHOIX_UNIQUE", "CHOIX_MULTIPLE"].includes(questionDraft.typeQuestion)) {
      const choices = questionDraft.choix.map((c) => c.trim()).filter(Boolean);

      if (choices.length < 2) {
        setQuestionError("Une question à choix doit contenir au moins deux options.");
        return false;
      }
    }

    if (
      questionDraft.typeQuestion === "ECHELLE" &&
      Number(questionDraft.echelleMin) >= Number(questionDraft.echelleMax)
    ) {
      setQuestionError("La valeur minimale doit être inférieure à la valeur maximale.");
      return false;
    }

    setQuestionError("");
    return true;
  };

  const saveQuestion = () => {
    if (!validateQuestionDraft()) return;

    const clean = {
      ...questionDraft,
      titre: questionDraft.titre.trim(),
      description: questionDraft.description?.trim() || "",
      choix: ["CHOIX_UNIQUE", "CHOIX_MULTIPLE"].includes(questionDraft.typeQuestion)
        ? questionDraft.choix.map((c) => c.trim()).filter(Boolean)
        : [],
    };

    if (editingIndex !== null) {
      setQuestions((prev) =>
        prev.map((q, index) => (index === editingIndex ? clean : q))
      );
    } else {
      setQuestions((prev) => [...prev, clean]);
    }

    setQuestionDraft(null);
    setEditingIndex(null);
    setQuestionError("");
  };

  const editQuestion = (index) => {
    setEditingIndex(index);
    setQuestionDraft({ ...questions[index] });
    setQuestionError("");
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Questions du sondage
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ajoutez les questions une par une après validation.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setQuestionDraft({ ...EMPTY_QUESTION });
              setEditingIndex(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={16} />
            Ajouter une question
          </button>
        )}
      </div>

      {showForm && (
        <>
          <QuestionForm
            value={questionDraft}
            onChange={setQuestionDraft}
            onCancel={() => {
              setQuestionDraft(null);
              setEditingIndex(null);
              setQuestionError("");
            }}
            onSave={saveQuestion}
            editing={editingIndex !== null}
          />

          {questionError && <p className="mt-2 text-sm text-red-500">{questionError}</p>}
        </>
      )}

      <div className="mt-5 space-y-3">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            Aucune question ajoutée
          </div>
        ) : (
          questions.map((q, index) => {
            const Icon =
              QUESTION_TYPES.find((t) => t.value === q.typeQuestion)?.icon || Circle;

            return (
              <div
                key={index}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800">
                    <Icon size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {index + 1}. {q.titre}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {QUESTION_TYPES.find((t) => t.value === q.typeQuestion)?.label}
                      {q.obligatoire ? " · Obligatoire" : " · Facultative"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => editQuestion(index)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-emerald-600"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => removeQuestion(index)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function StepFinalisation({ form, questions, dateFin, setDateFin, dateDebut, setDateDebut, publishError }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">
        Aperçu & publication
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        Vérifiez le résumé puis enregistrez comme brouillon ou publiez directement.
      </p>

      {/* Summary */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
        <p className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Résumé</p>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <p>
            <span className="text-slate-400">Titre : </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{form.titre || "—"}</span>
          </p>
          <p>
            <span className="text-slate-400">Type : </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {TYPE_OPTIONS.find((t) => t.value === form.type)?.label || "—"}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Mode : </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {form.anonyme ? "Anonyme" : "Nominatif"}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Questions : </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{questions.length}</span>
          </p>
          {form.filtreWilaya && (
            <p>
              <span className="text-slate-400">Wilaya : </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{form.filtreWilaya}</span>
            </p>
          )}
          {form.filtreGenre && (
            <p>
              <span className="text-slate-400">Genre : </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {form.filtreGenre === "M" ? "Hommes" : "Femmes"}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Publication dates */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
        <p className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-200">Publier maintenant</p>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Précisez la date de clôture pour activer le bouton « Publier maintenant ».
          Sans date d'ouverture, le sondage sera actif immédiatement.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Date d'ouverture{" "}
              <span className="font-normal normal-case text-slate-300">(optionnelle)</span>
            </label>
            <input
              type="datetime-local"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className={inputCls}
            />
            {dateDebut && new Date(dateDebut) > new Date() && (
              <p className="mt-1 text-[11px] text-blue-500">
                Le sondage sera planifié et activé à cette date.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Date de clôture <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        {publishError && (
          <p className="mt-3 text-sm text-red-500">{publishError}</p>
        )}
      </div>
    </section>
  );
}

export default function AdminSondageCreationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [questions, setQuestions] = useState([]);
  const [specialites, setSpecialites] = useState([]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");

  const [questionDraft, setQuestionDraft] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [questionError, setQuestionError] = useState("");

  const [dateFin,      setDateFin]      = useState("");
  const [dateDebut,    setDateDebut]    = useState("");
  const [publishing,   setPublishing]   = useState(false);
  const [publishError, setPublishError] = useState("");

  useEffect(() => {
    getSpecialites()
      .then((res) => setSpecialites(res.data || []))
      .catch(() => setSpecialites([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    getSondageById(id)
      .then((res) => {
        const s = res.data;

        if (s.statut !== "BROUILLON") {
          navigate("/admin/sondages");
          return;
        }

        setForm({
          titre: s.titre || "",
          description: s.description || "",
          type: s.type || "",
          anonyme: s.anonyme ?? true,
          filtreStatut: s.filtreStatut || "",
          filtreGenre: s.filtreGenre || "",
          filtreWilaya: s.filtreWilaya || "",
          filtreSpecialite: s.filtreSpecialite || "",
        });

        setQuestions(s.questions || []);
      })
      .catch(() => navigate("/admin/sondages"))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.titre.trim()) e.titre = "Le titre est obligatoire.";
      if (!form.type) e.type = "Le type est obligatoire.";
    }
    if (step === 2) {
      if (questions.length === 0) e.questions = "Ajoutez au moins une question.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const payload = useMemo(
    () => ({
      titre: form.titre.trim(),
      description: form.description.trim() || null,
      type: form.type,
      anonyme: form.anonyme,
      filtreStatut: form.filtreStatut || null,
      filtreGenre: form.filtreGenre || null,
      filtreWilaya: form.filtreWilaya || null,
      filtreSpecialite: form.filtreSpecialite || null,
      questions: questions.map((q, index) => ({
        ordre: index + 1,
        typeQuestion: q.typeQuestion,
        titre: q.titre.trim(),
        description: q.description?.trim() || null,
        obligatoire: q.obligatoire,
        echelleMin: q.typeQuestion === "ECHELLE" ? Number(q.echelleMin) : null,
        echelleMax: q.typeQuestion === "ECHELLE" ? Number(q.echelleMax) : null,
        choix: ["CHOIX_UNIQUE", "CHOIX_MULTIPLE"].includes(q.typeQuestion)
          ? q.choix.map((c) => c.trim()).filter(Boolean)
          : null,
      })),
    }),
    [form, questions]
  );

  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      isEdit ? await updateSondage(id, payload) : await createSondage(payload);
      navigate("/admin/sondages");
    } catch (err) {
      setSaveError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Impossible d’enregistrer le sondage."
      );
    } finally {
      setSaving(false);
    }
  };

  const saveAndPublish = async () => {
    if (!dateFin) {
      setPublishError("La date de clôture est obligatoire pour publier.");
      return;
    }
    setPublishing(true);
    setSaveError("");
    setPublishError("");
    try {
      let sondageId = id;
      if (!isEdit) {
        const res = await createSondage(payload);
        sondageId = res.data.id;
      } else {
        await updateSondage(id, payload);
      }
      await publishSondage(sondageId, {
        dateDebut: toIso(dateDebut) || null,
        dateFin:   toIso(dateFin),
      });
      navigate("/admin/sondages");
    } catch (err) {
      setPublishError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Impossible de publier le sondage."
      );
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Chargement">
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Modifier le sondage" : "Nouveau sondage"}>
      <div className="min-h-screen bg-[#F7F8FC] px-7 py-6 dark:bg-slate-950">
        <button
          onClick={() => navigate("/admin/sondages")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-700"
        >
          <ArrowLeft size={15} />
          Retour aux sondages
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {isEdit ? "Modifier le sondage" : "Nouveau sondage"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Préparez un sondage interne destiné aux médecins de l’Ordre.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
          <Stepper step={step} />

          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {step === 0 && (
                  <StepInfo form={form} setForm={setForm} errors={errors} />
                )}

                {step === 1 && (
                  <StepAudience
                    form={form}
                    setForm={setForm}
                    specialites={specialites}
                  />
                )}

                {step === 2 && (
                  <>
                    <StepQuestions
                      questions={questions}
                      setQuestions={setQuestions}
                      questionDraft={questionDraft}
                      setQuestionDraft={setQuestionDraft}
                      editingIndex={editingIndex}
                      setEditingIndex={setEditingIndex}
                      questionError={questionError}
                      setQuestionError={setQuestionError}
                    />
                    {errors.questions && (
                      <p className="mt-3 text-sm text-red-500">{errors.questions}</p>
                    )}
                  </>
                )}

                {step === 3 && (
                  <StepFinalisation
                    form={form}
                    questions={questions}
                    dateFin={dateFin}
                    setDateFin={setDateFin}
                    dateDebut={dateDebut}
                    setDateDebut={setDateDebut}
                    publishError={publishError}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {saveError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
            <button
              onClick={step === 0 ? () => navigate("/admin/sondages") : prev}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
            >
              <ChevronLeft size={15} />
              {step === 0 ? "Quitter" : "Précédent"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Suivant
                <ChevronRight size={15} />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving || publishing}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Enregistrer brouillon
                </button>
                <button
                  onClick={saveAndPublish}
                  disabled={saving || publishing || !dateFin}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  Publier maintenant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}