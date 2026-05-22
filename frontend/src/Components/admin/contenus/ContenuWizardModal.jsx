import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ArrowLeft, ArrowRight, UploadCloud, ImagePlus,
  Check, AlertCircle, Globe, Lock, RefreshCw,
  Megaphone, Newspaper, ClipboardList, Gavel, CalendarDays,
  ChevronDown,
} from "lucide-react";
import { getSpecialites } from "../../../services/adminContenuApi";

const TYPE_OPTIONS = [
  { value: "ANNONCE",    label: "Annonce",     Icon: Megaphone,     desc: "Avis officiel",              accent: "bg-amber-50 border-amber-300 text-amber-700" },
  { value: "ACTUALITE",  label: "Actualité",   Icon: Newspaper,     desc: "Actualité institutionnelle", accent: "bg-blue-50 border-blue-300 text-blue-700" },
  { value: "COMMUNIQUE", label: "Communiqué",  Icon: ClipboardList, desc: "Note officielle",            accent: "bg-purple-50 border-purple-300 text-purple-700" },
  { value: "DECISION",   label: "Décision",    Icon: Gavel,         desc: "Décision ou règlement",      accent: "bg-red-50 border-red-300 text-red-700" },
  { value: "EVENEMENT",  label: "Événement",   Icon: CalendarDays,  desc: "Formation, réunion…",        accent: "bg-teal-50 border-teal-300 text-teal-700" },
];

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Public",              Icon: Globe, desc: "Visible par tous les visiteurs" },
  { value: "PRIVEE", label: "Médecins uniquement", Icon: Lock,  desc: "Visible après connexion" },
];

const CATEGORIES_BY_TYPE = {
  ANNONCE:    [{ id: 1, label: "Annonce officielle" }, { id: 2, label: "Recrutement" }, { id: 3, label: "Appel à candidature" }],
  ACTUALITE:  [{ id: 4, label: "Actualité institutionnelle" }, { id: 5, label: "Vie de l'Ordre" }],
  COMMUNIQUE: [{ id: 6, label: "Communiqué officiel" }, { id: 7, label: "Note d'information" }],
  DECISION:   [{ id: 8, label: "Décision ordinale" }, { id: 9, label: "Réglementation" }],
  EVENEMENT:  [{ id: 10, label: "Formation" }, { id: 11, label: "Réunion" }],
};

const STEPS = [
  { id: 1, label: "Classification" },
  { id: 2, label: "Couverture" },
  { id: 3, label: "Contenu" },
  { id: 4, label: "Finalisation" },
];

const cx = (...c) => c.filter(Boolean).join(" ");

const slideVariant = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32, transition: { duration: 0.18 } }),
};

function inp(err) {
  return cx(
    "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition",
    "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
    "focus:ring-2 focus:ring-green-500/20",
    err
      ? "border-red-400 focus:border-red-400"
      : "border-slate-200 dark:border-slate-700 focus:border-green-500"
  );
}

