import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FilePlus2,
  SearchCheck,
  Stethoscope,
  MessageSquareWarning,
  ArrowRight,
} from "lucide-react";


const services = [
  {
    title: "Soumettre un dossier",
    description: "Déposez votre demande d'adhésion en ligne de manière simple, rapide et sécurisée.",
    icon: FilePlus2,
    link: "/adhesion",
    tag: "Adhésion",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  {
    title: "Réclamation",
    description: "Transmettez une réclamation à l'ordre et suivez son traitement en toute transparence.",
    icon: MessageSquareWarning,
    link: "/reclamations",
    tag: "Signalement",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    title: "Consulter l'annuaire",
    description: "Recherchez un médecin inscrit selon son nom, sa spécialité ou sa localisation.",
    icon: Stethoscope,
    link: "/annuaire",
    tag: "Annuaire",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-700",
  },
  {
    title: "Suivre un dossier",
    description: "Vérifiez l'état d'avancement de votre dossier d'adhésion à tout moment.",
    icon: SearchCheck,
    link: "/suivi",
    tag: "Suivi",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
];


function ServiceCard({ service, index }) {
  const Icon = service.icon;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    
    
    const timer = setTimeout(() => {
      setVisible(true);
    }, 80 + index * 70);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link
      to={service.link}
      className={`
        group flex flex-col bg-white rounded-3xl border border-slate-200 p-8
        transition-all duration-500 ease-out
        hover:shadow-2xl hover:-translate-y-3 hover:border-slate-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
      `}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      {/* Icône (comme sur Dribbble) */}
      <div
        className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-8 transition-all duration-300
                    ${service.iconBg} ${service.iconColor} group-hover:scale-110`}
      >
        <Icon size={36} strokeWidth={1.75} />
      </div>

      {/* Tag */}
      <span className="inline-flex items-center px-4 py-1 text-xs font-semibold uppercase tracking-widest bg-slate-100 text-slate-600 rounded-3xl mb-4">
        {service.tag}
      </span>

      {/* Titre */}
      <h3 className="text-2xl font-semibold text-slate-900 mb-3 group-hover:text-green-600 transition-colors">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-slate-600 leading-relaxed flex-1">
        {service.description}
      </p>

      {/* CTA (style Dribbble) */}
      <div className="mt-8 flex items-center gap-2 text-green-600 font-medium text-sm group-hover:gap-3 transition-all">
        Accéder
        <div className="w-8 h-8 rounded-2xl bg-green-100 flex items-center justify-center transition-transform group-hover:translate-x-1">
          <ArrowRight size={18} />
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════
   Section Services complète
═══════════════════════════════════════════ */
function Services() {
  return (
    <section className="py-10 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* En-tête */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-green-50 text-green-700 rounded-3xl text-sm font-semibold">
            Nos services
          </span>
          {/* <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-6 leading-tight">
            Des services essentiels{" "}
            <span className="text-green-600">à portée de clic</span>
          </h2> */}
          <p className="mt-5 text-lg text-slate-600">
            Simplifiez vos démarches auprès de l’Ordre National des Médecins.
          </p>
        </div>

        {/* Grille responsive (exactement comme sur Dribbble) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>

        {/* Stats (optionnel mais sympa) */}
        {/* <div className="mt-16 flex flex-wrap justify-center gap-10 text-center">
          {[
            { value: "500+", label: "Médecins inscrits" },
            { value: "24h", label: "Délai de traitement" },
            { value: "100%", label: "Démarches en ligne" },
            { value: "5 ans", label: "D’expérience digitale" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-green-600">{stat.value}</span>
              <span className="text-xs uppercase tracking-widest text-slate-400 mt-1">{stat.label}</span>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
}

export default Services;