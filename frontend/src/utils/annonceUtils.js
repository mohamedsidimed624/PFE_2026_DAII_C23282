export const formatAnnonceDate = (value) => {
  if (!value) return "Non publié";

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const getTypeLabel = (type) => {
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
};

export const getActionLabel = (type) => {
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
};
