import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { createMedecinReclamation } from "../../services/medecinReclamationApi";
import {
  ArrowLeft, Send, Paperclip, CheckCircle2, AlertCircle,
  X, Upload, Clock, ShieldCheck, ChevronRight, ListChecks,
} from "lucide-react";

/* ── Catégories groupées visuellement ───────────────── */
const CATEGORY_GROUPS = [
  {
    id: "administratif",
    label: "Administratif",
    icon: "📋",
    description: "Dossier, délais, informations",
    sub: [
      { value: "RETARD_TRAITEMENT",   label: "Retard de traitement" },
      { value: "ERREUR_DOSSIER",      label: "Erreur sur dossier" },
      { value: "DEMANDE_INFORMATION", label: "Demande d'information" },
    ],
  },
  {
    id: "medical",
    label: "Pratique médicale",
    icon: "🩺",
    description: "Soins, prescriptions, certificats",
    sub: [
      { value: "QUALITE_SOINS",            label: "Qualité des soins" },
      { value: "CERTIFICAT_MEDICAL",       label: "Certificat médical" },
      { value: "PRESCRIPTION_ABUSIVE",     label: "Prescription abusive" },
      { value: "INFORMATION_CONSENTEMENT", label: "Information et consentement" },
    ],
  },
  {
    id: "comportement",
    label: "Comportement & déontologie",
    icon: "⚖️",
    description: "Conduite, secret, confraternité",
    sub: [
      { value: "COMPORTEMENT_INAPPROPRIE",    label: "Comportement inapproprié" },
      { value: "SECRET_PROFESSIONNEL",        label: "Secret professionnel" },
      { value: "CONFRATERNITE",               label: "Confraternité" },
      { value: "PUBLICITE_CHARLATANISME",     label: "Publicité / charlatanisme" },
      { value: "DECONSIDERATION_PROFESSION",  label: "Déconsidération de la profession" },
    ],
  },
  {
    id: "autre",
    label: "Autre",
    icon: "📝",
    description: "Autre motif non listé",
    sub: [{ value: "AUTRE", label: "Autre" }],
  },
];

const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.sub);

const cx = (...c) => c.filter(Boolean).join(" ");

