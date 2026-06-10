import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import MedecinLayout from "../../components/medecin/MedecinLayout";
import { createMedecinReclamation } from "../../services/medecinReclamationApi";

import {
  ArrowLeft,
  Send,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Clock,
  ShieldCheck,
  ListChecks,
  Tag,
  FileText,
  Loader2,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";

const CATEGORIES = [
  { value: "RETARD_TRAITEMENT", label: "Retard de traitement", group: "Administratif" },
  { value: "ERREUR_DOSSIER", label: "Erreur sur dossier", group: "Administratif" },
  { value: "DEMANDE_INFORMATION", label: "Demande d'information", group: "Administratif" },
  { value: "QUALITE_SOINS", label: "Qualité des soins", group: "Pratique médicale" },
  { value: "CERTIFICAT_MEDICAL", label: "Certificat médical", group: "Pratique médicale" },
  { value: "PRESCRIPTION_ABUSIVE", label: "Prescription abusive", group: "Pratique médicale" },
  { value: "INFORMATION_CONSENTEMENT", label: "Information et consentement", group: "Pratique médicale" },
  { value: "COMPORTEMENT_INAPPROPRIE", label: "Comportement inapproprié", group: "Déontologie" },
  { value: "SECRET_PROFESSIONNEL", label: "Secret professionnel", group: "Déontologie" },
  { value: "CONFRATERNITE", label: "Confraternité", group: "Déontologie" },
  { value: "PUBLICITE_CHARLATANISME", label: "Publicité / charlatanisme", group: "Déontologie" },
  { value: "DECONSIDERATION_PROFESSION", label: "Déconsidération de la profession", group: "Déontologie" },
  { value: "AUTRE", label: "Autre", group: "Autre" },
];

const GROUPS = [...new Set(CATEGORIES.map((c) => c.group))];

const MAX_OBJET = 120;
const MAX_MESSAGE = 2000;

const inputCls = (hasIcon, hasError) =>
  `h-10 w-full rounded border bg-white text-sm text-slate-700 outline-none transition
   placeholder:text-slate-400
   focus:border-blue-500 focus:ring-1 focus:ring-blue-500
   dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500
   ${hasIcon ? "pl-9 pr-3" : "px-3"}
   ${hasError ? "border-red-400" : "border-slate-300 dark:border-slate-700"}`;

const textareaCls = (hasError) =>
  `w-full resize-none rounded border bg-white px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition
   placeholder:text-slate-400
   focus:border-blue-500 focus:ring-1 focus:ring-blue-500
   dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500
   ${hasError ? "border-red-400" : "border-slate-300 dark:border-slate-700"}`;

function Field({ label, required, hint, icon, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {hint && (
        <p className="mb-1.5 text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      )}

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        {children}
      </div>

      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

function StepInfo({ icon, text }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}

export default function MedecinReclamationCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    categorie: "",
    objet: "",
    message: "",
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [copied, setCopied] = useState(false);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const e = {};

    if (!form.objet.trim()) {
      e.objet = "L'objet est obligatoire.";
    } else if (form.objet.trim().length < 5) {
      e.objet = "Minimum 5 caractères.";
    }

    if (!form.categorie) {
      e.categorie = "Sélectionnez une catégorie.";
    }

    if (!form.message.trim()) {
      e.message = "La description est obligatoire.";
    } else if (form.message.trim().length < 20) {
      e.message = "Minimum 20 caractères.";
    }

    if (file) {
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];

      if (file.type && !allowedTypes.includes(file.type)) {
        e.file = "Format non supporté. Utilisez PDF, PNG ou JPG.";
      } else if (file.size > 5 * 1024 * 1024) {
        e.file = "Le fichier dépasse 5 Mo.";
      }
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const res = await createMedecinReclamation(
        {
          categorie: form.categorie,
          objet: form.objet.trim(),
          message: form.message.trim(),
        },
        file
      );

      setSubmitted({
        numero: res?.numeroReclamation || res?.data?.numeroReclamation || "",
      });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Impossible de soumettre la réclamation."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReference = async () => {
    if (!submitted?.numero) return;

    try {
      await navigator.clipboard.writeText(submitted.numero);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Erreur lors de la copie :", err);
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setForm({
      categorie: "",
      objet: "",
      message: "",
    });
    setFile(null);
    setErrors({});
    setSubmitError("");
    setCopied(false);
  };

  if (submitted) {
    return (
      <MedecinLayout title="Réclamation soumise">
        <div className="mx-auto max-w-xl py-8 text-center">
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          >
            <CheckCircle2 size={34} />
          </motion.div>

          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            Réclamation soumise avec succès
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Votre réclamation a été transmise à l’administration de l’Ordre.
          </p>

          {submitted.numero && (
            <div className="mx-auto mt-6 w-full max-w-sm rounded border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-400">
                Référence de réclamation
              </p>

              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                  {submitted.numero}
                </span>

                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-blue-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              {copied && (
                <p className="mt-2 text-xs font-medium text-green-600">
                  Référence copiée
                </p>
              )}
            </div>
          )}

          <div className="mt-6 rounded border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-4 text-xs font-semibold uppercase text-slate-400">
              Prochaines étapes
            </p>

            <div className="space-y-3">
              <StepInfo
                icon={<Clock size={14} />}
                text="Votre réclamation sera examinée par l’administration."
              />
              <StepInfo
                icon={<ShieldCheck size={14} />}
                text="Vous serez contacté si des informations complémentaires sont nécessaires."
              />
              <StepInfo
                icon={<ListChecks size={14} />}
                text="Vous pouvez suivre l’état de traitement depuis la page Mes réclamations."
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate("/medecin/reclamations")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded bg-blue-600 px-5 text-sm font-semibold uppercase text-white shadow-sm transition hover:bg-blue-700"
            >
              <ListChecks size={15} />
              Mes réclamations
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-10 items-center justify-center rounded border border-slate-300 bg-white px-5 text-sm font-semibold uppercase text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Nouvelle réclamation
            </button>
          </div>
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout title="Nouvelle réclamation">
      <div className="px-4 py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* <div>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
              Nouvelle réclamation
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Déposez une réclamation liée à votre dossier ou à votre activité professionnelle.
            </p>
          </div> */}

          <button
            type="button"
            onClick={() => navigate("/medecin/reclamations")}
            className="inline-flex h-10 items-center gap-2 self-start rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={15} />
            Mes réclamations
          </button>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Informations de la réclamation
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Renseignez les informations nécessaires pour transmettre votre réclamation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                  >
                    <AlertCircle size={15} />
                    {submitError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 items-start gap-x-6 gap-y-6 md:grid-cols-2">
                <Field
                  label="Objet"
                  required
                  hint="Résumez votre réclamation en une phrase."
                  icon={<FileText size={15} />}
                  error={errors.objet}
                >
                  <input
                    type="text"
                    value={form.objet}
                    onChange={(e) => setField("objet", e.target.value)}
                    placeholder="Objet de la réclamation"
                    maxLength={MAX_OBJET}
                    className={`${inputCls(true, Boolean(errors.objet))} pr-16`}
                  />

                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {form.objet.length}/{MAX_OBJET}
                  </span>
                </Field>

                <Field
                  label="Catégorie"
                  required
                  hint="Choisissez le type de réclamation."
                  icon={<Tag size={15} />}
                  error={errors.categorie}
                >
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={form.categorie}
                    onChange={(e) => setField("categorie", e.target.value)}
                    className={`${inputCls(true, Boolean(errors.categorie))} appearance-none pr-10`}
                  >
                    <option value="">— Sélectionner une catégorie —</option>

                    {GROUPS.map((group) => (
                      <optgroup key={group} label={group}>
                        {CATEGORIES.filter((c) => c.group === group).map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                label="Description"
                required
                hint="Décrivez les faits avec précision : dates, lieu, personnes ou éléments concernés."
                error={errors.message}
              >
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => setField("message", e.target.value)}
                  maxLength={MAX_MESSAGE}
                  placeholder="Décrivez votre réclamation en détail…"
                  className={textareaCls(Boolean(errors.message))}
                />

                <div className="mt-1 flex items-center justify-between">
                  {!errors.message && (
                    <span className="text-xs text-slate-400">
                      Minimum 20 caractères
                    </span>
                  )}

                  <span
                    className={`ml-auto text-xs ${
                      form.message.length > 1800
                        ? "text-amber-500"
                        : "text-slate-400"
                    }`}
                  >
                    {form.message.length}/{MAX_MESSAGE}
                  </span>
                </div>
              </Field>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pièce jointe
                </label>

                <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">
                  Optionnel — PDF, PNG ou JPG, taille maximale 5 Mo.
                </p>

                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.label
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`flex h-20 cursor-pointer items-center gap-4 rounded border-2 border-dashed px-4 transition ${
                        errors.file
                          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                          : "border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500"
                      }`}
                    >
                      <Upload size={20} className="shrink-0 text-slate-400" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-100">
                          Choisir un fichier
                        </p>
                        <p className="text-xs text-slate-400">
                          PDF, PNG ou JPG · max 5 Mo
                        </p>
                      </div>

                      <input
                        type="file"
                        accept="application/pdf,image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] || null);
                          setErrors((prev) => ({ ...prev, file: "" }));
                        }}
                      />
                    </motion.label>
                  ) : (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 rounded border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-blue-600 dark:border-slate-700 dark:bg-slate-900">
                        <Paperclip size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-100">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {Math.round(file.size / 1024)} Ko
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setErrors((prev) => ({ ...prev, file: "" }));
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      >
                        <X size={15} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.file && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500">
                    <AlertCircle size={12} />
                    {errors.file}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-end">
  <button
    type="button"
    onClick={() => navigate("/medecin/reclamations")}
    className="inline-flex h-[44px] items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-6 text-sm font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-900/20"
  >
    <X size={16} />
    Annuler
  </button>

  <button
    type="submit"
    disabled={loading}
    className="inline-flex h-[44px] items-center justify-center gap-2 rounded-lg bg-green-600 px-7 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:bg-green-600 dark:hover:bg-green-500"
  >
    {loading ? (
      <>
        <Loader2 size={16} className="animate-spin" />
        Envoi...
      </>
    ) : (
      <>
        <Send size={16} />
        Soumettre
      </>
    )}
  </button>
</div>
            </form>
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}