import { Vote, FileText, Clock, Trophy, XCircle, BarChart2 } from "lucide-react";

const CONFIG = {
  BROUILLON:               { label: "Brouillon",             cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",           Icon: null },
  CANDIDATURE_OUVERTE:     { label: "Candidatures ouvertes", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",             Icon: FileText },
  VALIDATION_CANDIDATURES: { label: "Validation",            cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",         Icon: Clock },
  VOTE_EN_COURS:           { label: "Vote en cours",         cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",         Icon: Vote },
  DEPOUILLEMENT:           { label: "Dépouillement",         cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",     Icon: BarChart2 },
  TERMINEE:                { label: "Terminée",              cls: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400",            Icon: null },
  RESULTATS_PUBLIES:       { label: "Résultats publiés",     cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", Icon: Trophy },
  ARCHIVEE:                { label: "Archivée",              cls: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",            Icon: null },
  ANNULEE:                 { label: "Annulée",               cls: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",                Icon: XCircle },
};

export default function ElectionStatusBadge({ statut, size = "sm" }) {
  const cfg = CONFIG[statut] ?? { label: statut, cls: "bg-slate-100 text-slate-500", Icon: null };
  const { label, cls, Icon } = cfg;
  const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${textSize} ${cls}`}>
      {Icon && <Icon size={10} />}
      {label}
    </span>
  );
}
