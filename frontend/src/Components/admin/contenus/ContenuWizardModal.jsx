import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ArrowLeft, ArrowRight, UploadCloud, ImagePlus,
  FileText, Settings, Eye, CheckCircle2, AlertCircle,
  Globe, Lock, Tag, Calendar, Sparkles, RefreshCw,
} from "lucide-react";

/* ── Constants ──────────────────────────────────────── */
const TYPE_OPTIONS = [
  { value: "ANNONCE",    label: "Annonce",     icon: "📢", desc: "Avis officiel de l'Ordre" },
  { value: "ACTUALITE",  label: "Actualité",   icon: "📰", desc: "Actualité institutionnelle" },
  { value: "COMMUNIQUE", label: "Communiqué",  icon: "📋", desc: "Note ou communiqué officiel" },
  { value: "DECISION",   label: "Décision",    icon: "⚖️", desc: "Décision ou réglementation" },
  { value: "EVENEMENT",  label: "Événement",   icon: "📅", desc: "Formation, réunion, conférence" },
];

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Public",            icon: <Globe size={14} />,  desc: "Visible par tous les visiteurs" },
  { value: "PRIVEE", label: "Médecins uniquement", icon: <Lock size={14} />, desc: "Visible uniquement après connexion" },
];

const CATEGORIES_BY_TYPE = {
  ANNONCE:    [{ id: 1, label: "Annonce officielle" }, { id: 2, label: "Recrutement" }, { id: 3, label: "Appel à candidature" }],
  ACTUALITE:  [{ id: 4, label: "Actualité institutionnelle" }, { id: 5, label: "Vie de l'Ordre" }],
  COMMUNIQUE: [{ id: 6, label: "Communiqué officiel" }, { id: 7, label: "Note d'information" }],
  DECISION:   [{ id: 8, label: "Décision ordinale" }, { id: 9, label: "Réglementation" }],
  EVENEMENT:  [{ id: 10, label: "Formation" }, { id: 11, label: "Réunion" }],
};

const STEPS = [
  { id: 1, label: "Classification", icon: Settings,  desc: "Type & visibilité" },
  { id: 2, label: "Couverture",     icon: ImagePlus,  desc: "Image principale" },
  { id: 3, label: "Rédaction",      icon: FileText,   desc: "Titre & contenu" },
  { id: 4, label: "Finalisation",   icon: Eye,        desc: "Vérification & dates" },
];

const cx = (...c) => c.filter(Boolean).join(" ");

/* ── Animation variants ─────────────────────────────── */
const stepVariant = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24, transition: { duration: 0.2 } }),
};

