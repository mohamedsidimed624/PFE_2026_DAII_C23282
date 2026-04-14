import React from "react";

export default function StepSuccess({ data, categoryMap, receipt }) {
  return (
    <div className="space-y-4">
      <div className="alert alert-success">
        <span>Votre réclamation a été envoyée avec succès.</span>
      </div>

      <div className="rounded-box border border-base-300 bg-base-100 p-4">
        <h3 className="mb-4 text-lg font-semibold">Réclamation envoyée</h3>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Numéro :</span>{" "}
            {receipt?.numeroReclamation || "—"}
          </p>
          <p><span className="font-semibold">Nom :</span> {data.nom}</p>
          <p><span className="font-semibold">Prénom :</span> {data.prenom}</p>
          <p>
            <span className="font-semibold">Catégorie :</span>{" "}
            {categoryMap.get(data.categorie) || "—"}
          </p>
          <p><span className="font-semibold">Objet :</span> {data.objet}</p>
        </div>
      </div>
    </div>
  );
}