import { Link } from "react-router-dom";
import { ShieldCheck, Users, BadgeCheck, ArrowRight, Activity, Award } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from "../motion/animation";
import aboutImg from "../assets/hero.jpg";

function About() {
    const features = [
        {
            icon: ShieldCheck,
            title: "Régulation & Déontologie",
            desc: "Garantir le respect strict des normes éthiques.",
        },
        {
            icon: Users,
            title: "Services aux Médecins",
            desc: "Accompagnement et facilitation des démarches.",
        },
        {
            icon: BadgeCheck,
            title: "Confiance Publique",
            desc: "Transparence totale sur les praticiens certifiés.",
        },
    ];

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Premium Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-green-100/40 to-emerald-50/20 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/40 to-green-50/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/4"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    
                    {/* LEFT - Images & Visuals (Swapped sides for better flow) */}
                    <motion.div 
                        variants={fadeInRight}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="relative order-2 lg:order-1"
                    >
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 aspect-[4/5] max-w-md mx-auto lg:mx-0 lg:ml-auto">
                            <img
                                src={aboutImg}
                                alt="Ordre National des Médecins"
                                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                            />
                            {/* Glassmorphism Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                            
                            {/* Embedded Stats inside Image */}
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-xl">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-green-500 rounded-xl shadow-inner">
                                            <Award size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl">Excellence</h4>
                                            <p className="text-green-50 text-sm font-medium">Au service de la santé publique</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Element */}
                        <motion.div 
                            animate={{ y: [-15, 15, -15] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 -left-4 lg:-left-12 bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 flex items-center gap-4 border border-slate-100 max-w-[240px]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0 shadow-sm">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">100%</p>
                                <p className="text-sm font-semibold text-slate-500 leading-tight">Médecins Certifiés</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT - Content */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="order-1 lg:order-2"
                    >
                        <motion.div variants={fadeInLeft} className="flex items-center gap-3 mb-6">
                            <span className="h-px w-12 bg-green-600"></span>
                            <span className="text-green-600 font-bold tracking-widest uppercase text-sm">
                                L'Institution
                            </span>
                        </motion.div>

                        <motion.h2 
                            variants={fadeInLeft}
                            className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.15] mb-6 tracking-tight"
                        >
                            Garant de l'éthique et de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">qualité médicale</span>
                        </motion.h2>

                        <motion.p 
                            variants={fadeInLeft}
                            className="text-slate-600 text-lg leading-relaxed mb-10 max-w-xl"
                        >
                            L’Ordre National des Médecins Mauritaniens (ONMM) encadre l’exercice de la profession. Nous œuvrons au respect rigoureux des règles déontologiques et accompagnons nos membres avec des services numériques innovants.
                        </motion.p>

                        {/* Features Grid */}
                        <div className="grid sm:grid-cols-2 gap-5 mb-10">
                            {features.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        variants={fadeInLeft}
                                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 hover:border-green-100 transition-all duration-300 group"
                                    >
                                        <div className="w-12 h-12 bg-slate-50 group-hover:bg-green-50 text-slate-600 group-hover:text-green-600 rounded-xl flex items-center justify-center mb-4 transition-colors">
                                            <Icon size={24} strokeWidth={2} />
                                        </div>
                                        <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div variants={fadeInLeft} className="flex flex-wrap items-center gap-8">
                            <Link
                                to="/about"
                                className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 px-8 py-4 text-white font-bold transition-all shadow-lg shadow-green-600/30 active:scale-95 group"
                            >
                                En savoir plus
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            
                            <div className="flex items-center gap-4 text-slate-600 font-medium text-sm">
                                <div className="flex -space-x-3">
                                    <img src="https://ui-avatars.com/api/?name=Dr+A&background=random" alt="user" className="w-10 h-10 rounded-full border-2 border-white shadow-md relative z-30" />
                                    <img src="https://ui-avatars.com/api/?name=Dr+B&background=random" alt="user" className="w-10 h-10 rounded-full border-2 border-white shadow-md relative z-20" />
                                    <img src="https://ui-avatars.com/api/?name=Dr+C&background=random" alt="user" className="w-10 h-10 rounded-full border-2 border-white shadow-md relative z-10" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Rejoignez</p>
                                    <p className="font-bold text-slate-900">+500 médecins</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

export default About;