import { SearchX, RotateCcw } from "lucide-react";

function AnnonceEmptyState({ onReset, hasFilters }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <SearchX size={28} className="text-slate-400" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        Aucune publication trouvée
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Aucun résultat ne correspond à vos critères de recherche. Modifiez ou réinitialisez les filtres."
          : "Aucune publication disponible pour le moment. Revenez ultérieurement."}
      </p>

      {hasFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-slate-50"
        >
          <RotateCcw size={14} />
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}

export default AnnonceEmptyState;
