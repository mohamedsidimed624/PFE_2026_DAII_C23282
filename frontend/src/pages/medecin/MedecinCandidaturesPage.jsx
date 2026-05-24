import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Vote, ChevronRight, FileText } from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMesCandidatures } from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";

const STATUT_STYLES = {
  BROUILLON: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  SOUMISE:   "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
  EN_REVUE:  "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  VALIDEE:   "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  REJETEE:   "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400",
  RETIREE:   "bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600",
};

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  SOUMISE:   "Soumise",
  EN_REVUE:  "En revue",
  VALIDEE:   "Validée",
  REJETEE:   "Rejetée",
  RETIREE:   "Retirée",
};

const STATUT_HINTS = {
  BROUILLON: "Votre candidature n'a pas encore été soumise.",
  SOUMISE:   "Votre candidature a été déposée et attend l'examen de l'administration.",
  EN_REVUE:  "Votre dossier est en cours d'examen.",
  VALIDEE:   "Votre candidature est validée.",
  REJETEE:   "Votre candidature a été rejetée. Consultez le motif indiqué.",
  RETIREE:   "Vous avez retiré cette candidature.",
};

const TYPE_LABELS = {
  CONSEIL_NATIONAL:        "Conseil National de l'Ordre",
  BUREAU_EXECUTIF:         "Bureau exécutif",
  BUREAU_SECTION_A:        "Bureau de Section A",
  BUREAU_SECTION_B:        "Bureau de Section B",
  BUREAU_SECTION_C:        "Bureau de Section C",
  REPRESENTANTS_REGIONAUX: "Représentants régionaux",
};

const CORPS_LABELS = {
  TOUS_MEDECINS_ACTIFS:     "Tous les médecins actifs",
  MEDECINS_REGION:          "Médecins de la région",
  MEDECINS_PAR_SECTION:     "Médecins répartis selon leur section",
  MEMBRES_CONSEIL_NATIONAL: "Membres du Conseil National",
  CONSEIL_SECTION_A:        "Membres du conseil de Section A",
  CONSEIL_SECTION_B:        "Membres du conseil de Section B",
  CONSEIL_SECTION_C:        "Membres du conseil de Section C",
};

const ELECTION_STATUT_LABELS = {
  BROUILLON:               "Brouillon",
  CANDIDATURE_OUVERTE:     "Candidatures ouvertes",
  VALIDATION_CANDIDATURES: "Candidatures en validation",
  VOTE_EN_COURS:           "Vote en cours",
  DEPOUILLEMENT:           "Dépouillement",
  TERMINEE:                "Terminée",
  RESULTATS_PUBLIES:       "Résultats publiés",
  ARCHIVEE:                "Archivée",
  ANNULEE:                 "Annulée",
};

const ELECTION_STATUT_STYLES = {
  CANDIDATURE_OUVERTE:     "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  VALIDATION_CANDIDATURES: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  VOTE_EN_COURS:           "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  DEPOUILLEMENT:           "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  TERMINEE:                "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  RESULTATS_PUBLIES:       "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  ARCHIVEE:                "bg-slate-50 text-slate-400",
  ANNULEE:                 "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400",
};

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

