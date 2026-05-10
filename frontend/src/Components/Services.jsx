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
        desc: "Soumettez votre dossier en ligne rapidement et en toute sécurité. Un parcours guidé, étape par étape.",
        link: "/adhesion",
        badge: "En ligne",
        iconBg: "bg-green-100",
        iconColor: "text-green-700",
        badgeBg: "bg-green-50 text-green-700",
        border: "hover:border-green-300",
        arrowColor: "text-green-600",
    },
    {
        icon: SearchCheck,
        title: "Suivi de dossier",
        desc: "Consultez l'avancement de votre demande à tout moment, en temps réel, depuis votre espace.",
        link: "/suivi-dossier",
        badge: "Temps réel",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-700",
        badgeBg: "bg-blue-50 text-blue-700",
        border: "hover:border-blue-300",
        arrowColor: "text-blue-600",
    },
    {
        icon: MessageSquareWarning,
        title: "Réclamation",
        desc: "Signalez un problème ou une irrégularité déontologique en toute confidentialité.",
        link: "/reclamations",
        badge: "Confidentiel",
        iconBg: "bg-[#A0891B]/10",
        iconColor: "text-[#A0891B]",
        badgeBg: "bg-[#A0891B]/10 text-[#A0891B]",
        border: "hover:border-[#A0891B]/40",
        arrowColor: "text-[#A0891B]",
    },
    {
        icon: Stethoscope,
        title: "Annuaire médical",
        desc: "Recherchez un médecin inscrit à l'Ordre par nom, spécialité ou wilaya.",
        link: "/annuaire",
        badge: "3 500+ médecins",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-700",
        badgeBg: "bg-slate-100 text-slate-600",
        border: "hover:border-slate-400",
        arrowColor: "text-slate-700",
    },
];

export default function Services() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-xl mx-auto mb-14"
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#A0891B]/30 bg-[#A0891B]/8 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-[#A0891B] mb-4">
                        Services en ligne
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Accédez à vos{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                            démarches
                        </span>
                    </h2>
                    <p className="text-base text-slate-500 leading-relaxed">
                        Un espace simplifié, sécurisé et transparent pour toutes vos interactions avec l'Ordre National des Médecins.
                    </p>
                </motion.div>

                {/* Cards — 4 equal columns */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
                >
                    {SERVICES.map((svc) => {
                        const SvcIcon = svc.icon;
                        return (
                            <motion.div key={svc.title} variants={fadeInUp}>
                                <Link
                                    to={svc.link}
                                    className={`flex flex-col h-full min-h-[260px] bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${svc.border} group outline-none`}
                                >
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl ${svc.iconBg} ${svc.iconColor} flex items-center justify-center mb-5 flex-shrink-0`}>
                                        <SvcIcon size={22} strokeWidth={2} />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 text-base mb-2">{svc.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{svc.desc}</p>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-5 flex items-center justify-between">
                                        <span className={`text-xs font-semibold rounded-full px-3 py-1 ${svc.badgeBg}`}>
                                            {svc.badge}
                                        </span>
                                        <ArrowRight size={16} className={`${svc.arrowColor} group-hover:translate-x-1 transition-transform`} />
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
