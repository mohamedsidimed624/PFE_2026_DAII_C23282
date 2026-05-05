import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const PAGE_SIZE = 6;

const TRIS = [
  { value: "alpha", label: "Ordre alphabétique" },
  { value: "recent", label: "Plus récents" },
  { value: "ancien", label: "Plus anciens" },
];

const VILLES_MAURITANIE = [
    "Nouakchott",
    "Nouadhibou",
    "Rosso",
    "Kaédi",
    "Zouérate",
    "Atar",
    "Kiffa",
    "Néma",
    "Aioun",
    "Boghé",
    "Aleg",
    "Tidjikja",
    "Sélibaby",
    "Akjoujt",
    "Boutilimit",
    "Chinguetti",
    "Ouadane",
    "Oualata",
    "Maghama",
    "Moudjéria",
    "Bababé",
    "Tintane",
    "Guerou",
    "M’Bout",
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
    nom: "",
    prenom: "",
    numeroInscription: "",
    specialite: "",
    ville: "",
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

  const specialitesOptions = useMemo(() => {
    return [
      "Toutes spécialités",
      ...specialitesDisponibles
        .map((s) => s.libelle)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    ];
  }, [specialitesDisponibles]);

  const villesOptions = useMemo(() => {

    return ["Toutes les villes", ...VILLES_MAURITANIE];
  }, []);

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

    setSubmittedFilters({
      nom: "",
      prenom: "",
      numeroInscription: "",
      specialite: "",
      ville: "",
    });
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

      <section className="relative overflow-hidden border-b border-slate-100 bg-white px-6 pb-16 pt-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-7xl relative z-10"
        >
          <div className="max-w-3xl">
            <motion.span variants={fadeInUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700 shadow-sm">
              <BadgeCheck size={13} />
              Registre officiel
            </motion.span>

            <motion.h1 variants={fadeInUp} className="max-w-2xl text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
              Annuaire National des
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Médecins</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Consultez le registre officiel de l'Ordre National des Médecins
              Mauritanien et recherchez les praticiens inscrits par nom,
              spécialité ou numéro d'inscription.
            </motion.p>
          </div>
        </motion.div>
      </section>

      <section className="px-6 pt-6 pb-10">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/40"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-white/50">
              <button
                type="button"
                onClick={() => setIsSearchOpen((v) => !v)}
                className="inline-flex items-center gap-3 text-left"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-green-100 bg-green-50 shrink-0">
                  <ChevronDown
                    size={18}
                    className={`text-green-600 transition-transform duration-200 ${
                      isSearchOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Moteur de recherche
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Recherchez un médecin par identité ou par critères
                    professionnels
                  </p>
                </div>
              </button>

              <label className="inline-flex cursor-pointer select-none items-center gap-3 text-sm font-medium text-slate-600">
                <span
                  className={`text-sm font-semibold transition-colors ${
                    isAdvancedSearch ? "text-green-700" : "text-slate-500"
                  }`}
                >
                  Recherche avancée
                </span>

                <button
                  type="button"
                  onClick={() => setIsAdvancedSearch((v) => !v)}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                    isAdvancedSearch ? "bg-green-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                      isAdvancedSearch ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
            </div>

            {isSearchOpen && (
              <form onSubmit={handleSearch} className="px-6 py-5">
                {!isAdvancedSearch && (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr_1fr_auto_auto]">
                    <Field label="Nom du médecin ou N° d'inscription">
                      <div className="relative">
                        <Search
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="Ahmed, Sidi, ORD-1001..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15"
                        />
                      </div>
                    </Field>

                    <Field label="Spécialité">
                      <SelectField
                        value={specialite}
                        onChange={(e) => setSpecialite(e.target.value)}
                        options={specialitesOptions}
                      />
                    </Field>

                    <Field label="Ville">
                      <SelectField
                        value={ville}
                        onChange={(e) => setVille(e.target.value)}
                        options={villesOptions}
                      />
                    </Field>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <RotateCcw size={15} />
                        Réinitialiser
                      </button>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 active:scale-[.99]"
                      >
                        <Search size={15} />
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
                          <SelectField
                            value={specialite}
                            onChange={(e) => setSpecialite(e.target.value)}
                            options={specialitesOptions}
                          />
                        </Field>
                      </div>
                    </AdvancedGroup>

                    <AdvancedGroup title="État civil">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Nom">
                          <AdvancedInput
                            value={advancedNom}
                            onChange={(e) => setAdvancedNom(e.target.value)}
                            placeholder="Nom du médecin"
                          />
                        </Field>

                        <Field label="Prénom">
                          <AdvancedInput
                            value={advancedPrenom}
                            onChange={(e) => setAdvancedPrenom(e.target.value)}
                            placeholder="Prénom du médecin"
                          />
                        </Field>

                        <Field label="N° d'inscription">
                          <AdvancedInput
                            value={advancedNumero}
                            onChange={(e) => setAdvancedNumero(e.target.value)}
                            placeholder="Ex: ORD-1001"
                          />
                        </Field>
                      </div>
                    </AdvancedGroup>

                    <AdvancedGroup title="Localisation">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Ville">
                          <SelectField
                            value={ville}
                            onChange={(e) => setVille(e.target.value)}
                            options={villesOptions}
                          />
                        </Field>
                      </div>
                    </AdvancedGroup>

                    <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <RotateCcw size={15} />
                        Réinitialiser
                      </button>

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 active:scale-[.99]"
                      >
                        <Search size={15} />
                        Rechercher
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <main className="mx-auto flex-1 w-full max-w-7xl px-6 pb-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-base font-bold text-slate-800">
            {loading ? (
              <span className="text-sm font-normal text-slate-400">
                Recherche en cours…
              </span>
            ) : (
              <>
                {totalElements}{" "}
                <span className="font-normal text-slate-500">
                  médecin{totalElements !== 1 ? "s" : ""} trouvé
                  {totalElements !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">
              Trier par :
            </span>
            <select
              value={tri}
              onChange={(e) => {
                setTri(e.target.value);
                setPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-green-700 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/15"
            >
              {TRIS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
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
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex justify-between p-5">
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-20 rounded bg-slate-200" />
                    <div className="h-6 w-40 rounded bg-slate-200" />
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </div>
                  <div className="h-20 w-20 rounded-2xl bg-slate-200" />
                </div>
                <div className="space-y-2 px-5 pb-5">
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-4 h-11 w-full rounded-2xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : medecins.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UserRound size={26} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Aucun médecin trouvé
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
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
              <MedecinCard
                key={m.id}
                medecin={m}
                onClick={() => navigate(`/annuaire/${m.id}`)}
              />
            ))}
          </motion.div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              {pageNumbers.map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`dot-${idx}`}
                    className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold shadow-sm transition-colors ${
                      page === item
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Affichage de {startItem}–{endItem} sur {totalElements} médecins
            </p>
          </div>
        )}
      </main>

      <footer className="mt-4 border-t border-slate-100 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-slate-800">ONMM</p>
            <p className="mt-0.5 text-xs text-slate-400">
              © 2024 Ordre National des Médecins Mauritanien
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            {[
              "Mentions légales",
              "Politique de confidentialité",
              "Règlement de l'annuaire",
              "Code déontologique",
            ].map((label) => (
              <button
                key={label}
                className="text-xs text-slate-500 transition-colors hover:text-green-700"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </label>
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
        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-800 outline-none transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
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
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/15"
    />
  );
}

function AdvancedGroup({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

const STATUS_CONFIG = {
  ACTIF: {
    label: "Vérifié",
    badge: "border-green-200 bg-green-50 text-green-700",
    cardGlow: "from-green-600/10 via-emerald-500/5 to-transparent",
  },
  SUSPENDU: {
    label: "Suspendu",
    badge: "border-red-200 bg-red-50 text-red-700",
    cardGlow: "from-red-600/10 via-rose-500/5 to-transparent",
  },
  RETRAITE: {
    label: "Retraité",
    badge: "border-slate-200 bg-slate-100 text-slate-600",
    cardGlow: "from-slate-500/10 via-slate-400/5 to-transparent",
  },
};

function MedecinCard({ medecin, onClick }) {
  const statusKey = (medecin.statut || "ACTIF").toUpperCase();
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ACTIF;

  const specialiteDisplay =
  medecin.educations && medecin.educations.length > 0
    ? medecin.educations
        .map((e) => {
          if (e.specialiteLibelle && e.sousSpecialiteLibelle) {
            return `${e.specialiteLibelle} — ${e.sousSpecialiteLibelle}`;
          }
          return e.specialiteLibelle;
        })
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index)
        .join(", ")
    : "Spécialité non renseignée";

  return (
    <motion.div 
      variants={fadeInUp}
      className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-green-900/5 hover:border-green-200"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${status.cardGlow} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            {medecin.photoProfilPath ? (
              <img
                src={`http://localhost:8080${medecin.photoProfilPath}`}
                alt={`Dr. ${medecin.nom}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-green-800 to-emerald-600 text-xl font-bold text-white">
                {medecin.prenom?.[0]}
                {medecin.nom?.[0]}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${status.badge}`}
              >
                {status.label}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                <ShieldCheck size={11} />
                ONMM
              </span>
            </div>

            <h3 className="mt-3 line-clamp-2 text-xl font-extrabold leading-tight text-slate-900">
              Dr. {medecin.prenom} {medecin.nom}
            </h3>

            <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
              <Stethoscope size={15} />
              {specialiteDisplay}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <CardInfoRow
            icon={<MapPin size={15} className="text-slate-400" />}
            label="Localisation"
            value={
              medecin.villeExercice
                ? `${medecin.villeExercice}, Mauritanie`
                : "Ville non renseignée"
            }
          />

          <CardInfoRow
            icon={<CreditCard size={15} className="text-slate-400" />}
            label="Inscription"
            value={medecin.numeroInscription || "Non renseigné"}
          />

          <CardInfoRow
            icon={<BadgeCheck size={15} className="text-green-600" />}
            label="Référence"
            value="Inscrit au registre officiel"
            valueClass="text-green-700"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles size={13} />
            Fiche publique vérifiée
          </div>

          <button
            onClick={onClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-600"
          >
            Voir le profil
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CardInfoRow({ icon, label, value, valueClass = "text-slate-700" }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className={`mt-1 text-sm font-semibold break-words ${valueClass}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default AnnuairePage;