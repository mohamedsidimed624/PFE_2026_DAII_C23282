import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ArrowLeft, ArrowRight, UploadCloud, ImagePlus,
  FileText, Settings2, Eye, CheckCircle2, AlertCircle,
  Globe, Lock, Tag, Calendar, Sparkles, RefreshCw,
  Newspaper, Megaphone, ClipboardList, Gavel, CalendarDays,
} from "lucide-react";

const TYPE_OPTIONS = [
  { value: "ANNONCE",    label: "Annonce",     Icon: Megaphone,     desc: "Avis officiel de l'Ordre",         accent: "bg-amber-50 border-amber-200 text-amber-700" },
  { value: "ACTUALITE",  label: "Actualité",   Icon: Newspaper,     desc: "Actualité institutionnelle",        accent: "bg-blue-50 border-blue-200 text-blue-700" },
  { value: "COMMUNIQUE", label: "Communiqué",  Icon: ClipboardList, desc: "Note ou communiqué officiel",      accent: "bg-purple-50 border-purple-200 text-purple-700" },
  { value: "DECISION",   label: "Décision",    Icon: Gavel,         desc: "Décision ou réglementation",       accent: "bg-red-50 border-red-200 text-red-700" },
  { value: "EVENEMENT",  label: "Événement",   Icon: CalendarDays,  desc: "Formation, réunion, conférence",   accent: "bg-teal-50 border-teal-200 text-teal-700" },
];

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Public",              Icon: Globe, desc: "Visible par tous les visiteurs" },
  { value: "PRIVEE", label: "Médecins uniquement", Icon: Lock,  desc: "Visible uniquement après connexion" },
];

const CATEGORIES_BY_TYPE = {
  ANNONCE:    [{ id: 1, label: "Annonce officielle" }, { id: 2, label: "Recrutement" }, { id: 3, label: "Appel à candidature" }],
  ACTUALITE:  [{ id: 4, label: "Actualité institutionnelle" }, { id: 5, label: "Vie de l'Ordre" }],
  COMMUNIQUE: [{ id: 6, label: "Communiqué officiel" }, { id: 7, label: "Note d'information" }],
  DECISION:   [{ id: 8, label: "Décision ordinale" }, { id: 9, label: "Réglementation" }],
  EVENEMENT:  [{ id: 10, label: "Formation" }, { id: 11, label: "Réunion" }],
};

const STEPS = [
  { id: 1, label: "Type",       Icon: Settings2,  desc: "Classification & visibilité" },
  { id: 2, label: "Couverture", Icon: ImagePlus,  desc: "Image principale" },
  { id: 3, label: "Contenu",    Icon: FileText,   desc: "Titre, résumé & corps" },
  { id: 4, label: "Publier",    Icon: Eye,        desc: "Vérification finale" },
];

const cx = (...c) => c.filter(Boolean).join(" ");

const slideVariant = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -28 : 28, transition: { duration: 0.18 } }),
};

/* ── Input helpers ── */
const inp = (err) => cx(
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition",
  "bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
  "focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-green-500/20",
  err ? "border-red-400 focus:border-red-400" : "border-slate-200 dark:border-slate-700 focus:border-green-500"
);
const textarea = (err) => cx(inp(err), "resize-none leading-relaxed");

