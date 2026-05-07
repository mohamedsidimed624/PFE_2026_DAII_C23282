import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Share2,
  Check,
  Clock,
  Tag,
  FileText,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { getPublicContenuById } from "../services/publicContenuApi";
import { formatAnnonceDate, getTypeLabel } from "../utils/annonceUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const TYPE_STYLES = {
  ANNONCE:    "border-green-200 bg-green-50 text-[#16A34A]",
  ACTUALITE:  "border-blue-200 bg-blue-50 text-blue-700",
  COMMUNIQUE: "border-purple-200 bg-purple-50 text-purple-700",
  DECISION:   "border-amber-200 bg-amber-50 text-amber-700",
  EVENEMENT:  "border-rose-200 bg-rose-50 text-rose-700",
};

function estimateReadingTime(text) {
  if (!text) return null;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min de lecture`;
}

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
      setError("Cette publication n'est pas disponible ou n'existe plus.");
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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const imageSrc = annonce?.imageUrl ? `${API_BASE_URL}${annonce.imageUrl}` : null;
  const typeCls = TYPE_STYLES[annonce?.type] || "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]";
  const readingTime = estimateReadingTime(annonce?.contenu);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F8FAFC] pt-24">

        {/* Breadcrumb */}
        <div className="border-b border-[#E2E8F0] bg-white">
          <div className="mx-auto max-w-4xl px-6 py-3.5">
            <Link
              to="/annonces"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#16A34A]"
            >
              <ArrowLeft size={14} />
              Retour aux publications
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-10">
          {loading ? (
            <DetailSkeleton />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <FileText size={22} className="text-red-500" />
              </div>
              <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
              <button
                onClick={loadAnnonce}
                className="mt-5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F8FAFC]"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <article className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

              {/* Image */}
              {imageSrc && (
                <div className="h-64 overflow-hidden bg-slate-100 md:h-80">
                  <img
                    src={imageSrc}
                    alt={annonce.titre || "Image de la publication"}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 md:p-10">

                {/* Meta */}
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeCls}`}>
                    {getTypeLabel(annonce.type)}
                  </span>

                  {annonce.categorieNom && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-medium text-[#64748B]">
                      <Tag size={10} />
                      {annonce.categorieNom}
                    </span>
                  )}

                  <span className="flex items-center gap-1.5 text-xs text-[#64748B] md:ml-2">
                    <CalendarDays size={12} />
                    Publié le {formatAnnonceDate(annonce.datePublication || annonce.dateCreation)}
                  </span>

                  {readingTime && (
                    <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Clock size={12} />
                      {readingTime}
                    </span>
                  )}
                </div>

                {/* Titre */}
                <h1 className="max-w-3xl text-2xl font-bold leading-tight text-[#0F172A] md:text-3xl">
                  {annonce.titre || "Publication sans titre"}
                </h1>

                {/* Résumé */}
                {annonce.resume && (
                  <p className="mt-5 max-w-3xl border-l-4 border-[#16A34A] pl-5 text-base leading-7 text-[#64748B]">
                    {annonce.resume}
                  </p>
                )}

                {/* Corps */}
                <div className="mt-8 border-t border-[#E2E8F0] pt-8">
                  <p className="max-w-3xl whitespace-pre-line text-base leading-8 text-[#0F172A]">
                    {annonce.contenu || "Le contenu détaillé de cette publication n'est pas disponible."}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-6">
                  <Link
                    to="/annonces"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F8FAFC]"
                  >
                    <ArrowLeft size={14} />
                    Retour aux publications
                  </Link>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      copied
                        ? "border-green-200 bg-green-50 text-[#16A34A]"
                        : "border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Share2 size={14} />}
                    {copied ? "Lien copié !" : "Copier le lien"}
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="h-64 animate-pulse bg-slate-100 md:h-80" />
      <div className="space-y-4 p-6 md:p-10">
        <div className="flex gap-2">
          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
          <div className="h-5 w-28 animate-pulse rounded-full bg-slate-100" />
          <div className="h-5 w-32 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        <div className="h-36 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default AnnonceDetailPage;
