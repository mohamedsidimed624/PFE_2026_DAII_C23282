const CONFIG = {
  BROUILLON: { label: "Brouillon", cls: "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
  SOUMISE:   { label: "Soumise",   cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  EN_REVUE:  { label: "En revue",  cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  VALIDEE:   { label: "Validée",   cls: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  REJETEE:   { label: "Rejetée",   cls: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
  RETIREE:   { label: "Retirée",   cls: "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500" },
};

export default function CandidatureStatusBadge({ statut }) {
  const cfg = CONFIG[statut] ?? { label: statut, cls: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
