import { useEffect, useState } from "react";
import MedecinLayout from "../../Components/medecin/MedecinLayout";
import { getMedecinContenus } from "../../services/medecinContenuApi";
import {
  Megaphone, Newspaper, ClipboardList, Gavel, CalendarDays,
  ChevronDown, ChevronUp, Loader2, Inbox,
} from "lucide-react";

const TYPE_CONFIG = {
  ANNONCE:    { label: "Annonce",     Icon: Megaphone,     light: "bg-amber-100 text-amber-700",   dark: "dark:bg-amber-900/30 dark:text-amber-400"   },
  ACTUALITE:  { label: "Actualité",   Icon: Newspaper,     light: "bg-blue-100 text-blue-700",     dark: "dark:bg-blue-900/30 dark:text-blue-400"     },
  COMMUNIQUE: { label: "Communiqué",  Icon: ClipboardList, light: "bg-purple-100 text-purple-700", dark: "dark:bg-purple-900/30 dark:text-purple-400" },
  DECISION:   { label: "Décision",    Icon: Gavel,         light: "bg-red-100 text-red-700",       dark: "dark:bg-red-900/30 dark:text-red-400"       },
  EVENEMENT:  { label: "Événement",   Icon: CalendarDays,  light: "bg-teal-100 text-teal-700",     dark: "dark:bg-teal-900/30 dark:text-teal-400"     },
};

const FILTERS = [
  { value: "", label: "Tous" },
  { value: "ANNONCE",    label: "Annonces"    },
  { value: "ACTUALITE",  label: "Actualités"  },
  { value: "COMMUNIQUE", label: "Communiqués" },
  { value: "DECISION",   label: "Décisions"   },
  { value: "EVENEMENT",  label: "Événements"  },
];

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function AnnonceCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const type = TYPE_CONFIG[item.type] || TYPE_CONFIG.ANNONCE;
  const Icon = type.Icon;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {item.imageUrl && (
        <div className="h-44 w-full shrink-0 overflow-hidden">
          <img
            src={`http://localhost:8080${item.imageUrl}`}
            alt={item.titre}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${type.light} ${type.dark}`}>
            <Icon size={11} />{type.label}
          </span>
          {item.categorieNom && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {item.categorieNom}
            </span>
          )}
          {item.specialiteCibleNom && (
            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
              {item.specialiteCibleNom}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-sm font-bold leading-snug text-slate-900 dark:text-white">{item.titre}</h3>

        {/* Resume */}
        {item.resume && (
          <p className="mb-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.resume}</p>
        )}

        {/* Expanded body */}
        {expanded && item.contenu && (
          <div className="mb-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">{item.contenu}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(item.datePublication)}</span>
          {item.contenu && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 transition-colors hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              {expanded ? (
                <><ChevronUp size={13} />Réduire</>
              ) : (
                <><ChevronDown size={13} />Lire la suite</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MedecinAnnoncesPage() {
  const [contenus, setContenus] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("");

  useEffect(() => {
    getMedecinContenus(0, 50)
      .then((res) => setContenus(res.data?.content || []))
      .catch(() => setContenus([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? contenus.filter((c) => c.type === filter) : contenus;

  return (
    <MedecinLayout title="Annonces de l'Ordre">
      <div className="space-y-5">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Annonces de l'Ordre</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Publications et communications destinées aux médecins membres.
          </p>
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === f.value
                  ? "border-green-500 bg-green-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:text-green-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-green-700 dark:hover:text-green-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-600">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Inbox size={28} className="text-slate-400 dark:text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Aucune annonce disponible</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {filter ? "Aucun contenu pour ce filtre." : "Aucune publication ne vous est adressée pour le moment."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <AnnonceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </MedecinLayout>
  );
}
