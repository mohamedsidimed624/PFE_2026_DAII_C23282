import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { createMedecinReclamation } from "../../services/medecinReclamationApi";
import {
  ArrowLeft, Send, Paperclip, CheckCircle2, AlertCircle,
  X, Upload, Clock, ShieldCheck, ListChecks, Tag, FileText, Loader2,
} from "lucide-react";

const CATEGORIES = [
  { value: "RETARD_TRAITEMENT",          label: "Retard de traitement",             group: "Administratif" },
  { value: "ERREUR_DOSSIER",             label: "Erreur sur dossier",               group: "Administratif" },
  { value: "DEMANDE_INFORMATION",        label: "Demande d'information",            group: "Administratif" },
  { value: "QUALITE_SOINS",              label: "Qualité des soins",                group: "Pratique médicale" },
  { value: "CERTIFICAT_MEDICAL",         label: "Certificat médical",               group: "Pratique médicale" },
  { value: "PRESCRIPTION_ABUSIVE",       label: "Prescription abusive",             group: "Pratique médicale" },
  { value: "INFORMATION_CONSENTEMENT",   label: "Information et consentement",      group: "Pratique médicale" },
  { value: "COMPORTEMENT_INAPPROPRIE",   label: "Comportement inapproprié",         group: "Déontologie" },
  { value: "SECRET_PROFESSIONNEL",       label: "Secret professionnel",             group: "Déontologie" },
  { value: "CONFRATERNITE",              label: "Confraternité",                    group: "Déontologie" },
  { value: "PUBLICITE_CHARLATANISME",    label: "Publicité / charlatanisme",        group: "Déontologie" },
  { value: "DECONSIDERATION_PROFESSION", label: "Déconsidération de la profession", group: "Déontologie" },
  { value: "AUTRE",                      label: "Autre",                            group: "Autre" },
];

const GROUPS = [...new Set(CATEGORIES.map((c) => c.group))];

