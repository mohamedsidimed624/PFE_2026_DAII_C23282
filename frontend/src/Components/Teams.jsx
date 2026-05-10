import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../motion/animation';
import { Users, Shield, Gavel, Building2, Network } from 'lucide-react';

const councilMembers = [
    { name: "Pr. Mohamed Ould Salem",  role: "Président",          initials: "Mohamed+Ould+Salem",  president: true  },
    { name: "Dr. Fatima Mint Ahmed",   role: "Vice-Présidente",    initials: "Fatima+Mint+Ahmed"                    },
    { name: "Dr. Ahmed Ould Cheikh",   role: "Secrétaire Général", initials: "Ahmed+Ould+Cheikh"                    },
    { name: "Dr. Mariem Mint Brahim",  role: "Trésorière",         initials: "Mariem+Mint+Brahim"                   },
    { name: "Dr. Sidi Ould Mohamed",   role: "Conseiller",         initials: "Sidi+Ould+Mohamed"                    },
    { name: "Dr. Aïcha Mint Vall",     role: "Conseillère",        initials: "Aicha+Mint+Vall"                      },
];

const avatarUrl = (initials) =>
    `https://ui-avatars.com/api/?name=${initials}&background=16a34a&color=fff&size=128`;

export default function Teams() {
    return (
        <section className="py-28 bg-green-950 relative overflow-hidden">
            {/* Glow decorations */}
            <div className="absolute -left-40 top-40 w-96 h-96 bg-green-400/8 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -right-40 bottom-10 w-96 h-96 bg-emerald-500/6 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Section header */}
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-3xl mx-auto text-center mb-20"
                >
                    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 text-green-400 border border-white/20 px-4 py-1.5 text-sm font-bold tracking-wide uppercase mb-6">
                        <Network size={16} />
                        Organisation
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                        Structure de <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">l'ONMM</span>
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        L'Ordre National des Médecins de Mauritanie s'articule autour de plusieurs organes délibérants, disciplinaires et exécutifs pour assurer sa mission.
                    </p>
                </motion.div>

                {/* Org chart */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="flex flex-col items-center">

                        {/* 1. Assemblée Générale */}
                        <motion.div variants={fadeInUp} className="w-full sm:w-auto">
                            <div className="bg-gradient-to-br from-green-900/60 to-green-950 rounded-2xl border border-green-700/40 p-6 sm:p-8 flex flex-col items-center text-center shadow-lg shadow-black/30 min-w-[280px] sm:min-w-[320px]">
                                <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <Users size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Assemblée Générale</h3>
                                <p className="text-slate-400 text-sm font-medium">L'organe suprême de l'Ordre</p>
                            </div>
                        </motion.div>

                        {/* Connector */}
                        <motion.div variants={fadeInUp} className="w-1 h-12 bg-slate-700 my-2 rounded-full"></motion.div>

                        {/* 2. Conseil National */}
                        <motion.div variants={fadeInUp} className="w-full sm:w-auto">
                            <div className="bg-gradient-to-br from-green-900/60 to-slate-900 rounded-2xl border border-green-700/40 p-6 sm:p-8 flex flex-col items-center text-center shadow-lg shadow-black/30 min-w-[280px] sm:min-w-[320px]">
                                <div className="w-14 h-14 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <Building2 size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Conseil National de l'Ordre</h3>
                                <p className="text-slate-400 text-sm font-medium">Organe délibérant (25 membres)</p>
                            </div>
                        </motion.div>

                        {/* Connector to children */}
                        <motion.div variants={fadeInUp} className="w-1 h-12 bg-slate-700 my-2 rounded-full hidden md:block"></motion.div>

                        {/* 3 Children */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-4 lg:gap-8 w-full justify-center relative mt-8 md:mt-0">

                            {/* Horizontal connector line for md+ */}
                            <div className="hidden md:block absolute top-0 left-[16.66%] right-[16.66%] h-px bg-slate-700"></div>

                            {/* Child 1: Bureau Exécutif */}
                            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center relative md:pt-8">
                                <div className="hidden md:block absolute top-0 w-px h-8 bg-slate-700"></div>
                                <div className="w-full md:w-auto bg-gradient-to-br from-green-900/40 to-green-950 rounded-2xl border border-green-700/30 p-6 flex flex-col items-center text-center shadow-lg shadow-black/20">
                                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Bureau Exécutif</h3>
                                    <p className="text-slate-400 text-xs font-medium">Gestion et administration quotidienne</p>
                                </div>
                            </motion.div>

                            {/* Child 2: Conseils de Section */}
                            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center relative md:pt-8">
                                <div className="hidden md:block absolute top-0 w-px h-8 bg-slate-700"></div>
                                <div className="w-full md:w-auto bg-gradient-to-br from-emerald-900/40 to-green-950 rounded-2xl border border-emerald-700/30 p-6 flex flex-col items-center text-center shadow-lg shadow-black/20">
                                    <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-4">
                                        <Shield size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Conseils de Section</h3>
                                    <p className="text-slate-400 text-xs font-medium">Généralistes, Spécialistes, Enseignants</p>
                                </div>
                            </motion.div>

                            {/* Child 3: Conseil de Discipline */}
                            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center relative md:pt-8">
                                <div className="hidden md:block absolute top-0 w-px h-8 bg-slate-700"></div>
                                <div className="w-full md:w-auto bg-gradient-to-br from-teal-900/40 to-green-950 rounded-2xl border border-teal-700/30 p-6 flex flex-col items-center text-center shadow-lg shadow-black/20">
                                    <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-4">
                                        <Gavel size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Conseil de Discipline</h3>
                                    <p className="text-slate-400 text-xs font-medium">Juridiction disciplinaire</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Council Members Grid ── */}
                <div className="mt-24">
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-80px" }}
                        className="text-center mb-12"
                    >
                        <span className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 text-green-400 border border-white/20 px-4 py-1.5 text-sm font-bold tracking-wide uppercase mb-4">
                            <Users size={14} />
                            Membres
                        </span>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            Le Conseil National
                        </h3>
                        <p className="mt-3 text-slate-400 max-w-lg mx-auto">
                            Les membres élus qui veillent au bon fonctionnement et à l'éthique de la profession médicale en Mauritanie.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                        {councilMembers.map((member) => (
                            <motion.div
                                key={member.name}
                                variants={fadeInUp}
                                className={`bg-gradient-to-b from-green-900/50 to-green-950/80 border rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-900/20 ${
                                    member.president
                                        ? "border-green-500/40 ring-1 ring-green-400/20"
                                        : "border-green-800/40"
                                }`}
                            >
                                {/* Avatar */}
                                <div className="relative mb-5">
                                    <img
                                        src={avatarUrl(member.initials)}
                                        alt={member.name}
                                        className="w-20 h-20 rounded-full object-cover ring-2 ring-green-500/40"
                                    />
                                    {/* Online dot */}
                                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-slate-900 animate-pulse" />
                                </div>

                                {/* Badge for president */}
                                {member.president && (
                                    <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-green-500/20 border border-green-500/30 px-3 py-0.5 text-xs font-bold text-green-400 uppercase tracking-widest">
                                        Président
                                    </span>
                                )}

                                <h4 className="font-bold text-white text-base leading-tight">{member.name}</h4>
                                <p className="text-slate-400 text-sm mt-1">{member.role}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
