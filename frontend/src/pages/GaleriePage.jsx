import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PublicHero from "../components/public/PublicHero";
import { Images, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Breadcrumb from "../components/public/Breadcrumb";

const CATEGORIES = ["Tous", "Événements", "Formations", "Cérémonies", "Congrès"];

const GALLERY = [
  { id: 1, category: "Événements",  title: "Assemblée générale 2024",        year: "2024", color: "from-green-400 to-emerald-600" },
  { id: 2, category: "Formations",  title: "Séminaire de formation médicale", year: "2024", color: "from-blue-400 to-blue-600" },
  { id: 3, category: "Cérémonies",  title: "Cérémonie d'investiture",         year: "2023", color: "from-purple-400 to-purple-600" },
  { id: 4, category: "Congrès",     title: "Congrès national de médecine",    year: "2023", color: "from-amber-400 to-orange-500" },
  { id: 5, category: "Formations",  title: "Atelier de chirurgie",            year: "2023", color: "from-teal-400 to-cyan-600" },
  { id: 6, category: "Événements",  title: "Journée mondiale de la santé",    year: "2023", color: "from-rose-400 to-red-500" },
  { id: 7, category: "Cérémonies",  title: "Remise des diplômes",             year: "2022", color: "from-indigo-400 to-indigo-600" },
  { id: 8, category: "Congrès",     title: "Forum médical africain",          year: "2022", color: "from-green-500 to-lime-500" },
  { id: 9, category: "Événements",  title: "Journée de prévention santé",     year: "2022", color: "from-sky-400 to-blue-500" },
];

const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function GaleriePage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [lightbox, setLightbox]             = useState(null); // index

  const filtered = activeCategory === "Tous"
    ? GALLERY
    : GALLERY.filter((g) => g.category === activeCategory);

  const openLightbox  = (idx) => setLightbox(idx);
  const closeLightbox = ()    => setLightbox(null);
  const prev = () => setLightbox((i) => (i - 1 + filtered.length) % filtered.length);
  const next = () => setLightbox((i) => (i + 1) % filtered.length);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Galerie" }]} />

      <PublicHero
        badgeIcon={Images}
        badgeText="Galerie · ONMM"
        title="Galerie photographique"
        subtitle="Retrouvez les moments forts de l'Ordre National des Médecins de Mauritanie — événements, formations, cérémonies et congrès."
      />

      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                activeCategory === cat
                  ? "border-green-500 bg-green-600 text-white shadow-sm shadow-green-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:text-green-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div
          key={activeCategory}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden" animate="show"
        >
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              onClick={() => openLightbox(idx)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Placeholder image (gradient) */}
              <div className={`relative h-52 bg-gradient-to-br ${item.color}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Images size={40} className="text-white/30" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Zoom overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white">
                    <ZoomIn size={22} />
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.year}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Images size={40} className="text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Aucune photo dans cette catégorie</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              {/* Image placeholder */}
              <div className={`relative h-80 sm:h-[450px] w-full rounded-2xl bg-gradient-to-br ${filtered[lightbox]?.color} flex items-center justify-center overflow-hidden`}>
                <Images size={60} className="text-white/20" />
              </div>

              {/* Caption */}
              <div className="mt-4 text-center">
                <p className="text-base font-semibold text-white">{filtered[lightbox]?.title}</p>
                <p className="text-sm text-white/60">{filtered[lightbox]?.category} · {filtered[lightbox]?.year}</p>
              </div>

              {/* Controls */}
              <button onClick={closeLightbox}
                className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <X size={18} />
              </button>
              <button onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm">
                <ChevronLeft size={20} />
              </button>
              <button onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm">
                <ChevronRight size={20} />
              </button>

              {/* Counter */}
              <p className="mt-3 text-center text-xs text-white/40">{lightbox + 1} / {filtered.length}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
