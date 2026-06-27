import { FileText, Tag, Upload, ChevronDown } from "lucide-react";

const MAX_MESSAGE = 2000;
const MAX_OBJET   = 120;

function Field({ label, required, hint, icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-400 -mt-0.5">{hint}</p>}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        {children}
      </div>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}

const inputCls = (hasIcon, hasError) =>
  `w-full rounded-xl border bg-white py-2.5 text-sm text-slate-900 outline-none transition
   focus:ring-2 focus:ring-green-500/20 focus:border-green-500
   ${hasIcon ? "pl-10 pr-4" : "px-4"}
   ${hasError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200"}`;

export default function StepReclamation({ data, onChange, errors, categoryOptions }) {
  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-slate-500">
        Les champs marqués <span className="text-red-500 font-semibold">*</span> sont obligatoires.
      </p>

      {/* Catégorie */}
      <Field label="Catégorie" required icon={<Tag size={15} />} error={errors.categorie}>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <select
          value={data.categorie || ""}
          onChange={(e) => onChange("categorie", e.target.value)}
          className={`${inputCls(true, Boolean(errors.categorie))} appearance-none pr-9`}
        >
          <option value="">— Sélectionner une catégorie —</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </Field>

      {/* Objet */}
      <Field
        label="Objet"
        required
        hint="Résumez en une phrase (120 caractères max)."
        icon={<FileText size={15} />}
        error={errors.objet}
      >
        <input
          type="text"
          value={data.objet || ""}
          onChange={(e) => onChange("objet", e.target.value)}
          maxLength={MAX_OBJET}
          placeholder="Objet de la réclamation"
          className={`${inputCls(true, Boolean(errors.objet))} pr-16`}
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {(data.objet || "").length}/{MAX_OBJET}
        </span>
      </Field>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Message<span className="text-red-500 ml-0.5">*</span>
        </label>
        <p className="text-xs text-slate-400">
          Décrivez les faits avec précision (dates, lieu, personnes concernées).
        </p>
        <textarea
          value={data.message || ""}
          onChange={(e) => onChange("message", e.target.value)}
          rows={6}
          maxLength={MAX_MESSAGE}
          placeholder="Décrivez votre réclamation en détail…"
          className={`w-full rounded-xl border bg-white resize-none px-4 py-3 text-sm text-slate-900 outline-none transition
            focus:ring-2 focus:ring-green-500/20 focus:border-green-500
            ${errors.message ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200"}`}
        />
        <div className="flex items-center justify-between">
          {errors.message && <p className="text-xs text-red-600" role="alert">{errors.message}</p>}
          <span className="ml-auto text-xs text-slate-400">
            {(data.message || "").length}/{MAX_MESSAGE}
          </span>
        </div>
      </div>

      {/* Pièce jointe */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Pièce jointe</label>
        <p className="text-xs text-slate-400">Optionnel — PDF, PNG ou JPG, max 5 Mo.</p>
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition
            ${errors.fichier
              ? "border-red-300 bg-red-50"
              : "border-slate-200 bg-slate-50 hover:border-green-400 hover:bg-green-50/40"}`}
        >
          <Upload size={18} className="shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">
              {data.fichier ? data.fichier.name : "Choisir un fichier"}
            </p>
            <p className="text-xs text-slate-400">
              {data.fichier
                ? `${Math.round(data.fichier.size / 1024)} Ko`
                : "PDF, PNG ou JPG · max 5 Mo"}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="application/pdf,image/png,image/jpeg,image/jpg"
            onChange={(e) => onChange("fichier", e.target.files?.[0] || null)}
          />
        </label>
        {errors.fichier && <p className="text-xs text-red-600" role="alert">{errors.fichier}</p>}
      </div>
    </div>
  );
}
