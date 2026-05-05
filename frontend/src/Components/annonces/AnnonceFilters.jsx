import { useState } from "react";
import {
  Search,
  Megaphone,
  Newspaper,
  Landmark,
  CalendarCheck,
  ShieldCheck,
  RotateCcw,
  ListFilter,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

import { Input } from "@/components/ui/input";

const TYPE_OPTIONS = [
  { value: "", label: "Tous", icon: ListFilter },
  { value: "ANNONCE", label: "Annonces", icon: Megaphone },
  { value: "ACTUALITE", label: "Actualités", icon: Newspaper },
  { value: "COMMUNIQUE", label: "Communiqués", icon: ShieldCheck },
  { value: "DECISION", label: "Décisions", icon: Landmark },
  { value: "EVENEMENT", label: "Événements", icon: CalendarCheck },
];

function AnnonceFilters({
  search,
  type,
  onSearchChange,
  onSearchSubmit,
  onTypeChange,
  onReset,
}) {
  const [open, setOpen] = useState(false);
  const hasFilters = Boolean(search || type);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <form
          onSubmit={onSearchSubmit}
          className="flex flex-1 flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher une publication..."
              className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm focus-visible:border-emerald-700 focus-visible:ring-emerald-700/20"
            />
          </div>

          <button
            type="submit"
            disabled={!search.trim() && !type}
            className="h-11 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Rechercher
          </button>
        </form>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <SlidersHorizontal size={16} />
          Filtres
          <ChevronDown
            size={15}
            className={`transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={15} />
            Réinitialiser
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            Type de publication
          </p>

          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = type === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onTypeChange(option.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default AnnonceFilters;