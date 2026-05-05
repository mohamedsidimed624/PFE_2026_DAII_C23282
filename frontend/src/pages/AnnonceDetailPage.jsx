import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Share2,
  Check,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { getPublicContenuById } from "../services/publicContenuApi";
import {
  formatAnnonceDate,
  getTypeLabel,
} from "../utils/annonceUtils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function AnnonceDetailPage() {
  const { id } = useParams();

  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);

  const loadAnnonce = useCallback(async () => {
    if (!id) {
      setError("Identifiant de publication invalide.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getPublicContenuById(id);
      setAnnonce(data);
    } catch (err) {
      console.error(err);
      setError("Cette publication n’est pas disponible ou n’existe plus.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnnonce();
  }, [loadAnnonce]);

  const handleCopyLink = async () => {
    try {
      if (!navigator.clipboard) return;

      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setCopied(false);
    }
  };

  const imageSrc = annonce?.imageUrl
    ? `${API_BASE_URL}${annonce.imageUrl}`
    : null;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-24">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <Link
              to="/annonces"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              <ArrowLeft size={16} />
              Retour aux publications
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-10">
          {loading ? (
            <DetailSkeleton />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm font-medium text-red-700">{error}</p>

              <Button
                variant="outline"
                onClick={loadAnnonce}
                className="mt-4 rounded-xl"
              >
                Réessayer
              </Button>
            </div>
          ) : (
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {imageSrc && (
                <div className="h-[320px] bg-slate-100 md:h-[420px]">
                  <img
                    src={imageSrc}
                    alt={annonce.titre || "Image de la publication"}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 md:p-10">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    {getTypeLabel(annonce.type)}
                  </Badge>

                  {annonce.categorieNom && (
                    <Badge variant="outline" className="text-slate-600">
                      {annonce.categorieNom}
                    </Badge>
                  )}

                  <span className="flex items-center gap-2 text-sm text-slate-500 md:ml-3">
                    <CalendarDays size={15} />
                    Publié le{" "}
                    {formatAnnonceDate(
                      annonce.datePublication || annonce.dateCreation
                    )}
                  </span>
                </div>

                <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                  {annonce.titre || "Publication sans titre"}
                </h1>

                {annonce.resume && (
                  <p className="mt-5 max-w-3xl border-l-4 border-emerald-600 pl-4 text-base leading-8 text-slate-600">
                    {annonce.resume}
                  </p>
                )}

                <div className="mt-8 border-t border-slate-100 pt-8">
                  <div className="max-w-none">
                    <p className="whitespace-pre-line text-base leading-8 text-slate-700">
                      {annonce.contenu ||
                        "Le contenu détaillé de cette publication n’est pas disponible."}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
                  <Link
                    to="/annonces"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={15} />
                    Retour aux publications
                  </Link>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {copied ? <Check size={15} /> : <Share2 size={15} />}
                    {copied ? "Lien copié" : "Copier le lien"}
                  </button>
                </div>
              </div>
            </article>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-[280px] animate-pulse bg-slate-100" />

      <div className="space-y-4 p-6 md:p-10">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-9 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        <div className="h-40 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default AnnonceDetailPage;