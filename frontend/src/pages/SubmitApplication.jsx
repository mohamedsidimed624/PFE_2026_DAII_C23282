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
    <div className="mx-auto w-full max-w-[1240px]">
      <div className="mb-5">
        <h1 className="text-[21px] font-semibold tracking-tight text-slate-900">
          Soumettre votre dossier
        </h1>
        <p className="mt-1 text-[13px] text-slate-400">
          Remplissez les étapes ci-dessous pour adhérer à l'Ordre National des
          Médecins de Mauritanie.
        </p>
      </div>

      <StepIndicator />

      <div className="mt-6">
        {step === 1 && <StepPersonal nextStep={nextStep} />}
        {step === 2 && (
          <StepEducation nextStep={nextStep} prevStep={prevStep} />
        )}
        {step === 3 && (
          <StepExperience nextStep={nextStep} prevStep={prevStep} />
        )}
        {step === 4 && (
          <StepDocuments nextStep={nextStep} prevStep={prevStep} />
        )}
        {step === 5 && <ConsentStep prevStep={prevStep} />}
      </div>
    </div>
  );
}

function SubmitApplication() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* pt-[74px] clears the fixed navbar (74px height) */}
      <div className="pt-[74px]">
        <Breadcrumb
          items={[
            { label: "Accueil", to: "/" },
            { label: "Déposer votre dossier" },
          ]}
        />

        <main className="px-6 pb-12 pt-7">
          <ApplicationSteps />
        </main>
      </div>
    </div>
  );
}

export default SubmitApplication;
