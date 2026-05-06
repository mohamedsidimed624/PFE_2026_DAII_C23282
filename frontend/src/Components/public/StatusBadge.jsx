const CONFIG = {
  ACTIF:    { label: "Actif",     cls: "border-green-200 bg-green-50 text-green-700",    dot: "bg-green-500" },
  SUSPENDU: { label: "Suspendu",  cls: "border-red-200 bg-red-50 text-red-700",          dot: "bg-red-500" },
  RETRAITE: { label: "Retraité",  cls: "border-slate-200 bg-slate-100 text-slate-600",   dot: "bg-slate-400" },
};

function StatusBadge({ status }) {
  const key = (status || "ACTIF").toUpperCase();
  const { label, cls, dot } = CONFIG[key] || CONFIG.ACTIF;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export default StatusBadge;
