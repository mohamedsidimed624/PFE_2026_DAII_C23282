import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Users, BadgeCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInLeft, fadeInRight, staggerContainer } from "../motion/animation";
import { getPublicMedecins, getPublicSpecialites } from "../services/publicAnnuaireApi";

const PILLARS = [
    {
        icon: ShieldCheck,
        num: "01",
        title: "Régulation & Déontologie",
        desc: "Garantir le respect strict des normes éthiques et déontologiques qui régissent l'exercice de la médecine.",
    },
    {
        icon: Users,
        num: "02",
        title: "Services aux Médecins",
        desc: "Accompagner les praticiens dans leurs démarches administratives et faciliter l'exercice de la profession.",
    },
    {
        icon: BadgeCheck,
        num: "03",
        title: "Confiance Publique",
        desc: "Assurer une transparence totale sur les praticiens certifiés et renforcer la confiance des patients.",
    },
];

export default function About() {
    const [medecinsCount, setMedecinsCount] = useState(null);
    const [specialitesCount, setSpecialitesCount] = useState(null);

    useEffect(() => {
        getPublicMedecins({ page: 0, size: 1 })
            .then((data) => setMedecinsCount(data.totalElements))
            .catch(() => {});

        getPublicSpecialites()
            .then((data) => setSpecialitesCount(data.length))
            .catch(() => {});
    }, []);

    const STATS = [
        { value: "2019", label: "Année de fondation" },
        { value: medecinsCount !== null ? `+${medecinsCount}` : "…", label: "Médecins membres" },
        { value: "13",   label: "Wilayas couvertes" },
        { value: specialitesCount !== null ? `${specialitesCount}+` : "…", label: "Spécialités" },
    ];

    return (
        <section className="bg-slate-50 overflow-hidden">

            {/* ── Gold stats band ── */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-green-600 py-10"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/20">
                        {STATS.map((s, i) => (
                            <div key={s.label} className={`text-center ${i > 0 ? "" : ""}`}>
                                <p className="text-4xl md:text-5xl font-black text-white leading-none">{s.value}</p>
                                <p className="text-sm text-white/70 mt-2 uppercase tracking-widest font-medium">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Main content ── */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* Left: mission text */}
                    <motion.div
                        variants={fadeInLeft}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-80px" }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="h-px w-12 bg-green-600" />
                            <span className="text-green-600 font-bold tracking-widest uppercase text-sm">
                                L'Institution
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-6">
                            Garant de l'éthique médicale en{" "}
                            <span className="text-green-600">Mauritanie</span>
                        </h2>

                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                            L'Ordre National des Médecins Mauritaniens (ONMM) est l'institution officielle qui encadre et régule l'exercice de la médecine. Nous veillons au respect des règles déontologiques et accompagnons nos membres avec des services numériques innovants.
                        </p>

                        <Link
                            to="/a-propos"
                            className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 px-8 py-4 text-white font-bold transition-all shadow-lg shadow-green-600/25 active:scale-95 group"
                        >
                            En savoir plus
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Right: numbered pillars */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-80px" }}
                        className="divide-y divide-slate-200"
                    >
                        {PILLARS.map((p) => {
                            const PillarIcon = p.icon;
                            return (
                                <motion.div
                                    key={p.num}
                                    variants={fadeInRight}
                                    className="py-7 flex gap-5 group"
                                >
                                    {/* Number */}
                                    <span className="text-5xl font-black text-green-600/15 leading-none flex-shrink-0 w-14 group-hover:text-green-600/30 transition-colors duration-300">
                                        {p.num}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <PillarIcon size={16} className="text-green-600" />
                                            <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                </div>
            </div>

            {/* ── Bottom accent line ── */}
            <div className="h-px bg-gradient-to-r from-transparent via-green-600/30 to-transparent" />
        </section>
    );
}
