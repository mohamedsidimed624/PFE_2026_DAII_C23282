import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FilePlus2,
  SearchCheck,
  MessageSquareWarning,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import { fadeInUp, staggerContainer } from "../motion/animation";

const SERVICES = [
  {
    icon: FilePlus2,
    title: "Demande d'adhésion",
    desc: "Soumettez votre dossier en ligne rapidement et en toute sécurité.",
    link: "/adhesion",
  },
  {
    icon: SearchCheck,
    title: "Suivi de dossier",
    desc: "Consultez l'avancement de votre demande à tout moment.",
    link: "/suivi-dossier",
  },
  {
    icon: MessageSquareWarning,
    title: "Réclamation",
    desc: "Signalez un problème ou une irrégularité en toute confidentialité.",
    link: "/reclamations",
  },
  {
    icon: Stethoscope,
    title: "Annuaire médical",
    desc: "Recherchez un médecin inscrit à l'Ordre par nom ou spécialité.",
    link: "/annuaire",
  },
];

export default function Services() {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-12 max-w-2xl"
        >
          <p className="mb-3 text-[15px] font-semibold text-green-600">
            Services en ligne
          </p>

          <h2 className="text-[34px] font-bold leading-tight text-slate-900 md:text-[42px]">
            Vos démarches auprès de l’Ordre
          </h2>

          <p className="mt-4 max-w-xl text-[16px] leading-7 text-slate-500">
            Un accès simple, rapide et sécurisé aux principaux services numériques
            de l’Ordre National des Médecins.
          </p>
        </motion.div>

        {/* Cards */}
        {/* Cards */}
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: "-60px" }}
  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
>
  {SERVICES.map((svc, index) => {
    const Icon = svc.icon;

    return (
      <motion.div key={svc.title} variants={fadeInUp} className="h-full">
        <Link
          to={svc.link}
          className="group relative flex h-full min-h-[245px] flex-col overflow-hidden rounded-[26px] border border-green-100 bg-white p-6 shadow-[0_18px_45px_rgba(0,120,70,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-[0_25px_60px_rgba(0,120,70,0.16)]"
        >
          {/* Accent background */}
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-100/70 transition group-hover:bg-green-200/80" />
          <div className="absolute left-0 top-0 h-full w-1 bg-green-600" />

          {/* Icon */}
          <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20">
            <Icon size={25} strokeWidth={2.2} />
          </div>

          {/* Text */}
          <div className="relative flex flex-1 flex-col">
            <span className="mb-3 w-fit rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-green-700">
              Service {index + 1}
            </span>

            <h3 className="text-[18px] font-bold text-slate-900">
              {svc.title}
            </h3>

            <p className="mt-3 flex-1 text-[14px] leading-6 text-slate-500">
              {svc.desc}
            </p>
          </div>

          {/* Footer */}
          <div className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-[13px] font-bold text-green-700">
              Accéder
            </span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white transition group-hover:translate-x-1">
              <ArrowRight size={17} />
            </span>
          </div>
        </Link>
      </motion.div>
    );
  })}
</motion.div>
      </div>
    </section>
  );
}