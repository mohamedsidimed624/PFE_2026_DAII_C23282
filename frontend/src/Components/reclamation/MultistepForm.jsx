import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Info, Phone, ArrowLeft, ArrowRight, RotateCcw, Loader2 } from "lucide-react";

import Progress from "./Progress";
import StepPersonal from "./StepPersonal";
import StepReclamation from "./StepReclamation";
import StepSummary from "./StepSummary";
import StepSuccess from "./StepSuccess";
import { createPublicReclamation } from "../../services/publicReclamationApi";

export const CATEGORY_OPTIONS = [
  { value: "RETARD_TRAITEMENT",        label: "Retard de traitement" },
  { value: "ERREUR_DOSSIER",           label: "Erreur sur dossier" },
  { value: "DEMANDE_INFORMATION",      label: "Demande d'information" },
  { value: "QUALITE_SOINS",            label: "Qualité des soins" },
  { value: "INFORMATION_CONSENTEMENT", label: "Information et consentement" },
  { value: "SECRET_PROFESSIONNEL",     label: "Secret professionnel" },
  { value: "COMPORTEMENT_INAPPROPRIE", label: "Comportement inapproprié" },
  { value: "CERTIFICAT_MEDICAL",       label: "Certificat médical" },
  { value: "PRESCRIPTION_ABUSIVE",     label: "Prescription abusive" },
  { value: "CONFRATERNITE",            label: "Confraternité" },
  { value: "PUBLICITE_CHARLATANISME",  label: "Publicité / charlatanisme" },
  { value: "DECONSIDERATION_PROFESSION", label: "Déconsidération de la profession" },
  { value: "AUTRE",                    label: "Autre" },
];

const validators = {
  required: (value) =>
    !value || String(value).trim() === "" ? "Champ obligatoire" : "",
  email: (value) =>
    /^\S+@\S+\.\S+$/.test(String(value || "").trim()) ? "" : "Adresse email invalide",
  minLen: (len) => (value) =>
    String(value || "").trim().length >= len ? "" : `Minimum ${len} caractères`,
  phone: (value) => {
    const n = String(value || "").trim().replace(/\s+/g, "").replace(/[^0-9+]/g, "");
    return /^\+?[0-9]{8,15}$/.test(n) ? "" : "Numéro invalide";
  },
  file: (file) => {
    if (!file) return "";
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (file.size > 5 * 1024 * 1024) return "Le fichier dépasse 5 Mo";
    if (file.type && !allowed.includes(file.type)) return "Format non supporté (PDF, PNG, JPG)";
    return "";
  },
};

const INITIAL_DATA = {
  nom: "", prenom: "", ville: "", telephone: "",
  adresse: "", email: "", categorie: "", objet: "", message: "", fichier: null,
};

const SIDEBAR_INFO = [
  {
    icon: <ShieldCheck size={15} className="text-green-600" />,
    title: "Confidentialité",
    desc: "Vos données servent uniquement au traitement de votre réclamation.",
  },
  {
    icon: <Info size={15} className="text-slate-400" />,
    title: "Conseil",
    desc: "Un message structuré et factuel accélère le traitement de votre dossier.",
  },
  {
    icon: <Phone size={15} className="text-slate-400" />,
    title: "Besoin d'aide ?",
    desc: "Contactez l'administration via les canaux officiels de l'ONMM.",
  },
];

