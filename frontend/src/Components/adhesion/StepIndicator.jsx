import { useEffect } from "react";
import { useFormData } from "../../context/FormContext";

const STEPS = [
  "Informations personnelles",
  "Informations sur l'éducation",
  "Expérience professionnelle",
  "Documents requis",
  "Déclaration et consentement",
];

const W = 260;
const H = 54;
const N = 22;

function chevronPoints(i, total) {
  const mid = H / 2;

  if (i === 0) {
    return `0,0 ${W - N},0 ${W},${mid} ${W - N},${H} 0,${H} ${N},${mid}`;
  }

  if (i === total - 1) {
    return `0,0 ${W - N},0 ${W},${mid} ${W - N},${H} 0,${H} ${N},${mid}`;
  }

  return `0,0 ${W - N},0 ${W},${mid} ${W - N},${H} 0,${H} ${N},${mid}`;
}

export default function StepIndicator() {
  const { step, setStep, submitted } = useFormData();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (submitted) return null;

  const total = STEPS.length;

  return (
    <div
      className="w-full mb-10 overflow-x-auto"
      style={{
        padding: "6px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "14px",
          minWidth: "100%",
        }}
      >
        {STEPS.map((label, i) => {
          const num = i + 1;
          const active = step === num;
          const completed = step > num;
          const clickable = num <= step;

          const isGreen = active || completed;

          const fill = isGreen ? "#2fbe73" : "#ffffff";
          const stroke = isGreen ? "#2fbe73" : "#dfe7e4";
          const color = isGreen ? "#ffffff" : "#374151";

          return (
            <div
              key={i}
              onClick={() => {
                if (clickable) setStep(num);
              }}
              style={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                height: "54px",
                cursor: clickable ? "pointer" : "default",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.08))",
              }}
            >
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  overflow: "visible",
                }}
              >
                <polygon
                  points={chevronPoints(i, total)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: "32px",
                  paddingRight: "32px",
                  color,
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "center",
                  whiteSpace: "normal",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}