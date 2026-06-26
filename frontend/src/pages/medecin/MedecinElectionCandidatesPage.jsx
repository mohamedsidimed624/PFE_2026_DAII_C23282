import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, Search, FileText, ExternalLink, X,
  ChevronLeft, ChevronRight, Award, Users, Building2, CalendarDays, CheckCircle2,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getElectionDetail } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";
import CandidateAvatar from "../../components/elections/CandidateAvatar";
import CandidatureStatusBadge from "../../components/elections/CandidatureStatusBadge";

const PAGE_SIZE = 15;

const TYPE_DOC_LABELS = {
  PHOTO:               "Photo",
  LETTRE_CANDIDATURE:  "Lettre de candidature",
  PROGRAMME_ELECTORAL: "Programme électoral",
  CV_OPTIONNEL:        "CV",
  AUTRE:               "Autre document",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fullName = (c) => `${c.medecinPrenom ?? ""} ${c.medecinNom ?? ""}`.trim();

function KpiCard({ label, value, icon, colorCls, bgCls }) {
  const Icon = icon;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className={`mt-1.5 text-[26px] font-semibold leading-none ${colorCls}`}>{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${bgCls}`}>
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function CandidateDetailModal({ candidate, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <CandidateAvatar candidate={candidate} size={44} />
            <div>
              <p className="text-[16px] font-bold text-slate-900 dark:text-slate-100">
                Dr. {candidate.medecinPrenom} {candidate.medecinNom}
              </p>
              {candidate.medecinNumeroInscription && (
                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  N° {candidate.medecinNumeroInscription}
                </p>
              )}
              <div className="mt-2">
                <CandidatureStatusBadge statut={candidate.statut} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100 border-b border-slate-100 dark:divide-slate-800 dark:border-slate-800">
            {[
              { icon: Award,        label: "Poste",      value: candidate.position?.libelle ?? "—" },
              { icon: Users,        label: "Spécialité", value: candidate.specialite ?? "—" },
              { icon: Building2,    label: "Région",     value: candidate.region ?? "—" },
              { icon: CalendarDays, label: "Déposée le", value: fmtDate(candidate.dateDepot) },
            ].map(({ icon, label, value }) => {
              const Icon = icon;
              return (
                <div key={label} className="flex items-start gap-3 px-5 py-3">
                  <Icon size={13} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-700 dark:text-slate-200">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {candidate.declarationCandidature && (
            <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Déclaration de candidature
              </p>
              <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                {candidate.declarationCandidature}
              </p>
            </div>
          )}

          {candidate.programmeElectoral && (
            <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Programme électoral
              </p>
              <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                {candidate.programmeElectoral}
              </p>
            </div>
          )}

          {candidate.documents?.length > 0 && (
            <div className="px-6 py-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Documents joints ({candidate.documents.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {candidate.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <FileText size={13} className="shrink-0" />
                    {TYPE_DOC_LABELS[doc.typeDocument] ?? doc.typeDocument}
                    <ExternalLink size={10} className="ml-0.5 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MedecinElectionCandidatesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [posteFilter, setPosteFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalCandidate, setModalCandidate] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await getElectionDetail(id);
        setElection(res.data);
      } catch (err) {
        setLoadError(extractApiError(err));
        setElection(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => { setPage(1); }, [searchQuery, posteFilter]);

  if (loading) {
    return (
      <MedecinLayout title="Chargement…">
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      </MedecinLayout>
    );
  }

  if (!election) {
    return (
      <MedecinLayout title="Introuvable">
        <div className="px-4 py-12 text-center text-slate-400">
          {loadError
            ? <span className="text-red-500">{loadError}</span>
            : "Élection introuvable."}
        </div>
      </MedecinLayout>
    );
  }

  const candidatures = election.candidatures ?? [];
  const positions    = election.positions ?? [];

  const filtered = candidatures
    .filter((c) => !searchQuery || fullName(c).toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((c) => !posteFilter || String(c.position?.id) === posteFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageNumbers = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) pageNumbers.push(p);

  const hasActiveFilters = Boolean(searchQuery || posteFilter);

  return (
    <MedecinLayout title={election.titre}>
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* Header */}
          <div>
            <button
              onClick={() => navigate(`/medecin/elections/${id}`)}
              className="mb-3 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft size={13} /> Retour à l'élection
            </button>
            <h1 className="text-[17px] font-semibold text-slate-700 dark:text-slate-200">Candidatures</h1>
            <p className="mt-0.5 text-[13px] text-slate-400">{election.titre}</p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              label="Candidats validés"
              value={candidatures.length}
              icon={CheckCircle2}
              colorCls="text-green-700 dark:text-green-400"
              bgCls="bg-green-50 text-green-600 dark:bg-green-900/20"
            />
            <KpiCard
              label="Postes électoraux"
              value={positions.length}
              icon={Award}
              colorCls="text-slate-700 dark:text-slate-100"
              bgCls="bg-slate-100 text-slate-500 dark:bg-slate-800"
            />
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-60">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom…"
                className="h-10 w-full rounded-md border border-slate-100 bg-white pl-8 pr-3 text-[13px] text-slate-600 shadow-sm outline-none focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600"
              />
            </div>

            {positions.length > 1 && (
              <select
                value={posteFilter}
                onChange={(e) => setPosteFilter(e.target.value)}
                className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] text-slate-500 shadow-sm outline-none focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Tous les postes</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>{pos.libelle}</option>
                ))}
              </select>
            )}

            {hasActiveFilters && (
              <button
                onClick={() => { setSearchQuery(""); setPosteFilter(""); }}
                className="h-10 rounded-full border border-slate-100 bg-white px-4 text-[13px] text-slate-400 shadow-sm transition hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-md bg-white shadow-sm dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="w-[28%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">Candidat</th>
                    <th className="w-[24%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">Poste</th>
                    <th className="w-[14%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">Statut</th>
                    <th className="w-[16%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">Déposée le</th>
                    <th className="w-[18%] px-7 py-5 text-left text-[13px] font-semibold uppercase text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-7 py-16 text-center text-[13px] text-slate-400">
                        {hasActiveFilters
                          ? "Aucune candidature ne correspond aux filtres sélectionnés."
                          : "Aucun candidat validé pour le moment."}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((c) => (
                      <tr key={c.id} className="border-b border-slate-100 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-3">
                            <CandidateAvatar candidate={c} size={34} />
                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                                Dr. {c.medecinPrenom} {c.medecinNom}
                              </p>
                              {c.medecinNumeroInscription && (
                                <p className="text-[12px] text-slate-400 dark:text-slate-500">N° {c.medecinNumeroInscription}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-7 py-4">
                          {c.position?.libelle ? (
                            <span className="inline-block max-w-full truncate rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[12px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                              {c.position.libelle}
                            </span>
                          ) : (
                            <span className="text-[13px] text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-7 py-4">
                          <CandidatureStatusBadge statut={c.statut} />
                        </td>
                        <td className="px-7 py-4 text-[13px] text-slate-500 dark:text-slate-400">{fmtDate(c.dateDepot)}</td>
                        <td className="px-7 py-4">
                          <button
                            onClick={() => setModalCandidate(c)}
                            title="Voir le dossier"
                            aria-label="Voir le dossier"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                          >
                            <FileText size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-7 py-5">
                <p className="text-[13px] text-slate-400">
                  {filtered.length} candidature{filtered.length > 1 ? "s" : ""}
                  {hasActiveFilters && ` sur ${candidatures.length} au total`}
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="Page précédente"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 disabled:opacity-40 dark:text-slate-500 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {pageNumbers.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        aria-current={p === page ? "page" : undefined}
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold transition ${
                          p === page
                            ? "bg-green-600 text-white"
                            : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      aria-label="Page suivante"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 disabled:opacity-40 dark:text-slate-500 dark:hover:bg-slate-800"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalCandidate && (
        <CandidateDetailModal candidate={modalCandidate} onClose={() => setModalCandidate(null)} />
      )}
    </MedecinLayout>
  );
}
