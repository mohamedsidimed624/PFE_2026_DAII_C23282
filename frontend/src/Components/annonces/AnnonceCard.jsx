import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight, FileText, Pin } from "lucide-react";
import { resolveFileUrl } from "../../config/api";

const TYPE_STYLES = {
  ANNONCE:    { label: "Annonce",     cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  ACTUALITE:  { label: "Actualité",   cls: "border-blue-200 bg-blue-50 text-blue-700" },
  COMMUNIQUE: { label: "Communiqué",  cls: "border-purple-200 bg-purple-50 text-purple-700" },
  DECISION:   { label: "Décision",    cls: "border-amber-200 bg-amber-50 text-amber-700" },
  EVENEMENT:  { label: "Événement",   cls: "border-rose-200 bg-rose-50 text-rose-700" },
};

const formatDate = (value) => {
  if (!value) return "Non publié";
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

function AnnonceCard({ annonce }) {
  const imageSrc = resolveFileUrl(annonce.imageUrl);
  const typeStyle = TYPE_STYLES[annonce.type] || { label: "Publication", cls: "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]" };

  return (
    <div className="h-full">
      <Link
        to={`/annonces/${annonce.id}`}
        aria-label={`Lire : ${annonce.titre || "Publication sans titre"}`}
        className="group block h-full"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md">

          {/* Image / placeholder */}
          <div className="relative h-48 shrink-0 overflow-hidden bg-[#F8FAFC]">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={annonce.titre || ""}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white">
                  <FileText size={22} strokeWidth={1.5} className="text-[#64748B]" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-widest text-[#64748B]">
                  Publication officielle
                </span>
              </div>
            )}

            {/* Type badge */}
            <div className="absolute left-3 top-3">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shadow-sm ${typeStyle.cls}`}>
                {typeStyle.label}
              </span>
            </div>

            {/* Pin */}
            {annonce.isPinned && (
              <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                <Pin size={12} className="fill-[#16A34A] text-[#16A34A]" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
            {annonce.categorieNom && (
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                {annonce.categorieNom}
              </p>
            )}

            <h3 className="line-clamp-2 text-base font-bold leading-6 text-[#0F172A] transition-colors group-hover:text-[#16A34A]">
              {annonce.titre || "Publication sans titre"}
            </h3>

            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-[#64748B]">
              {annonce.resume || "Aucun résumé disponible pour cette publication."}
            </p>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#E2E8F0] pt-3">
              <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <CalendarDays size={12} />
                {formatDate(annonce.datePublication || annonce.dateCreation)}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#16A34A] transition-all group-hover:gap-2">
                Lire plus
                <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default AnnonceCard;