/* ── Field ── */
function Field({ label, hint, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}{required && <span className="ml-1 text-green-600">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{hint}</span>}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs font-medium text-red-500">
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Vertical Step Nav ── */
function StepNav({ currentStep, onStepClick }) {
  return (
    <div className="flex flex-col gap-1 p-4">
      {STEPS.map((s) => {
        const done    = currentStep > s.id;
        const current = currentStep === s.id;
        const Icon    = s.Icon;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => done && onStepClick(s.id)}
            className={cx(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
              current ? "bg-green-600 text-white shadow-md shadow-green-900/20"
              : done   ? "bg-white/5 text-slate-400 hover:bg-white/10 cursor-pointer"
              : "text-slate-500 cursor-default"
            )}
          >
            <div className={cx(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition",
              current ? "bg-white/20 text-white"
              : done   ? "bg-green-500/20 text-green-400"
              : "bg-slate-700/50 text-slate-500"
            )}>
              {done ? <CheckCircle2 size={13} /> : <Icon size={13} />}
            </div>
            <div className="min-w-0">
              <p className={cx("text-xs font-bold leading-tight", current ? "text-white" : done ? "text-slate-300" : "text-slate-500")}>
                {s.label}
              </p>
              <p className={cx("text-[10px] leading-tight truncate", current ? "text-white/70" : "text-slate-600")}>
                {s.desc}
              </p>
            </div>
          </button>
        );
      })}

      {/* Progress */}
      <div className="mt-4 px-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Progression</span>
          <span className="text-[10px] font-bold text-green-400">{Math.round(((currentStep - 1) / STEPS.length) * 100)}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-slate-700">
          <motion.div
            className="h-full rounded-full bg-green-500"
            animate={{ width: `${((currentStep - 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Live Preview ── */
function LivePreview({ form, imagePreview, selectedCategory }) {
  const typeInfo = TYPE_OPTIONS.find((t) => t.value === form.type);
  const visInfo  = VISIBILITY_OPTIONS.find((v) => v.value === form.visibilite);
  return (
    <div className="flex flex-col gap-3">
      <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600">
        Aperçu en direct
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative h-28 bg-slate-100 dark:bg-slate-800">
          {imagePreview
            ? <img src={imagePreview} alt="" className="h-full w-full object-cover" />
            : <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600"><ImagePlus size={24} /></div>
          }
          {typeInfo && (
            <div className="absolute left-2 top-2">
              <span className={cx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold", typeInfo.accent)}>
                <typeInfo.Icon size={9} />{typeInfo.label}
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500">
                <Tag size={8} />{selectedCategory}
              </span>
            )}
            {visInfo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500">
                <visInfo.Icon size={8} />{visInfo.label}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {form.titre || <span className="font-normal italic text-slate-400 dark:text-slate-600">Titre de la publication…</span>}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
            {form.resume || <span className="italic">Résumé ici…</span>}
          </p>
          {form.dateExpiration && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
              <Calendar size={9} />
              {new Date(form.dateExpiration).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-3 py-2.5">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-4">
          Enregistré en <strong className="text-slate-700 dark:text-slate-300">Brouillon</strong>. Publiez-le depuis la liste après validation.
        </p>
      </div>
    </div>
  );
}

/* ── Main Modal ── */
function ContenuWizardModal({ isOpen, mode = "create", initialData = null, loading = false, onClose, onSubmit }) {
  const [step, setStep]             = useState(1);
  const [direction, setDirection]   = useState(1);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [stepErrors, setStepErrors] = useState({});
  const [formError, setFormError]   = useState("");

  const [form, setForm] = useState({
    type: "ANNONCE", categorieId: 1, visibilite: "PUBLIC",
    titre: "", resume: "", contenu: "", dateExpiration: "",
  });

  const categories       = useMemo(() => CATEGORIES_BY_TYPE[form.type] || [], [form.type]);
  const selectedCategory = categories.find((c) => Number(c.id) === Number(form.categorieId))?.label || "—";

  useEffect(() => {
    if (!isOpen) return;
    setStep(1); setDirection(1); setImageFile(null); setFormError(""); setStepErrors({});
    if (mode === "edit" && initialData) {
      setForm({
        type: initialData.type || "ANNONCE",
        categorieId: initialData.categorieId || 1,
        visibilite: initialData.visibilite || "PUBLIC",
        titre: initialData.titre || "",
        resume: initialData.resume || "",
        contenu: initialData.contenu || "",
        dateExpiration: initialData.dateExpiration ? initialData.dateExpiration.slice(0, 16) : "",
      });
      setImagePreview(initialData.imageUrl ? `http://localhost:8080${initialData.imageUrl}` : "");
    } else {
      setForm({ type: "ANNONCE", categorieId: 1, visibilite: "PUBLIC", titre: "", resume: "", contenu: "", dateExpiration: "" });
      setImagePreview("");
    }
  }, [isOpen, mode, initialData]);

  useEffect(() => {
    const list = CATEGORIES_BY_TYPE[form.type] || [];
    if (!list.some((c) => Number(c.id) === Number(form.categorieId))) {
      setForm((p) => ({ ...p, categorieId: list[0]?.id || "" }));
    }
  }, [form.type]);

  if (!isOpen) return null;

  const update = (key, value) => { setForm((p) => ({ ...p, [key]: value })); setStepErrors((p) => ({ ...p, [key]: "" })); setFormError(""); };

  const handleImageChange = (file) => {
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) { setFormError("Format non autorisé (JPG, PNG, WEBP)."); return; }
    if (file.size > 3 * 1024 * 1024) { setFormError("L'image ne doit pas dépasser 3 Mo."); return; }
    setImageFile(file); setImagePreview(URL.createObjectURL(file)); setFormError("");
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) { if (!form.type) e.type = "Choisissez un type."; if (!form.categorieId) e.categorieId = "Choisissez une catégorie."; if (!form.visibilite) e.visibilite = "Choisissez une visibilité."; }
    if (s === 2 && !imagePreview) e.image = "Ajoutez une image de couverture.";
    if (s === 3) { if (!form.titre.trim()) e.titre = "Le titre est obligatoire."; if (!form.resume.trim()) e.resume = "Le résumé est obligatoire."; if (!form.contenu.trim()) e.contenu = "Le contenu est obligatoire."; }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) { setStepErrors(e); setFormError("Corrigez les champs avant de continuer."); return; }
    setStepErrors({}); setFormError(""); setDirection(1); setStep((s) => Math.min(4, s + 1));
  };
  const prev = () => { setDirection(-1); setStep((s) => Math.max(1, s - 1)); setFormError(""); };
  const submit = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) { setStepErrors(e); return; }
    onSubmit({ data: { ...form, categorieId: Number(form.categorieId), dateExpiration: form.dateExpiration || null }, image: imageFile });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && onClose()} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl"
            style={{ maxHeight: "90vh" }}
          >
            {/* ── Left sidebar (dark, CMS nav) ── */}
            <div className="hidden w-52 shrink-0 flex-col bg-slate-900 lg:flex">
              {/* Sidebar header */}
              <div className="border-b border-white/10 px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {mode === "create" ? "Nouvelle publication" : "Modifier"}
                    </p>
                    <p className="text-[10px] text-slate-500">CMS · ONMM</p>
                  </div>
                </div>
              </div>

              {/* Steps nav */}
              <div className="flex-1 overflow-y-auto">
                <StepNav currentStep={step} onStepClick={(id) => { setDirection(id < step ? -1 : 1); setStep(id); }} />
              </div>

              {/* Sidebar footer note */}
              <div className="border-t border-white/10 px-4 py-3">
                <p className="text-[10px] text-slate-600 leading-4">
                  Brouillon auto-sauvegardé à chaque étape.
                </p>
              </div>
            </div>

            {/* ── Main content area ── */}
            <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900">
              {/* Top bar */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3.5">
                {/* Mobile step indicator */}
                <div className="flex items-center gap-3 lg:hidden">
                  {STEPS.map((s) => (
                    <div key={s.id} className={cx("h-1.5 w-6 rounded-full transition-all", step >= s.id ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700")} />
                  ))}
                </div>
                {/* Desktop step label */}
                <div className="hidden lg:block">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {STEPS[step - 1]?.label}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{STEPS[step - 1]?.desc}</p>
                </div>
                <button onClick={() => !loading && onClose()}
                  className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Content + preview */}
              <div className="flex min-h-0 flex-1 overflow-hidden">
                {/* Step content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div key={step} custom={direction} variants={slideVariant} initial="enter" animate="center" exit="exit">

                      {/* ── Step 1: Classification ── */}
                      {step === 1 && (
                        <div className="space-y-7">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Type de publication</h3>
                            <p className="mt-1 text-sm text-slate-500">Choisissez la nature de votre contenu.</p>
                          </div>

                          <Field label="Type" required error={stepErrors.type}>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                              {TYPE_OPTIONS.map((t) => (
                                <button key={t.value} type="button" onClick={() => update("type", t.value)}
                                  className={cx(
                                    "group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all",
                                    form.type === t.value
                                      ? cx("ring-2 ring-green-500/30 border-green-400 dark:border-green-600", t.accent)
                                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                                  )}
                                >
                                  <div className={cx("flex h-9 w-9 items-center justify-center rounded-xl transition",
                                    form.type === t.value ? "bg-white/60 dark:bg-slate-900/40" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                                  )}>
                                    <t.Icon size={17} />
                                  </div>
                                  <span className={cx("text-xs font-bold leading-tight", form.type === t.value ? "" : "text-slate-700 dark:text-slate-200")}>{t.label}</span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight hidden sm:block">{t.desc}</span>
                                </button>
                              ))}
                            </div>
                          </Field>

                          <Field label="Catégorie" required error={stepErrors.categorieId}>
                            <div className="flex flex-wrap gap-2">
                              {categories.map((c) => (
                                <button key={c.id} type="button" onClick={() => update("categorieId", c.id)}
                                  className={cx(
                                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                                    Number(form.categorieId) === c.id
                                      ? "border-green-500 bg-green-600 text-white shadow-sm"
                                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-green-300 dark:hover:border-green-700 hover:text-green-700"
                                  )}
                                >
                                  {Number(form.categorieId) === c.id && <CheckCircle2 size={10} />}
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </Field>

                          <Field label="Visibilité" required error={stepErrors.visibilite}>
                            <div className="grid grid-cols-2 gap-3">
                              {VISIBILITY_OPTIONS.map((v) => (
                                <button key={v.value} type="button" onClick={() => update("visibilite", v.value)}
                                  className={cx(
                                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                                    form.visibilite === v.value
                                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500/20"
                                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-green-200 dark:hover:border-green-800"
                                  )}
                                >
                                  <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                                    form.visibilite === v.value ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                  )}>
                                    <v.Icon size={16} />
                                  </span>
                                  <div>
                                    <p className={cx("text-sm font-bold", form.visibilite === v.value ? "text-green-700 dark:text-green-400" : "text-slate-800 dark:text-slate-100")}>{v.label}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{v.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </Field>
                        </div>
                      )}

                      {/* ── Step 2: Cover image ── */}
                      {step === 2 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Image de couverture</h3>
                            <p className="mt-1 text-sm text-slate-500">Une bonne image augmente l'engagement de votre publication.</p>
                          </div>

                          <AnimatePresence mode="wait">
                            {!imagePreview ? (
                              <motion.label key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className={cx(
                                  "group flex cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-14 text-center transition-all",
                                  stepErrors.image
                                    ? "border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-900/10"
                                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50/40 dark:hover:bg-green-900/10"
                                )}
                              >
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-green-300 group-hover:text-green-600 transition-colors">
                                  <UploadCloud size={28} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Déposez votre image ici</p>
                                  <p className="mt-1 text-xs text-slate-400">ou <span className="text-green-600 font-semibold">parcourir les fichiers</span></p>
                                  <p className="mt-2 text-[11px] text-slate-400">JPG, PNG ou WEBP — max 3 Mo — Ratio 16:9 recommandé</p>
                                </div>
                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                  onChange={(e) => handleImageChange(e.target.files?.[0])} />
                              </motion.label>
                            ) : (
                              <motion.div key="preview" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                              >
                                <img src={imagePreview} alt="Couverture" className="h-64 w-full object-cover" />
                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-5 opacity-0 transition group-hover:opacity-100">
                                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition-colors">
                                    <RefreshCw size={13} />Changer l'image
                                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                      onChange={(e) => handleImageChange(e.target.files?.[0])} />
                                  </label>
                                </div>
                                <div className="absolute top-3 right-3 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white">
                                  ✓ Image ajoutée
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {stepErrors.image && (
                            <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                              <AlertCircle size={12} />{stepErrors.image}
                            </p>
                          )}
                        </div>
                      )}

                      {/* ── Step 3: Rédaction ── */}
                      {step === 3 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Rédaction du contenu</h3>
                            <p className="mt-1 text-sm text-slate-500">Titre clair, résumé accrocheur et corps complet.</p>
                          </div>

                          <Field label="Titre de la publication" required error={stepErrors.titre}>
                            <div className="relative">
                              <input type="text" value={form.titre} onChange={(e) => update("titre", e.target.value)}
                                placeholder='Ex : "Réunion ordinale du 15 mars — Convocation officielle"'
                                maxLength={160} className={inp(!!stepErrors.titre)} />
                              <span className={cx(
                                "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
                                form.titre.length > 140 ? "text-amber-500" : "text-slate-400 dark:text-slate-500"
                              )}>
                                {form.titre.length}/160
                              </span>
                            </div>
                          </Field>

                          <Field label="Résumé" required hint="Affiché dans la liste publique" error={stepErrors.resume}>
                            <textarea rows={3} value={form.resume} maxLength={220}
                              onChange={(e) => update("resume", e.target.value)}
                              placeholder="Un texte court et percutant visible avant l'ouverture du contenu…"
                              className={textarea(!!stepErrors.resume)} />
                            <div className="flex justify-end">
                              <span className={cx("text-xs", form.resume.length > 190 ? "text-amber-500" : "text-slate-400 dark:text-slate-500")}>
                                {form.resume.length}/220
                              </span>
                            </div>
                          </Field>

                          <Field label="Corps du contenu" required error={stepErrors.contenu}>
                            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/15 transition">
                              {/* Minimal toolbar hint */}
                              <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 px-4 py-2 flex items-center gap-3">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Corps du texte</span>
                              </div>
                              <textarea rows={10} value={form.contenu} onChange={(e) => update("contenu", e.target.value)}
                                placeholder="Rédigez le corps complet de la publication. Soyez précis, structuré et factuel…"
                                className={cx(
                                  "w-full border-0 bg-transparent px-4 py-3 text-sm outline-none resize-none leading-relaxed",
                                  "text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                )} />
                            </div>
                          </Field>
                        </div>
                      )}

                      {/* ── Step 4: Finalisation ── */}
                      {step === 4 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Vérification finale</h3>
                            <p className="mt-1 text-sm text-slate-500">Relisez avant d'enregistrer le brouillon.</p>
                          </div>

                          {/* Summary card */}
                          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-5 py-3">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Récapitulatif</p>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                              {[
                                { label: "Type",       value: TYPE_OPTIONS.find((t) => t.value === form.type)?.label },
                                { label: "Catégorie",  value: selectedCategory },
                                { label: "Visibilité", value: VISIBILITY_OPTIONS.find((v) => v.value === form.visibilite)?.label },
                                { label: "Titre",      value: form.titre || <span className="italic text-slate-400">Non renseigné</span> },
                                { label: "Image",      value: imagePreview ? <span className="text-green-600 font-semibold">✓ Image ajoutée</span> : <span className="text-amber-500">Aucune image</span> },
                              ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between gap-4 px-5 py-3">
                                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0 w-20">{label}</span>
                                  <span className="text-right text-xs text-slate-800 dark:text-slate-100 truncate">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Field label="Date d'expiration" hint="optionnelle — laisser vide si aucune limite">
                            <div className="relative">
                              <CalendarDays size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              <input type="datetime-local" value={form.dateExpiration}
                                onChange={(e) => update("dateExpiration", e.target.value)}
                                className={cx(inp(false), "pl-10")} />
                            </div>
                          </Field>

                          <div className="flex items-start gap-3 rounded-xl border border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/10 px-4 py-3.5">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
                            <p className="text-xs text-green-800 dark:text-green-300 leading-5">
                              La publication sera sauvegardée en <strong>Brouillon</strong>.
                              Elle ne sera visible qu'après publication manuelle depuis le panneau de gestion.
                            </p>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Live preview sidebar */}
                <div className="hidden w-60 shrink-0 overflow-y-auto border-l border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/20 p-4 xl:block">
                  <LivePreview form={form} imagePreview={imagePreview} selectedCategory={selectedCategory} />
                </div>
              </div>

              {/* Error bar */}
              <AnimatePresence>
                {formError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="shrink-0 border-t border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-5 py-2.5">
                    <p className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
                      <AlertCircle size={12} />{formError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3.5">
                <button type="button" onClick={step === 1 ? onClose : prev}
                  className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  <ArrowLeft size={14} />
                  {step === 1 ? "Annuler" : "Retour"}
                </button>

                {step < 4 ? (
                  <motion.button type="button" onClick={next} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm shadow-green-900/20">
                    Continuer <ArrowRight size={14} />
                  </motion.button>
                ) : (
                  <motion.button type="button" onClick={submit} disabled={loading} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? (
                      <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Enregistrement…</>
                    ) : (
                      <><CheckCircle2 size={14} />Enregistrer le brouillon</>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ContenuWizardModal;
