import React from "react";

export default function StepSummary({ data, categoryMap }) {
  return (
    <div className="space-y-4">
      <div className="rounded-box border border-base-300 bg-base-100 p-4">
        <h3 className="mb-4 text-lg font-semibold">Vérification</h3>

        <div className="space-y-2 text-sm">
          <p><span className="font-semibold">Nom :</span> {data.nom}</p>
          <p><span className="font-semibold">Prénom :</span> {data.prenom}</p>
          <p><span className="font-semibold">Ville :</span> {data.ville}</p>
          <p><span className="font-semibold">Téléphone :</span> {data.telephone}</p>
          <p><span className="font-semibold">Adresse :</span> {data.adresse}</p>
          <p><span className="font-semibold">Email :</span> {data.email}</p>
          <p>
            <span className="font-semibold">Catégorie :</span>{" "}
            {categoryMap.get(data.categorie) || "—"}
          </p>
          <p><span className="font-semibold">Objet :</span> {data.objet}</p>
          <p><span className="font-semibold">Message :</span> {data.message}</p>
          <p>
            <span className="font-semibold">Fichier :</span>{" "}
            {data.fichier ? data.fichier.name : "Aucun"}
          </p>
        </div>
      </div>
    </div>
  );
}