const formatFileSize = (b) => {
  if (!b && b !== 0) return "";
  if (b < 1024) return `${b} o`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} Ko`;
  return `${(b / (1024 * 1024)).toFixed(1)} Mo`;
};

/* ── Variants ───────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.32, delay: i * 0.06, ease: "easeOut" },
  }),
};

const slideIn = {
  hidden:  { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:    { opacity: 0, x: 10, transition: { duration: 0.18 } },
};

const alertV = {
  hidden:  { opacity: 0, y: -10, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.18 } },
};

/* ── Field ──────────────────────────────────────────── */
function Field({ label, required, hint, error, children, index = 0 }) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible" custom={index}
      className="space-y-1.5"
    >
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-base-content">
          {label}{required && <span className="ml-1 text-error">*</span>}
        </label>
        {hint && <span className="text-xs text-base-content/40 shrink-0">{hint}</span>}
      </div>
      {children}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs font-medium text-error"
          >
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main ───────────────────────────────────────────── */
export default function MedecinReclamationCreatePage() {
  const navigate = useNavigate();

  const [activeGroup, setActiveGroup] = useState(null);
  const [form, setForm]   = useState({ categorie: "", objet: "", message: "" });
  const [file, setFile]   = useState(null);
  const [errors, setErrors]           = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(null); // { numero }

  const setField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setSubmitError("");
  };

  const selectGroup = (groupId) => {
    const grp = CATEGORY_GROUPS.find((g) => g.id === groupId);
    setActiveGroup(groupId);
    // Auto-select si une seule sub-catégorie
    if (grp?.sub.length === 1) {
      setField("categorie", grp.sub[0].value);
    } else {
      setField("categorie", "");
    }
  };

  const validate = () => {
    const e = {};
    if (!form.objet.trim())                  e.objet     = "L'objet est obligatoire.";
    else if (form.objet.trim().length < 5)   e.objet     = "Minimum 5 caractères.";
    if (!form.categorie)                     e.categorie = "Choisissez une catégorie.";
    if (!form.message.trim())                e.message   = "La description est obligatoire.";
    else if (form.message.trim().length < 20) e.message  = "Minimum 20 caractères.";
    if (file) {
      const ok = ["application/pdf","image/png","image/jpeg","image/jpg","image/webp"];
      if (file.type && !ok.includes(file.type)) e.file = "Format non supporté (PDF, PNG, JPG).";
      else if (file.size > 5 * 1024 * 1024)     e.file = "Le fichier dépasse 5 Mo.";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) { setSubmitError("Corrigez les champs en erreur."); return; }
    try {
      setLoading(true);
      const res = await createMedecinReclamation(
        { categorie: form.categorie, objet: form.objet.trim(), message: form.message.trim() },
        file
      );
      setSubmitted({ numero: res?.numeroReclamation || "" });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Impossible de soumettre.");
    } finally {
      setLoading(false);
    }
  };

  const activeGroupData = CATEGORY_GROUPS.find((g) => g.id === activeGroup);
  const selectedCatLabel = ALL_CATEGORIES.find((c) => c.value === form.categorie)?.label;

  /* ── SUCCESS STATE ────────────────────────────────── */
  if (submitted) {
    return (
      <MedecinLayout title="Réclamation soumise" subtitle="">
        <div className="mx-auto max-w-lg py-10 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success"
          >
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <h1 className="text-2xl font-bold text-base-content">
              Réclamation soumise
            </h1>
            <p className="mt-2 text-sm text-base-content/60">
              Votre demande a bien été enregistrée et sera traitée par l'administration.
            </p>
          </motion.div>

          {submitted.numero && (
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-base-200 bg-base-200/50 px-5 py-3"
            >
              <span className="text-xs text-base-content/50">Référence</span>
              <span className="font-mono text-sm font-bold text-base-content">
                {submitted.numero}
              </span>
            </motion.div>
          )}

          {/* What's next */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-6 rounded-2xl border border-base-200 bg-base-100 p-5 text-left space-y-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/40">
              Prochaines étapes
            </p>
            {[
              { icon: <Clock size={14} />, text: "Votre réclamation sera examinée dans les meilleurs délais." },
              { icon: <ShieldCheck size={14} />, text: "L'administration vous contactera si des informations complémentaires sont nécessaires." },
              { icon: <ListChecks size={14} />, text: "Vous pourrez suivre l'état de votre réclamation depuis votre espace." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-base-content/70">
                <span className="mt-0.5 text-success shrink-0">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <button
              onClick={() => navigate("/medecin/reclamations")}
              className="btn btn-success gap-2 text-white"
            >
              <ListChecks size={16} />
              Voir mes réclamations
            </button>
            <button
              onClick={() => {
                setSubmitted(null);
                setForm({ categorie: "", objet: "", message: "" });
                setFile(null); setActiveGroup(null);
              }}
              className="btn btn-ghost gap-2"
            >
              Nouvelle réclamation
            </button>
          </motion.div>
        </div>
      </MedecinLayout>
    );
  }

  /* ── FORM ─────────────────────────────────────────── */
  return (
    <MedecinLayout title="Nouvelle réclamation" subtitle="Soumettez une réclamation à l'administration.">
      <div className="mx-auto max-w-2xl space-y-5">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28 }}
          onClick={() => navigate("/medecin/reclamations")}
          className="btn btn-ghost btn-sm gap-2 text-base-content/50 hover:text-base-content"
        >
          <ArrowLeft size={14} /> Retour
        </motion.button>

        {/* Header contextuel */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="rounded-2xl border border-base-200 bg-base-200/40 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-base-content">
                Déposer une réclamation
              </p>
              <p className="mt-1 text-xs text-base-content/50 leading-5">
                Votre demande sera transmise à l'administration de l'Ordre.
                Elle sera examinée et vous recevrez une réponse dans les meilleurs délais.
                Soyez précis et factuel pour accélérer le traitement.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Submit error */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              variants={alertV} initial="hidden" animate="visible" exit="exit"
              className="alert alert-error shadow-sm"
            >
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-sm">{submitError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form card */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="card border border-base-200 bg-base-100 shadow-sm"
        >
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-base-200 bg-base-200/40 px-5 py-3.5">
            <p className="text-sm font-semibold text-base-content">
              Informations de la réclamation
            </p>
            <span className="text-xs text-base-content/40">
              <span className="text-error">*</span> obligatoire
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="divide-y divide-base-200">

              {/* ── Objet ── */}
              <div className="px-5 py-4">
                <Field label="Objet" required hint="résumé en une phrase" error={errors.objet} index={2}>
                  <input
                    type="text"
                    value={form.objet}
                    onChange={(e) => setField("objet", e.target.value)}
                    placeholder='Ex. "Mon dossier dinscription a été rejeté sans justification le 15 mars."'
                    maxLength={120}
                    className={cx("input input-bordered w-full text-sm", errors.objet && "input-error")}/>
                  <div className="mt-1 flex justify-end">
                    <span className="text-xs text-base-content/30">{form.objet.length}/120</span>
                  </div>
                </Field>
              </div>

              {/* ── Catégorie en 2 étapes ── */}
              <div className="px-5 py-4 space-y-3">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-medium text-base-content">
                      Catégorie <span className="text-error">*</span>
                    </label>
                    {selectedCatLabel && (
                      <span className="badge badge-success badge-sm gap-1">
                        <CheckCircle2 size={10} /> {selectedCatLabel}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-base-content/40">
                    Sélectionnez d'abord le type, puis précisez si nécessaire.
                  </p>

                  {/* Étape 1 — groupes */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {CATEGORY_GROUPS.map((grp) => (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => selectGroup(grp.id)}
                        className={cx(
                          "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
                          activeGroup === grp.id
                            ? "border-success/50 bg-success/8 ring-1 ring-success/30"
                            : "border-base-200 bg-base-100 hover:border-success/30 hover:bg-base-200/40"
                        )}
                      >
                        <span className="text-base leading-none mt-0.5">{grp.icon}</span>
                        <div className="min-w-0">
                          <p className={cx(
                            "text-xs font-semibold leading-tight",
                            activeGroup === grp.id ? "text-success" : "text-base-content"
                          )}>
                            {grp.label}
                          </p>
                          <p className="mt-0.5 text-xs text-base-content/40 leading-tight">
                            {grp.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Étape 2 — sous-catégories */}
                  <AnimatePresence>
                    {activeGroup && activeGroupData && activeGroupData.sub.length > 1 && (
                      <motion.div
                        key={activeGroup}
                        variants={slideIn} initial="hidden" animate="visible" exit="exit"
                        className="mt-3 space-y-1.5"
                      >
                        <p className="text-xs font-medium text-base-content/60">
                          Précisez :
                        </p>
                        <div className="space-y-1">
                          {activeGroupData.sub.map((sub) => (
                            <button
                              key={sub.value}
                              type="button"
                              onClick={() => setField("categorie", sub.value)}
                              className={cx(
                                "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
                                form.categorie === sub.value
                                  ? "border-success/40 bg-success/8 text-success font-medium"
                                  : "border-base-200 bg-base-100 text-base-content/70 hover:bg-base-200/40"
                              )}
                            >
                              {sub.label}
                              {form.categorie === sub.value && (
                                <CheckCircle2 size={14} className="text-success shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {errors.categorie && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-error"
                      >
                        <AlertCircle size={11} /> {errors.categorie}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* ── Description ── */}
              <div className="px-5 py-4">
                <Field
                  label="Description"
                  required
                  hint="soyez factuel et précis"
                  error={errors.message}
                  index={4}
                >
                  <textarea
                    rows={7}
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder={"Exemple : Le 12 mars, j'ai soumis mon dossier de renouvellement. Malgré plusieurs relances, aucune réponse n'a été donnée. Je sollicite une explication et un traitement rapide..."}
                    maxLength={2000}
                    className={cx(
                      "textarea textarea-bordered w-full resize-none text-sm leading-relaxed",
                      errors.message && "textarea-error"
                    )}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-base-content/40">
                      Minimum 20 caractères
                    </span>
                    <span className={cx(
                      "text-xs",
                      form.message.length > 1800 ? "text-warning" : "text-base-content/30"
                    )}>
                      {form.message.length}/2000
                    </span>
                  </div>
                </Field>
              </div>

              {/* ── Pièce jointe ── */}
              <div className="px-5 py-4">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-medium text-base-content">
                      Pièce jointe
                    </label>
                    <span className="text-xs text-base-content/40">
                      recommandée — PDF, PNG, JPG, max 5 Mo
                    </span>
                  </div>

                  <p className="text-xs text-base-content/40">
                    Un document justificatif (capture, courrier, résultat…) renforce votre dossier.
                  </p>

                  <AnimatePresence mode="wait">
                    {!file ? (
                      <motion.label
                        key="upload"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={cx(
                          "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 transition",
                          errors.file
                            ? "border-error/50 bg-error/5"
                            : "border-base-300 bg-base-200/20 hover:border-success/50 hover:bg-success/5"
                        )}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-base-300 bg-base-100 text-base-content/40">
                          <Upload size={15} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-base-content">
                            Ajouter un justificatif
                          </p>
                          <p className="text-xs text-base-content/40">Cliquez pour sélectionner</p>
                        </div>
                        <input
                          type="file"
                          accept="application/pdf,image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setFile(f);
                            setErrors((p) => ({ ...p, file: "" }));
                            setSubmitError("");
                          }}
                        />
                      </motion.label>
                    ) : (
                      <motion.div
                        key="file"
                        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-success/20 bg-base-100 text-success">
                          <Paperclip size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-base-content">{file.name}</p>
                          <p className="text-xs text-base-content/40">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setFile(null); setErrors((p) => ({ ...p, file: "" })); }}
                          className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {errors.file && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-xs font-medium text-error"
                      >
                        <AlertCircle size={11} /> {errors.file}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between border-t border-base-200 bg-base-200/40 px-5 py-3.5">
              <button
                type="button"
                onClick={() => navigate("/medecin/reclamations")}
                className="btn btn-ghost btn-sm gap-2 text-base-content/50"
              >
                <ArrowLeft size={14} /> Annuler
              </button>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="btn btn-success btn-sm gap-2 text-white"
              >
                {loading ? (
                  <><span className="loading loading-spinner loading-xs" />Envoi...</>
                ) : (
                  <><Send size={14} />Soumettre<ChevronRight size={13} /></>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

      </div>
    </MedecinLayout>
  );
}