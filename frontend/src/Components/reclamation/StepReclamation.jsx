import { FileText, Tag, Upload, ChevronDown } from "lucide-react";

const MAX_MESSAGE = 2000;
const MAX_OBJET   = 120;

function FieldLabel({ label, required, hint }) {
  return (
    <div className="mb-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>;
}

const baseCls = (hasError) =>
  `w-full rounded-xl border bg-slate-50 text-sm text-slate-900 outline-none transition
   focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500
   ${hasError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200"}`;

export default function StepReclamation({ data, onChange, errors, categoryOptions }) {
  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm text-slate-500">
        Les champs marqués <span className="text-red-500 font-semibold">*</span> sont obligatoires.
      </p>

      {/* Catégorie */}
      <div>
        <FieldLabel label="Catégorie" required />
        <div className="relative">
          <Tag size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={data.categorie || ""}
            onChange={(e) => onChange("categorie", e.target.value)}
            className={`${baseCls(Boolean(errors.categorie))} appearance-none py-2.5 pl-10 pr-9`}
          >
            <option value="">— Sélectionner une catégorie —</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <FieldError error={errors.categorie} />
      </div>

      {/* Objet */}
      <div>
        <FieldLabel label="Objet" required hint="Résumez en une phrase (120 caractères max)." />
        <div className="relative">
          <FileText size={15} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={data.objet || ""}
            onChange={(e) => onChange("objet", e.target.value)}
            maxLength={MAX_OBJET}
            placeholder="Objet de la réclamation"
            className={`${baseCls(Boolean(errors.objet))} py-2.5 pl-10 pr-4`}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <FieldError error={errors.objet} />
          <span className="ml-auto text-xs text-slate-400">
            {(data.objet || "").length}/{MAX_OBJET}
          </span>
        </div>
      </div>

      {/* Message */}
      <div>
        <FieldLabel
          label="Message"
          required
          hint="Décrivez les faits avec précision (dates, lieu, personnes concernées)."
        />
        <textarea
          value={data.message || ""}
          onChange={(e) => onChange("message", e.target.value)}
          rows={6}
          maxLength={MAX_MESSAGE}
          placeholder="Décrivez votre réclamation en détail…"
          className={`${baseCls(Boolean(errors.message))} resize-none px-4 py-3`}
        />
        <div className="mt-1 flex items-center justify-between">
          <FieldError error={errors.message} />
          <span className="ml-auto text-xs text-slate-400">
            {(data.message || "").length}/{MAX_MESSAGE}
          </span>
        </div>
      </div>

      {/* Pièce jointe */}
      <div>
        <FieldLabel label="Pièce jointe" hint="Optionnel — PDF, PNG ou JPG, max 5 Mo." />
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition
            ${errors.fichier
              ? "border-red-300 bg-red-50"
              : "border-slate-300 bg-slate-50 hover:border-green-400 hover:bg-green-50/30"}`}
        >
          <Upload size={15} className="shrink-0 text-slate-400" />
          <span className="truncate text-sm text-slate-600">
            {data.fichier
              ? `${data.fichier.name} (${Math.round(data.fichier.size / 1024)} Ko)`
              : "Choisir un fichier…"}
          </span>
          <input
            type="file"
            className="hidden"
            accept="application/pdf,image/png,image/jpeg,image/jpg"
            onChange={(e) => onChange("fichier", e.target.files?.[0] || null)}
          />
        </label>
        <FieldError error={errors.fichier} />
      </div>
    </div>
  );
}
