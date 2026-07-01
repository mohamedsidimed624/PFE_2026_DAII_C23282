const ICON_COLORS = {
  blue:    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  green:   "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  amber:   "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
  slate:   "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  purple:  "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
  red:     "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
};

export default function StatCard({ label, value, icon: Icon, color = "blue", sub }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
      {Icon && (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ICON_COLORS[color] ?? ICON_COLORS.blue}`}>
          <Icon size={16} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
        <p className="text-[18px] sm:text-[20px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
