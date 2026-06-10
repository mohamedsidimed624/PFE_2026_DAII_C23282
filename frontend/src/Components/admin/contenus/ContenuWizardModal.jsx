import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  Check,
  AlertCircle,
  Globe,
  RefreshCw,
  Megaphone,
  Newspaper,
  ClipboardList,
  Gavel,
  CalendarDays,
  Loader2,
} from "lucide-react";

const TYPE_OPTIONS = [
  {
    value: "ANNONCE",
    label: "Annonce",
    Icon: Megaphone,
    desc: "Avis officiel",
  },
  {
    value: "ACTUALITE",
    label: "Actualité",
    Icon: Newspaper,
    desc: "Actualité institutionnelle",
  },
  {
    value: "COMMUNIQUE",
    label: "Communiqué",
    Icon: ClipboardList,
    desc: "Note officielle",
  },
  {
    value: "DECISION",
    label: "Décision",
    Icon: Gavel,
    desc: "Décision ou règlement",
  },
  {
    value: "EVENEMENT",
    label: "Événement",
    Icon: CalendarDays,
    desc: "Formation, réunion…",
  },
];

const CATEGORIES_BY_TYPE = {
  ANNONCE: [
    { id: 1, label: "Annonce officielle" },
    { id: 2, label: "Recrutement" },
    { id: 3, label: "Appel à candidature" },
  ],
  ACTUALITE: [
    { id: 4, label: "Actualité institutionnelle" },
    { id: 5, label: "Vie de l'Ordre" },
  ],
  COMMUNIQUE: [
    { id: 6, label: "Communiqué officiel" },
    { id: 7, label: "Note d'information" },
  ],
  DECISION: [
    { id: 8, label: "Décision ordinale" },
    { id: 9, label: "Réglementation" },
  ],
  EVENEMENT: [
    { id: 10, label: "Formation" },
    { id: 11, label: "Réunion" },
  ],
};

const STEPS = [
  { id: 1, label: "Classification" },
  { id: 2, label: "Couverture" },
  { id: 3, label: "Contenu" },
  { id: 4, label: "Finalisation" },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");

const slideVariant = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 28 : -28,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -28 : 28,
    transition: {
      duration: 0.16,
    },
  }),
};

function inputCls(hasError) {
  return cx(
    "w-full rounded-md border bg-white px-4 py-2.5 text-[13px] text-slate-700 outline-none transition",
    "placeholder:text-slate-300",
    "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500",
    "focus:border-green-400 focus:ring-2 focus:ring-green-500/10",
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
      : "border-slate-200"
  );
}

