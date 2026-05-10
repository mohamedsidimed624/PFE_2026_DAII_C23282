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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Breadcrumb items={BREADCRUMB} />

      {/* ── Page header ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-10 bg-green-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">
              <BadgeCheck size={11} className="inline mr-1" />
              Registre officiel · ONMM
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Annuaire des médecins
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Vérifiez qu'un médecin est bien inscrit au registre officiel de l'Ordre
          </p>
          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            {[
              { label: "Médecins inscrits", value: "3 500+" },
              { label: "Spécialités", value: "40+" },
              { label: "Wilayas", value: "13" },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-green-600">{s.value}</span>
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-linear-to-r from-green-500 via-emerald-300 to-transparent" />
      </section>

      {/* ── Recherche dans le registre ── */}
      <section className="border-b border-slate-200 bg-white px-6 pb-4 pt-6 lg:sticky lg:top-18 lg:z-20">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#E2E8F0] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setIsSearchOpen((v) => !v)}
                className="inline-flex items-center gap-3 text-left"
                aria-expanded={isSearchOpen}
                aria-controls="registry-search-form"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-green-100 bg-green-50">
                  <ChevronDown
                    size={16}
                    className={`text-[#16A34A] transition-transform duration-200 ${isSearchOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">Recherche dans le registre</h2>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    Recherchez par identité, spécialité ou localisation
                  </p>
                </div>
              </button>

              <label className="inline-flex cursor-pointer select-none items-center gap-3">
                <span className={`text-xs font-semibold transition-colors ${isAdvancedSearch ? "text-[#16A34A]" : "text-[#64748B]"}`}>
                  Recherche avancée
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdvancedSearch((v) => !v)}
                  aria-pressed={isAdvancedSearch}
                  aria-label="Activer la recherche avancée"
                  className={`relative h-5 w-10 rounded-full transition-colors duration-200 ${isAdvancedSearch ? "bg-[#16A34A]" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${isAdvancedSearch ? "left-5" : "left-0.5"}`} />
                </button>
              </label>
            </div>

            {isSearchOpen && (
              <form id="registry-search-form" onSubmit={handleSearch} className="px-6 py-5">
                {!isAdvancedSearch && (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr_1fr_auto_auto]">
                    <Field label="Nom ou N° d'inscription">
                      <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" aria-hidden="true" />
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="Ahmed, Sidi, ORD-1001..."
                          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-[#16A34A]/15"
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
                        <RotateCcw size={14} aria-hidden="true" />
                        Réinitialiser
                      </button>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#15803d] active:scale-[.99]"
                      >
                        <Search size={14} aria-hidden="true" />
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
                        <RotateCcw size={14} aria-hidden="true" />
                        Réinitialiser
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#15803d] active:scale-[.99]"
                      >
                        <Search size={14} aria-hidden="true" />
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

      {/* ── Results ── */}
      <main className="mx-auto w-full max-w-7xl px-6 pb-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1 rounded-full bg-[#16A34A]" aria-hidden="true" />
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
              aria-label="Trier les résultats"
              className="appearance-none rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#16A34A] outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/15"
            >
              {TRIS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm" aria-hidden="true">
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
              <UserRound size={26} className="text-[#64748B]" aria-hidden="true" />
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
          <nav className="mt-10 flex flex-col items-center gap-3" aria-label="Pagination">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Page précédente"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} aria-hidden="true" />
              </button>
              {pageNumbers.map((item, idx) =>
                item === "..." ? (
                  <span key={`dot-${idx}`} className="flex h-9 w-9 items-center justify-center text-sm text-[#64748B]" aria-hidden="true">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    aria-label={`Page ${item}`}
                    aria-current={page === item ? "page" : undefined}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                      page === item
                        ? "border-[#16A34A] bg-[#16A34A] text-white"
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
                aria-label="Page suivante"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-[#64748B]">
              Affichage de {startItem}–{endItem} sur {totalElements} médecins
            </p>
          </nav>
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
  const specialite = medecin.educations?.[0]?.specialiteLibelle || medecin.specialiteLibelle || null;
  const workplace = medecin.lieuExercice || medecin.experiences?.[0]?.nomEtablissement || null;
  const ville = medecin.villeExercice || medecin.ville || null;

  return (
    <motion.div
      variants={fadeInUp}
      className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="h-0.5 bg-[#16A34A]" aria-hidden="true" />

      <div className="p-5">
        {/* Identity row */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#E2E8F0] bg-slate-100">
            {medecin.photoProfilPath ? (
              <img
                src={`${API_BASE_URL}${medecin.photoProfilPath}`}
                alt={`Photo de Dr. ${medecin.prenom} ${medecin.nom}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#16A34A] text-sm font-bold text-white" aria-hidden="true">
                {medecin.prenom?.[0]}{medecin.nom?.[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-[#0F172A]">
              Dr. {medecin.prenom} {medecin.nom}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={medecin.statut} />
              {medecin.numeroInscription && <RegistryBadge number={medecin.numeroInscription} />}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="mt-4 space-y-2 border-t border-[#E2E8F0] pt-4">
          <InfoRow icon={<Stethoscope size={13} className="text-[#16A34A]" aria-hidden="true" />} value={specialite || "Spécialité non renseignée"} />
          {ville && <InfoRow icon={<MapPin size={13} className="text-[#64748B]" aria-hidden="true" />} value={`${ville}, Mauritanie`} />}
          {workplace && <InfoRow icon={<Building2 size={13} className="text-[#64748B]" aria-hidden="true" />} value={workplace} />}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A] transition-colors hover:text-[#15803d]"
        >
          Voir le profil
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
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
