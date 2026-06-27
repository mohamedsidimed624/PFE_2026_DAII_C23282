// eslint-disable-next-line react-refresh/only-export-components
export const ORGANE_LABELS = {
  CONSEIL_NATIONAL:        "Conseil National",
  BUREAU_EXECUTIF:         "Bureau exécutif",
  BUREAU_SECTION_A:        "Bureau – Section A",
  BUREAU_SECTION_B:        "Bureau – Section B",
  BUREAU_SECTION_C:        "Bureau – Section C",
  REPRESENTANTS_REGIONAUX: "Représentants régionaux",
};

export default function ElectionTypeBadge({ type }) {
  if (!type) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      {ORGANE_LABELS[type] ?? type}
    </span>
  );
}
