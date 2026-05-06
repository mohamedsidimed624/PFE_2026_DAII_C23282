import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MultistepForm from '../components/reclamation/MultistepForm';
import { ShieldCheck, ClipboardList, MessageSquareWarning } from 'lucide-react';

const PROCESS_CARDS = [
  {
    icon: <ClipboardList size={20} className="text-green-600" />,
    step: "1",
    title: "Renseignez vos coordonnées",
    desc: "Nom, contact et localisation pour permettre le suivi de votre dossier.",
  },
  {
    icon: <MessageSquareWarning size={20} className="text-green-600" />,
    step: "2",
    title: "Décrivez votre réclamation",
    desc: "Choisissez la catégorie et exposez les faits de façon précise.",
  },
  {
    icon: <ShieldCheck size={20} className="text-green-600" />,
    step: "3",
    title: "Confirmation & suivi",
    desc: "Un numéro de référence vous est attribué pour suivre l'avancement.",
  },
];

export default function PublicReclamationPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* ── En-tête institutionnel ── */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white pt-24 pb-12">
        {/* Cercle décoratif */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-green-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <ShieldCheck size={14} />
            Espace public · ONMM
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Déposer une réclamation
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            L'Ordre National des Médecins de Mauritanie traite toutes les réclamations
            relatives à la pratique médicale ou à la gestion administrative. Remplissez
            le formulaire ci-dessous — votre démarche est confidentielle.
          </p>

          {/* Étapes du processus */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PROCESS_CARDS.map((card) => (
              <div
                key={card.step}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  {card.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                    Étape {card.step}
                  </p>
                  <p className="text-sm font-bold text-slate-800">{card.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Formulaire ── */}
      <main className="flex-1">
        <MultistepForm />
      </main>

      <Footer />
    </div>
  );
}
