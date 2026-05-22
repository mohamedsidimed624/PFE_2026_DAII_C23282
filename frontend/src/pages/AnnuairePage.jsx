import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Breadcrumb from "../components/public/Breadcrumb";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../motion/animation";
import StatusBadge from "../components/public/StatusBadge";
import RegistryBadge from "../components/public/RegistryBadge";
import { getPublicMedecins, getPublicSpecialites } from "../services/publicAnnuaireApi";
import {
  Search,
  MapPin,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  UserRound,
  ChevronDown,
  RotateCcw,
  Stethoscope,
  Building2,
} from "lucide-react";

const BREADCRUMB = [{ label: "Accueil", to: "/" }, { label: "Annuaire médical" }];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const PAGE_SIZE = 6;

const TRIS = [
  { value: "alpha",  label: "Ordre alphabétique" },
  { value: "recent", label: "Plus récents" },
  { value: "ancien", label: "Plus anciens" },
];

const VILLES_MAURITANIE = [
  "Nouakchott", "Nouadhibou", "Rosso", "Kaédi", "Zouérate", "Atar",
  "Kiffa", "Néma", "Aioun", "Boghé", "Aleg", "Tidjikja", "Sélibaby",
  "Akjoujt", "Boutilimit", "Chinguetti", "Ouadane", "Oualata", "Maghama",
  "Moudjéria", "Bababé", "Tintane", "Guerou", "M'Bout",
];

