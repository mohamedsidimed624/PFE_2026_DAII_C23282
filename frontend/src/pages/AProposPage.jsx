import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Target, Scale, BookOpen, Users, Award,
  ShieldCheck, Stethoscope, Globe, ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/public/Breadcrumb";

const VALUES = [
  { icon: ShieldCheck, title: "Déontologie",  desc: "Garantir l'application stricte du code de déontologie médicale en Mauritanie.",            color: "bg-green-50 text-green-600" },
  { icon: Scale,       title: "Indépendance", desc: "Exercer notre mission sans ingérence politique ou commerciale.",                             color: "bg-blue-50 text-blue-600" },
  { icon: Users,       title: "Solidarité",   desc: "Soutenir les médecins membres, défendre leurs droits et promouvoir leur bien-être.",        color: "bg-purple-50 text-purple-600" },
  { icon: Globe,       title: "Excellence",   desc: "Promouvoir une médecine de qualité en encourageant la formation continue et l'innovation.", color: "bg-amber-50 text-amber-600" },
];

const MISSIONS = [
  "Veiller au respect des règles déontologiques et éthiques de la profession médicale",
  "Instruire les plaintes et réclamations déontologiques via le Conseil de Discipline",
  "Tenir à jour le tableau de l'Ordre et délivrer les autorisations d'exercice",
  "Représenter la profession auprès des pouvoirs publics et institutions nationales",
  "Défendre l'indépendance et l'honneur de la profession médicale",
  "Œuvrer au développement de la médecine et à la formation continue des praticiens",
];

const COUNCIL = [
  { initials: "AG", role: "Assemblée Générale",     desc: "Organe suprême de l'Ordre — réunit l'ensemble des médecins inscrits",                               color: "bg-green-600" },
  { initials: "CN", role: "Conseil National",        desc: "25 membres élus : 10 (Section A) · 6 (Section B) · 6 (Section C) · 3 (wilayas intérieures)",       color: "bg-blue-600" },
  { initials: "BE", role: "Bureau Exécutif",         desc: "Élu par le Conseil National — mandat de 4 ans renouvelable, 8 fonctions dont le Président et le VP", color: "bg-purple-600" },
  { initials: "CS", role: "Conseils de Section",     desc: "Trois sections : A (généralistes), B (spécialistes), C (enseignants-chercheurs)",                    color: "bg-slate-500" },
  { initials: "CD", role: "Conseil de Discipline",   desc: "Instruit les plaintes déontologiques et prononce les sanctions disciplinaires",                       color: "bg-slate-600" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "À propos" }]} />

      {/* ── Page header ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-10 bg-green-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">À propos · ONMM</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            L'Ordre National des Médecins de Mauritanie
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Organisme d'utilité publique institué par Décret N° 2019-077 du 25 Avril 2019,
            garant de l'éthique médicale et de la qualité des soins en Mauritanie.
          </p>
        </div>
        <div className="h-px bg-linear-to-r from-green-500 via-emerald-300 to-transparent" />
      </section>

      {/* ── Mission ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          className="grid gap-12 lg:grid-cols-2 lg:items-center"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
        >
          <motion.div variants={fadeUp}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700">
              <Target size={14} />
              Notre mission
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Réguler, protéger, former
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              L'ONMM est l'organe représentatif et régulateur de la profession médicale en Mauritanie,
              institué par Décret N° 2019-077 du 25 Avril 2019. Organisme d'utilité publique doté
              de la personnalité morale et de l'autonomie financière, il a pour mission de garantir
              le respect de l'éthique médicale, de protéger les patients et de défendre les droits
              légitimes des praticiens.
            </p>
            <ul className="mt-6 space-y-3">
              {MISSIONS.map((m) => (
                <li key={m} className="flex items-start gap-3 text-sm text-slate-700">
                  <ChevronRight size={16} className="mt-0.5 shrink-0 text-green-500" />
                  {m}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5 text-white">
                <Stethoscope size={28} className="mb-2 text-white/70" />
                <p className="text-xl font-extrabold">25</p>
                <p className="text-sm text-white/80">Membres élus au Conseil National de l'Ordre</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="px-6 py-4">
                  <p className="text-2xl font-extrabold text-slate-900">3</p>
                  <p className="text-xs text-slate-500">Sections (A · B · C)</p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-2xl font-extrabold text-slate-900">5</p>
                  <p className="text-xs text-slate-500">Organes de gouvernance</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-100">
                <div className="px-6 py-4">
                  <p className="text-2xl font-extrabold text-slate-900">8</p>
                  <p className="text-xs text-slate-500">Fonctions du Bureau Exécutif</p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-2xl font-extrabold text-slate-900">4 ans</p>
                  <p className="text-xs text-slate-500">Durée du mandat (renouvelable)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Values ── */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
              <Award size={14} />
              Nos valeurs
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Principes fondateurs</h2>
            <p className="mt-2 text-sm text-slate-500">Les valeurs qui guident chacune de nos actions</p>
          </motion.div>

          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {VALUES.map((v) => (
              <motion.div
                key={v.title} variants={fadeUp}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${v.color}`}>
                  <v.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{v.title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Founding act ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
            <BookOpen size={14} />
            Acte fondateur
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Texte constitutif</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-start gap-5 rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm"
        >
          <span className="shrink-0 rounded-xl bg-green-600 px-4 py-2 text-sm font-extrabold text-white">2019</span>
          <div>
            <p className="text-sm font-bold text-slate-900">Décret N° 2019-077 du 25 Avril 2019</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              Fixant les conditions d'organisation et de fonctionnement de l'Ordre National des Médecins
              de Mauritanie — organisme d'utilité publique doté de la personnalité morale et de
              l'autonomie financière, dont l'adhésion est obligatoire pour tout médecin exerçant
              sur le territoire mauritanien.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Governance structure ── */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-sm font-semibold text-purple-700">
              <Users size={14} />
              Gouvernance
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Structure de l'Ordre</h2>
            <p className="mt-2 text-sm text-slate-500">Les cinq organes définis par le Décret N° 2019-077 (Art. 4)</p>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {COUNCIL.map((organ) => (
              <motion.div
                key={organ.role} variants={fadeUp}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${organ.color}`}>
                  {organ.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{organ.role}</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{organ.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Legal Framework ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Scale size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Cadre juridique</p>
              <p className="text-xs text-slate-500">Textes législatifs et réglementaires</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { ref: "Décret N° 2019-077",          desc: "Du 25 Avril 2019 — fixant les conditions d'organisation et de fonctionnement de l'ONMM" },
              { ref: "Code de déontologie médicale", desc: "Régissant les devoirs et droits des médecins membres de l'Ordre" },
              { ref: "Règlement intérieur",          desc: "Fixant les modalités de fonctionnement du Conseil de l'Ordre" },
            ].map((t) => (
              <div key={t.ref} className="flex items-start gap-4 px-6 py-4 transition hover:bg-slate-50">
                <span className="mt-0.5 shrink-0 rounded-lg bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">{t.ref}</span>
                <p className="text-sm text-slate-700">{t.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-green-600 py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="mx-auto max-w-3xl px-6 text-center"
        >
          <h2 className="text-2xl font-extrabold text-white">Rejoindre l'Ordre</h2>
          <p className="mt-3 text-base text-green-100">
            Vous êtes médecin et souhaitez exercer légalement en Mauritanie ? Déposez votre dossier d'adhésion en ligne.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/adhesion"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 shadow transition hover:bg-green-50"
            >
              <Stethoscope size={16} />
              Déposer ma candidature
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Nous contacter
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
