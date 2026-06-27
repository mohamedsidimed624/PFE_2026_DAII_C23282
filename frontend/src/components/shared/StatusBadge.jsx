const PRESETS = {
  // Reclamation statuses
  SUBMITTED:   { label: "Soumise",    cls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400",   dot: "bg-amber-500"  },
  IN_PROGRESS: { label: "En cours",   cls: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400",         dot: "bg-blue-500"   },
  CLOSED:      { label: "Clôturée",   cls: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",   dot: "bg-green-500"  },
  // Cotisation statuses
  PAYEE:       { label: "Payée",      cls: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",   dot: "bg-green-500"  },
  EN_RETARD:   { label: "En retard",  cls: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400",               dot: "bg-red-500"    },
  EN_ATTENTE:  { label: "En attente", cls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400",   dot: "bg-amber-500"  },
  // Generic
  ACTIVE:      { label: "Actif",      cls: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",   dot: "bg-green-500"  },
  INACTIVE:    { label: "Inactif",    cls: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",       dot: "bg-slate-400"  },
};

/**
 * Reusable status badge for medecin dashboard pages.
 * Pass either a `preset` key (from PRESETS above) or explicit `label` + `colorClass` + optional `dot` color.
 */
function StatusBadge({ preset, label, colorClass, dot }) {
  const cfg = preset ? PRESETS[preset.toUpperCase()] : null;
  const resolvedLabel = cfg?.label ?? label ?? preset ?? "—";
  const resolvedCls = cfg?.cls ?? colorClass ?? "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  const resolvedDot = cfg?.dot ?? dot;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${resolvedCls}`}>
      {resolvedDot && <span className={`h-1.5 w-1.5 rounded-full ${resolvedDot}`} />}
      {resolvedLabel}
    </span>
  );
}

export default StatusBadge;
