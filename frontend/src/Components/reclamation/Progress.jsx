import { CheckCircle2 } from "lucide-react";

const STEPS = [
  "Vos informations",
  "Votre réclamation",
  "Confirmation",
  "Envoyée",
];

export default function Progress({ step }) {
  return (
    <nav aria-label="Étapes du formulaire" className="my-6">
      <ol className="flex items-center">
        {STEPS.map((title, index) => {
          const done    = index < step;
          const current = index === step;
          const isLast  = index === STEPS.length - 1;

          return (
            <li key={index} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              {/* Dot + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all
                    ${done    ? "border-green-600 bg-green-600 text-white"
                    : current ? "border-green-600 bg-white text-green-700"
                    : "border-slate-200 bg-white text-slate-400"}`}
                >
                  {done ? <CheckCircle2 size={15} /> : index + 1}
                </div>
                <span
                  className={`hidden text-[11px] font-medium whitespace-nowrap sm:block
                    ${current ? "text-green-700" : done ? "text-slate-600" : "text-slate-400"}`}
                >
                  {title}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`mx-2 mb-4 h-px flex-1 transition-all
                    ${done ? "bg-green-500" : "bg-slate-200"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
