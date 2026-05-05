import { FileText, Search, RotateCcw } from "lucide-react";

function AnnonceEmptyState({ onReset }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <FileText size={26} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Aucune publication trouvée
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Aucun résultat ne correspond à votre recherche. Essayez un autre mot-clé
        ou modifiez les filtres appliqués.
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          <Search size={14} />
          Essayez un mot-clé plus simple
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
}

export default AnnonceEmptyState;