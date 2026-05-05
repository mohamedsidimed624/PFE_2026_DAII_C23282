import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Mail, Phone, MapPin, Globe, Clock, Send,
  CheckCircle2, Building2, ChevronRight, Facebook, Twitter, Linkedin,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const CONTACT_INFOS = [
  { icon: <MapPin size={22} strokeWidth={1.6} />, label: "Adresse", value: "Tevragh Zeina, Nouakchott", sub: "République Islamique de Mauritanie", color: "bg-green-50 text-green-600" },
  { icon: <Phone size={22} strokeWidth={1.6} />, label: "Téléphone", value: "+222 45 25 00 00", sub: "+222 36 00 00 00", color: "bg-blue-50 text-blue-600" },
  { icon: <Mail size={22} strokeWidth={1.6} />, label: "Email", value: "contact@ordre-medecins.mr", sub: "support@ordre-medecins.mr", color: "bg-violet-50 text-violet-600" },
  { icon: <Clock size={22} strokeWidth={1.6} />, label: "Heures d'ouverture", value: "Dim – Jeu : 08h00 – 16h00", sub: "Vendredi & Samedi : Fermé", color: "bg-amber-50 text-amber-600" },
];

const DEPARTMENTS = [
  { name: "Secrétariat général", email: "secretariat@ordre-medecins.mr", phone: "+222 45 25 00 01" },
  { name: "Inscriptions & Adhésions", email: "inscriptions@ordre-medecins.mr", phone: "+222 45 25 00 02" },
  { name: "Réclamations & Déontologie", email: "reclamations@ordre-medecins.mr", phone: "+222 45 25 00 03" },
  { name: "Communication", email: "communication@ordre-medecins.mr", phone: "+222 45 25 00 04" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ nom: "", email: "", sujet: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-green-950 to-emerald-900 px-6 pt-36 pb-24">
        <div className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] bg-green-500/10 rounded-full blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-[360px] h-[360px] bg-emerald-500/10 rounded-full blur-[80px]" />
        <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10 max-w-7xl mx-auto">
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-200 backdrop-blur mb-6">
            <Globe size={13} /> Ordre National des Médecins de Mauritanie
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-2xl">
            Contactez{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">l'ONMM</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-xl text-lg text-slate-300 leading-relaxed">
            Notre équipe est disponible pour répondre à toutes vos questions concernant l'inscription, la déontologie médicale, ou toute autre demande administrative.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            {["Inscription", "Réclamation", "Annuaire", "Suivi de dossier"].map((l) => (
              <span key={l} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur">
                <ChevronRight size={13} className="text-green-300" /> {l}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">

          {/* LEFT */}
          <div className="space-y-10">
            {/* Form */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <motion.div variants={fadeUp} className="mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900">Envoyer un message</h2>
                <p className="mt-2 text-slate-500 text-sm">Remplissez le formulaire et nous vous répondrons dans les meilleurs délais.</p>
              </motion.div>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center"><CheckCircle2 size={32} className="text-green-600" /></div>
                  <h3 className="text-xl font-bold text-slate-900">Message envoyé !</h3>
                  <p className="text-slate-500 max-w-xs">Notre équipe vous contactera dans un délai de 24 à 48 heures.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ nom: "", email: "", sujet: "", message: "" }); }} className="mt-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Nouveau message</button>
                </motion.div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
                  <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField label="Nom complet" required>
                      <input type="text" name="nom" value={form.nom} onChange={onChange} placeholder="Dr. Ahmed Ould Mohamed" required className="input-field" />
                    </FormField>
                    <FormField label="Email" required>
                      <input type="email" name="email" value={form.email} onChange={onChange} placeholder="vous@exemple.mr" required className="input-field" />
                    </FormField>
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <FormField label="Sujet" required>
                      <select name="sujet" value={form.sujet} onChange={onChange} required className="input-field appearance-none">
                        <option value="">Choisissez un sujet…</option>
                        <option>Demande d'inscription à l'Ordre</option>
                        <option>Suivi de dossier</option>
                        <option>Réclamation déontologique</option>
                        <option>Renseignement sur l'annuaire</option>
                        <option>Problème technique</option>
                        <option>Autre</option>
                      </select>
                    </FormField>
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <FormField label="Message" required>
                      <textarea name="message" value={form.message} onChange={onChange} rows={5} required placeholder="Décrivez votre demande en détail…" className="input-field resize-none" />
                    </FormField>
                  </motion.div>
                  <motion.div variants={fadeUp} className="pt-2">
                    <button type="submit" className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30 hover:-translate-y-0.5 transition-all active:scale-[.98]">
                      <Send size={16} /> Envoyer le message
                    </button>
                  </motion.div>
                </form>
              )}
            </motion.div>

            {/* Departments */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <motion.div variants={fadeUp} className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-900">Contacts par département</h2>
                <p className="mt-1 text-slate-500 text-sm">Contactez directement le service concerné.</p>
              </motion.div>
              <div className="divide-y divide-slate-100">
                {DEPARTMENTS.map((dept) => (
                  <motion.div key={dept.name} variants={fadeUp} className="group flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-green-700 transition-colors">{dept.name}</p>
                      <a href={`mailto:${dept.email}`} className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-green-600 transition-colors"><Mail size={11} />{dept.email}</a>
                    </div>
                    <a href={`tel:${dept.phone.replace(/\s/g, "")}`} className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-green-200 hover:bg-green-50 hover:text-green-700 transition-all">
                      <Phone size={12} />{dept.phone}
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Info cards */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-4">
              {CONTACT_INFOS.map((info) => (
                <motion.div key={info.label} variants={fadeUp} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300">
                  <div className={`shrink-0 w-11 h-11 rounded-2xl ${info.color} flex items-center justify-center`}>{info.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{info.label}</p>
                    <p className="font-bold text-slate-800 text-sm">{info.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{info.sub}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Social */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Réseaux sociaux</p>
              <div className="flex gap-3">
                {[
                  { icon: <Facebook size={18} />, label: "Facebook", cls: "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600" },
                  { icon: <Twitter size={18} />, label: "Twitter", cls: "hover:bg-sky-50 hover:border-sky-200 hover:text-sky-500" },
                  { icon: <Linkedin size={18} />, label: "LinkedIn", cls: "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700" },
                ].map((s) => (
                  <button key={s.label} className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500 transition-all ${s.cls}`}>{s.icon}{s.label}</button>
                ))}
              </div>
            </motion.div>

            {/* Map */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-3xl rotate-1 scale-105 opacity-15 blur-xl pointer-events-none" />
              <div className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-xl bg-white group">
                <div className="absolute top-3 left-3 z-20 pointer-events-none">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur px-3 py-2 shadow-sm border border-white/30">
                    <Globe size={14} className="text-green-600" />
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Siège ONMM — Nouakchott</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center pointer-events-none">
                  <div className="w-7 h-7 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120377.58554227181!2d-16.04690750402271!3d18.086395156475734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xea0cc25cd7d48d7%3A0x1d2105151b75cb45!2sNouakchott%2C%20Mauritania!5e0!3m2!1sfr!2s!4v1684347209307!5m2!1sfr!2s"
                  width="100%" height="320" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  className="relative z-10 w-full grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                  title="Siège ONMM"
                />
              </div>
            </motion.div>

            {/* Official note */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center"><Building2 size={16} className="text-green-700" /></div>
                <div>
                  <h3 className="text-sm font-bold text-green-800 mb-1">Institution officielle</h3>
                  <p className="text-xs leading-relaxed text-green-700">
                    L'ONMM est l'autorité nationale de régulation de la profession médicale en Mauritanie, établie par décret présidentiel. Toutes vos démarches passent par nos services.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label}{required && <span className="ml-1 text-green-600">*</span>}
      </label>
      {children}
    </div>
  );
}
