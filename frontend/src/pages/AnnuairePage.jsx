import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../motion/animation";
import { getPublicMedecins } from "../services/publicAnnuaireApi";
import { getPublicSpecialites } from "../services/publicAnnuaireApi";
import {
  Search,
  MapPin,
  BadgeCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  UserRound,
  ChevronDown,
  RotateCcw,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

const PAGE_SIZE = 6;

const MEDICAL_PATTERN = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 0h6v17h17v6H23v17h-6V23H0v-6h17z' fill='%230F766E'/%3E%3C/svg%3E")`,
  backgroundSize: "40px 40px",
};

const TRIS = [
  { value: "alpha", label: "Ordre alphabétique" },
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
        console.log("Fetched medecins:", data);
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
        console.error("Erreur chargement spécialités", err);
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
    if (isAdvancedSearch) {
      setSubmittedFilters({
        nom: advancedNom.trim(),
        prenom: advancedPrenom.trim(),
        numeroInscription: advancedNumero.trim(),
        specialite: specialite === "Toutes spécialités" ? "" : specialite,
        ville: ville === "Toutes les villes" ? "" : ville,
      });
    } else {
      setSubmittedFilters({
        nom: searchInput.trim(),
        prenom: "",
        numeroInscription: "",
        specialite: specialite === "Toutes spécialités" ? "" : specialite,
        ville: ville === "Toutes les villes" ? "" : ville,
      });
    }
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* ── En-tête avec identité visuelle ── */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-linear-to-br from-teal-50/50 to-white pt-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={MEDICAL_PATTERN} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              {/* Gauche : titre */}
              <div>
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-[#0F766E]">
                  <BadgeCheck size={12} />
                  Registre officiel · ONMM
                </div>
                <h1 className="text-2xl font-bold text-[#0F172A] md:text-3xl">
                  Annuaire public des médecins
                </h1>
                <p className="mt-1.5 max-w-lg text-sm text-[#64748B]">
                  Recherchez un médecin inscrit au registre officiel de l&apos;Ordre
                  National des Médecins de Mauritanie.
                </p>
              </div>

              {/* Droite : credential de registre */}
              {!loading && (
                <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm lg:w-64">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                      <ShieldCheck size={16} className="text-[#0F766E]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#64748B]">Médecins inscrits</p>
                      <p className="text-lg font-bold text-[#0F172A]">{totalElements}</p>
                    </div>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                      Registre certifié ONMM
                    </p>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      Données officielles · République de Mauritanie
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Moteur de recherche ── */}
      <section className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 pb-4 pt-6 lg:sticky lg:top-18 lg:z-20">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#E2E8F0] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setIsSearchOpen((v) => !v)}
                className="inline-flex items-center gap-3 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-teal-50">
                  <ChevronDown
                    size={16}
                    className={`text-[#0F766E] transition-transform duration-200 ${isSearchOpen ? "rotate-180" : ""}`}
                  />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">Moteur de recherche</h2>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    Recherchez un médecin par identité ou critères professionnels
                  </p>
                </div>
              </button>

              <label className="inline-flex cursor-pointer select-none items-center gap-3">
                <span className={`text-xs font-semibold transition-colors ${isAdvancedSearch ? "text-[#0F766E]" : "text-[#64748B]"}`}>
                  Recherche avancée
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdvancedSearch((v) => !v)}
                  className={`relative h-5 w-10 rounded-full transition-colors duration-200 ${isAdvancedSearch ? "bg-[#0F766E]" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${isAdvancedSearch ? "left-5" : "left-0.5"}`} />
                </button>
              </label>
            </div>

            {isSearchOpen && (
              <form onSubmit={handleSearch} className="px-6 py-5">
                {!isAdvancedSearch && (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr_1fr_auto_auto]">
                    <Field label="Nom du médecin ou N° d'inscription">
                      <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="Ahmed, Sidi, ORD-1001..."
                          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/15"
                        />
                      </div>
                    </Field>
                    <Field label="Spécialité">
                      <SelectField value={specialite} onChange={(e) => setSpecialite(e.target.value)} options={specialitesOptions} />
                    </Field>
                    <Field label="Ville">
                      <SelectField value={ville} onChange={(e) => setVille(e.target.value)} options={villesOptions} />
                    </Field>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] transition hover:bg-[#F8FAFC]"
                      >
                        <RotateCcw size={14} />
                        Réinitialiser
                      </button>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e6b62] active:scale-[.99]"
                      >
                        <Search size={14} />
                        Rechercher
                      </button>
                    </div>
                  </div>
                )}

                {isAdvancedSearch && (
                  <div className="space-y-4">
                    <AdvancedGroup title="Qualifications">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Spécialité">
                          <SelectField value={specialite} onChange={(e) => setSpecialite(e.target.value)} options={specialitesOptions} />
                        </Field>
                      </div>
                    </AdvancedGroup>
                    <AdvancedGroup title="État civil">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Nom">
                          <AdvancedInput value={advancedNom} onChange={(e) => setAdvancedNom(e.target.value)} placeholder="Nom du médecin" />
                        </Field>
                        <Field label="Prénom">
                          <AdvancedInput value={advancedPrenom} onChange={(e) => setAdvancedPrenom(e.target.value)} placeholder="Prénom du médecin" />
                        </Field>
                        <Field label="N° d'inscription">
                          <AdvancedInput value={advancedNumero} onChange={(e) => setAdvancedNumero(e.target.value)} placeholder="Ex: ORD-1001" />
                        </Field>
                      </div>
                    </AdvancedGroup>
                    <AdvancedGroup title="Localisation">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Ville">
                          <SelectField value={ville} onChange={(e) => setVille(e.target.value)} options={villesOptions} />
                        </Field>
                      </div>
                    </AdvancedGroup>
                    <div className="flex flex-wrap justify-end gap-3 border-t border-[#E2E8F0] pt-2">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-medium text-[#0F172A] transition hover:bg-[#F8FAFC]"
                      >
                        <RotateCcw size={14} />
                        Réinitialiser
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e6b62] active:scale-[.99]"
                      >
                        <Search size={14} />
                        Rechercher
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Résultats ── */}
      <main className="mx-auto w-full max-w-7xl px-6 pb-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1 rounded-full bg-[#0F766E]" />
            <p className="text-base font-semibold text-[#0F172A]">
              {loading ? (
                <span className="text-sm font-normal text-[#64748B]">Recherche en cours…</span>
              ) : (
                <>
                  {totalElements}{" "}
                  <span className="font-normal text-[#64748B]">
                    médecin{totalElements !== 1 ? "s" : ""} trouvé{totalElements !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#64748B]">Trier par :</span>
            <select
              value={tri}
              onChange={(e) => { setTri(e.target.value); setPage(1); }}
              className="appearance-none rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#0F766E] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15"
            >
              {TRIS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
                <div className="h-0.5 bg-slate-100" />
                <div className="flex justify-between p-5">
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-20 rounded bg-slate-100" />
                    <div className="h-5 w-40 rounded bg-slate-200" />
                    <div className="h-3 w-28 rounded bg-slate-100" />
                  </div>
                  <div className="h-12 w-12 rounded-full bg-slate-100" />
                </div>
                <div className="space-y-2 border-t border-[#E2E8F0] px-5 pb-5 pt-4">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-3/4 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : medecins.length === 0 ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <UserRound size={26} className="text-[#64748B]" />
            </div>
            <h2 className="text-base font-bold text-[#0F172A]">Aucun médecin trouvé</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-[#64748B]">
              Essayez une autre recherche ou modifiez vos filtres.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {medecins.map((m) => (
              <MedecinCard key={m.id} medecin={m} onClick={() => navigate(`/annuaire/${m.id}`)} />
            ))}
          </motion.div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              {pageNumbers.map((item, idx) =>
                item === "..." ? (
                  <span key={`dot-${idx}`} className="flex h-9 w-9 items-center justify-center text-sm text-[#64748B]">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                      page === item
                        ? "border-[#0F766E] bg-[#0F766E] text-white"
                        : "border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <p className="text-xs text-[#64748B]">
              Affichage de {startItem}–{endItem} sur {totalElements} médecins
            </p>
          </div>
        )}
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
        className="w-full appearance-none rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 pr-10 text-sm text-[#0F172A] outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/15"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
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
      className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15"
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

const STATUS_CONFIG = {
  ACTIF:    { label: "Actif",     badge: "border-green-200 bg-green-50 text-green-700", dot: "bg-green-500" },
  SUSPENDU: { label: "Suspendu",  badge: "border-red-200 bg-red-50 text-red-700",       dot: "bg-red-500" },
  RETRAITE: { label: "Retraité",  badge: "border-slate-200 bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};

function MedecinCard({ medecin, onClick }) {
  const statusKey = (medecin.statut || "ACTIF").toUpperCase();
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ACTIF;

  const primaryEdu = medecin.educations?.[0];
  const specialite = primaryEdu?.specialiteLibelle || medecin.specialiteLibelle || null;
  const workplace = medecin.lieuExercice || medecin.experiences?.[0]?.nomEtablissement || null;
  const ville = medecin.villeExercice || medecin.ville || null;

  return (
    <motion.div
      variants={fadeInUp}
      className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      {/* Accent ligne */}
      <div className="h-0.5 bg-[#0F766E]" />

      <div className="p-5">
        {/* Identité */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#E2E8F0] bg-slate-100">
            {medecin.photoProfilPath ? (
              <img src={`http://localhost:8080${medecin.photoProfilPath}`} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0F766E] text-sm font-bold text-white">
                {medecin.prenom?.[0]}{medecin.nom?.[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <h3 className="mt-0.5 truncate text-sm font-bold text-[#0F172A]">
              Dr. {medecin.prenom} {medecin.nom}
            </h3>
          </div>
        </div>

        {/* Infos */}
        <div className="mt-4 space-y-2 border-t border-[#E2E8F0] pt-4">
          <CardInfoRow icon={<Stethoscope size={13} className="text-[#0F766E]" />} value={specialite || "Spécialité non renseignée"} />
          {ville && <CardInfoRow icon={<MapPin size={13} className="text-[#64748B]" />} value={`${ville}, Mauritanie`} />}
          {workplace && <CardInfoRow icon={<CreditCard size={13} className="text-[#64748B]" />} value={workplace} />}
          {medecin.numeroInscription && <CardInfoRow icon={<ShieldCheck size={13} className="text-[#64748B]" />} value={medecin.numeroInscription} />}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] transition-colors hover:text-[#0e6b62]"
        >
          Voir le profil
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function CardInfoRow({ icon, value }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#64748B]">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

export default AnnuairePage;