function Field({ label, hint, error, required, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>

        {hint && (
          <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
            {hint}
          </span>
        )}
      </div>

      {children}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stepper({ currentStep }) {
  return (
    <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
      <div className="flex items-center">
        {STEPS.map((step, index) => {
          const done = currentStep > step.id;
          const current = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex shrink-0 items-center gap-2">
                <div
                  className={cx(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                    done || current
                      ? "bg-green-500 text-white"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  )}
                >
                  {done ? <Check size={14} /> : step.id}
                </div>

                <span
                  className={cx(
                    "hidden text-xs font-semibold sm:inline",
                    current
                      ? "text-green-600 dark:text-green-400"
                      : done
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cx(
                    "mx-3 h-px flex-1 rounded-full transition",
                    currentStep > step.id
                      ? "bg-green-400"
                      : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContenuWizardModal({
  isOpen,
  mode = "create",
  initialData = null,
  loading = false,
  onClose,
  onSubmit,
}) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [stepErrors, setStepErrors] = useState({});
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    type: "ANNONCE",
    categorieId: 1,
    visibilite: "PUBLIC",
    titre: "",
    resume: "",
    contenu: "",
    dateExpiration: "",
  });

  const categories = useMemo(() => {
    return CATEGORIES_BY_TYPE[form.type] || [];
  }, [form.type]);

  const selectedCategory = useMemo(() => {
    return (
      categories.find((c) => Number(c.id) === Number(form.categorieId))
        ?.label || "—"
    );
  }, [categories, form.categorieId]);

  useEffect(() => {
    if (!isOpen) return;

    setStep(1);
    setDirection(1);
    setImageFile(null);
    setFormError("");
    setStepErrors({});

    if (mode === "edit" && initialData) {
      const type = initialData.type || "ANNONCE";
      const availableCategories = CATEGORIES_BY_TYPE[type] || [];

      setForm({
        type,
        categorieId:
          initialData.categorieId || availableCategories[0]?.id || 1,
        visibilite: initialData.visibilite || "PUBLIC",
        titre: initialData.titre || "",
        resume: initialData.resume || "",
        contenu: initialData.contenu || "",
        dateExpiration: initialData.dateExpiration
          ? initialData.dateExpiration.slice(0, 16)
          : "",
      });

      setImagePreview(
        initialData.imageUrl
          ? `http://localhost:8080${initialData.imageUrl}`
          : ""
      );
    } else {
      setForm({
        type: "ANNONCE",
        categorieId: 1,
        visibilite: "PUBLIC",
        titre: "",
        resume: "",
        contenu: "",
        dateExpiration: "",
      });

      setImagePreview("");
    }
  }, [isOpen, mode, initialData]);

  useEffect(() => {
    const list = CATEGORIES_BY_TYPE[form.type] || [];

    if (!list.some((c) => Number(c.id) === Number(form.categorieId))) {
      setForm((prev) => ({
        ...prev,
        categorieId: list[0]?.id || "",
      }));
    }
  }, [form.type, form.categorieId]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!isOpen) return null;

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setStepErrors((prev) => ({
      ...prev,
      [key]: "",
    }));

    setFormError("");
  };

  const handleImageChange = (file) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Format non autorisé. Utilisez JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setFormError("L'image ne doit pas dépasser 3 Mo.");
      return;
    }

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
    setStepErrors((prev) => ({ ...prev, image: "" }));
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");
  };

  const validateStep = (targetStep) => {
    const errors = {};

    if (targetStep === 1) {
      if (!form.type) errors.type = "Choisissez un type.";
      if (!form.categorieId) errors.categorieId = "Choisissez une catégorie.";
      if (!form.visibilite) errors.visibilite = "Choisissez une visibilité.";
    }

    if (targetStep === 3) {
      if (!form.titre.trim()) {
        errors.titre = "Le titre est obligatoire.";
      } else if (form.titre.trim().length < 5) {
        errors.titre = "Le titre est trop court.";
      }

      if (!form.resume.trim()) {
        errors.resume = "Le résumé est obligatoire.";
      } else if (form.resume.trim().length < 10) {
        errors.resume = "Le résumé est trop court.";
      }

      if (!form.contenu.trim()) {
        errors.contenu = "Le contenu est obligatoire.";
      } else if (form.contenu.trim().length < 20) {
        errors.contenu = "Le contenu est trop court.";
      }
    }

    return errors;
  };

  const validateAll = () => {
    return {
      ...validateStep(1),
      ...validateStep(3),
    };
  };

  const next = () => {
    const errors = validateStep(step);

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      setFormError("Corrigez les champs avant de continuer.");
      return;
    }

    setStepErrors({});
    setFormError("");
    setDirection(1);
    setStep((prev) => Math.min(4, prev + 1));
  };

  const prev = () => {
    setDirection(-1);
    setStep((prev) => Math.max(1, prev - 1));
    setFormError("");
  };

  const submit = () => {
    const errors = validateAll();

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      setFormError("Certains champs obligatoires sont incomplets.");
      return;
    }

    onSubmit({
      data: {
        ...form,
        categorieId: Number(form.categorieId),
        specialiteCibleId: null,
        dateExpiration: form.dateExpiration || null,
      },
      image: imageFile,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/35"
            onClick={() => !loading && onClose()}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            style={{ maxHeight: "92vh" }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-800 dark:text-slate-100">
                  {mode === "create"
                    ? "Nouveau contenu"
                    : "Modifier le contenu"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  Étape {step} sur {STEPS.length} — {STEPS[step - 1]?.label}
                </p>
              </div>

              <button
                type="button"
                onClick={() => !loading && onClose()}
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <Stepper currentStep={step} />

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariant}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {/* Step 1 */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <Field
                        label="Type de publication"
                        required
                        error={stepErrors.type}
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                          {TYPE_OPTIONS.map((type) => {
                            const Icon = type.Icon;
                            const selected = form.type === type.value;

                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => update("type", type.value)}
                                className={cx(
                                  "rounded-md border px-3 py-4 text-left transition",
                                  selected
                                    ? "border-green-400 bg-green-50 ring-1 ring-green-200 dark:border-green-700 dark:bg-green-900/20 dark:ring-green-800"
                                    : "border-slate-100 bg-white hover:border-green-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-green-800 dark:hover:bg-slate-800/70"
                                )}
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <div
                                    className={cx(
                                      "flex h-9 w-9 items-center justify-center rounded-md",
                                      selected
                                        ? "bg-green-500 text-white"
                                        : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-400"
                                    )}
                                  >
                                    <Icon size={17} />
                                  </div>

                                  {selected && (
                                    <Check
                                      size={15}
                                      className="text-green-600 dark:text-green-400"
                                    />
                                  )}
                                </div>

                                <p
                                  className={cx(
                                    "text-[13px] font-semibold",
                                    selected
                                      ? "text-green-700 dark:text-green-400"
                                      : "text-slate-700 dark:text-slate-200"
                                  )}
                                >
                                  {type.label}
                                </p>

                                <p className="mt-1 text-[11px] leading-4 text-slate-400 dark:text-slate-500">
                                  {type.desc}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </Field>

                      <Field
                        label="Catégorie"
                        required
                        error={stepErrors.categorieId}
                      >
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {categories.map((category) => {
                            const selected =
                              Number(form.categorieId) === Number(category.id);

                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() =>
                                  update("categorieId", category.id)
                                }
                                className={cx(
                                  "flex items-center justify-between rounded-md border px-4 py-2.5 text-left text-[13px] font-medium transition",
                                  selected
                                    ? "border-green-400 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400"
                                    : "border-slate-100 bg-white text-slate-600 hover:border-green-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                )}
                              >
                                {category.label}
                                {selected && <Check size={14} />}
                              </button>
                            );
                          })}
                        </div>
                      </Field>

                      <Field
                        label="Visibilité"
                        required
                        error={stepErrors.visibilite}
                      >
                        <div className="flex items-start gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-green-600 shadow-sm dark:bg-slate-900 dark:text-green-400">
                            <Globe size={16} />
                          </div>

                          <div>
                            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                              Visible publiquement
                            </p>

                            <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              Cette publication sera destinée au portail public.
                              Elle restera invisible tant qu’elle n’est pas
                              publiée depuis la liste des contenus.
                            </p>
                          </div>
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">
                          Image de couverture
                        </h3>

                        <p className="mt-1 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
                          L’image est optionnelle. Elle améliore simplement la
                          présentation du contenu dans les cartes publiques.
                        </p>
                      </div>

                      {!imagePreview ? (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center transition hover:border-green-300 hover:bg-green-50/40 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-green-800 dark:hover:bg-green-900/10">
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-white text-slate-400 shadow-sm dark:bg-slate-900 dark:text-slate-500">
                            <UploadCloud size={26} />
                          </div>

                          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                            Sélectionner une image
                          </p>

                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            JPG, PNG ou WEBP — max 3 Mo — ratio 16:9 recommandé
                          </p>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) =>
                              handleImageChange(e.target.files?.[0])
                            }
                          />
                        </label>
                      ) : (
                        <div className="overflow-hidden rounded-md border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Couverture"
                              className="h-64 w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                            <div className="absolute bottom-4 left-4 flex gap-2">
                              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                <RefreshCw size={13} />
                                Changer
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleImageChange(e.target.files?.[0])
                                  }
                                />
                              </label>

                              <button
                                type="button"
                                onClick={removeImage}
                                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-red-500 shadow-sm transition hover:bg-red-50"
                              >
                                <X size={13} />
                                Retirer
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">
                          Rédaction du contenu
                        </h3>

                        <p className="mt-1 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
                          Renseignez un titre clair, un résumé court et un corps
                          complet.
                        </p>
                      </div>

                      <Field
                        label="Titre"
                        required
                        hint={`${form.titre.length}/160`}
                        error={stepErrors.titre}
                      >
                        <input
                          type="text"
                          value={form.titre}
                          onChange={(e) => update("titre", e.target.value)}
                          placeholder="Ex : Convocation officielle à une réunion ordinale"
                          maxLength={160}
                          className={inputCls(Boolean(stepErrors.titre))}
                        />
                      </Field>

                      <Field
                        label="Résumé"
                        required
                        hint={`${form.resume.length}/220`}
                        error={stepErrors.resume}
                      >
                        <textarea
                          rows={3}
                          value={form.resume}
                          maxLength={220}
                          onChange={(e) => update("resume", e.target.value)}
                          placeholder="Résumé court affiché dans la liste des publications…"
                          className={cx(
                            inputCls(Boolean(stepErrors.resume)),
                            "resize-none leading-6"
                          )}
                        />
                      </Field>

                      <Field
                        label="Corps du contenu"
                        required
                        error={stepErrors.contenu}
                      >
                        <textarea
                          rows={10}
                          value={form.contenu}
                          onChange={(e) => update("contenu", e.target.value)}
                          placeholder="Rédigez le contenu complet de la publication…"
                          className={cx(
                            inputCls(Boolean(stepErrors.contenu)),
                            "resize-none leading-6"
                          )}
                        />
                      </Field>
                    </div>
                  )}

                  {/* Step 4 */}
                  {step === 4 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">
                          Finalisation
                        </h3>

                        <p className="mt-1 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
                          Vérifiez les informations avant d’enregistrer le
                          contenu.
                        </p>
                      </div>

                      <div className="overflow-hidden rounded-md border border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-900">
                        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Récapitulatif
                          </p>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                            {
                              label: "Type",
                              value:
                                TYPE_OPTIONS.find(
                                  (type) => type.value === form.type
                                )?.label || "—",
                            },
                            {
                              label: "Catégorie",
                              value: selectedCategory,
                            },
                            {
                              label: "Visibilité",
                              value: "Public",
                            },
                            {
                              label: "Image",
                              value: imagePreview
                                ? "Image ajoutée"
                                : "Aucune image",
                            },
                            {
                              label: "Titre",
                              value: form.titre || "—",
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="grid grid-cols-[120px_1fr] gap-4 px-5 py-3"
                            >
                              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                {item.label}
                              </span>

                              <span className="truncate text-right text-xs font-medium text-slate-700 dark:text-slate-200">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Field label="Date d'expiration" hint="optionnelle">
                        <div className="relative">
                          <CalendarDays
                            size={15}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type="datetime-local"
                            value={form.dateExpiration}
                            onChange={(e) =>
                              update("dateExpiration", e.target.value)
                            }
                            className={cx(inputCls(false), "pl-10")}
                          />
                        </div>
                      </Field>

                      <div className="rounded-md border border-green-100 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-900/10">
                        <p className="text-xs leading-5 text-green-700 dark:text-green-400">
                          Le contenu sera enregistré en brouillon. Il ne sera
                          visible qu’après publication manuelle depuis la page de
                          gestion des contenus.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Error */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="shrink-0 border-t border-red-100 bg-red-50 px-6 py-3 dark:border-red-900/40 dark:bg-red-900/10"
                >
                  <p className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                    <AlertCircle size={13} />
                    {formError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={step === 1 ? onClose : prev}
                disabled={loading}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-100 bg-white px-4 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ArrowLeft size={14} />
                {step === 1 ? "Annuler" : "Retour"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={loading}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-green-500 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:opacity-60"
                >
                  Continuer
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-green-500 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Enregistrer
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ContenuWizardModal;