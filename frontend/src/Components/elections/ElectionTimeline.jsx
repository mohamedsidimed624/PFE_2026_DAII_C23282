import { CheckCircle2, Circle, Clock, ChevronRight } from "lucide-react";

export default function ElectionTimeline({ steps }) {
  return (
    <div className="flex flex-wrap items-start gap-x-2 gap-y-3">
      {steps.map((step, i) => {
        const isLast   = i === steps.length - 1;
        const isDone   = step.status === "done";
        const isActive = step.status === "active";
        return (
          <div key={i} className="flex items-start gap-2">
            <div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                isActive ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                isDone   ? "border-green-200 bg-white text-green-600 dark:border-green-800 dark:bg-slate-900 dark:text-green-500" :
                           "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
              }`}>
                {isDone   ? <CheckCircle2 size={11} aria-hidden="true" /> :
                 isActive ? <Clock size={11} aria-hidden="true" /> :
                            <Circle size={8} aria-hidden="true" />}
                {step.label}
              </span>
              {step.date && <p className="mt-1 pl-1 text-[10px] text-slate-400">{step.date}</p>}
            </div>
            {!isLast && <ChevronRight size={13} className="mt-1.5 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}
