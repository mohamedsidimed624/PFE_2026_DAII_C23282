import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../motion/animation";
import {
    FilePlus2,
    SearchCheck,
    Stethoscope,
    MessageSquareWarning,
    ArrowRight,
} from "lucide-react";

const services = [
    {
        title: "Demande d’adhésion",
        description: "Soumettez votre dossier en ligne rapidement et de manière sécurisée.",
        cta: "Commencer",
        icon: FilePlus2,
        link: "/adhesion",
        color: "from-green-500 to-emerald-400"
    },
    {
        title: "Suivi de dossier",
        description: "Consultez l’état d'avancement de votre demande en temps réel.",
        cta: "Suivre",
        icon: SearchCheck,
        link: "/suivi",
        color: "from-blue-500 to-cyan-400"
    },
    {
        title: "Réclamation",
        description: "Signalez un problème ou une irrégularité en toute confidentialité.",
        cta: "Déposer",
        icon: MessageSquareWarning,
        link: "/reclamations",
        color: "from-amber-500 to-orange-400"
    },
    {
        title: "Annuaire",
        description: "Recherchez un médecin inscrit à l'Ordre National.",
        cta: "Rechercher",
        icon: Stethoscope,
        link: "/annuaire",
        color: "from-indigo-500 to-violet-400"
    },
];

function ServiceCard({ service }) {
    const Icon = service.icon;

    return (
        <Link to={service.link} className="block h-full outline-none">
            <motion.div
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex flex-col h-full p-8 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
                {/* Decorative background glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-bl-full pointer-events-none ${service.color}" />

                {/* Icon Container */}
                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-white mb-6 shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} strokeWidth={2} />
                </div>

                {/* Content */}
                <h3 className="font-bold text-slate-900 text-xl mb-3 tracking-tight">
                    {service.title}
                </h3>
                
                <p className="text-base text-slate-600 leading-relaxed flex-1">
                    {service.description}
                </p>

                {/* CTA */}
                <div className="mt-8 flex items-center justify-between text-sm font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                    <span>
                        {service.cta}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

function Services() {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-transparent to-transparent opacity-70 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 px-4 py-1.5 text-sm font-bold tracking-wide uppercase mb-4">
                            Services Rapides
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
                            Vos démarches <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">en ligne</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Accédez rapidement aux principales fonctionnalités de l’Ordre des Médecins. Un processus simplifié, sécurisé et transparent.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {services.map((s, i) => (
                        <ServiceCard key={i} service={s} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

export default Services;