import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight, FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const formatDate = (value) => {
  if (!value) return "Non publié";

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function getTypeLabel(type) {
  switch (type) {
    case "ANNONCE":
      return "Annonce";
    case "ACTUALITE":
      return "Actualité";
    case "COMMUNIQUE":
      return "Communiqué";
    case "DECISION":
      return "Décision";
    case "EVENEMENT":
      return "Événement";
    default:
      return "Publication";
  }
}

function getActionLabel(type) {
  switch (type) {
    case "COMMUNIQUE":
      return "Lire le communiqué";
    case "DECISION":
      return "Consulter la décision";
    case "EVENEMENT":
      return "Voir l’événement";
    case "ANNONCE":
      return "Consulter l’annonce";
    case "ACTUALITE":
      return "Lire l’actualité";
    default:
      return "Lire la publication";
  }
}

function AnnonceCard({ annonce }) {
  const imageSrc = annonce.imageUrl
    ? `${API_BASE_URL}${annonce.imageUrl}`
    : null;

  return (
    <Link
      to={`/annonces/${annonce.id}`}
      aria-label={`Lire la publication : ${
        annonce.titre || "Publication sans titre"
      }`}
      className="block h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
        <div className="relative h-44 shrink-0 bg-slate-100">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={annonce.titre || "Image de la publication"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <FileText size={36} />
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
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

          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900">
            {annonce.titre || "Publication sans titre"}
          </h3>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {annonce.resume ||
              "Aucun résumé disponible pour cette publication."}
          </p>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays size={14} />
              {formatDate(annonce.datePublication || annonce.dateCreation)}
            </span>

            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700">
              {getActionLabel(annonce.type)}
              <ArrowRight size={14} />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default AnnonceCard;