import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Breadcrumb from "../components/public/Breadcrumb";
import AnnonceCard from "../components/annonces/AnnonceCard";
import AnnonceFeatured from "../components/annonces/AnnonceFeatured";
import AnnonceFilters from "../components/annonces/AnnonceFilters";
import AnnonceSkeleton from "../components/annonces/AnnonceSkeleton";
import AnnonceEmptyState from "../components/annonces/AnnonceEmptyState";
import { getPublicContenus } from "../services/publicContenuApi";
import { Newspaper, SlidersHorizontal } from "lucide-react";

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
    <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Annonces" }]} />

    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-10 bg-green-600" />
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-green-600">
              <Newspaper size={12} />
              Publications officielles
            </span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Annonces & Actualités
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Retrouvez les communiqués officiels, décisions, formations et actualités publiés par l’Ordre National des Médecins.
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 px-5 py-3">
              <p className="text-xs font-medium text-slate-500">Publications affichées</p>
              <p className="text-2xl font-bold text-green-700">{totalAnnounces}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[88px] z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal size={15} />
              Filtres
            </button>

            <div className="hidden flex-1 lg:block">
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

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <span className="text-sm text-slate-500">
                {totalAnnounces} résultat{totalAnnounces !== 1 ? "s" : ""}
              </span>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
              >
                <option value="recent">Plus récent</option>
                <option value="oldest">Plus ancien</option>
                <option value="titleAsc">Titre A–Z</option>
                <option value="titleDesc">Titre Z–A</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filters */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Filtres</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <AnnonceFilters
              search={search}
              type={type}
              onSearchChange={setSearch}
              onSearchSubmit={(e) => {
                handleSearchSubmit(e);
                setShowMobileFilters(false);
              }}
              onTypeChange={handleTypeChange}
              onReset={resetFilters}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-10" ref={mainRef} tabIndex={-1}>
        {loading ? (
          <AnnonceSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={loadFirstPage}
              className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50"
            >
              Réessayer
            </button>
          </div>
        ) : allContenus.length === 0 ? (
          <AnnonceEmptyState hasFilters={hasActiveFilters} onReset={resetFilters} />
        ) : (
          <>
            {featured && (
              <div className="mb-10">
                <AnnonceFeatured annonce={featured} />
              </div>
            )}

            {list.length > 0 && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-5 w-1 rounded-full bg-green-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Toutes les publications
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((annonce) => (
                    <AnnonceCard key={annonce.id} annonce={annonce} />
                  ))}
                </div>
              </>
            )}

            {featured && list.length === 0 && (
              <p className="text-center text-sm text-slate-500">
                Aucune autre publication pour le moment.
              </p>
            )}

            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-green-500 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingMore ? "Chargement..." : "Charger plus de publications"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>

    <Footer />
  </>
)
}
