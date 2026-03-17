import { useEffect } from "react";
import { useFormData } from "../../context/FormContext";

import {
  User,
  GraduationCap,
  Briefcase,
  FileText,
  ShieldCheck,
  Check
} from "lucide-react";

const steps = [
  { label: "Informations personnelles", icon: User },
  { label: "Informations sur l'éducation", icon: GraduationCap },
  { label: "Expérience professionnelle", icon: Briefcase },
  { label: "Documents requis", icon: FileText },
  { label: "Déclaration et consentement", icon: ShieldCheck }
];

function StepIndicator() {

  const { step, setStep, submitted } = useFormData();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [step]);

  if (submitted) return null;

  return (
    
    <div className="flex w-full mb-10 overflow-hidden">

      {steps.map((item, index) => {

        const Icon = item.icon;
        const stepNumber = index + 1;

        const active = step === stepNumber;
        const completed = step > stepNumber;

        return (

          <div
            key={index}

            onClick={() => {
              if (stepNumber <= step) {
                setStep(stepNumber);
              }
            }}

            className={`
            relative flex items-center gap-2 px-6 py-3 text-sm font-medium
            cursor-pointer transition-all duration-300

            ${active
              ? "bg-green-600 text-white"
              : completed
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-600"}

            ${index !== 0 && "ml-6"}
            `}
            
            style={{
              clipPath:
                index === steps.length 
                  ? "polygon(0 0,100% 0,100% 100%,0% 100%)"
                  : "polygon(0 0,calc(100% - 20px) 0,100% 50%,calc(100% - 20px) 100%,0 100%)"
            }}

          >

            {completed ? (
              <Check size={18}/>
            ) : (
              <Icon size={18}/>
            )}

            {item.label}

          </div>

        );

      })}

    </div>

  );

}

export default StepIndicator;