function AnnuairePage() {
  const navigate = useNavigate();

  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [specialite, setSpecialite] = useState("Toutes spécialités");
  const [ville, setVille] = useState("Toutes les villes");
  const [tri, setTri] = useState("alpha");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);

  const [advancedNom, setAdvancedNom] = useState("");
  const [advancedPrenom, setAdvancedPrenom] = useState("");
  const [advancedNumero, setAdvancedNumero] = useState("");

  const [specialitesDisponibles, setSpecialitesDisponibles] = useState([]);

  const [submittedFilters, setSubmittedFilters] = useState({
    nom: "", prenom: "", numeroInscription: "", specialite: "", ville: "",
  });

  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPublicMedecins({
          nom: submittedFilters.nom,
          prenom: submittedFilters.prenom,
          numeroInscription: submittedFilters.numeroInscription,
          specialite: submittedFilters.specialite,
          ville: submittedFilters.ville,
          page: page - 1,
          size: PAGE_SIZE,
          sort: tri,
        });
        setMedecins(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger l'annuaire.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedecins();
  }, [submittedFilters, page, tri]);

  useEffect(() => {
    const fetchSpecialites = async () => {
      try {
        const data = await getPublicSpecialites();
        setSpecialitesDisponibles(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSpecialites();
  }, []);

  const specialitesOptions = useMemo(() => [
    "Toutes spécialités",
    ...specialitesDisponibles.map((s) => s.libelle).filter(Boolean).sort((a, b) => a.localeCompare(b)),
  ], [specialitesDisponibles]);

  const villesOptions = useMemo(() => ["Toutes les villes", ...VILLES_MAURITANIE], []);

  const startItem = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalElements);

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedFilters(
      isAdvancedSearch
        ? {
            nom: advancedNom.trim(),
            prenom: advancedPrenom.trim(),
            numeroInscription: advancedNumero.trim(),
            specialite: specialite === "Toutes spécialités" ? "" : specialite,
            ville: ville === "Toutes les villes" ? "" : ville,
          }
        : {
            nom: searchInput.trim(),
            prenom: "",
            numeroInscription: "",
            specialite: specialite === "Toutes spécialités" ? "" : specialite,
            ville: ville === "Toutes les villes" ? "" : ville,
          }
    );
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setAdvancedNom("");
    setAdvancedPrenom("");
    setAdvancedNumero("");
    setSpecialite("Toutes spécialités");
    setVille("Toutes les villes");
    setTri("alpha");
    setPage(1);
    setSubmittedFilters({ nom: "", prenom: "", numeroInscription: "", specialite: "", ville: "" });
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  // Garde tes imports et ta logique, remplace surtout le JSX du return
// + remplace MedecinCard par celui-ci en bas

return (
  <div className="min-h-screen bg-white">
    <Navbar />

    <main className="pt-28">
      <div className="mx-auto max-w-7xl px-6">
        <Breadcrumb items={BREADCRUMB} />

        {/* Header proche Home */}
        <section className="pb-10 pt-8">
          <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-green-600">
            <BadgeCheck size={15} />
            Registre officiel ONMM
          </span>

          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Annuaire des{" "}
            <span className="text-green-600">médecins inscrits</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
            Recherchez un médecin inscrit à l’Ordre National des Médecins par nom,
            spécialité ou ville d’exercice.
          </p>
        </section>

        {/* Recherche */}
        <section className="mb-10 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Nom, prénom ou numéro d'inscription..."
                  className="h-13 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                />
              </div>

              <select
                value={specialite}
                onChange={(e) => setSpecialite(e.target.value)}
                className="h-13 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
              >
                {specialitesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="h-13 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
              >
                {villesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="h-13 rounded-2xl bg-green-600 px-7 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Rechercher
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-700"
              >
                <RotateCcw size={14} />
                Réinitialiser
              </button>

              <select
                value={tri}
                onChange={(e) => {
                  setTri(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none"
              >
                {TRIS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </section>

        {/* Résultats */}
        <section className="pb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {loading ? "Recherche en cours..." : `${totalElements} médecin(s) trouvé(s)`}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="h-[390px] animate-pulse rounded-3xl border border-slate-100 bg-slate-50"
                />
              ))}
            </div>
          ) : medecins.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white py-20 text-center shadow-sm">
              <UserRound size={34} className="mx-auto text-slate-300" />
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Aucun médecin trouvé
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Essayez une autre recherche ou modifiez les filtres.
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3"
            >
              {medecins.map((m) => (
                <MedecinCard
                  key={m.id}
                  medecin={m}
                  onClick={() => navigate(`/annuaire/${m.id}`)}
                />
              ))}
            </motion.div>
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((item, idx) =>
                item === "..." ? (
                  <span key={idx} className="px-2 text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`h-10 w-10 rounded-xl text-sm font-semibold ${
                      page === item
                        ? "bg-green-600 text-white"
                        : "border border-slate-200 text-slate-600"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </main>

    <Footer />
  </div>
);
}

/* ── Sub-components ── */

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#64748B]">{label}</label>
      {children}
    </div>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 pr-10 text-sm text-[#0F172A] outline-none transition focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-[#16A34A]/15"
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" aria-hidden="true" />
    </div>
  );
}

function AdvancedInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/15"
    />
  );
}

function AdvancedGroup({ title, children }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">{title}</p>
      {children}
    </div>
  );
}

function MedecinCard({ medecin, onClick }) {
  const specialite =
    medecin.educations?.[0]?.specialiteLibelle ||
    medecin.specialiteLibelle ||
    "Spécialité non renseignée";

  const workplace =
    medecin.lieuExercice ||
    medecin.experiences?.[0]?.nomEtablissement ||
    "Lieu d’exercice non renseigné";

  const ville = medecin.villeExercice || medecin.ville || null;

  return (
    <motion.article
      variants={fadeInUp}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
    >
      <div className="relative h-40 bg-green-50">
        {medecin.photoProfilPath ? (
          <img
            src={`${API_BASE_URL}${medecin.photoProfilPath}`}
            alt={`Dr. ${medecin.prenom} ${medecin.nom}`}
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-600 text-3xl font-bold text-white">
              {medecin.prenom?.[0]}
              {medecin.nom?.[0]}
            </div>
          </div>
        )}

        <div className="absolute left-4 top-4">
          <StatusBadge status={medecin.statut} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-bold text-slate-900">
          Dr. {medecin.prenom} {medecin.nom}
        </h3>

        {medecin.numeroInscription && (
          <div className="mt-2">
            <RegistryBadge number={medecin.numeroInscription} />
          </div>
        )}

        <div className="mt-3 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <Stethoscope size={16} className="text-green-600" />
            <span className="line-clamp-1">{specialite}</span>
          </div>

          <div className="flex items-center gap-3">
            <Building2 size={16} className="text-slate-400" />
            <span className="line-clamp-1">{workplace}</span>
          </div>

          {ville && (
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-slate-400" />
              <span>{ville}, Mauritanie</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-semibold text-green-600">
            Voir le profil
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function InfoRow({ icon, value }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#64748B]">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

export default AnnuairePage;
