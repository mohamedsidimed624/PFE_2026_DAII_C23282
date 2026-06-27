import { useEffect } from "react";
import { useFormData } from "../../context/FormContext";

const STEPS = [
  "Informations personnelles",
  "Informations sur l'éducation",
  "Expérience professionnelle",
  "Documents requis",
  "Déclaration et consentement",
];

const W = 240;
const H = 48;
const N = 18;

function chevronPoints() {
  const mid = H / 2;
  return `0,0 ${W - N},0 ${W},${mid} ${W - N},${H} 0,${H} ${N},${mid}`;
}

export default function StepIndicator() {
  const { step, setStep, submitted } = useFormData();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (submitted) return null;

  return (
    <div className="mb-9 w-full overflow-hidden">
      <div className="grid grid-cols-5 gap-4">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const active = step === num;
          const completed = step > num;
          const clickable = num <= step;
          const isGreen = active || completed;

          return (
            <button
              key={label}
              type="button"
              onClick={() => clickable && setStep(num)}
              className="relative h-[48px] min-w-0"
              style={{
                cursor: clickable ? "pointer" : "default",
              }}
            >
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                <polygon
                  points={chevronPoints()}
                  fill={isGreen ? "#35C878" : "#ffffff"}
                  stroke={isGreen ? "#35C878" : "#D9E7E2"}
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <span
                className={`relative z-10 flex h-full items-center justify-center px-5 text-center text-[13px] font-semibold leading-tight ${
                  isGreen ? "text-white" : "text-slate-700"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}