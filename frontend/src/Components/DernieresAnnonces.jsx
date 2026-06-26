import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  FileText,
  Newspaper,
} from "lucide-react";
import { getPublicContenus } from "../services/PublicContenuApi";
import { resolveFileUrl } from "../config/api";

/* Each slide is exactly 1/VISIBLE of the track width → translateX(-i * 100/VISIBLE %) is pixel-perfect. */
const VISIBLE = 3;
const AUTO_DELAY = 4500;

const TYPE_STYLES = {
  ANNONCE:    { label: "Annonce",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ACTUALITE:  { label: "Actualité",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
  COMMUNIQUE: { label: "Communiqué", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  DECISION:   { label: "Décision",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  EVENEMENT:  { label: "Événement",  cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

/* ── Compact slide card ─────────────────────────────────────────────────── */
function AnnonceSlide({ item }) {
  const type = TYPE_STYLES[item.type] || {
    label: "Publication",
    cls: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const imageSrc = resolveFileUrl(item.imageUrl);
  const date = formatDate(item.datePublication || item.dateCreation);

  return (
    <Link
      to={`/annonces/${item.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
    >
      {/* Thumbnail or placeholder */}
      <div className="relative h-[140px] shrink-0 overflow-hidden bg-slate-50">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.titre || ""}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-white">
              <FileText size={20} strokeWidth={1.5} className="text-slate-400" />
            </div>
          </div>
        )}
        <span
          className={`absolute left-3 top-3 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${type.cls}`}
        >
          {type.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-green-700">
          {item.titre || "Publication sans titre"}
        </h3>

        <p className="mt-1.5 line-clamp-2 flex-1 text-[12px] leading-relaxed text-slate-500">
          {item.resume || "Aucun résumé disponible."}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
          {date ? (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <CalendarDays size={11} />
              {date}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-green-600 transition-all group-hover:gap-1.5">
            Lire <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Skeleton placeholder ───────────────────────────────────────────────── */
function SkeletonSlide() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="h-[140px] animate-pulse bg-slate-100" />
      <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────────────── */
export default function DernieresAnnonces() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    getPublicContenus({ page: 0, size: 6 })
      .then((data) => setItems(data.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxIndex = Math.max(0, items.length - VISIBLE);

  const prev = useCallback(
    () => setIndex((i) => (i <= 0 ? maxIndex : i - 1)),
    [maxIndex]
  );

  const next = useCallback(
    () => setIndex((i) => (i >= maxIndex ? 0 : i + 1)),
    [maxIndex]
  );

  /* Auto-advance — clear and restart whenever index or pause changes */
  useEffect(() => {
    if (paused || items.length <= VISIBLE) return;
    const id = setInterval(next, AUTO_DELAY);
    return () => clearInterval(id);
  }, [paused, next, items.length]);

  useEffect(() => { setIndex(0); }, [items.length]);

  const showControls = !loading && items.length > VISIBLE;

  /*
   * Transform math:
   *   Each slide = w-1/3 (exactly 1/3 of track width, no gap on the flex row).
   *   Inner spacing is provided by px-2.5 padding on each slide slot
   *   (5px L + 5px R → 10px per side → 20px visual gap between cards).
   *   translateX(-i * 33.333…%) shifts by exactly one card per step.
   */
  const translateX = `translateX(-${index * (100 / VISIBLE)}%)`;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1240px] px-6">

        {/* ── Header ── */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
                <Newspaper size={15} className="text-white" />
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-widest text-green-600">
                Actualités
              </span>
            </div>
            <h2 className="text-[26px] font-semibold tracking-tight text-slate-900">
              Dernières annonces
            </h2>
            <p className="mt-1 text-[13px] text-slate-400">
              Restez informé des publications officielles de l'Ordre
            </p>
          </div>

          <Link
            to="/annonces"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:border-green-300 hover:text-green-700 sm:flex"
          >
            Voir toutes les annonces
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Carousel ── */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {showControls && (
            <button
              onClick={prev}
              aria-label="Précédent"
              className="absolute -left-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-green-300 hover:text-green-700"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Overflow mask */}
          <div className="overflow-hidden">
            {/* Track — each slide is w-1/3; spacing is inner px-2.5 padding */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: translateX }}
            >
              {loading
                ? Array.from({ length: VISIBLE }).map((_, i) => (
                    <div key={i} className="w-1/3 flex-shrink-0 px-2.5">
                      <SkeletonSlide />
                    </div>
                  ))
                : items.map((item) => (
                    <div key={item.id} className="w-1/3 flex-shrink-0 px-2.5">
                      <AnnonceSlide item={item} />
                    </div>
                  ))}
            </div>
          </div>

          {showControls && (
            <button
              onClick={next}
              aria-label="Suivant"
              className="absolute -right-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-green-300 hover:text-green-700"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* ── Dot indicators ── */}
        {showControls && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Position ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-6 bg-green-600"
                    : "w-1.5 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Mobile CTA ── */}
        <div className="mt-7 flex justify-center sm:hidden">
          <Link
            to="/annonces"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-5 py-2.5 text-[13px] font-medium text-slate-600 transition hover:border-green-300 hover:text-green-700"
          >
            Voir toutes les annonces <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