/* ── Field wrapper ──────────────────────────────────── */
function Field({ label, hint, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-sm font-medium text-base-content">
          {label}{required && <span className="ml-1 text-error">*</span>}
        </label>
        {hint && <span className="text-xs text-base-content/40 shrink-0">{hint}</span>}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs font-medium text-error"
          >
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Step indicator ─────────────────────────────────── */
function StepBar({ currentStep }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto border-b border-base-200 bg-base-100 px-6">
      {STEPS.map((s, idx) => {
        const done    = currentStep > s.id;
        const current = currentStep === s.id;
        const Icon    = s.icon;
        return (
          <div key={s.id} className="flex items-center">
            <div className={cx(
              "flex shrink-0 items-center gap-2.5 border-b-2 px-4 py-3.5 transition-all",
              current ? "border-success text-success"
              : done   ? "border-success/40 text-success/60"
              : "border-transparent text-base-content/30"
            )}>
              <div className={cx(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                done    ? "bg-success text-white"
                : current ? "bg-success/10 text-success ring-2 ring-success/30"
                : "bg-base-200 text-base-content/40"
              )}>
                {done ? <CheckCircle2 size={13} /> : s.id}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-tight">{s.label}</p>
                <p className={cx("text-[10px] leading-tight", current ? "text-success/70" : "text-base-content/30")}>
                  {s.desc}
                </p>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cx("mx-1 h-px w-6 shrink-0 transition", currentStep > s.id ? "bg-success/40" : "bg-base-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Live preview card ──────────────────────────────── */
function LivePreview({ form, imagePreview, selectedCategory, step }) {
  const typeInfo = TYPE_OPTIONS.find((t) => t.value === form.type);
  const visInfo  = VISIBILITY_OPTIONS.find((v) => v.value === form.visibilite);

  return (
    <aside className="flex flex-col gap-4">
      {/* Card preview */}
      <div className="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">
        <div className="border-b border-base-200 bg-base-200/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-error/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-warning/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-success/60" />
            <span className="ml-1 text-xs text-base-content/30">Aperçu en direct</span>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-32 bg-base-200">
          {imagePreview ? (
            <img src={imagePreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-base-content/20">
              <ImagePlus size={28} />
            </div>
          )}
          {/* Badge type */}
          {typeInfo && (
            <div className="absolute left-2.5 top-2.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                {typeInfo.icon} {typeInfo.label}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 text-xs text-base-content/60">
                <Tag size={9} /> {selectedCategory}
              </span>
            )}
            {visInfo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 text-xs text-base-content/60">
                {visInfo.icon} {visInfo.label}
              </span>
            )}
          </div>

          {/* Titre */}
          <h4 className="line-clamp-2 text-sm font-bold text-base-content leading-snug">
            {form.titre || <span className="text-base-content/30 font-normal italic">Titre de la publication…</span>}
          </h4>

          {/* Résumé */}
          <p className="mt-2 line-clamp-3 text-xs leading-5 text-base-content/50">
            {form.resume || <span className="italic">Le résumé apparaîtra ici…</span>}
          </p>

          {/* Date expiration */}
          {form.dateExpiration && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-base-content/40">
              <Calendar size={11} />
              Expire le {new Date(form.dateExpiration).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-base-200 bg-base-100 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-base-content/60">Progression</span>
          <span className="text-xs font-bold text-success">{step} / {STEPS.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-base-200">
          <motion.div
            className="h-full rounded-full bg-success"
            animate={{ width: `${(step / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 text-xs text-base-content/40">
          Étape suivante : {STEPS[step]?.label || "Enregistrement"}
        </p>
      </div>

      {/* Statut */}
      <div className="rounded-xl border border-base-200 bg-base-200/40 px-3 py-2.5">
        <p className="text-xs text-base-content/50">
          Le contenu sera sauvegardé en{" "}
          <span className="font-semibold text-base-content">Brouillon</span>.
          Vous pourrez le publier depuis la liste après validation.
        </p>
      </div>
    </aside>
  );
}

/* ── Main Modal ─────────────────────────────────────── */
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

  const categories    = useMemo(() => CATEGORIES_BY_TYPE[form.type] || [], [form.type]);
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

  const update = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setStepErrors((p) => ({ ...p, [key]: "" }));
    setFormError("");
  };

  const handleImageChange = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setFormError("Format non autorisé (JPG, PNG, WEBP)."); return; }
    if (file.size > 3 * 1024 * 1024) { setFormError("L'image ne doit pas dépasser 3 Mo."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.type)       errs.type = "Choisissez un type.";
      if (!form.categorieId) errs.categorieId = "Choisissez une catégorie.";
      if (!form.visibilite) errs.visibilite = "Choisissez une visibilité.";
    }
    if (s === 2) {
      if (!imagePreview) errs.image = "Ajoutez une image de couverture.";
    }
    if (s === 3) {
      if (!form.titre.trim())   errs.titre   = "Le titre est obligatoire.";
      if (!form.resume.trim())  errs.resume  = "Le résumé est obligatoire.";
      if (!form.contenu.trim()) errs.contenu = "Le contenu est obligatoire.";
    }
    return errs;
  };

  const next = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) { setStepErrors(errs); setFormError("Corrigez les champs avant de continuer."); return; }
    setStepErrors({}); setFormError(""); setDirection(1);
    setStep((s) => Math.min(4, s + 1));
  };

  const prev = () => { setDirection(-1); setStep((s) => Math.max(1, s - 1)); setFormError(""); };

  const submit = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) { setStepErrors(errs); return; }
    onSubmit({ data: { ...form, categorieId: Number(form.categorieId), dateExpiration: form.dateExpiration || null }, image: imageFile });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => !loading && onClose()}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-2xl"
            style={{ maxHeight: "92vh" }}
          >

            {/* ── Modal header ── */}
            <div className="flex shrink-0 items-center justify-between border-b border-base-200 bg-base-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-base-content">
                    {mode === "create" ? "Nouvelle publication" : "Modifier la publication"}
                  </h2>
                  <p className="text-xs text-base-content/40">
                    {mode === "create" ? "Créez un contenu structuré prêt à publier" : "Mettez à jour les informations"}
                  </p>
                </div>
              </div>
              <button onClick={() => !loading && onClose()} className="btn btn-ghost btn-sm btn-circle text-base-content/50">
                <X size={16} />
              </button>
            </div>

            {/* ── Step bar ── */}
            <StepBar currentStep={step} />

            {/* ── Body ── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Main form area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={stepVariant}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >

                      {/* ── STEP 1 — Classification ── */}
                      {step === 1 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-semibold text-base-content">Type de publication</h3>
                            <p className="mt-1 text-sm text-base-content/50">Choisissez la nature de votre contenu.</p>
                          </div>

                          {/* Type cards */}
                          <Field label="" error={stepErrors.type}>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                              {TYPE_OPTIONS.map((t) => (
                                <button
                                  key={t.value} type="button"
                                  onClick={() => update("type", t.value)}
                                  className={cx(
                                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition",
                                    form.type === t.value
                                      ? "border-success/50 bg-success/8 ring-2 ring-success/20"
                                      : "border-base-200 bg-base-100 hover:border-success/30 hover:bg-base-200/40"
                                  )}
                                >
                                  <span className="text-xl">{t.icon}</span>
                                  <span className={cx(
                                    "text-xs font-semibold",
                                    form.type === t.value ? "text-success" : "text-base-content"
                                  )}>
                                    {t.label}
                                  </span>
                                  <span className="text-[10px] text-base-content/40 leading-tight">{t.desc}</span>
                                </button>
                              ))}
                            </div>
                          </Field>

                          {/* Catégorie */}
                          <Field label="Catégorie" required error={stepErrors.categorieId}>
                            <div className="flex flex-wrap gap-2">
                              {categories.map((c) => (
                                <button
                                  key={c.id} type="button"
                                  onClick={() => update("categorieId", c.id)}
                                  className={cx(
                                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                    Number(form.categorieId) === c.id
                                      ? "border-success/50 bg-success/10 text-success"
                                      : "border-base-200 bg-base-100 text-base-content/60 hover:border-success/30"
                                  )}
                                >
                                  {Number(form.categorieId) === c.id && <CheckCircle2 size={11} />}
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </Field>

                          {/* Visibilité */}
                          <Field label="Visibilité" required error={stepErrors.visibilite}>
                            <div className="grid grid-cols-2 gap-3">
                              {VISIBILITY_OPTIONS.map((v) => (
                                <button
                                  key={v.value} type="button"
                                  onClick={() => update("visibilite", v.value)}
                                  className={cx(
                                    "flex items-center gap-3 rounded-xl border p-3.5 text-left transition",
                                    form.visibilite === v.value
                                      ? "border-success/50 bg-success/8 ring-2 ring-success/20"
                                      : "border-base-200 bg-base-100 hover:border-success/30"
                                  )}
                                >
                                  <span className={cx(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                    form.visibilite === v.value ? "bg-success/10 text-success" : "bg-base-200 text-base-content/40"
                                  )}>
                                    {v.icon}
                                  </span>
                                  <div>
                                    <p className={cx("text-sm font-semibold", form.visibilite === v.value ? "text-success" : "text-base-content")}>
                                      {v.label}
                                    </p>
                                    <p className="text-xs text-base-content/40 leading-tight">{v.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </Field>
                        </div>
                      )}

                      {/* ── STEP 2 — Image ── */}
                      {step === 2 && (
                        <div className="space-y-5">
                          <div>
                            <h3 className="text-base font-semibold text-base-content">Image de couverture</h3>
                            <p className="mt-1 text-sm text-base-content/50">
                              Une image professionnelle améliore l'impact visuel de votre publication.
                            </p>
                          </div>

                          <AnimatePresence mode="wait">
                            {!imagePreview ? (
                              <motion.label
                                key="upload"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className={cx(
                                  "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition",
                                  stepErrors.image
                                    ? "border-error/40 bg-error/5"
                                    : "border-base-300 bg-base-200/30 hover:border-success/50 hover:bg-success/5"
                                )}
                              >
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
                                  <UploadCloud size={26} />
                                </div>
                                <p className="text-sm font-semibold text-base-content">
                                  Glissez une image ou cliquez pour parcourir
                                </p>
                                <p className="mt-1.5 text-xs text-base-content/40">
                                  JPG, PNG ou WEBP — maximum 3 Mo
                                </p>
                                <input
                                  type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                                />
                              </motion.label>
                            ) : (
                              <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="group relative overflow-hidden rounded-2xl border border-base-200 shadow-sm"
                              >
                                <img src={imagePreview} alt="Couverture" className="h-72 w-full object-cover" />
                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                                  <label className="btn btn-sm gap-2 bg-white/90 text-slate-800 hover:bg-white cursor-pointer">
                                    <RefreshCw size={13} />
                                    Changer l'image
                                    <input
                                      type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                      onChange={(e) => handleImageChange(e.target.files?.[0])}
                                    />
                                  </label>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {stepErrors.image && (
                            <p className="flex items-center gap-1.5 text-xs font-medium text-error">
                              <AlertCircle size={12} />{stepErrors.image}
                            </p>
                          )}
                        </div>
                      )}

                      {/* ── STEP 3 — Rédaction ── */}
                      {step === 3 && (
                        <div className="space-y-5">
                          <div>
                            <h3 className="text-base font-semibold text-base-content">Rédaction du contenu</h3>
                            <p className="mt-1 text-sm text-base-content/50">
                              Rédigez un titre clair, un résumé accrocheur et le contenu complet.
                            </p>
                          </div>

                          <Field label="Titre" required error={stepErrors.titre}>
                            <input
                              type="text"
                              value={form.titre}
                              onChange={(e) => update("titre", e.target.value)}
                              placeholder='Ex : "Réunion ordinale du 15 mars — Convocation officielle"'
                              maxLength={160}
                              className={cx(
                                "input input-bordered w-full text-sm",
                                stepErrors.titre && "input-error"
                              )}
                            />
                            <div className="mt-1 flex justify-end">
                              <span className="text-xs text-base-content/30">{form.titre.length}/160</span>
                            </div>
                          </Field>

                          <Field label="Résumé" required hint="Visible dans les cartes publiques" error={stepErrors.resume}>
                            <textarea
                              rows={3}
                              value={form.resume}
                              maxLength={220}
                              onChange={(e) => update("resume", e.target.value)}
                              placeholder="Un résumé court et clair, visible avant ouverture du contenu…"
                              className={cx(
                                "textarea textarea-bordered w-full resize-none text-sm leading-relaxed",
                                stepErrors.resume && "textarea-error"
                              )}
                            />
                            <div className="mt-1 flex justify-end">
                              <span className={cx(
                                "text-xs",
                                form.resume.length > 180 ? "text-warning" : "text-base-content/30"
                              )}>
                                {form.resume.length}/220
                              </span>
                            </div>
                          </Field>

                          <Field label="Contenu complet" required error={stepErrors.contenu}>
                            <textarea
                              rows={9}
                              value={form.contenu}
                              onChange={(e) => update("contenu", e.target.value)}
                              placeholder="Rédigez le corps complet de la publication. Soyez précis, structuré et factuel…"
                              className={cx(
                                "textarea textarea-bordered w-full resize-none text-sm leading-relaxed",
                                stepErrors.contenu && "textarea-error"
                              )}
                            />
                          </Field>
                        </div>
                      )}

                      {/* ── STEP 4 — Finalisation ── */}
                      {step === 4 && (
                        <div className="space-y-5">
                          <div>
                            <h3 className="text-base font-semibold text-base-content">Finalisation</h3>
                            <p className="mt-1 text-sm text-base-content/50">
                              Vérifiez les informations et configurez les options avancées.
                            </p>
                          </div>

                          {/* Recap */}
                          <div className="overflow-hidden rounded-xl border border-base-200 bg-base-100">
                            <div className="border-b border-base-200 bg-base-200/40 px-4 py-2.5">
                              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/40">
                                Récapitulatif
                              </p>
                            </div>
                            <div className="divide-y divide-base-200">
                              {[
                                { label: "Type",       value: TYPE_OPTIONS.find(t => t.value === form.type)?.label },
                                { label: "Catégorie",  value: selectedCategory },
                                { label: "Visibilité", value: VISIBILITY_OPTIONS.find(v => v.value === form.visibilite)?.label },
                                { label: "Titre",      value: form.titre || "—" },
                                { label: "Image",      value: imagePreview ? "✓ Image ajoutée" : "Aucune image" },
                              ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                                  <span className="text-xs text-base-content/50 shrink-0">{label}</span>
                                  <span className="text-right text-xs font-medium text-base-content truncate">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Date expiration */}
                          <Field label="Date d'expiration" hint="optionnelle">
                            <input
                              type="datetime-local"
                              value={form.dateExpiration}
                              onChange={(e) => update("dateExpiration", e.target.value)}
                              className="input input-bordered w-full text-sm"
                            />
                          </Field>

                          {/* Info */}
                          <div className="flex items-start gap-3 rounded-xl border border-base-200 bg-base-200/40 px-4 py-3">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                            <p className="text-xs text-base-content/60 leading-5">
                              Le contenu sera enregistré en <strong className="text-base-content">Brouillon</strong>.
                              Vous pourrez le relire et le publier depuis la liste de gestion des contenus.
                            </p>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Live preview sidebar ── */}
              <div className="hidden w-72 shrink-0 overflow-y-auto border-l border-base-200 bg-base-200/20 p-4 lg:block">
                <LivePreview
                  form={form}
                  imagePreview={imagePreview}
                  selectedCategory={selectedCategory}
                  step={step}
                />
              </div>
            </div>

            {/* ── Error bar ── */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="shrink-0 border-t border-error/20 bg-error/5 px-5 py-2.5"
                >
                  <p className="flex items-center gap-2 text-xs font-medium text-error">
                    <AlertCircle size={13} />{formError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Footer ── */}
            <div className="flex shrink-0 items-center justify-between border-t border-base-200 bg-base-100 px-6 py-3.5">
              <button
                type="button" onClick={step === 1 ? onClose : prev}
                className="btn btn-ghost btn-sm gap-2 text-base-content/60"
              >
                <ArrowLeft size={14} />
                {step === 1 ? "Annuler" : "Retour"}
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-base-content/30">
                  {step} / {STEPS.length}
                </span>
                {step < 4 ? (
                  <motion.button
                    type="button" onClick={next}
                    whileTap={{ scale: 0.97 }}
                    className="btn btn-sm gap-2 bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700"
                  >
                    Continuer
                    <ArrowRight size={14} />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button" onClick={submit} disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="btn btn-sm gap-2 bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700"
                  >
                    {loading ? <><span className="loading loading-spinner loading-xs" />Enregistrement…</> : <><CheckCircle2 size={14} />Enregistrer le brouillon</>}
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