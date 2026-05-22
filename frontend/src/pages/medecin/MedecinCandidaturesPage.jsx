import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronRight, Vote } from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMesCandidatures } from "../../services/medecinElectionApi";

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

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function MedecinCandidaturesPage() {
  const navigate = useNavigate();
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMesCandidatures()
      .then((res) => setCandidatures(res.data ?? []))
      .catch(() => setCandidatures([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MedecinLayout title="Mes Candidatures">
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
              <h2 className="font-bold text-[15px] text-slate-800 dark:text-slate-100">Mes candidatures</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Toutes les candidatures que vous avez soumises</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={20} className="animate-spin text-slate-400" />
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
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {candidatures.map((c) => (
                  <li key={c.id} className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    <button
                      onClick={() => navigate(`/medecin/elections/${c.electionId}`)}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${STATUT_STYLES[c.statut] ?? "bg-slate-100 text-slate-400"}`}>
                            {STATUT_LABELS[c.statut] ?? c.statut}
                          </span>
                          {c.position?.libelle && (
                            <span className="rounded bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400">
                              {c.position.libelle}
                            </span>
                          )}
                          {c.documents?.length > 0 && (
                            <span className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              {c.documents.length} doc{c.documents.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {c.electionTitre ?? "—"}
                        </p>
                        <p className="text-[12px] text-slate-400 mt-0.5">
                          Déposée le {formatDate(c.dateDepot)}
                        </p>
                        {c.statut === "REJETEE" && c.commentaireValidation && (
                          <div className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
                            <span className="font-semibold">Motif du rejet : </span>{c.commentaireValidation}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={14} className="shrink-0 text-slate-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}
