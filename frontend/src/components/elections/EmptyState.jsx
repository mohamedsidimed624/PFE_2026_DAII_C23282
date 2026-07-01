export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-14 text-center px-6">
      {Icon && <Icon size={36} className="mb-3 text-slate-200 dark:text-slate-700" />}
      <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">{title}</p>
      {subtitle && <p className="mt-1 text-[12px] text-slate-400">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
