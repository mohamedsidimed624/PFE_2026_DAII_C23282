const SCHEMES = {
  green:  { card: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",  icon: "border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/40",  value: "text-green-700 dark:text-green-400",  label: "text-green-600 dark:text-green-500"  },
  amber:  { card: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20", icon: "border-amber-200 bg-amber-100 dark:border-amber-800 dark:bg-amber-900/40", value: "text-amber-700 dark:text-amber-400",  label: "text-amber-600 dark:text-amber-500"  },
  red:    { card: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",         icon: "border-red-200 bg-red-100 dark:border-red-800 dark:bg-red-900/40",         value: "text-red-700 dark:text-red-400",      label: "text-red-600 dark:text-red-500"      },
  blue:   { card: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",     icon: "border-blue-200 bg-blue-100 dark:border-blue-800 dark:bg-blue-900/40",     value: "text-blue-700 dark:text-blue-400",    label: "text-blue-600 dark:text-blue-500"    },
  slate:  { card: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",       icon: "border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800",     value: "text-slate-900 dark:text-slate-100",  label: "text-slate-500 dark:text-slate-400"  },
};

/**
 * Reusable stat card for medecin dashboard pages.
 * Props: title, value, icon (ReactNode), colorScheme ('green'|'amber'|'red'|'blue'|'slate')
 */
function StatCard({ title, value, icon, colorScheme = "slate" }) {
  const s = SCHEMES[colorScheme] ?? SCHEMES.slate;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${s.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${s.label}`}>{title}</p>
          <p className={`mt-2 text-2xl font-bold leading-none ${s.value}`}>{value}</p>
        </div>
        <div className={`rounded-xl border p-2 ${s.icon}`}>{icon}</div>
      </div>
    </div>
  );
}

export default StatCard;