export default function MultistepForm() {
  const totalSteps = 4;

  const [step, setStep]           = useState(0);
  const [data, setData]           = useState(() => {
    const saved = localStorage.getItem("publicReclamationFormData");
    if (!saved) return INITIAL_DATA;
    try {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_DATA, ...parsed, fichier: null };
    } catch { return INITIAL_DATA; }
  });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [receipt, setReceipt]     = useState(null);

  useEffect(() => {
    const { fichier, ...safeData } = data;
    localStorage.setItem("publicReclamationFormData", JSON.stringify(safeData));
  }, [data]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    CATEGORY_OPTIONS.forEach((c) => map.set(c.value, c.label));
    return map;
  }, []);

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setSubmitError("");
  };

  const validateStep = (currentStep = step) => {
    const e = {};
    if (currentStep === 0) {
      e.nom       = validators.required(data.nom)       || validators.minLen(2)(data.nom);
      e.prenom    = validators.required(data.prenom)    || validators.minLen(2)(data.prenom);
      e.ville     = validators.required(data.ville);
      e.telephone = validators.required(data.telephone) || validators.phone(data.telephone);
      e.adresse   = validators.required(data.adresse)   || validators.minLen(5)(data.adresse);
      e.email     = validators.required(data.email)     || validators.email(data.email);
    }
    if (currentStep === 1) {
      e.categorie = validators.required(data.categorie);
      e.objet     = validators.required(data.objet)     || validators.minLen(5)(data.objet);
      e.message   = validators.required(data.message)   || validators.minLen(20)(data.message);
      e.fichier   = validators.file(data.fichier);
    }
    const cleaned = Object.fromEntries(Object.entries(e).filter(([, v]) => v !== ""));
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const back = () => {
    setSubmitError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    if (!validateStep(1)) { setStep(1); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        nom: data.nom.trim(), prenom: data.prenom.trim(),
        ville: data.ville.trim(), telephone: data.telephone.trim(),
        adresse: data.adresse.trim(), email: data.email.trim(),
        categorie: data.categorie, objet: data.objet.trim(),
        message: data.message.trim(),
      };
      const res = await createPublicReclamation(payload, data.fichier);
      setReceipt({ numeroReclamation: res?.numeroReclamation || res?.reference || res?.id || "—" });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setComplete(true);
      setStep(3);
      localStorage.removeItem("publicReclamationFormData");
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Erreur lors de l'envoi de la réclamation.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setData(INITIAL_DATA);
    setErrors({});
    setSubmitError("");
    setReceipt(null);
    setComplete(false);
    setStep(0);
    localStorage.removeItem("publicReclamationFormData");
  };

  const steps = [
    { id: "personal",    title: "Vos informations",   component: <StepPersonal    data={data} errors={errors} onChange={handleChange} /> },
    { id: "reclamation", title: "Votre réclamation",  component: <StepReclamation data={data} errors={errors} onChange={handleChange} categoryOptions={CATEGORY_OPTIONS} /> },
    { id: "summary",     title: "Confirmation",        component: <StepSummary     data={data} categoryMap={categoryMap} receipt={receipt} /> },
    { id: "success",     title: "Réclamation envoyée", component: <StepSuccess     data={data} categoryMap={categoryMap} receipt={receipt} /> },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">

        {/* ── Carte principale ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header de la carte */}
          <div className="border-b border-slate-100 bg-white px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              Déposer une réclamation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Formulaire public · Ordre National des Médecins de Mauritanie
            </p>
            <Progress step={step} />
          </div>

          {/* Corps du formulaire */}
          <div className="px-6 py-5">
            {submitError && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span>{submitError}</span>
              </div>
            )}

            <div className="relative min-h-80">
              <AnimatePresence mode="wait">
                <motion.div
                  key={steps[step].id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {steps[step].component}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Pied : navigation */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            {/* Bouton gauche : Réinitialiser (toujours visible sauf succès) */}
            <div>
              {step < totalSteps - 1 && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <RotateCcw size={14} />
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Boutons droite : navigation */}
            <div className="flex items-center gap-3">
              {step > 0 && step < totalSteps - 1 && (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={15} />
                  Précédent
                </button>
              )}

              {step < totalSteps - 2 && (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-[.98]"
                >
                  Suivant
                  <ArrowRight size={15} />
                </button>
              )}

              {step === totalSteps - 2 && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-60 active:scale-[.98]"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      Envoyer la réclamation
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              )}

              {step === totalSteps - 1 && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                >
                  Nouvelle réclamation
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {SIDEBAR_INFO.map((info) => (
            <div key={info.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{info.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{info.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{info.desc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Aperçu temps réel (masqué aux étapes 3 et 4) */}
          {step < 2 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Aperçu</p>
              <div className="space-y-0 text-sm">
                {[
                  { label: "Nom",       value: `${data.prenom} ${data.nom}`.trim() },
                  { label: "Email",     value: data.email },
                  { label: "Catégorie", value: categoryMap.get(data.categorie) },
                  { label: "Objet",     value: data.objet },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
                    <span className="shrink-0 text-xs text-slate-400">{label}</span>
                    <span className="text-right text-xs font-medium text-slate-700 break-words max-w-[65%]">
                      {value || <span className="text-slate-300">—</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
