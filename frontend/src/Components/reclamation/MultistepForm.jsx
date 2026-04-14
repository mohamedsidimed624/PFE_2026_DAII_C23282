
import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import Progress from "./Progress";
import StepPersonal from "./StepPersonal";
import StepReclamation from "./StepReclamation";
import StepSummary from "./StepSummary";
import StepSuccess from "./StepSuccess";
import { AnimatePresence, motion } from "framer-motion";
import { createPublicReclamation } from "../../services/publicReclamationApi";

export const CATEGORY_OPTIONS = [
  { value: "RETARD_TRAITEMENT", label: "Retard de traitement" },
  { value: "ERREUR_DOSSIER", label: "Erreur sur dossier" },
  { value: "DEMANDE_INFORMATION", label: "Demande d'information" },
  { value: "QUALITE_SOINS", label: "Qualité des soins" },
  { value: "INFORMATION_CONSENTEMENT", label: "Information et consentement" },
  { value: "SECRET_PROFESSIONNEL", label: "Secret professionnel" },
  { value: "COMPORTEMENT_INAPPROPRIE", label: "Comportement inapproprié" },
  { value: "CERTIFICAT_MEDICAL", label: "Certificat médical" },
  { value: "PRESCRIPTION_ABUSIVE", label: "Prescription abusive" },
  { value: "CONFRATERNITE", label: "Confraternité" },
  { value: "PUBLICITE_CHARLATANISME", label: "Publicité / charlatanisme" },
  { value: "DECONSIDERATION_PROFESSION", label: "Déconsidération de la profession" },
  { value: "AUTRE", label: "Autre" },
];

const validators = {
  required: (value) =>
    value === undefined || value === null || String(value).trim() === ""
      ? "Champ obligatoire"
      : "",

  email: (value) =>
    /^\S+@\S+\.\S+$/.test(String(value || "").trim())
      ? ""
      : "Adresse email invalide",

  minLen:
    (len) =>
    (value) =>
      String(value || "").trim().length >= len
        ? ""
        : `Minimum ${len} caractères`,

  phone: (value) => {
    const normalized = String(value || "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^0-9+]/g, "");
    return /^\+?[0-9]{8,15}$/.test(normalized)
      ? ""
      : "Numéro invalide";
  },

  file: (file) => {
    if (!file) return "";
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (file.size > 5 * 1024 * 1024) {
      return "Le fichier dépasse 5 Mo";
    }
    if (file.type && !allowed.includes(file.type)) {
      return "Format non supporté (PDF, PNG, JPG)";
    }
    return "";
  },
};

const INITIAL_DATA = {
  nom: "",
  prenom: "",
  ville: "",
  telephone: "",
  adresse: "",
  email: "",
  categorie: "",
  objet: "",
  message: "",
  fichier: null,
};

export default function MultistepForm() {
  const totalSteps = 4;

  const [step, setStep] = useState(0);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("publicReclamationFormData");
    if (!saved) return INITIAL_DATA;

    try {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_DATA, ...parsed, fichier: null };
    } catch {
      return INITIAL_DATA;
    }
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [receipt, setReceipt] = useState(null);

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
      e.nom = validators.required(data.nom) || validators.minLen(2)(data.nom);
      e.prenom =
        validators.required(data.prenom) || validators.minLen(2)(data.prenom);
      e.ville = validators.required(data.ville);
      e.telephone =
        validators.required(data.telephone) || validators.phone(data.telephone);
      e.adresse =
        validators.required(data.adresse) || validators.minLen(5)(data.adresse);
      e.email =
        validators.required(data.email) || validators.email(data.email);
    }

    if (currentStep === 1) {
      e.categorie = validators.required(data.categorie);
      e.objet =
        validators.required(data.objet) || validators.minLen(5)(data.objet);
      e.message =
        validators.required(data.message) || validators.minLen(20)(data.message);
      e.fichier = validators.file(data.fichier);
    }

    const cleaned = Object.fromEntries(
      Object.entries(e).filter(([, value]) => value !== "")
    );

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
    if (!validateStep(1)) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        ville: data.ville.trim(),
        telephone: data.telephone.trim(),
        adresse: data.adresse.trim(),
        email: data.email.trim(),
        categorie: data.categorie,
        objet: data.objet.trim(),
        message: data.message.trim(),
      };

      const res = await createPublicReclamation(payload, data.fichier);

      setReceipt({
        numeroReclamation:
          res?.numeroReclamation || res?.reference || res?.id || "—",
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setComplete(true);
      setStep(3);
      localStorage.removeItem("publicReclamationFormData");
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Erreur lors de l'envoi de la réclamation."
      );
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
    {
      id: "personal",
      title: "Vos informations",
      component: (
        <StepPersonal data={data} errors={errors} onChange={handleChange} />
      ),
    },
    {
      id: "reclamation",
      title: "Votre réclamation",
      component: (
        <StepReclamation
          data={data}
          errors={errors}
          onChange={handleChange}
          categoryOptions={CATEGORY_OPTIONS}
        />
      ),
    },
    {
      id: "summary",
      title: "Confirmation",
      component: (
        <StepSummary
          data={data}
          categoryMap={categoryMap}
          receipt={receipt}
        />
      ),
    },
    {
      id: "success",
      title: "Envoyée",
      component: (
        <StepSuccess
          data={data}
          categoryMap={categoryMap}
          receipt={receipt}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-xl border bg-base-100">
        <div className="card shadow-xl">
          <div className="card-body p-6 md:p-10">
            <div>
              <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                Déposer une réclamation
              </h2>
              <p className="text-sm text-gray-500">
                Formulaire public de réclamation ONMM
              </p>
            </div>

            <Progress step={step} />

            {submitError && (
              <div className="alert alert-error mt-4 text-sm">
                <span>{submitError}</span>
              </div>
            )}

            <div className="relative min-h-80">
              <AnimatePresence mode="wait">
                <motion.div
                  key={steps[step].id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  {steps[step].component}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div>
                <button onClick={resetForm} className="btn btn-outline">
                  Reset
                </button>
              </div>

              <div className="flex w-full items-center justify-end gap-3">
                {step > 0 && step < totalSteps - 1 && (
                  <button onClick={back} className="btn btn-ghost">
                    Back
                  </button>
                )}

                {step < totalSteps - 2 && (
                  <button onClick={next} className="btn btn-success">
                    Next
                  </button>
                )}

                {step === totalSteps - 2 && (
                  <button
                    className={`btn btn-success ${submitting ? "loading" : ""}`}
                    onClick={submit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                )}

                {step === totalSteps - 1 && (
                  <button onClick={resetForm} className="btn btn-success">
                    Nouvelle réclamation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}