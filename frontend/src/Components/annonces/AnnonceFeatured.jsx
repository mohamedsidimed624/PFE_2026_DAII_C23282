import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight, FileText, Pin } from "lucide-react";
import { formatAnnonceDate, getTypeLabel, getActionLabel } from "../../utils/annonceUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const TYPE_STYLES = {
  ANNONCE:    "border-emerald-200 bg-emerald-50 text-emerald-700",
  ACTUALITE:  "border-blue-200 bg-blue-50 text-blue-700",
  COMMUNIQUE: "border-purple-200 bg-purple-50 text-purple-700",
  DECISION:   "border-amber-200 bg-amber-50 text-amber-700",
  EVENEMENT:  "border-rose-200 bg-rose-50 text-rose-700",
};

function AnnonceFeatured({ annonce }) {
  if (!annonce) return null;

  const imageSrc = annonce.imageUrl ? `${API_BASE_URL}${annonce.imageUrl}` : null;
  const typeCls = TYPE_STYLES[annonce.type] || "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]";

  /* ── Version avec image ── */
  if (imageSrc) {
    return (
      <section>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
          À la une
        </p>
        <Link
          to={`/annonces/${annonce.id}`}
          aria-label={`Lire : ${annonce.titre || "Publication sans titre"}`}
          className="group block"
        >
          <div className="relative h-96 overflow-hidden rounded-xl">
            <img
              src={imageSrc}
              alt={annonce.titre || ""}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />

            {/* Pin */}
            {annonce.isPinned && (
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0F766E] shadow">
                <Pin size={11} className="fill-[#0F766E] text-[#0F766E]" />
                Épinglé
              </div>
            )}

            {/* Content over image */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                  {getTypeLabel(annonce.type)}
                </span>
                {annonce.categorieNom && (
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-medium text-white/80">
                    {annonce.categorieNom}
                  </span>
                )}
              </div>

              <h2 className="max-w-3xl text-2xl font-bold leading-tight text-white md:text-3xl">
                {annonce.titre || "Publication sans titre"}
              </h2>

              {annonce.resume && (
                <p className="mt-2 max-w-2xl line-clamp-2 text-sm leading-6 text-white/70 md:text-base">
                  {annonce.resume}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <CalendarDays size={13} />
                  Publié le {formatAnnonceDate(annonce.datePublication || annonce.dateCreation)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0F766E] px-4 py-1.5 text-xs font-semibold text-white transition group-hover:bg-[#0e6b62]">
                  {getActionLabel(annonce.type)}
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>
    );
  }

  /* ── Version sans image ── */
  return (
    <section>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
        À la une
      </p>
      <Link
        to={`/annonces/${annonce.id}`}
        aria-label={`Lire : ${annonce.titre || "Publication sans titre"}`}
        className="group block"
      >
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 group-hover:border-teal-200 group-hover:shadow-md">
          <div className="flex">
            {/* Accent bar */}
            <div className="w-1 shrink-0 bg-[#0F766E]" />

            <div className="flex flex-1 flex-col justify-center p-6 md:flex-row md:items-center md:p-10">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeCls}`}>
                    {getTypeLabel(annonce.type)}
                  </span>
                  {annonce.categorieNom && (
                    <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-medium text-[#64748B]">
                      {annonce.categorieNom}
                    </span>
                  )}
                  {annonce.isPinned && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-[#0F766E]">
                      <Pin size={10} className="fill-[#0F766E]" /> Épinglé
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold leading-tight text-[#0F172A] transition-colors group-hover:text-[#0F766E] md:text-3xl">
                  {annonce.titre || "Publication sans titre"}
                </h2>

                {annonce.resume && (
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64748B] md:text-base">
                    {annonce.resume}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                    <CalendarDays size={13} />
                    Publié le {formatAnnonceDate(annonce.datePublication || annonce.dateCreation)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0F766E] px-4 py-1.5 text-xs font-semibold text-white transition group-hover:bg-[#0e6b62]">
                    {getActionLabel(annonce.type)}
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>

              {/* Institutional icon placeholder */}
              <div className="mt-6 flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] md:ml-10 md:mt-0 md:h-28 md:w-28">
                <FileText size={28} strokeWidth={1.5} className="text-[#64748B]" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#64748B]">ONMM</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

export default AnnonceFeatured;
