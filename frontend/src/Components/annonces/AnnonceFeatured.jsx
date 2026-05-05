import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight, FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getTypeLabel, formatAnnonceDate, getActionLabel } from "../../utils/annonceUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";



function AnnonceFeatured({ annonce }) {
  if (!annonce) return null;

  const imageSrc = annonce.imageUrl
    ? `${API_BASE_URL}${annonce.imageUrl}`
    : null;

  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Dernière publication
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[300px] bg-slate-100 lg:min-h-[360px]">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={annonce.titre || "Image de la publication"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center text-slate-300 lg:min-h-[360px]">
                <FileText size={54} />
              </div>
            )}
          </div>

          <CardContent className="flex flex-col justify-center p-7 lg:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                {getTypeLabel(annonce.type)}
              </Badge>

              {annonce.categorieNom && (
                <Badge variant="outline" className="text-slate-600">
                  {annonce.categorieNom}
                </Badge>
              )}
            </div>

            <h2 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
              {annonce.titre || "Publication sans titre"}
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              {annonce.resume ||
                "Aucun résumé disponible pour cette publication."}
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={16} />
              Publié le{" "}
              {formatAnnonceDate(annonce.datePublication || annonce.dateCreation)}
            </div>

            <Link
              to={`/annonces/${annonce.id}`}
              aria-label={`Lire la publication : ${
                annonce.titre || "Publication sans titre"
              }`}
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              {getActionLabel(annonce.type)}
              <ArrowRight size={16} />
            </Link>
          </CardContent>
        </div>
      </Card>
    </section>
  );
}

export default AnnonceFeatured;