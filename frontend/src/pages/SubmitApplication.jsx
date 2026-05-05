import Navbar from "../components/Navbar";

import StepIndicator from "../components/adhesion/StepIndicator";
import StepPersonal from "../components/adhesion/StepPersonal";
import StepEducation from "../components/adhesion/StepEducation";
import StepExperience from "../components/adhesion/StepExperience";
import StepDocuments from "../components/adhesion/StepDocuments";
import ConsentStep from "../components/adhesion/ConsentStep";

import { useFormData } from "../context/FormContext";

function ApplicationSteps() {
  const { submitted } = useFormData(); 
  {!submitted && <StepIndicator />}

  const { step, setStep } = useFormData();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (

    <div className="max-w-6xl mx-auto mt-10 bg-white p-8 rounded shadow">
      
      <StepIndicator />

      {step === 1 && <StepPersonal nextStep={nextStep} />}

      {step === 2 && (
        <StepEducation
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 3 && (
        <StepExperience
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 4 && (
        <StepDocuments
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 5 && (
        <ConsentStep
          prevStep={prevStep}
        />
      )}

    </div>

  );
}

function SubmitApplication() {

  return (

    <>

      <div className='min-h-screen bg-base-100'> 
        <Navbar />
        <main className='pt-24 md:pt-28'>
          <ApplicationSteps />
        </main>
        </div>

    </>

  );

}

export default SubmitApplication;