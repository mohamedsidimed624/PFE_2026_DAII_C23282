import { CheckCircle2, Circle, Clock } from "lucide-react";

export default function ElectionTimeline({ steps }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const isLast   = i === steps.length - 1;
        const isDone   = step.status === "done";
        const isActive = step.status === "active";
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isDone   ? "border-green-600 bg-green-600 text-white" :
                isActive ? "border-green-600 bg-white dark:bg-slate-900 text-green-600" :
                           "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600"
              }`}>
                {isDone   ? <CheckCircle2 size={13} /> :
                 isActive ? <Clock size={12} /> :
                            <Circle size={9} />}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 my-1 flex-1 ${isDone ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"}`}
                  style={{ minHeight: 18 }}
                />
              )}
            </div>
            <div className="pb-4 min-w-0">
              <p className={`text-[13px] font-semibold leading-tight ${
                isDone   ? "text-slate-700 dark:text-slate-200" :
                isActive ? "text-green-600" :
                           "text-slate-400 dark:text-slate-500"
              }`}>
                {step.label}
                {isActive && (
                  <span className="ml-2 rounded-full bg-green-600/10 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
                    En cours
                  </span>
                )}
              </p>
              {step.date && (
                <p className="text-[11px] text-slate-400 mt-0.5">{step.date}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
