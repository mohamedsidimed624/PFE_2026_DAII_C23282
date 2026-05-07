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
  { value: "",           label: "Tous",        icon: ListFilter },
  { value: "ANNONCE",    label: "Annonces",    icon: Megaphone },
  { value: "ACTUALITE",  label: "Actualités",  icon: Newspaper },
  { value: "COMMUNIQUE", label: "Communiqués", icon: ShieldCheck },
  { value: "DECISION",   label: "Décisions",   icon: Landmark },
  { value: "EVENEMENT",  label: "Événements",  icon: CalendarCheck },
];

function AnnonceFilters({
  search,
  type,
  onSearchChange,
  onSearchSubmit,
  onTypeChange,
  onReset,
  compact,
}) {
  const [open, setOpen] = useState(false);
  const hasFilters = Boolean(search || type);

  if (compact) {
    return (
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <form onSubmit={onSearchSubmit} className="flex items-center gap-1.5">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher une publication..."
              className="h-9 w-52 rounded-lg border-[#E2E8F0] bg-[#F8FAFC] pl-9 text-sm focus-visible:border-[#16A34A] focus-visible:ring-[#16A34A]/20"
            />
          </div>
          <button
            type="submit"
            aria-label="Lancer la recherche"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16A34A] text-white transition hover:bg-[#15803d]"
          >
            <Search size={14} aria-hidden="true" />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrer par type">
          {TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onTypeChange(option.value)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
                  active
                    ? "border-[#16A34A] bg-[#16A34A] text-white"
                    : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-green-200 hover:bg-green-50 hover:text-[#16A34A]"
                }`}
              >
                <Icon size={12} aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#64748B] transition hover:bg-[#F8FAFC]"
          >
            <RotateCcw size={12} aria-hidden="true" />
            Réinitialiser
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <form onSubmit={onSearchSubmit} className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher une publication..."
              className="h-11 rounded-lg border-[#E2E8F0] bg-[#F8FAFC] pl-11 text-sm focus-visible:border-[#16A34A] focus-visible:ring-[#16A34A]/20"
            />
          </div>
          <button
            type="submit"
            disabled={!search.trim() && !type}
            className="h-11 rounded-lg bg-[#16A34A] px-5 text-sm font-semibold text-white transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Rechercher
          </button>
        </form>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="annonce-type-filters"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#0F172A] transition hover:bg-[#F8FAFC]"
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          Filtres
          <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#64748B] transition hover:bg-[#F8FAFC]"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Réinitialiser
          </button>
        )}
      </div>

      {open && (
        <div id="annonce-type-filters" className="border-t border-[#E2E8F0] px-4 pb-4 pt-3">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
            Type de publication
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Type de publication">
            {TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onTypeChange(option.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? "border-[#16A34A] bg-[#16A34A] text-white"
                      : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-green-200 hover:bg-green-50 hover:text-[#16A34A]"
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
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
