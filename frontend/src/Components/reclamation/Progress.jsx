import { Check } from "lucide-react";

const STEPS = [
  "Informations personnelles",
  "Détail de la réclamation",
  "Confirmation",
  "Envoyée",
];

export default function Progress({ step }) {
  return (
    <nav aria-label="Étapes du formulaire" className="mb-8">
      <ol className="flex items-start justify-center">
        {STEPS.map((title, index) => {
          const done = index < step;
          const current = index === step;
          const isLast = index === STEPS.length - 1;

          return (
            <li
              key={index}
              className={`flex items-start ${isLast ? "" : "flex-1"}`}
            >
              <div className="flex min-w-[130px] flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm transition
                    ${
                      done
                        ? "bg-green-700 text-white"
                        : current
                        ? "bg-green-700 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                >
                  {done ? <Check size={18} /> : index + 1}
                </div>

                <p
                  className={`mt-3 text-center text-sm font-bold leading-5
                    ${
                      current || done
                        ? "text-slate-800"
                        : "text-slate-500"
                    }`}
                >
                  {title}
                </p>
              </div>

              {!isLast && (
                <div
                  className={`mt-4 h-[2px] flex-1 transition
                    ${done ? "bg-green-700" : "bg-slate-200"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}