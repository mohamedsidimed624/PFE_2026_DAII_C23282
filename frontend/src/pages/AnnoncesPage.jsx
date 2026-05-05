import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnnonceCard from "../components/annonces/AnnonceCard";
import AnnonceFeatured from "../components/annonces/AnnonceFeatured";
import AnnonceFilters from "../components/annonces/AnnonceFilters";
import AnnonceSkeleton from "../components/annonces/AnnonceSkeleton";
import AnnonceEmptyState from "../components/annonces/AnnonceEmptyState";
import { getPublicContenus } from "../services/publicContenuApi";
import { Button } from "@/components/ui/button";
import { ShieldCheck, SlidersHorizontal, Stethoscope, FileText } from "lucide-react";

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

  // ---- Chargement initial / réinitialisation aux filtres ----
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

  // ---- Chargement de la page suivante ----
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

  const handleTypeChange = (value) => {
    setType(value);
  };

  const resetFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setType("");
    setShowMobileFilters(false);
  };

  // ---- Extraction de l'annonce épinglée (depuis TOUS les contenus chargés) ----
  const featured = useMemo(() => {
    return allContenus.find((item) => item.isPinned) || null;
  }, [allContenus]);

  // ---- Liste sans l'épinglé, triée côté client ----
  const list = useMemo(() => {
    let filtered = allContenus.filter((item) =>
      featured ? item.id !== featured.id : true
    );
    switch (sortOption) {
      case "oldest":
        return [...filtered].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "titleAsc":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case "titleDesc":
        return [...filtered].sort((a, b) => b.title.localeCompare(a.title));
      case "recent":
      default:
        return [...filtered].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [allContenus, featured, sortOption]);

  const totalAnnounces = allContenus.length;
  const hasActiveFilters = submittedSearch !== "" || type !== "";

  // ---- Focus après chargement (accessibilité) ----
  useEffect(() => {
    if (!loading && mainRef.current) {
      mainRef.current.focus({ preventScroll: true });
    }
  }, [loading]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-24">
        {/* ---- En-tête ---- */}
        <section className="relative bg-[#fcfcfc] border-b border-slate-100 overflow-hidden">
  {/* Motif de fond discret – grille de points */}
  <div
    className="absolute inset-0 opacity-[0.03]"
    style={{
      backgroundImage: `radial-gradient(circle, #0f172a 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}
  />

  {/* Sceau décoratif en arrière-plan */}
  <div className="absolute left-1/2 top-12 -translate-x-1/2 select-none pointer-events-none">
    <div className="flex items-center justify-center rounded-full border-2 border-emerald-100 p-10 w-72 h-72 text-emerald-100/60">
      <FileText size={100} strokeWidth={1} />
    </div>
  </div>

  <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
    {/* Badge officiel */}
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
      <ShieldCheck size={15} />
      Publications officielles
    </div>

    {/* Titre principal */}
    <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
      Annonces & Actualités
    </h1>

    {/* Sous-titre */}
    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
      Consultez les communiqués, décisions, annonces et événements publiés
      par l’Ordre National des Médecins de Mauritanie.
    </p>

    {/* Compteur de publications */}
    {!loading && (
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-500 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {totalAnnounces} publication{totalAnnounces > 1 ? 's' : ''} disponible{totalAnnounces > 1 ? 's' : ''}
      </div>
    )}
  </div>
</section>

        {/* ---- Contenu principal ---- */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          {/* Barre sticky : filtres desktop + tri + compteur */}
          <div className="sticky top-[72px] z-20 -mx-6 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-3">
                {/* Bouton mobile pour ouvrir les filtres */}
                <button
                  className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowMobileFilters(true)}
                  aria-label="Ouvrir les filtres"
                >
                  <SlidersHorizontal size={16} />
                  Filtres
                </button>

                {/* Filtres inline (desktop) */}
                <div className="hidden lg:flex items-center gap-3 flex-1">
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

              {/* Tri + compteur (toujours visible) */}
              <div className="flex items-center gap-3 self-end lg:self-auto">
                <span className="text-sm text-slate-500 whitespace-nowrap">
                  {totalAnnounces} résultat{totalAnnounces > 1 ? "s" : ""}
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Trier les annonces"
                >
                  <option value="recent">Plus récent</option>
                  <option value="oldest">Plus ancien</option>
                  <option value="titleAsc">Titre A-Z</option>
                  <option value="titleDesc">Titre Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Panneau mobile des filtres (bottom sheet) */}
          {showMobileFilters && (
            <div
              className="fixed inset-0 z-50 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Filtres de recherche"
            >
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filtres</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-slate-500 hover:text-slate-800"
                    aria-label="Fermer les filtres"
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

          {/* Résultats */}
          <div className="mt-8" ref={mainRef} tabIndex={-1}>
            {loading ? (
              <AnnonceSkeleton />
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-sm font-medium text-red-700">{error}</p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={loadFirstPage}
                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                  >
                    Réessayer
                  </button>
                  <a
                    href="/"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Accueil
                  </a>
                </div>
              </div>
            ) : allContenus.length === 0 ? (
              <AnnonceEmptyState
                hasFilters={hasActiveFilters}
                onReset={resetFilters}
              />
            ) : (
              <>
                {featured && (
                  <div className="mb-8">
                    <AnnonceFeatured annonce={featured} />
                  </div>
                )}

                {list.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">
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
                  <p className="text-center text-slate-500">
                    Aucune autre publication pour le moment.
                  </p>
                )}

                {/* Charger plus */}
                {hasMore && !loading && !error && (
                  <div className="mt-10 flex justify-center">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="rounded-xl px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {loadingMore ? "Chargement..." : "Charger plus d’annonces"}
                    </Button>
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