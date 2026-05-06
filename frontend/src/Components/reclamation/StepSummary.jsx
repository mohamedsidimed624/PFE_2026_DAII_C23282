import { Eye, User, FileText, Paperclip } from "lucide-react";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800 break-words max-w-[60%]">
        {value || <span className="text-slate-300 font-normal">—</span>}
      </span>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <span className="text-green-600">{icon}</span>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

export default function StepSummary({ data, categoryMap }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <Eye size={15} className="shrink-0 text-amber-600" />
        <p className="text-sm font-medium text-amber-700">
          Vérifiez attentivement vos informations avant de soumettre.
        </p>
      </div>

      <Section icon={<User size={14} />} title="Identité du déclarant">
        <Row label="Nom complet"  value={`${data.prenom} ${data.nom}`.trim()} />
        <Row label="Email"        value={data.email} />
        <Row label="Téléphone"    value={data.telephone} />
        <Row label="Ville"        value={data.ville} />
        <Row label="Adresse"      value={data.adresse} />
      </Section>

      <Section icon={<FileText size={14} />} title="Détail de la réclamation">
        <Row label="Catégorie"    value={categoryMap.get(data.categorie)} />
        <Row label="Objet"        value={data.objet} />
        <Row
          label="Pièce jointe"
          value={data.fichier ? (
            <span className="inline-flex items-center gap-1 text-green-700">
              <Paperclip size={12} /> {data.fichier.name}
            </span>
          ) : "Aucune"}
        />
      </Section>

      {data.message && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Message</p>
          </div>
          <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-6 text-slate-700">
            {data.message}
          </p>
        </div>
      )}

      <p className="text-xs text-slate-400 leading-5">
        En soumettant ce formulaire, vous confirmez l'exactitude des informations fournies
        et acceptez qu'elles soient traitées par l'Ordre National des Médecins de Mauritanie.
      </p>
    </div>
  );
}
