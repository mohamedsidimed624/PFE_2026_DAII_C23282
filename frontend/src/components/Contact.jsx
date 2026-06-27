import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { fadeInUp, staggerContainer, fadeInLeft, fadeInRight } from "../motion/animation";

function Contact() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                
                <motion.div 
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-2xl mx-auto text-center mb-16"
                >
                    <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 px-4 py-1.5 text-sm font-bold tracking-wide uppercase mb-4">
                        Contact & Localisation
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Siège</span>
                    </h2>
                    <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                        Retrouvez-nous au siège de l'Ordre National des Médecins de Mauritanie.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                    {/* LEFT - Contact Info */}
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="space-y-8 lg:col-span-2"
                    >
                        <motion.div variants={fadeInLeft} className="flex gap-6 group">
                            <div className="flex-shrink-0 w-16 h-16 bg-slate-50 group-hover:bg-green-50 text-slate-700 group-hover:text-green-600 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                                <MapPin size={30} strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Notre Siège</h3>
                                <p className="text-slate-600 leading-relaxed text-lg">Tevragh Zeina, Nouakchott<br />République Islamique de Mauritanie</p>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInLeft} className="flex gap-6 group">
                            <div className="flex-shrink-0 w-16 h-16 bg-slate-50 group-hover:bg-green-50 text-slate-700 group-hover:text-green-600 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                                <Phone size={30} strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Téléphone</h3>
                                <p className="text-slate-600 leading-relaxed text-lg">+222 45 25 00 00<br />+222 36 00 00 00</p>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInLeft} className="flex gap-6 group">
                            <div className="flex-shrink-0 w-16 h-16 bg-slate-50 group-hover:bg-green-50 text-slate-700 group-hover:text-green-600 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                                <Mail size={30} strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Email</h3>
                                <p className="text-slate-600 leading-relaxed text-lg">contact@ordre-medecins.mr<br />support@ordre-medecins.mr</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT - Map */}
                    <motion.div 
                        variants={fadeInRight}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="lg:col-span-3 h-[400px] sm:h-[500px] lg:h-[600px] bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative"
                    >
                        {/* Loading placeholder */}
                        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120377.58554227181!2d-16.04690750402271!3d18.086395156475734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xea0cc25cd7d48d7%3A0x1d2105151b75cb45!2sNouakchott%2C%20Mauritania!5e0!3m2!1sen!2s!4v1684347209307!5m2!1sen!2s" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            className="relative z-10 grayscale-[20%] contrast-125 hover:grayscale-0 transition-all duration-700"
                            title="ONMM Location"
                        ></iframe>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default Contact;
