import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Vote, FileText, Calendar } from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMesCandidatures } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";
import CandidatureStatusBadge from "../../components/elections/CandidatureStatusBadge";
import ElectionStatusBadge from "../../components/elections/ElectionStatusBadge";
import ElectionTypeBadge from "../../components/elections/ElectionTypeBadge";
import EmptyState from "../../components/elections/EmptyState";

const STATUT_HINTS = {
  BROUILLON: "Brouillon non soumis — complétez votre candidature avant la clôture.",
  SOUMISE:   "Votre candidature a été déposée et attend l'examen de l'administration.",
  EN_REVUE:  "Votre dossier est en cours d'examen par l'administration.",
  VALIDEE:   "Votre candidature a été validée. Vous figurez parmi les candidats officiels.",
  REJETEE:   "Votre candidature a été rejetée. Consultez le motif ci-dessous.",
  RETIREE:   "Vous avez retiré cette candidature.",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function CandidatureCard({ c }) {
  const navigate = useNavigate();

  const electionStatut = c.electionStatut ?? c.statutElection;
  const nbDocs = c.documents?.length ?? 0;

  const actionPath = c.statut === "BROUILLON"
    ? `/medecin/elections/${c.electionId}/candidature`
    : `/medecin/elections/${c.electionId}`;

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-bold text-[14px] text-slate-800 dark:text-slate-100 leading-snug">
            {c.electionTitre ?? "—"}
          </p>
          {c.position?.libelle && (
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{c.position.libelle}</p>
          )}
        </div>
        <CandidatureStatusBadge statut={c.statut} />
      </div>

      {/* Election info */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {electionStatut && <ElectionStatusBadge statut={electionStatut} size="xs" />}
        <ElectionTypeBadge type={c.electionType ?? c.type} />
        {(c.electionCorpsElectoral === "MEDECINS_REGION" && c.electionRegion) && (
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {c.electionRegion}
          </span>
        )}
        {nbDocs > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <FileText size={9} /> {nbDocs} doc{nbDocs > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Banners */}
      {c.statut === "BROUILLON" && (
        <div className="mb-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 px-3 py-2.5">
          <p className="text-[12px] text-amber-700 dark:text-amber-400">{STATUT_HINTS.BROUILLON}</p>
        </div>
      )}
      {c.statut === "REJETEE" && c.commentaireValidation && (
        <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 px-3 py-2.5">
          <p className="text-[11px] font-bold text-red-700 dark:text-red-400 mb-0.5">Motif de rejet</p>
          <p className="text-[12px] text-red-600 dark:text-red-300">{c.commentaireValidation}</p>
        </div>
      )}
      {c.statut === "VALIDEE" && (
        <div className="mb-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 px-3 py-2.5">
          <p className="text-[12px] text-green-700 dark:text-green-400">{STATUT_HINTS.VALIDEE}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar size={11} />
          {c.dateDepot ? `Déposée le ${formatDate(c.dateDepot)}` : "Non encore soumise"}
        </span>
        <div className="flex gap-2">
          {c.statut === "BROUILLON" && (
            <button
              onClick={() => navigate(actionPath)}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-green-700 transition"
            >
              Continuer
            </button>
          )}
          <button
            onClick={() => navigate(`/medecin/elections/${c.electionId}`)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Voir l'élection
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MedecinCandidaturesPage() {
  const navigate = useNavigate();
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMesCandidatures()
      .then((res) => {
        const list = res.data ?? [];
        setCandidatures([...list].sort((a, b) => {
          if (!a.dateDepot) return -1;
          if (!b.dateDepot) return 1;
          return new Date(b.dateDepot) - new Date(a.dateDepot);
        }));
      })
      .catch((err) => setError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MedecinLayout title="Mes Candidatures">
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5">

          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Mes candidatures</h1>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              Suivi de toutes vos candidatures aux élections ONMM
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-white dark:bg-slate-900 p-6 text-center">
              <p className="text-[13px] text-red-500">{error}</p>
            </div>
          ) : candidatures.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <EmptyState
                icon={Vote}
                title="Aucune candidature"
                subtitle="Vous n'avez pas encore déposé de candidature."
                action={
                  <button
                    onClick={() => navigate("/medecin/elections")}
                    className="rounded-xl bg-green-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-green-700 transition"
                  >
                    Voir les élections
                  </button>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {candidatures.map((c) => <CandidatureCard key={c.id} c={c} />)}
            </div>
          )}

        </div>
      </div>
    </MedecinLayout>
  );
}