function CandidatureCard({ c }) {
  const navigate = useNavigate();

  const electionType           = c.electionType           ?? c.type;
  const electionCorpsElectoral = c.electionCorpsElectoral ?? c.corpsElectoral;
  const electionRegion         = c.electionRegion         ?? c.region;
  const electionStatut         = c.electionStatut         ?? c.statutElection;
  const candidatureStartDate   = c.electionCandidatureStartDate ?? c.candidatureStartDate;
  const candidatureEndDate     = c.electionCandidatureEndDate   ?? c.candidatureEndDate;
  const voteStartDate          = c.electionVoteStartDate        ?? c.voteStartDate;
  const voteEndDate            = c.electionVoteEndDate          ?? c.voteEndDate;
  const actionLabel = c.statut === "BROUILLON" ? "Continuer"
    : c.peutModifier ? "Modifier ma candidature"
    : c.peutRetirer  ? "Gérer ma candidature"
    : "Voir ma candidature";
  const actionPath = c.statut === "BROUILLON"
    ? `/medecin/elections/${c.electionId}/candidature`
    : `/medecin/elections/${c.electionId}`;

  const nbDocs = c.documents?.length ?? 0;
  const isAnnulee = electionStatut === "ANNULEE";

  return (
    <li className="px-5 py-5 border-b border-slate-100 last:border-b-0 dark:border-slate-800">
      {/* Status + poste + docs */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${STATUT_STYLES[c.statut] ?? "bg-slate-100 text-slate-400"}`}>
          {STATUT_LABELS[c.statut] ?? c.statut}
        </span>
        {c.position?.libelle && (
          <span className="rounded bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400">
            {c.position.libelle}
          </span>
        )}
        {nbDocs > 0 ? (
          <span className="flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <FileText size={9} />
            {nbDocs} doc{nbDocs > 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-[10px] text-slate-300 dark:text-slate-600">Aucun document joint</span>
        )}
        {isAnnulee && (
          <span className="rounded bg-red-100 dark:bg-red-900/20 px-2 py-0.5 text-[10px] font-bold text-red-500">
            Élection annulée
          </span>
        )}
        {c.peutModifier && (
          <span className="rounded bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            Modifiable
          </span>
        )}
        {c.peutRetirer && (
          <span className="rounded bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            Retrait possible
          </span>
        )}
      </div>

      {/* Election title */}
      <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 truncate">
        {c.electionTitre ?? "—"}
      </p>

      {/* Election meta: type + corps + region */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-400">
        {electionType && (
          <span>{TYPE_LABELS[electionType] ?? electionType}</span>
        )}
        {electionCorpsElectoral && (
          <>
            {electionType && <span>·</span>}
            <span className="text-emerald-700 dark:text-emerald-400">
              {CORPS_LABELS[electionCorpsElectoral] ?? electionCorpsElectoral}
              {electionCorpsElectoral === "MEDECINS_REGION" && electionRegion
                ? ` · ${electionRegion}`
                : ""}
            </span>
          </>
        )}
      </div>

      {/* Election statut */}
      {electionStatut && (
        <div className="mt-1.5">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${ELECTION_STATUT_STYLES[electionStatut] ?? "bg-slate-100 text-slate-500"}`}>
            Élection : {ELECTION_STATUT_LABELS[electionStatut] ?? electionStatut}
          </span>
        </div>
      )}

      {/* Dates */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-400">
        <span>{c.dateDepot ? `Déposée le ${formatDateTime(c.dateDepot)}` : "Non encore déposée"}</span>
        {candidatureStartDate && (
          <span>
            Candidatures : {formatDateTime(candidatureStartDate)} → {formatDateTime(candidatureEndDate)}
          </span>
        )}
        {voteStartDate && (
          <span>
            Vote : {formatDateTime(voteStartDate)} → {formatDateTime(voteEndDate)}
          </span>
        )}
      </div>

      {/* Status hint */}
      {STATUT_HINTS[c.statut] && (
        <p className="mt-2 text-[11px] text-slate-400 italic">{STATUT_HINTS[c.statut]}</p>
      )}

      {/* Rejection reason */}
      {c.statut === "REJETEE" && c.commentaireValidation && (
        <div className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400">
          <span className="font-semibold">Motif du rejet : </span>{c.commentaireValidation}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => navigate(actionPath)}
          className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {actionLabel} <ChevronRight size={12} />
        </button>
        <span className="text-slate-200 dark:text-slate-700">|</span>
        <button
          onClick={() => navigate(`/medecin/elections/${c.electionId}`)}
          className="text-[12px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          Voir l'élection
        </button>
      </div>
    </li>
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
          if (!a.dateDepot) return 1;
          if (!b.dateDepot) return -1;
          return new Date(b.dateDepot) - new Date(a.dateDepot);
        }));
      })
      .catch((err) => setError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MedecinLayout title="Mes Candidatures">
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
              <h2 className="font-bold text-[15px] text-slate-800 dark:text-slate-100">Mes candidatures</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Suivi de toutes vos candidatures aux élections ONMM</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                <p className="text-[13px] text-red-500">{error}</p>
              </div>
            ) : candidatures.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                <Vote size={32} className="text-slate-200 dark:text-slate-700" />
                <p className="text-[13px]">Vous n'avez soumis aucune candidature.</p>
                <button
                  onClick={() => navigate("/medecin/elections")}
                  className="text-[12px] font-semibold text-blue-600 hover:underline"
                >
                  Voir les élections disponibles
                </button>
              </div>
            ) : (
              <ul>
                {candidatures.map((c) => (
                  <CandidatureCard key={c.id} c={c} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}
