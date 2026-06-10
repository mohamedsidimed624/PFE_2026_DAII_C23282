import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Breadcrumb from "../components/public/Breadcrumb";
import AnnonceCard from "../components/annonces/AnnonceCard";
import AnnonceFeatured from "../components/annonces/AnnonceFeatured";
import AnnonceFilters from "../components/annonces/AnnonceFilters";
import AnnonceSkeleton from "../components/annonces/AnnonceSkeleton";
import AnnonceEmptyState from "../components/annonces/AnnonceEmptyState";
import { getPublicContenus } from "../services/publicContenuApi";

const PAGE_SIZE = 6;

export default function AnnoncesPage() {
  const [contenus, setContenus] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [type, setType] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPublicContenus({
        page: page - 1,
        size: PAGE_SIZE,
        type,
        search: submittedSearch,
      });
      setContenus(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      setError("Les publications ne sont pas disponibles pour le moment.");
    } finally {
      setLoading(false);
    }
  }, [page, type, submittedSearch]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // Revenir à la page 1 quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [type, submittedSearch]);

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

  const featured = useMemo(
    () => (page === 1 ? contenus.find((item) => item.isPinned) || null : null),
    [contenus, page]
  );

  const list = useMemo(() => {
    const filtered = contenus.filter((item) =>
      featured ? item.id !== featured.id : true
    );
    switch (sortOption) {
      case "oldest":
        return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "titleAsc":
        return [...filtered].sort((a, b) => a.title?.localeCompare(b.title));
      case "titleDesc":
        return [...filtered].sort((a, b) => b.title?.localeCompare(a.title));
      default:
        return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [contenus, featured, sortOption]);

  const hasActiveFilters = submittedSearch !== "" || type !== "";

  // Numéros de pages avec ellipsis — même logique que AnnuairePage
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const startItem = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem   = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-[108px]">
        <div className="mx-auto max-w-[1240px] px-6">
          <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Annonces" }]} />

          {/* Header */}
          <section className="pb-7 pt-7">
            <h1 className="text-[30px] font-medium tracking-tight text-slate-950">
              Annonces et actualités
            </h1>
            <p className="mt-2 max-w-[680px] text-[15px] leading-6 text-slate-500">
              Consultez les communiqués officiels, décisions, formations et
              actualités publiés par l'Ordre National des Médecins.
            </p>
          </section>

          {/* Filtres */}
          <section className="mb-10 rounded-2xl bg-[#F7F7F7] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <button
                type="button"
                className="inline-flex h-[48px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal size={16} />
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
                <span className="text-[14px] font-medium text-slate-500">
                  {loading ? "…" : `${totalElements} résultat${totalElements !== 1 ? "s" : ""}`}
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="h-[42px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 outline-none transition focus:border-[#03A84E] focus:ring-2 focus:ring-[#03A84E]/10"
                >
                  <option value="recent">Plus récent</option>
                  <option value="oldest">Plus ancien</option>
                  <option value="titleAsc">Titre A–Z</option>
                  <option value="titleDesc">Titre Z–A</option>
                </select>
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
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="text-slate-400 transition hover:text-slate-700"
                  >
                    ✕
                  </button>
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

          {/* Contenu */}
          <section className="pb-16">
            {loading ? (
              <AnnonceSkeleton />
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-sm font-medium text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={loadPage}
                  className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
                >
                  Réessayer
                </button>
              </div>
            ) : contenus.length === 0 ? (
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
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="h-5 w-1 rounded-full bg-[#03A84E]" />
                        <h2 className="text-base font-bold text-slate-900">
                          Toutes les publications
                        </h2>
                      </div>
                      {totalElements > 0 && (
                        <p className="text-[13px] text-slate-400">
                          {startItem}–{endItem} sur {totalElements}
                        </p>
                      )}
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#03A84E] hover:text-[#03A84E] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {pageNumbers.map((item, idx) =>
                      item === "..." ? (
                        <span key={idx} className="px-2 text-slate-400">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
                            page === item
                              ? "bg-[#03A84E] text-white"
                              : "border border-slate-200 text-slate-600 hover:border-[#03A84E] hover:text-[#03A84E]"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#03A84E] hover:text-[#03A84E] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
