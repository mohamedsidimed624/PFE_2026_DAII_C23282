import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Loader2 } from "lucide-react";

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        
        {/* Header bleu/vert selon ton thème */}
        <div className="bg-green-700 px-6 py-6 text-center">
          <h1 className="text-2xl font-bold text-white">
            Déposer une réclamation
          </h1>
        </div>

        <div className="px-8 py-7">
          <Progress step={step} />

          {submitError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="relative min-h-80 pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={steps[step].id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <h2 className="mb-6 text-2xl font-bold text-slate-800">
                  {steps[step].title}
                </h2>

                {steps[step].component}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation style photo */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <div>
              {step > 0 && step < totalSteps - 1 && (
                <button
                  type="button"
                  onClick={back}
                  className="rounded-md border border-green-600 bg-white px-6 py-2.5 text-sm font-bold uppercase text-green-700 transition hover:bg-green-50"
                >
                  Retour
                </button>
              )}
            </div>

            <div>
              {step < totalSteps - 2 && (
                <button
                  type="button"
                  onClick={next}
                  className="rounded-md bg-green-700 px-7 py-2.5 text-sm font-bold uppercase text-white transition hover:bg-green-800"
                >
                  Suivant
                </button>
              )}

              {step === totalSteps - 2 && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="rounded-md bg-green-700 px-7 py-2.5 text-sm font-bold uppercase text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting ? "Enregistrement..." : "Envoyer"}
                </button>
              )}

              {step === totalSteps - 1 && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md bg-green-700 px-7 py-2.5 text-sm font-bold uppercase text-white transition hover:bg-green-800"
                >
                  Nouvelle réclamation
                </button>
              )}
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}