function Field({ label, hint, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}{required && <span className="ml-0.5 text-green-600">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{hint}</span>}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs font-medium text-red-500"
          >
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Horizontal numbered stepper ── */
function Stepper({ currentStep }) {
  return (
    <div className="flex items-center px-6 pt-5 pb-4">
      {STEPS.map((s, i) => {
        const done    = currentStep > s.id;
        const current = currentStep === s.id;
        return (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={cx(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                done    ? "bg-green-600 text-white"
                : current ? "bg-green-600 text-white ring-4 ring-green-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
              )}>
                {done ? <Check size={15} /> : s.id}
              </div>
              <span className={cx(
                "whitespace-nowrap text-[11px] font-semibold transition-colors",
                current ? "text-green-700 dark:text-green-400" : done ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"
              )}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cx(
                "mx-2 flex-1 h-0.5 mb-4 rounded-full transition-all duration-500",
                currentStep > s.id ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ContenuWizardModal({ isOpen, mode = "create", initialData = null, loading = false, onClose, onSubmit }) {
  const [step, setStep]           = useState(1);
  const [direction, setDirection] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [stepErrors, setStepErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [specialites, setSpecialites] = useState([]);

  const [form, setForm] = useState({
    type: "ANNONCE", categorieId: 1, visibilite: "PUBLIC", specialiteCibleId: "",
    titre: "", resume: "", contenu: "", dateExpiration: "",
  });

  const categories       = useMemo(() => CATEGORIES_BY_TYPE[form.type] || [], [form.type]);
  const selectedCategory = categories.find((c) => Number(c.id) === Number(form.categorieId))?.label || "—";

  /* Load specialites when visibility becomes PRIVEE */
  useEffect(() => {
    if (form.visibilite === "PRIVEE" && specialites.length === 0) {
      getSpecialites()
        .then((res) => setSpecialites(res.data?.content || []))
        .catch(() => {});
    }
  }, [form.visibilite]);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1); setDirection(1); setImageFile(null); setFormError(""); setStepErrors({});
    if (mode === "edit" && initialData) {
      setForm({
        type: initialData.type || "ANNONCE",
        categorieId: initialData.categorieId || 1,
        visibilite: initialData.visibilite || "PUBLIC",
        specialiteCibleId: initialData.specialiteCibleId || "",
        titre: initialData.titre || "",
        resume: initialData.resume || "",
        contenu: initialData.contenu || "",
        dateExpiration: initialData.dateExpiration ? initialData.dateExpiration.slice(0, 16) : "",
      });
      setImagePreview(initialData.imageUrl ? `http://localhost:8080${initialData.imageUrl}` : "");
    } else {
      setForm({ type: "ANNONCE", categorieId: 1, visibilite: "PUBLIC", specialiteCibleId: "", titre: "", resume: "", contenu: "", dateExpiration: "" });
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

  const update = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setStepErrors((p) => ({ ...p, [key]: "" }));
    setFormError("");
  };

  const handleImageChange = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Format non autorisé (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) { setFormError("L'image ne doit pas dépasser 3 Mo."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.type) e.type = "Choisissez un type.";
      if (!form.categorieId) e.categorieId = "Choisissez une catégorie.";
      if (!form.visibilite) e.visibilite = "Choisissez une visibilité.";
    }
    if (s === 2 && !imagePreview) e.image = "Ajoutez une image de couverture.";
    if (s === 3) {
      if (!form.titre.trim()) e.titre = "Le titre est obligatoire.";
      if (!form.resume.trim()) e.resume = "Le résumé est obligatoire.";
      if (!form.contenu.trim()) e.contenu = "Le contenu est obligatoire.";
    }
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
    onSubmit({
      data: {
        ...form,
        categorieId: Number(form.categorieId),
        specialiteCibleId: form.specialiteCibleId ? Number(form.specialiteCibleId) : null,
        dateExpiration: form.dateExpiration || null,
      },
      image: imageFile,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && onClose()}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "92vh" }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {mode === "create" ? "Nouvelle publication" : "Modifier la publication"}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Étape {step} sur {STEPS.length} — {STEPS[step - 1]?.label}
                </p>
              </div>
              <button
                onClick={() => !loading && onClose()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stepper */}
            <Stepper currentStep={step} />

            {/* Divider */}
            <div className="shrink-0 border-t border-slate-100 dark:border-slate-800" />

            {/* Step content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={step} custom={direction} variants={slideVariant} initial="enter" animate="center" exit="exit">

                  {/* ── Step 1: Classification ── */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <Field label="Type de publication" required error={stepErrors.type}>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                          {TYPE_OPTIONS.map((t) => (
                            <button key={t.value} type="button" onClick={() => update("type", t.value)}
                              className={cx(
                                "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all",
                                form.type === t.value
                                  ? cx("ring-2 ring-green-500/30", t.accent)
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                              )}
                            >
                              <div className={cx(
                                "flex h-9 w-9 items-center justify-center rounded-xl transition",
                                form.type === t.value ? "bg-white/70" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                              )}>
                                <t.Icon size={17} />
                              </div>
                              <span className="text-xs font-bold leading-tight">{t.label}</span>
                              <span className="hidden sm:block text-[9px] text-slate-400 leading-tight">{t.desc}</span>
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
                                  ? "border-green-500 bg-green-600 text-white"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-green-300 hover:text-green-700"
                              )}
                            >
                              {Number(form.categorieId) === c.id && <Check size={10} />}
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
                                  ? "border-green-500 bg-green-50 ring-2 ring-green-500/20"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-green-200 dark:hover:border-green-700"
                              )}
                            >
                              <span className={cx(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                                form.visibilite === v.value ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
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

                      {/* Specialty targeting — only when PRIVEE */}
                      <AnimatePresence>
                        {form.visibilite === "PRIVEE" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                          >
                            <Field label="Cibler une spécialité" hint="optionnel — laisser vide = tous les médecins">
                              <div className="relative">
                                <select
                                  value={form.specialiteCibleId}
                                  onChange={(e) => update("specialiteCibleId", e.target.value)}
                                  className={cx(inp(false), "appearance-none pr-9 cursor-pointer")}
                                >
                                  <option value="">Tous les médecins</option>
                                  {specialites.map((s) => (
                                    <option key={s.id} value={s.id}>{s.libelle}</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              </div>
                              <p className="text-xs text-slate-400 leading-4 mt-1">
                                Si une spécialité est sélectionnée, seuls les médecins de cette spécialité verront cette publication.
                              </p>
                            </Field>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* ── Step 2: Image de couverture ── */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Image de couverture</h3>
                        <p className="mt-1 text-sm text-slate-500">Une image attrayante augmente l'engagement de votre publication.</p>
                      </div>

                      <AnimatePresence mode="wait">
                        {!imagePreview ? (
                          <motion.label key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className={cx(
                              "group flex cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-14 text-center transition-all",
                              stepErrors.image
                                ? "border-red-300 bg-red-50"
                                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-green-400 hover:bg-green-50/40 dark:hover:bg-green-900/10"
                            )}
                          >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-slate-400 group-hover:border-green-300 group-hover:text-green-600 transition-colors">
                              <UploadCloud size={28} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">Déposez votre image ici</p>
                              <p className="mt-1 text-xs text-slate-400">ou <span className="text-green-600 font-semibold">parcourir les fichiers</span></p>
                              <p className="mt-2 text-[11px] text-slate-400">JPG, PNG ou WEBP — max 3 Mo — Ratio 16:9 recommandé</p>
                            </div>
                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                              onChange={(e) => handleImageChange(e.target.files?.[0])} />
                          </motion.label>
                        ) : (
                          <motion.div key="preview" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                          >
                            <img src={imagePreview} alt="Couverture" className="h-64 w-full object-cover" />
                            <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/60 via-transparent to-transparent p-5 opacity-0 transition group-hover:opacity-100">
                              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition-colors">
                                <RefreshCw size={13} />Changer l'image
                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                  onChange={(e) => handleImageChange(e.target.files?.[0])} />
                              </label>
                            </div>
                            <div className="absolute top-3 right-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
                              <Check size={11} /> Image ajoutée
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
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Rédaction du contenu</h3>
                        <p className="mt-1 text-sm text-slate-500">Titre clair, résumé accrocheur et corps complet.</p>
                      </div>

                      <Field label="Titre de la publication" required error={stepErrors.titre}>
                        <div className="relative">
                          <input type="text" value={form.titre} onChange={(e) => update("titre", e.target.value)}
                            placeholder='Ex : "Réunion ordinale du 15 mars — Convocation officielle"'
                            maxLength={160} className={inp(!!stepErrors.titre)} />
                          <span className={cx(
                            "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
                            form.titre.length > 140 ? "text-amber-500" : "text-slate-400"
                          )}>
                            {form.titre.length}/160
                          </span>
                        </div>
                      </Field>

                      <Field label="Résumé" required hint="Affiché dans la liste" error={stepErrors.resume}>
                        <textarea rows={3} value={form.resume} maxLength={220}
                          onChange={(e) => update("resume", e.target.value)}
                          placeholder="Un texte court et percutant visible avant l'ouverture du contenu…"
                          className={cx(inp(!!stepErrors.resume), "resize-none leading-relaxed")} />
                        <div className="flex justify-end">
                          <span className={cx("text-xs", form.resume.length > 190 ? "text-amber-500" : "text-slate-400")}>
                            {form.resume.length}/220
                          </span>
                        </div>
                      </Field>

                      <Field label="Corps du contenu" required error={stepErrors.contenu}>
                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/15 transition">
                          <div className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Corps du texte</span>
                          </div>
                          <textarea rows={10} value={form.contenu} onChange={(e) => update("contenu", e.target.value)}
                            placeholder="Rédigez le corps complet de la publication. Soyez précis, structuré et factuel…"
                            className="w-full border-0 bg-transparent px-4 py-3 text-sm outline-none resize-none leading-relaxed text-slate-800 placeholder:text-slate-400" />
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* ── Step 4: Finalisation ── */}
                  {step === 4 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Vérification finale</h3>
                        <p className="mt-1 text-sm text-slate-500">Relisez avant d'enregistrer le brouillon.</p>
                      </div>

                      {/* Summary */}
                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-5 py-2.5">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Récapitulatif</p>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {[
                            { label: "Type",        value: TYPE_OPTIONS.find((t) => t.value === form.type)?.label },
                            { label: "Catégorie",   value: selectedCategory },
                            { label: "Visibilité",  value: VISIBILITY_OPTIONS.find((v) => v.value === form.visibilite)?.label },
                            { label: "Cible",       value: form.specialiteCibleId
                                ? specialites.find((s) => String(s.id) === String(form.specialiteCibleId))?.libelle || "—"
                                : form.visibilite === "PRIVEE" ? "Tous les médecins" : "—" },
                            { label: "Titre",       value: form.titre || <span className="italic text-slate-400">Non renseigné</span> },
                            { label: "Image",       value: imagePreview ? <span className="text-green-600 font-semibold flex items-center gap-1"><Check size={12}/>Image ajoutée</span> : <span className="text-amber-500">Aucune image</span> },
                          ].filter(r => r.label !== "Cible" || form.visibilite === "PRIVEE").map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between gap-4 px-5 py-3">
                              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0 w-20">{label}</span>
                              <span className="text-right text-xs text-slate-800 dark:text-slate-200 truncate">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Field label="Date d'expiration" hint="optionnelle">
                        <div className="relative">
                          <CalendarDays size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input type="datetime-local" value={form.dateExpiration}
                            onChange={(e) => update("dateExpiration", e.target.value)}
                            className={cx(inp(false), "pl-10")} />
                        </div>
                      </Field>

                      <div className="flex items-start gap-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3.5">
                        <Check size={15} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
                        <p className="text-xs text-green-800 dark:text-green-300 leading-5">
                          La publication sera sauvegardée en <strong>Brouillon</strong>. Elle ne sera visible qu'après publication manuelle depuis le panneau de gestion.
                        </p>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Error bar */}
            <AnimatePresence>
              {formError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="shrink-0 border-t border-red-200 bg-red-50 px-5 py-2.5"
                >
                  <p className="flex items-center gap-2 text-xs font-medium text-red-600">
                    <AlertCircle size={12} />{formError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
              <button type="button" onClick={step === 1 ? onClose : prev}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft size={14} />
                {step === 1 ? "Annuler" : "Retour"}
              </button>

              {step < 4 ? (
                <motion.button type="button" onClick={next} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm shadow-green-900/15"
                >
                  Continuer <ArrowRight size={14} />
                </motion.button>
              ) : (
                <motion.button type="button" onClick={submit} disabled={loading} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Enregistrement…</>
                  ) : (
                    <><Check size={14} />Enregistrer le brouillon</>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ContenuWizardModal;
