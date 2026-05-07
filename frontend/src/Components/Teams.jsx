import React from 'react'
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../motion/animation';
import { Users, Shield, Gavel, Building2, Network } from 'lucide-react';

export default function Teams() {
    return (
        <section className='py-28 bg-white relative overflow-hidden'>
            {/* Background Decorations */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-50 to-transparent"></div>
            <div className="absolute -left-40 top-40 w-96 h-96 bg-green-100/50 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -right-40 bottom-10 w-96 h-96 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div 
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-3xl mx-auto text-center mb-20"
                >
                    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-green-50 text-green-700 border border-green-100 px-4 py-1.5 text-sm font-bold tracking-wide uppercase mb-6 shadow-sm">
                        <Network size={16} />
                        Organisation
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                        Structure de <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">l'ONMM</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        L'Ordre National des Médecins de Mauritanie s'articule autour de plusieurs organes délibérants, disciplinaires et exécutifs pour assurer sa mission.
                    </p>
                </motion.div>

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
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 flex flex-col items-center text-center shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-blue-200 transition-all duration-300 min-w-[280px] sm:min-w-[320px] relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-inner">
                                    <Users size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Assemblée Générale</h3>
                                <p className="text-slate-600 text-sm font-medium relative z-10">L'organe suprême de l'Ordre</p>
                            </div>
                        </motion.div>

                        {/* Connector */}
                        <motion.div variants={fadeInUp} className="w-1 h-12 bg-gradient-to-b from-blue-100 to-green-100 my-2 rounded-full"></motion.div>

                        {/* 2. Conseil National */}
                        <motion.div variants={fadeInUp} className="w-full sm:w-auto">
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 flex flex-col items-center text-center shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-green-200 transition-all duration-300 min-w-[280px] sm:min-w-[320px] relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-inner">
                                    <Building2 size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Conseil National de l'Ordre</h3>
                                <p className="text-slate-600 text-sm font-medium relative z-10">Organe délibérant (25 membres)</p>
                            </div>
                        </motion.div>

                        {/* Connector to children */}
                        <motion.div variants={fadeInUp} className="w-1 h-12 bg-gradient-to-b from-green-100 to-slate-200 my-2 rounded-full hidden md:block"></motion.div>

                        {/* 3 Children */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-4 lg:gap-8 w-full justify-center relative mt-8 md:mt-0">
                            
                            {/* Horizontal connector line for md+ */}
                            <div className="hidden md:block absolute top-0 left-[16.66%] right-[16.66%] h-1 bg-slate-200 rounded-full"></div>

                            {/* Child 1: Bureau Exécutif */}
                            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center relative md:pt-8">
                                <div className="hidden md:block absolute top-0 w-1 h-8 bg-slate-200 rounded-b-full"></div>
                                <div className="w-full md:w-auto bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center shadow-lg shadow-slate-200/40 hover:shadow-xl hover:border-green-200 transition-all duration-300 group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 relative z-10">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 relative z-10">Bureau Exécutif</h3>
                                    <p className="text-slate-500 text-xs font-medium relative z-10">Gestion et administration quotidienne</p>
                                </div>
                            </motion.div>

                            {/* Child 2: Conseils de Section */}
                            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center relative md:pt-8">
                                <div className="hidden md:block absolute top-0 w-1 h-8 bg-slate-200 rounded-b-full"></div>
                                <div className="w-full md:w-auto bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center shadow-lg shadow-slate-200/40 hover:shadow-xl hover:border-cyan-200 transition-all duration-300 group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mb-4 relative z-10">
                                        <Shield size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 relative z-10">Conseils de Section</h3>
                                    <p className="text-slate-500 text-xs font-medium relative z-10">Généralistes, Spécialistes, Enseignants</p>
                                </div>
                            </motion.div>

                            {/* Child 3: Conseil de Discipline */}
                            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center relative md:pt-8">
                                <div className="hidden md:block absolute top-0 w-1 h-8 bg-slate-200 rounded-b-full"></div>
                                <div className="w-full md:w-auto bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center shadow-lg shadow-slate-200/40 hover:shadow-xl hover:border-rose-200 transition-all duration-300 group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 relative z-10">
                                        <Gavel size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 relative z-10">Conseil de Discipline</h3>
                                    <p className="text-slate-500 text-xs font-medium relative z-10">Juridiction disciplinaire</p>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
