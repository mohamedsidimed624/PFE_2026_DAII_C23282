import { Vote, FileText, Clock, Trophy, XCircle, BarChart2 } from "lucide-react";

const CONFIG = {
  BROUILLON:               { label: "Brouillon",             cls: "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400",            Icon: null },
  CANDIDATURE_OUVERTE:     { label: "Candidatures ouvertes", cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",              Icon: FileText },
  VALIDATION_CANDIDATURES: { label: "Validation",            cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",          Icon: Clock },
  VOTE_EN_COURS:           { label: "Vote en cours",         cls: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",          Icon: Vote },
  DEPOUILLEMENT:           { label: "Dépouillement",         cls: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",      Icon: BarChart2 },
  RESULTATS_PUBLIES:       { label: "Résultats publiés",     cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",  Icon: Trophy },
  ARCHIVEE:                { label: "Archivée",              cls: "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500",             Icon: null },
  ANNULEE:                 { label: "Annulée",               cls: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",                  Icon: XCircle },
};

export default function ElectionStatusBadge({ statut, size = "sm" }) {
  const cfg = CONFIG[statut] ?? { label: statut, cls: "bg-slate-100 text-slate-500", Icon: null };
  const { label, cls, Icon } = cfg;
  const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${textSize} ${cls}`}>
      {Icon ? <Icon size={10} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}
