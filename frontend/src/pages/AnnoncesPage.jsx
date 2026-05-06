import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PublicHero from "../components/public/PublicHero";
import AnnonceCard from "../components/annonces/AnnonceCard";
import AnnonceFeatured from "../components/annonces/AnnonceFeatured";
import AnnonceFilters from "../components/annonces/AnnonceFilters";
import AnnonceSkeleton from "../components/annonces/AnnonceSkeleton";
import AnnonceEmptyState from "../components/annonces/AnnonceEmptyState";
import { getPublicContenus } from "../services/publicContenuApi";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";

const ITEMS_PER_PAGE = 9;

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
      const data = await getPublicContenus({ page: 0, size: ITEMS_PER_PAGE, type, search: submittedSearch });
      setAllContenus(data.content || []);
      setHasMore((data.content || []).length === ITEMS_PER_PAGE && (data.totalPages || 1) > 1);
    } catch (err) {
      console.error(err);
      setError("Les publications ne sont pas disponibles pour le moment.");
    } finally {
      setLoading(false);
    }
  }, [type, submittedSearch]);

  useEffect(() => { loadFirstPage(); }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const data = await getPublicContenus({ page: nextPage, size: ITEMS_PER_PAGE, type, search: submittedSearch });
      const newContent = data.content || [];
      setAllContenus((prev) => [...prev, ...newContent]);
      setCurrentPage(nextPage);
      setHasMore(nextPage + 1 < (data.totalPages || 1) && newContent.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, type, submittedSearch]);

  const handleSearchSubmit = (e) => { e.preventDefault(); setSubmittedSearch(search.trim()); };
  const handleTypeChange = (value) => setType(value);
  const resetFilters = () => { setSearch(""); setSubmittedSearch(""); setType(""); setShowMobileFilters(false); };

  const featured = useMemo(() => allContenus.find((item) => item.isPinned) || null, [allContenus]);

  const list = useMemo(() => {
    const filtered = allContenus.filter((item) => (featured ? item.id !== featured.id : true));
    switch (sortOption) {
      case "oldest":   return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "titleAsc": return [...filtered].sort((a, b) => a.title?.localeCompare(b.title));
      case "titleDesc":return [...filtered].sort((a, b) => b.title?.localeCompare(a.title));
      default:         return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

      <main className="min-h-screen bg-[#F8FAFC]">
        <PublicHero
          badgeIcon={ShieldCheck}
          badgeText="Publications officielles · ONMM"
          title="Annonces et actualités"
          subtitle="Consultez les publications officielles, communiqués et actualités de l'Ordre National des Médecins de Mauritanie."
        />

        <section className="mx-auto max-w-7xl px-6 py-10">
          {/* Sticky filter bar */}
          <div className="sticky top-18 z-20 -mx-6 border-b border-[#E2E8F0] bg-white px-6 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <button
                  className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                  onClick={() => setShowMobileFilters(true)}
                  aria-label="Ouvrir les filtres"
                >
                  <SlidersHorizontal size={15} aria-hidden="true" />
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
                  {totalAnnounces} résultat{totalAnnounces !== 1 ? "s" : ""}
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  aria-label="Trier les annonces"
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
                >
                  <option value="recent">Plus récent</option>
                  <option value="oldest">Plus ancien</option>
                  <option value="titleAsc">Titre A–Z</option>
                  <option value="titleDesc">Titre Z–A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile filter sheet */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres de recherche">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#0F172A]">Filtres</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-[#64748B] hover:text-[#0F172A]" aria-label="Fermer les filtres">✕</button>
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

          {/* Results */}
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
                      <div className="h-5 w-1 rounded-full bg-[#0F766E]" aria-hidden="true" />
                      <h2 className="text-base font-semibold text-[#0F172A]">Toutes les publications</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {list.map((annonce) => (
                        <AnnonceCard key={annonce.id} annonce={annonce} />
                      ))}
                    </div>
                  </div>
                )}

                {featured && list.length === 0 && (
                  <p className="text-center text-sm text-[#64748B]">Aucune autre publication pour le moment.</p>
                )}

                {hasMore && (
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
