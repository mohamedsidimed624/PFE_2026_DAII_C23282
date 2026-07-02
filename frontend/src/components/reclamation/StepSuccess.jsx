import { CheckCircle2, Clock, ClipboardCheck, ArrowRight } from "lucide-react";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800 break-words">{value || "—"}</span>
    </div>
  );
}

const PROCESS_STEPS = [
  { icon: ClipboardCheck, label: "Réclamation reçue",   desc: "Votre dossier est enregistré." },
  { icon: Clock,          label: "En cours d'examen",   desc: "L'administration instruit votre demande." },
  { icon: CheckCircle2,   label: "Clôturée",            desc: "Une réponse vous sera transmise par email." },
];

export default function StepSuccess({ data, categoryMap, receipt }) {
  return (
    <div className="space-y-6 pt-2">
      {/* Bandeau succès */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 py-8 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-green-900">
            Réclamation envoyée avec succès
          </h3>
          <p className="mt-1 text-sm text-green-700">
            Votre demande a bien été reçue et sera traitée dans les meilleurs délais.
          </p>
        </div>
      </div>

      {/* Numéro de référence */}
      {receipt?.numeroReclamation && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Numéro de référence
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {receipt.numeroReclamation}
          </p>
          {/* <p className="mt-1 text-xs text-slate-400">Conservez ce numéro pour suivre votre dossier.</p> */}
        </div>
      )}

      {/* Récapitulatif */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Récapitulatif</p>
        </div>
        <div className="px-4 py-1">
          <Row label="Nom complet"  value={`${data.nom} ${data.prenom}`.trim()} />
          <Row label="Email"        value={data.email} />
          <Row label="Catégorie"    value={categoryMap.get(data.categorie)} />
          <Row label="Objet"        value={data.objet} />
        </div>
      </div>

      {/* Processus de traitement */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
          Processus de traitement
        </p>
        <div className="flex flex-col sm:flex-row gap-0">
          {PROCESS_STEPS.map((s, idx) => {
            const Icon   = s.icon;
            const isLast = idx === PROCESS_STEPS.length - 1;
            return (
              <div key={idx} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div className="h-px flex-1 bg-green-200 hidden sm:block" />
                  )}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Icon size={16} />
                  </div>
                  {!isLast && (
                    <div className="h-px flex-1 bg-green-200 hidden sm:block" />
                  )}
                </div>
                <p className="mt-2 text-xs font-bold text-slate-700">{s.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-400 leading-4 px-1">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
