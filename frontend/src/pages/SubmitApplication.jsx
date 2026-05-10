import Navbar from "../components/Navbar";
import Breadcrumb from "../components/public/Breadcrumb";

import StepIndicator from "../components/adhesion/StepIndicator";
import StepPersonal from "../components/adhesion/StepPersonal";
import StepEducation from "../components/adhesion/StepEducation";
import StepExperience from "../components/adhesion/StepExperience";
import StepDocuments from "../components/adhesion/StepDocuments";
import ConsentStep from "../components/adhesion/ConsentStep";

import { useFormData } from "../context/FormContext";

function ApplicationSteps() {
  const { step, setStep } = useFormData();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Soumettre votre dossier</h1>
        <p className="mt-1 text-sm text-slate-500">
          Remplissez les étapes ci-dessous pour adhérer à l'Ordre National des Médecins de Mauritanie.
        </p>
      </div>
      <StepIndicator />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {step === 1 && <StepPersonal nextStep={nextStep} />}
        {step === 2 && <StepEducation nextStep={nextStep} prevStep={prevStep} />}
        {step === 3 && <StepExperience nextStep={nextStep} prevStep={prevStep} />}
        {step === 4 && <StepDocuments nextStep={nextStep} prevStep={prevStep} />}
        {step === 5 && <ConsentStep prevStep={prevStep} />}
      </div>
    </div>
  );
}

function SubmitApplication() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Déposer votre dossier" }]} />
      <main className="pt-8 px-6 pb-16">
        <ApplicationSteps />
      </main>
    </div>
  );
}

export default SubmitApplication;