import React from "react";

export default function StepReclamation({
  data,
  onChange,
  errors,
  categoryOptions,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label mb-1">Catégorie</label>
        <select
          className={`select select-success w-full ${errors.categorie ? "select-error" : ""}`}
          value={data.categorie || ""}
          onChange={(e) => onChange("categorie", e.target.value)}
        >
          <option value="">Sélectionner une catégorie</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.categorie && (
          <p className="mt-1 text-sm text-red-500">{errors.categorie}</p>
        )}
      </div>

      <div>
        <label className="label mb-1">Objet</label>
        <input
          type="text"
          className={`input input-success w-full ${errors.objet ? "input-error" : ""}`}
          value={data.objet || ""}
          onChange={(e) => onChange("objet", e.target.value)}
          placeholder="Objet de la réclamation"
        />
        {errors.objet && (
          <p className="mt-1 text-sm text-red-500">{errors.objet}</p>
        )}
      </div>

      <div>
        <label className="label mb-1">Message</label>
        <textarea
          className={`textarea textarea-success w-full ${errors.message ? "textarea-error" : ""}`}
          rows={6}
          value={data.message || ""}
          onChange={(e) => onChange("message", e.target.value)}
          placeholder="Décrivez votre réclamation"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message}</p>
        )}
      </div>

      <div>
        <label className="label mb-1">Pièce jointe</label>
        <input
          type="file"
          className={`file-input file-input-success w-full ${errors.fichier ? "file-input-error" : ""}`}
          accept="application/pdf,image/png,image/jpeg,image/jpg"
          onChange={(e) => onChange("fichier", e.target.files?.[0] || null)}
        />
        {data.fichier && (
          <p className="mt-2 text-sm text-slate-500">{data.fichier.name}</p>
        )}
        {errors.fichier && (
          <p className="mt-1 text-sm text-red-500">{errors.fichier}</p>
        )}
      </div>
    </div>
  );
}