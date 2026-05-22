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
const H = 44;
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
    <div className="mb-7 w-full overflow-x-auto">
      <div className="flex min-w-[900px] gap-[3px]">
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
              className="relative flex-1"
              style={{
                height: `${H}px`,
                cursor: clickable ? "pointer" : "default",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.06))",
              }}
            >
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                <polygon
                  points={chevronPoints()}
                  fill={isGreen ? "#16a34a" : "#ffffff"}
                  stroke={isGreen ? "#16a34a" : "#cbd5e1"}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <span
                className={`relative z-10 flex h-full items-center justify-center px-6 text-center text-[12px] font-medium leading-tight ${
                  isGreen ? "text-white" : "text-slate-600"
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
