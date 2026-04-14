import React from "react";

export default function StepPersonal({ data, onChange, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label mb-1">Nom</label>
        <input
          type="text"
          className={`input input-success w-full ${errors.nom ? "input-error" : ""}`}
          value={data.nom || ""}
          onChange={(e) => onChange("nom", e.target.value)}
          placeholder="Nom"
        />
        {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
      </div>

      <div>
        <label className="label mb-1">Prénom</label>
        <input
          type="text"
          className={`input input-success w-full ${errors.prenom ? "input-error" : ""}`}
          value={data.prenom || ""}
          onChange={(e) => onChange("prenom", e.target.value)}
          placeholder="Prénom"
        />
        {errors.prenom && (
          <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>
        )}
      </div>

      <div>
        <label className="label mb-1">Ville</label>
        <input
          type="text"
          className={`input input-success w-full ${errors.ville ? "input-error" : ""}`}
          value={data.ville || ""}
          onChange={(e) => onChange("ville", e.target.value)}
          placeholder="Ville"
        />
        {errors.ville && (
          <p className="mt-1 text-sm text-red-500">{errors.ville}</p>
        )}
      </div>

      <div>
        <label className="label mb-1">Téléphone</label>
        <input
          type="text"
          className={`input input-success w-full ${errors.telephone ? "input-error" : ""}`}
          value={data.telephone || ""}
          onChange={(e) => onChange("telephone", e.target.value)}
          placeholder="+222..."
        />
        {errors.telephone && (
          <p className="mt-1 text-sm text-red-500">{errors.telephone}</p>
        )}
      </div>

      <div>
        <label className="label mb-1">Adresse</label>
        <input
          type="text"
          className={`input input-success w-full ${errors.adresse ? "input-error" : ""}`}
          value={data.adresse || ""}
          onChange={(e) => onChange("adresse", e.target.value)}
          placeholder="Adresse"
        />
        {errors.adresse && (
          <p className="mt-1 text-sm text-red-500">{errors.adresse}</p>
        )}
      </div>

      <div>
        <label className="label mb-1">Email</label>
        <input
          type="email"
          className={`input input-success w-full ${errors.email ? "input-error" : ""}`}
          value={data.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="nom@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>
    </div>
  );
}