import { User, MapPin, Phone, Mail, Home } from "lucide-react";

const VILLES = [
  "Nouakchott", "Nouadhibou", "Kiffa", "Kaédi", "Zouérate", "Rosso",
  "Atar", "Tidjikja", "Néma", "Aïoun el-Atrouss", "Sélibabi", "Akjoujt",
  "Boutilimit", "Chinguetti", "Tichit", "Ouadâne", "Kobeni", "Maghama",
  "Mbout", "Kankossa", "Autre",
];

function Field({ label, required, icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
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

export default function StepPersonal({ data, onChange, errors }) {
  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-slate-500">
        Les champs marqués <span className="text-red-500 font-semibold">*</span> sont obligatoires.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" required icon={<User size={15} />} error={errors.nom}>
          <input
            type="text"
            value={data.nom || ""}
            onChange={(e) => onChange("nom", e.target.value)}
            placeholder="Votre nom"
            autoComplete="family-name"
            className={inputCls(true, Boolean(errors.nom))}
          />
        </Field>

        <Field label="Prénom" required icon={<User size={15} />} error={errors.prenom}>
          <input
            type="text"
            value={data.prenom || ""}
            onChange={(e) => onChange("prenom", e.target.value)}
            placeholder="Votre prénom"
            autoComplete="given-name"
            className={inputCls(true, Boolean(errors.prenom))}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ville" required icon={<MapPin size={15} />} error={errors.ville}>
          <select
            value={data.ville || ""}
            onChange={(e) => onChange("ville", e.target.value)}
            className={inputCls(true, Boolean(errors.ville))}
          >
            <option value="">Sélectionner une ville</option>
            {VILLES.map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>

        <Field label="Téléphone" required icon={<Phone size={15} />} error={errors.telephone}>
          <input
            type="tel"
            value={data.telephone || ""}
            onChange={(e) => onChange("telephone", e.target.value)}
            placeholder="+222 XX XX XX XX"
            autoComplete="tel"
            className={inputCls(true, Boolean(errors.telephone))}
          />
        </Field>
      </div>

      <Field label="Email" required icon={<Mail size={15} />} error={errors.email}>
        <input
          type="email"
          value={data.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="nom@domaine.com"
          autoComplete="email"
          className={inputCls(true, Boolean(errors.email))}
        />
      </Field>

      <Field label="Adresse" required icon={<Home size={15} />} error={errors.adresse}>
        <input
          type="text"
          value={data.adresse || ""}
          onChange={(e) => onChange("adresse", e.target.value)}
          placeholder="Quartier, rue, numéro…"
          autoComplete="street-address"
          className={inputCls(true, Boolean(errors.adresse))}
        />
      </Field>
    </div>
  );
}
