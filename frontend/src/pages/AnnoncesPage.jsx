import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnnonceCard from "../components/annonces/AnnonceCard";
import AnnonceFeatured from "../components/annonces/AnnonceFeatured";
import AnnonceFilters from "../components/annonces/AnnonceFilters";
import AnnonceSkeleton from "../components/annonces/AnnonceSkeleton";
import AnnonceEmptyState from "../components/annonces/AnnonceEmptyState";
import { getPublicContenus } from "../services/publicContenuApi";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";

const ITEMS_PER_PAGE = 9;

const MEDICAL_PATTERN = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 0h6v17h17v6H23v17h-6V23H0v-6h17z' fill='%230F766E'/%3E%3C/svg%3E")`,
  backgroundSize: "40px 40px",
};

const PUB_TYPES = [
  { label: "Annonces",    cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { label: "Actualités",  cls: "border-blue-200 bg-blue-50 text-blue-700" },
  { label: "Communiqués", cls: "border-purple-200 bg-purple-50 text-purple-700" },
  { label: "Décisions",   cls: "border-amber-200 bg-amber-50 text-amber-700" },
  { label: "Événements",  cls: "border-rose-200 bg-rose-50 text-rose-700" },
];

export default function AnnoncesPage() {
  const [allContenus, setAllContenus] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [type, setType] = useState("");

  const [sortOption, setSortOption] = useState("recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const mainRef = useRef(null);

  const loadFirstPage = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setAllContenus([]);
      setHasMore(true);
      setCurrentPage(0);

      const data = await getPublicContenus({
        page: 0,
        size: ITEMS_PER_PAGE,
        type,
        search: submittedSearch,
      });

      setAllContenus(data.content || []);
      setHasMore(
        (data.content || []).length === ITEMS_PER_PAGE &&
          (data.totalPages || 1) > 1
      );
    } catch (err) {
      console.error(err);
      setError("Les publications ne sont pas disponibles pour le moment.");
    } finally {
      setLoading(false);
    }
  }, [type, submittedSearch]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const data = await getPublicContenus({
        page: nextPage,
        size: ITEMS_PER_PAGE,
        type,
        search: submittedSearch,
      });
      const newContent = data.content || [];
      setAllContenus((prev) => [...prev, ...newContent]);
      setCurrentPage(nextPage);
      const totalPages = data.totalPages || 1;
      setHasMore(nextPage + 1 < totalPages && newContent.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, type, submittedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearch(search.trim());
  };

  const handleTypeChange = (value) => setType(value);

  const resetFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setType("");
    setShowMobileFilters(false);
  };

  const featured = useMemo(
    () => allContenus.find((item) => item.isPinned) || null,
    [allContenus]
  );

  const list = useMemo(() => {
    let filtered = allContenus.filter((item) =>
      featured ? item.id !== featured.id : true
    );
    switch (sortOption) {
      case "oldest":
        return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "titleAsc":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case "titleDesc":
        return [...filtered].sort((a, b) => b.title.localeCompare(a.title));
      case "recent":
      default:
        return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [allContenus, featured, sortOption]);

  const totalAnnounces = allContenus.length;
  const hasActiveFilters = submittedSearch !== "" || type !== "";

  useEffect(() => {
    if (!loading && mainRef.current) mainRef.current.focus({ preventScroll: true });
  }, [loading]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F8FAFC] pt-24">

        {/* ── En-tête avec identité visuelle ── */}
        <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-linear-to-br from-teal-50/50 to-white">
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={MEDICAL_PATTERN} />
          <div className="relative mx-auto max-w-5xl px-6 py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">

              {/* Gauche : texte */}
              <div className="lg:flex-1">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-[#0F766E]">
                  <ShieldCheck size={13} />
                  Publications officielles · ONMM
                </div>
                <h1 className="text-2xl font-bold text-[#0F172A] md:text-3xl">
                  Annonces et actualités
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-6 text-[#64748B]">
                  Consultez les publications officielles, communiqués et actualités
                  de l&apos;Ordre National des Médecins de Mauritanie.
                </p>
                {!loading && totalAnnounces > 0 && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 shadow-sm">
                    <span className="text-base font-bold text-[#0F172A]">{totalAnnounces}</span>
                    <span className="text-xs text-[#64748B]">
                      publication{totalAnnounces > 1 ? "s" : ""} disponible{totalAnnounces > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Droite : légende des types de publications */}
              <div className="flex flex-col gap-2.5 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm lg:w-52">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                  Types de publications
                </p>
                <div className="space-y-1.5">
                  {PUB_TYPES.map((t) => (
                    <span
                      key={t.label}
                      className={`flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${t.cls}`}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contenu principal ── */}
        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Barre sticky */}
          <div className="sticky top-18 z-20 -mx-6 border-b border-[#E2E8F0] bg-white px-6 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <button
                  className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                  onClick={() => setShowMobileFilters(true)}
                  aria-label="Ouvrir les filtres"
                >
                  <SlidersHorizontal size={15} />
                  Filtres
                </button>
                <div className="hidden lg:flex flex-1 items-center gap-3">
                  <AnnonceFilters
                    search={search}
                    type={type}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    onTypeChange={handleTypeChange}
                    onReset={resetFilters}
                    compact
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 self-end lg:self-auto">
                <span className="text-sm text-[#64748B] whitespace-nowrap">
                  {totalAnnounces} résultat{totalAnnounces > 1 ? "s" : ""}
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
                  aria-label="Trier les annonces"
                >
                  <option value="recent">Plus récent</option>
                  <option value="oldest">Plus ancien</option>
                  <option value="titleAsc">Titre A–Z</option>
                  <option value="titleDesc">Titre Z–A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Panneau mobile */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#0F172A]">Filtres</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
                </div>
                <AnnonceFilters
                  search={search}
                  type={type}
                  onSearchChange={setSearch}
                  onSearchSubmit={(e) => { handleSearchSubmit(e); setShowMobileFilters(false); }}
                  onTypeChange={handleTypeChange}
                  onReset={resetFilters}
                />
              </div>
            </div>
          )}

          {/* Résultats */}
          <div className="mt-8" ref={mainRef} tabIndex={-1}>
            {loading ? (
              <AnnonceSkeleton />
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-sm font-medium text-red-700">{error}</p>
                <div className="mt-4 flex justify-center gap-3">
                  <button onClick={loadFirstPage} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">
                    Réessayer
                  </button>
                  <a href="/" className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F8FAFC]">
                    Accueil
                  </a>
                </div>
              </div>
            ) : allContenus.length === 0 ? (
              <AnnonceEmptyState hasFilters={hasActiveFilters} onReset={resetFilters} />
            ) : (
              <>
                {featured && (
                  <div className="mb-8">
                    <AnnonceFeatured annonce={featured} />
                  </div>
                )}

                {list.length > 0 && (
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="h-5 w-1 rounded-full bg-[#0F766E]" />
                      <h2 className="text-base font-semibold text-[#0F172A]">
                        Toutes les publications
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {list.map((annonce) => (
                        <AnnonceCard key={annonce.id} annonce={annonce} />
                      ))}
                    </div>
                  </div>
                )}

                {featured && list.length === 0 && !loading && !error && (
                  <p className="text-center text-sm text-[#64748B]">
                    Aucune autre publication pour le moment.
                  </p>
                )}

                {hasMore && !loading && !error && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="rounded-xl border border-[#E2E8F0] bg-white px-8 py-3 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:border-[#0F766E] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingMore ? "Chargement..." : "Charger plus de publications"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