const inputCls = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500
   focus:ring-2 focus:ring-green-500/20 focus:border-green-500
   ${hasError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20 dark:border-red-700" : "border-slate-200 dark:border-slate-700"}`;

function Field({ label, required, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-400 -mt-0.5">{hint}</p>}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

export default function MedecinReclamationCreatePage() {
  const navigate = useNavigate();

  const [form, setForm]               = useState({ categorie: "", objet: "", message: "" });
  const [file, setFile]               = useState(null);
  const [errors, setErrors]           = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(null);

  const setField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const e = {};
    if (!form.objet.trim())                  e.objet     = "L'objet est obligatoire.";
    else if (form.objet.trim().length < 5)   e.objet     = "Minimum 5 caractères.";
    if (!form.categorie)                     e.categorie = "Sélectionnez une catégorie.";
    if (!form.message.trim())                e.message   = "La description est obligatoire.";
    else if (form.message.trim().length < 20) e.message  = "Minimum 20 caractères.";
    if (file) {
      const ok = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
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
    if (Object.keys(errs).length > 0) return;
    try {
      setLoading(true);
      const res = await createMedecinReclamation(
        { categorie: form.categorie, objet: form.objet.trim(), message: form.message.trim() },
        file
      );
      setSubmitted({ numero: res?.numeroReclamation || "" });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Impossible de soumettre la réclamation.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success ── */
  if (submitted) {
    return (
      <MedecinLayout title="Réclamation soumise" subtitle="">
        <div className="mx-auto max-w-lg py-10 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"
          >
            <CheckCircle2 size={38} strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Réclamation soumise</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Votre demande a été transmise à l'administration de l'Ordre.
          </p>

          {submitted.numero && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
              <span className="text-xs text-slate-400">Référence</span>
              <span className="font-mono text-sm font-bold text-slate-800">{submitted.numero}</span>
            </div>
          )}

          <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-white p-5 text-left dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Prochaines étapes</p>
            {[
              { icon: <Clock size={14} />,      text: "Votre réclamation sera examinée dans les meilleurs délais." },
              { icon: <ShieldCheck size={14} />, text: "L'administration vous contactera si nécessaire." },
              { icon: <ListChecks size={14} />,  text: "Suivez l'état depuis votre espace réclamations." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="mt-0.5 shrink-0 text-green-600">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/medecin/reclamations")}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-green-700 px-6 py-2.5 text-sm font-bold uppercase text-white transition hover:bg-green-800"
            >
              <ListChecks size={15} /> Voir mes réclamations
            </button>
            <button
              onClick={() => { setSubmitted(null); setForm({ categorie: "", objet: "", message: "" }); setFile(null); }}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-green-600 bg-white px-6 py-2.5 text-sm font-bold uppercase text-green-700 transition hover:bg-green-50"
            >
              Nouvelle réclamation
            </button>
          </div>
        </div>
      </MedecinLayout>
    );
  }

  /* ── Form ── */
  return (
    <MedecinLayout title="Nouvelle réclamation" subtitle="Soumettez une réclamation à l'administration de l'Ordre.">
      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <button
          onClick={() => navigate("/medecin/reclamations")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={15} /> Retour aux réclamations
        </button>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">

          {/* Green header */}
          <div className="bg-green-700 px-6 py-5 text-center">
            <h2 className="text-xl font-bold text-white">Déposer une réclamation</h2>
            <p className="mt-1 text-sm text-green-100">
              Soyez précis et factuel pour accélérer le traitement de votre dossier.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">

            {/* Submit error */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle size={15} className="shrink-0" />{submitError}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-sm text-slate-500">
              Les champs marqués <span className="font-semibold text-red-500">*</span> sont obligatoires.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Objet */}
              <Field label="Objet" required hint="Résumez en une phrase (120 caractères max)." error={errors.objet}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <FileText size={15} />
                  </span>
                  <input
                    type="text"
                    value={form.objet}
                    onChange={(e) => setField("objet", e.target.value)}
                    placeholder="Objet de la réclamation"
                    maxLength={120}
                    className={`${inputCls(Boolean(errors.objet))} pl-10 pr-14`}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {form.objet.length}/120
                  </span>
                </div>
              </Field>

              {/* Catégorie */}
              <Field label="Catégorie" required error={errors.categorie}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Tag size={15} />
                  </span>
                  <select
                    value={form.categorie}
                    onChange={(e) => setField("categorie", e.target.value)}
                    className={`${inputCls(Boolean(errors.categorie))} appearance-none pl-10 pr-9`}
                  >
                    <option value="">— Sélectionner une catégorie —</option>
                    {GROUPS.map((group) => (
                      <optgroup key={group} label={group}>
                        {CATEGORIES.filter((c) => c.group === group).map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                </div>
              </Field>

              {/* Message */}
              <Field label="Message" required hint="Décrivez les faits avec précision (dates, lieu, personnes concernées)." error={errors.message}>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => setField("message", e.target.value)}
                  maxLength={2000}
                  placeholder="Décrivez votre réclamation en détail…"
                  className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500
                    ${errors.message ? "border-red-300 focus:border-red-400 focus:ring-red-400/20 dark:border-red-700" : "border-slate-200 dark:border-slate-700"}`}
                />
                <div className="flex items-center justify-between">
                  {!errors.message && <span className="text-xs text-slate-400">Minimum 20 caractères</span>}
                  <span className={`ml-auto text-xs ${form.message.length > 1800 ? "text-amber-500" : "text-slate-400"}`}>
                    {form.message.length}/2000
                  </span>
                </div>
              </Field>

              {/* Pièce jointe */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Pièce jointe</label>
                <p className="text-xs text-slate-400">Optionnel — PDF, PNG ou JPG, max 5 Mo.</p>

                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.label
                      key="upload"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition
                        ${errors.file ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20" : "border-slate-200 bg-slate-50 hover:border-green-400 hover:bg-green-50/40 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-green-700 dark:hover:bg-green-900/10"}`}
                    >
                      <Upload size={18} className="shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Choisir un fichier</p>
                        <p className="text-xs text-slate-400">PDF, PNG ou JPG · max 5 Mo</p>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => { setFile(e.target.files?.[0] || null); setErrors((p) => ({ ...p, file: "" })); }}
                      />
                    </motion.label>
                  ) : (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-green-100 bg-white text-green-600">
                        <Paperclip size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-400">{Math.round(file.size / 1024)} Ko</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setFile(null); setErrors((p) => ({ ...p, file: "" })); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.file && (
                  <p className="flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
                    <AlertCircle size={11} />{errors.file}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/medecin/reclamations")}
                  className="rounded-md border border-green-600 bg-white px-5 py-2.5 text-sm font-bold uppercase text-green-700 transition hover:bg-green-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-md bg-green-700 px-7 py-2.5 text-sm font-bold uppercase text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? (
                    <><Loader2 size={14} className="animate-spin" />Envoi en cours…</>
                  ) : (
                    <><Send size={14} />Envoyer</>
                  )}
                </button>
              </div>

            </form>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            Besoin d'aide ?{" "}
            <span className="font-bold uppercase text-green-700">Contacter l'administration</span>
          </div>
        </div>

      </div>
    </MedecinLayout>
  );
}
