import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PublicHero from "../components/public/PublicHero";
import {
  Info, Target, Scale, BookOpen, Users, Award,
  ShieldCheck, Stethoscope, Globe, ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/public/Breadcrumb";

const VALUES = [
  { icon: ShieldCheck, title: "Déontologie",    desc: "Garantir l'application stricte du code de déontologie médicale en Mauritanie.",             color: "bg-green-50 text-green-600" },
  { icon: Scale,       title: "Indépendance",   desc: "Exercer notre mission sans ingérence politique ou commerciale.",                              color: "bg-blue-50 text-blue-600" },
  { icon: Users,       title: "Solidarité",     desc: "Soutenir les médecins membres, défendre leurs droits et promouvoir leur bien-être.",         color: "bg-purple-50 text-purple-600" },
  { icon: Globe,       title: "Excellence",     desc: "Promouvoir une médecine de qualité en encourageant la formation continue et l'innovation.",  color: "bg-amber-50 text-amber-600" },
];

const MISSIONS = [
  "Veiller au respect des règles déontologiques par les médecins membres",
  "Instruire les plaintes et réclamations concernant des actes médicaux",
  "Tenir et mettre à jour l'annuaire des médecins autorisés à exercer",
  "Représenter la profession médicale auprès des institutions nationales",
  "Organiser des formations continues pour le développement des compétences",
  "Délivrer et gérer les autorisations d'exercice de la médecine",
];

const COUNCIL = [
  { name: "Pr. Mohamed Ould Salem",    role: "Président",             initials: "MS" },
  { name: "Dr. Fatima Mint Ahmed",     role: "Vice-Présidente",       initials: "FA" },
  { name: "Dr. Hamoud Ould Bilal",     role: "Secrétaire Général",    initials: "HB" },
  { name: "Dr. Mariam Bint Cheikh",    role: "Trésorière",            initials: "MC" },
  { name: "Dr. Sidi Ould Moussa",      role: "Membre du Conseil",     initials: "SM" },
  { name: "Dr. Aminetou Mint Yahya",   role: "Membre du Conseil",     initials: "AY" },
];

const HISTORY = [
  { year: "1999", event: "Création de l'Ordre National des Médecins de Mauritanie par décret" },
  { year: "2003", event: "Adoption du premier code de déontologie médicale national" },
  { year: "2010", event: "Lancement du registre électronique des médecins" },
  { year: "2018", event: "Réforme des statuts et modernisation de la gouvernance" },
  { year: "2023", event: "Lancement de la plateforme numérique de services aux médecins" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "À propos" }]} />

      <PublicHero
        badgeIcon={Info}
        badgeText="À propos · ONMM"
        title="L'Ordre National des Médecins de Mauritanie"
        subtitle="Institution régulatrice de la profession médicale en Mauritanie, garante de l'éthique et de la qualité des soins depuis 1999."
      />

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
              L'ONMM est l'organe représentatif et régulateur de la profession médicale en Mauritanie.
              Institué par la loi, il a pour vocation de garantir le respect de l'éthique médicale,
              de protéger les patients et de défendre les droits légitimes des praticiens.
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
                <p className="text-xl font-extrabold">+3 500</p>
                <p className="text-sm text-white/80">Médecins inscrits à l'Ordre</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="px-6 py-4">
                  <p className="text-2xl font-extrabold text-slate-900">25+</p>
                  <p className="text-xs text-slate-500">Années d'existence</p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-2xl font-extrabold text-slate-900">13</p>
                  <p className="text-xs text-slate-500">Wilayas couvertes</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-100">
                <div className="px-6 py-4">
                  <p className="text-2xl font-extrabold text-slate-900">40+</p>
                  <p className="text-xs text-slate-500">Spécialités médicales</p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-2xl font-extrabold text-slate-900">200+</p>
                  <p className="text-xs text-slate-500">Dossiers traités / an</p>
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

      {/* ── History ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
            <BookOpen size={14} />
            Notre histoire
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Moments clés</h2>
        </motion.div>

        <motion.div
          className="relative space-y-0 pl-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
        >
          {HISTORY.map((h, i) => (
            <motion.div key={h.year} variants={fadeUp} className="relative pb-8 last:pb-0">
              <div className="absolute -left-5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-green-500 bg-white">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <div className="ml-4 flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="shrink-0 rounded-lg bg-green-50 px-3 py-1 text-xs font-bold text-green-700">{h.year}</span>
                <p className="text-sm text-slate-700">{h.event}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Council ── */}
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
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Le Conseil de l'Ordre</h2>
            <p className="mt-2 text-sm text-slate-500">Membres élus pour représenter et diriger l'institution</p>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {COUNCIL.map((member, i) => (
              <motion.div
                key={member.name} variants={fadeUp}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  i === 0 ? "bg-green-600" : i === 1 ? "bg-blue-600" : "bg-slate-500"
                }`}>
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
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
              { ref: "Loi N° 93-08",     desc: "Relative à l'exercice de la médecine en Mauritanie" },
              { ref: "Décret N° 99-152", desc: "Portant création de l'Ordre National des Médecins" },
              { ref: "Code de déontologie médicale", desc: "Adopté en 2003, régissant les devoirs et droits des médecins" },
              { ref: "Règlement intérieur", desc: "Fixant les modalités de fonctionnement du Conseil de l'Ordre" },
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
