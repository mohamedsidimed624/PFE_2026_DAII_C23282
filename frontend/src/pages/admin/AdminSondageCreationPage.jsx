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
  ClipboardList,
  Users,
  Eye,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import {
  createSondage,
  updateSondage,
  getSondageById,
  publishSondage,
} from "../../services/adminSondageApi";
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
  "h-[48px] w-full rounded-lg border bg-white px-4 text-[15px] text-[#123F4A] outline-none transition placeholder:text-slate-300 focus:border-[#35C878] focus:ring-2 focus:ring-[#35C878]/10";

const textareaCls =
  "w-full rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 text-[13px] leading-6 text-slate-600 dark:text-slate-200 shadow-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-green-400 resize-none";

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
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
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function Stepper({ current }) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 px-7 py-5">
      <div className="flex items-center">
        {STEPS.map((label, index) => {
          const active = index === current;
          const done = index < current;

          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition ${
                    done
                      ? "bg-green-700 text-white"
                      : active
                      ? "bg-green-700 text-white ring-4 dark:ring-green-900/30"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  }`}
                >
                  {done ? <CheckCircle2 size={14} /> : index + 1}
                </div>

                <div className="hidden md:block">
                  <p
                    className={`text-[13px] font-semibold ${
                      active
                        ? "text-green-600 dark:text-green-400"
                        : done
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                    Étape {index + 1}
                  </p>
                </div>
              </div>

              {index < STEPS.length - 1 && (
                <div className="mx-4 h-px flex-1 bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      done ? "w-full bg-green-500" : "w-0 bg-green-500"
                    }`}
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

function StepInfo({ form, setForm, errors }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-[16px] font-semibold text-slate-700 dark:text-slate-100">
          Informations de base
        </h2>
        <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
          Définissez le titre, le type et le contexte du sondage.
        </p>
      </div>

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
            onChange={(e) =>
              setForm({ ...form, anonyme: e.target.value === "true" })
            }
          >
            <option value="true">Anonyme</option>
            <option value="false">Nominatif</option>
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field label="Description">
            <textarea
              rows={7}
              className={textareaCls}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Expliquez clairement l'objectif du sondage, son contexte et les informations utiles pour les médecins ciblés."
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function StepAudience({ form, setForm, specialites }) {
  const hasFilter =
    form.filtreStatut ||
    form.filtreGenre ||
    form.filtreWilaya ||
    form.filtreSpecialite;

  const resetAudience = () => {
    setForm({
      ...form,
      filtreStatut: "",
      filtreGenre: "",
      filtreWilaya: "",
      filtreSpecialite: "",
    });
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-[16px] font-semibold text-slate-700 dark:text-slate-100">
          Audience ciblée
        </h2>
        <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
          Laissez les filtres vides pour cibler tous les médecins concernés.
        </p>
      </div>

      <div className="rounded-md border border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={!hasFilter}
            onChange={(e) => e.target.checked && resetAudience()}
            className="mt-1 h-4 w-4 rounded accent-green-500"
          />
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              Tous les médecins inscrits
            </p>
            <p className="mt-0.5 text-[12px] text-slate-400 dark:text-slate-500">
              Aucun filtre appliqué : le sondage sera visible pour toute l’audience.
            </p>
          </div>
        </label>
      </div>

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
            onChange={(e) =>
              setForm({ ...form, filtreSpecialite: e.target.value })
            }
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
    </section>
  );
}


function QuestionForm({ value, onChange, onCancel, onSave, editing }) {
  const needsChoices = ["CHOIX_UNIQUE", "CHOIX_MULTIPLE"].includes(
    value.typeQuestion
  );
  const needsScale = value.typeQuestion === "ECHELLE";

  const updateChoice = (index, text) => {
    const choix = [...value.choix];
    choix[index] = text;
    onChange({ ...value, choix });
  };

  return (
    <div className="rounded-md border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-700 dark:text-slate-100">
            {editing ? "Modifier la question" : "Nouvelle question"}
          </h3>
          <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
            Choisissez le type puis rédigez la question.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-5 p-5">
        <Field label="Type de question">
  <select
    className={inputCls}
    value={value.typeQuestion}
    onChange={(e) => {
      const nextType = e.target.value;

      onChange({
        ...value,
        typeQuestion: nextType,
        choix: ["CHOIX_UNIQUE", "CHOIX_MULTIPLE"].includes(nextType)
          ? value.choix?.length
            ? value.choix
            : ["", ""]
          : [],
      });
    }}
  >
    {QUESTION_TYPES.map((type) => (
      <option key={type.value} value={type.value}>
        {type.label}
      </option>
    ))}
  </select>
</Field>


        <Field label="Titre de la question" required>
          <input
            className={inputCls}
            value={value.titre}
            onChange={(e) => onChange({ ...value, titre: e.target.value })}
            placeholder="Ex : Êtes-vous favorable à cette proposition ?"
          />
        </Field>

        <Field label="Description / aide">
          <textarea
            rows={3}
            className={textareaCls}
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            placeholder="Texte d’aide optionnel visible par les médecins."
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
          <input
            type="checkbox"
            checked={value.obligatoire}
            onChange={(e) =>
              onChange({ ...value, obligatoire: e.target.checked })
            }
            className="h-4 w-4 rounded accent-green-500"
          />
          <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
            Réponse obligatoire
          </span>
        </label>

        {needsScale && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Valeur minimale">
              <input
                type="number"
                className={inputCls}
                value={value.echelleMin}
                onChange={(e) =>
                  onChange({ ...value, echelleMin: Number(e.target.value) })
                }
              />
            </Field>

            <Field label="Valeur maximale">
              <input
                type="number"
                className={inputCls}
                value={value.echelleMax}
                onChange={(e) =>
                  onChange({ ...value, echelleMax: Number(e.target.value) })
                }
              />
            </Field>
          </div>
        )}

        {needsChoices && (
          <Field label="Options de réponse" required>
            <div className="space-y-2">
              {value.choix.map((choice, index) => (
                <div key={index} className="flex items-center gap-2">
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
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => onChange({ ...value, choix: [...value.choix, ""] })}
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-600 hover:text-green-700 dark:text-green-400"
              >
                <Plus size={14} />
                Ajouter une option
              </button>
            </div>
          </Field>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-100 bg-white px-5 py-2 text-[13px] font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-md bg-green-500 px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600"
          >
            {editing ? "Enregistrer" : "Ajouter la question"}
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
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-700 dark:text-slate-100">
            Questions du sondage
          </h2>
          <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
            Construisez le questionnaire envoyé aux médecins.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setQuestionDraft({ ...EMPTY_QUESTION });
              setEditingIndex(null);
              setQuestionError("");
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-green-500 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600"
          >
            <Plus size={15} />
            Ajouter une question
          </button>
        )}
      </div>

      {questionError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {questionError}
        </div>
      )}

      {showForm && (
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
      )}

      {!showForm && questions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <ClipboardList size={28} className="mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            Aucune question ajoutée
          </p>
          <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
            Ajoutez au moins une question pour continuer.
          </p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="overflow-hidden rounded-md border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              {questions.length} question{questions.length > 1 ? "s" : ""} ajoutée
              {questions.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {questions.map((q, index) => {
              const meta = QUESTION_TYPES.find((t) => t.value === q.typeQuestion);
              const Icon = meta?.icon || Circle;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                        {index + 1}. {q.titre}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                        {meta?.label}
                        {q.obligatoire ? " · Obligatoire" : " · Facultative"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editQuestion(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function StepPreview({
  form,
  questions,
  dateDebut,
  setDateDebut,
  dateFin,
  setDateFin,
  publishError,
}) {
  const typeLabel =
    TYPE_OPTIONS.find((t) => t.value === form.type)?.label || "—";

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-[16px] font-semibold text-slate-700 dark:text-slate-100">
          Aperçu avant enregistrement
        </h2>
        <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
          Vérifiez les informations avant d’enregistrer ou de publier.
        </p>
      </div>

      <div className="rounded-md border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
              {typeLabel}
            </span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {form.anonyme ? "Anonyme" : "Nominatif"}
            </span>
          </div>

          <h3 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">
            {form.titre || "—"}
          </h3>

          <p className="mt-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
            {form.description || "Aucune description"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
          <PreviewCell icon={<ClipboardList size={15} />} label="Questions" value={questions.length} />
          <PreviewCell icon={<Users size={15} />} label="Audience" value={form.filtreWilaya || form.filtreSpecialite ? "Filtrée" : "Tous"} />
          <PreviewCell icon={<Eye size={15} />} label="Visibilité" value="Après publication" />
        </div>
      </div>

      <div className="rounded-md border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-1 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
          Publication
        </p>
        <p className="mb-4 text-[13px] text-slate-400 dark:text-slate-500">
          La date de clôture est obligatoire uniquement si vous publiez maintenant.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Date d’ouverture">
            <input
              type="datetime-local"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Date de clôture">
            <input
              type="datetime-local"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {publishError && (
          <p className="mt-3 text-[12px] text-red-500">{publishError}</p>
        )}
      </div>

      {/* {questions.length > 0 && (
        <div className="rounded-md border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              Questions
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {questions.map((q, i) => (
              <div key={i} className="px-5 py-3">
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                  {i + 1}. {q.titre}
                  {q.obligatoire && <span className="ml-1 text-red-400">*</span>}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {QUESTION_TYPES.find((t) => t.value === q.typeQuestion)?.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </section>
  );
}

function PreviewCell({ icon, label, value }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 md:border-b-0 md:border-r last:md:border-r-0">
      <div className="mb-2 flex items-center gap-2 text-green-500">{icon}</div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
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

  const [questionDraft, setQuestionDraft] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [questionError, setQuestionError] = useState("");

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [publishError, setPublishError] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(isEdit);

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

        setQuestions(
          (s.questions || []).map((q) => ({
            ...EMPTY_QUESTION,
            ...q,
            choix: q.choix || [],
          }))
        );

        setDateDebut(s.dateDebut ? s.dateDebut.slice(0, 16) : "");
        setDateFin(s.dateFin ? s.dateFin.slice(0, 16) : "");
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

    if (step === 2 && questions.length === 0) {
      setQuestionError("Ajoutez au moins une question.");
      return false;
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
    setQuestionError("");
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
        echelleMin:
          q.typeQuestion === "ECHELLE" ? Number(q.echelleMin) : null,
        echelleMax:
          q.typeQuestion === "ECHELLE" ? Number(q.echelleMax) : null,
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
      if (isEdit) await updateSondage(id, payload);
      else await createSondage(payload);

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
        dateFin: toIso(dateFin),
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
        <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] dark:bg-slate-950">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Modifier le sondage" : "Nouveau sondage"}>
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
        <button
          onClick={() => navigate("/admin/sondages")}
          className="mb-5 inline-flex items-center gap-2 text-[13px] font-medium text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
        >
          <ArrowLeft size={15} />
          Retour aux sondages
        </button>

        <div className="mb-5">
          <h1 className="text-[17px] font-semibold text-slate-700 dark:text-slate-100">
            {isEdit ? "Modifier le sondage" : "Nouveau sondage"}
          </h1>
          <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
            Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        <div className="overflow-hidden rounded-md bg-white shadow-sm dark:bg-slate-900">
          <Stepper current={step} />

          <div className="min-h-[460px] px-7 py-6">
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
                )}

                {step === 3 && (
                  <StepPreview
                    form={form}
                    questions={questions}
                    dateDebut={dateDebut}
                    setDateDebut={setDateDebut}
                    dateFin={dateFin}
                    setDateFin={setDateFin}
                    publishError={publishError}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {saveError && (
              <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {saveError}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-7 py-5 dark:border-slate-800 dark:bg-slate-800/40">
            <button
              onClick={step === 0 ? () => navigate("/admin/sondages") : prev}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-100 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronLeft size={14} />
              {step === 0 ? "Annuler" : "Précédent"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-green-500 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600"
              >
                Suivant
                <ChevronRight size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={save}
                  disabled={saving || publishing}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-100 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Enregistrer
                </button>

                <button
                  onClick={saveAndPublish}
                  disabled={saving || publishing}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-green-500 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:opacity-50"
                >
                  {publishing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
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