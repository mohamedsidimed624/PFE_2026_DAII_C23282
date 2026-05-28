import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Trophy, CheckCircle2,
  XCircle, PlayCircle, StopCircle, Archive, Ban, Star, Clock,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import {
  getElectionById, getResultats, ouvrirCandidatures, cloturerCandidatures,
  validerCandidature, rejeterCandidature, ouvrirVotes, cloturerVotes,
  terminerDepouillement, publierResultats, archiverElection, annulerElection,
  getPositions, getAuditLog,
} from "../../services/adminElectionApi";
import ElectionStatusBadge from "../../components/elections/ElectionStatusBadge";
import ElectionTypeBadge from "../../components/elections/ElectionTypeBadge";
import CandidatureStatusBadge from "../../components/elections/CandidatureStatusBadge";
import ElectionTimeline from "../../components/elections/ElectionTimeline";

const STATUT_ORDER = [
  "BROUILLON", "CANDIDATURE_OUVERTE", "VALIDATION_CANDIDATURES",
  "VOTE_EN_COURS", "DEPOUILLEMENT", "RESULTATS_PUBLIES", "ARCHIVEE",
];
function computeTimelineStatus(currentStatut, targetStatut) {
  const curr = STATUT_ORDER.indexOf(currentStatut);
  const tgt  = STATUT_ORDER.indexOf(targetStatut);
  if (curr < 0 || tgt < 0) return "pending";
  if (curr > tgt) return "done";
  if (curr === tgt) return "active";
  return "pending";
}
const formatDateShort = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : null;

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

const STATUT_STYLES = {
  BROUILLON:               "bg-slate-100 text-slate-500",
  CANDIDATURE_OUVERTE:     "bg-blue-100 text-blue-700",
  VALIDATION_CANDIDATURES: "bg-amber-100 text-amber-700",
  VOTE_EN_COURS:           "bg-green-100 text-green-700",
  DEPOUILLEMENT:           "bg-purple-100 text-purple-700",
  TERMINEE:                "bg-slate-200 text-slate-600",
  RESULTATS_PUBLIES:       "bg-amber-100 text-amber-700",
  ARCHIVEE:                "bg-slate-100 text-slate-400",
  ANNULEE:                 "bg-red-100 text-red-500",
};

const STATUT_LABELS = {
  BROUILLON:               "Brouillon",
  CANDIDATURE_OUVERTE:     "Candidatures ouvertes",
  VALIDATION_CANDIDATURES: "Validation candidatures",
  VOTE_EN_COURS:           "Vote en cours",
  DEPOUILLEMENT:           "Dépouillement",
  TERMINEE:                "Terminée",
  RESULTATS_PUBLIES:       "Résultats publiés",
  ARCHIVEE:                "Archivée",
  ANNULEE:                 "Annulée",
};

const CAND_STYLES = {
  BROUILLON:  "bg-slate-100 text-slate-400",
  SOUMISE:    "bg-slate-100 text-slate-500",
  EN_REVUE:   "bg-amber-100 text-amber-600",
  VALIDEE:    "bg-green-100 text-green-700",
  REJETEE:    "bg-red-100 text-red-500",
  RETIREE:    "bg-slate-50 text-slate-400",
};

const CAND_LABELS = {
  BROUILLON: "Brouillon",
  SOUMISE:   "Soumise",
  EN_REVUE:  "En revue",
  VALIDEE:   "Validée",
  REJETEE:   "Rejetée",
  RETIREE:   "Retirée",
};

const formatDt = (d) =>
  d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const TABS = ["Informations", "Candidatures", "Postes électoraux", "Résultats", "Historique"];

function ActionBtn({ icon, label, onClick, color = "blue", disabled = false }) {
  const Icon = icon;
  const cls = {
    blue:  "bg-blue-700 hover:bg-blue-800 text-white",
    green: "bg-green-700 hover:bg-green-800 text-white",
    amber: "bg-amber-500 hover:bg-amber-600 text-white",
    red:   "border border-red-200 text-red-500 hover:bg-red-50",
    slate: "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
  }[color];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${cls} disabled:opacity-40`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

export default function AdminElectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [resultats, setResultats] = useState(null);
  const [positions, setPositions] = useState([]);
  const [auditLogs, setAuditLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [rejComment, setRejComment] = useState({});
  const [annulerModal, setAnnulerModal] = useState(false);
  const [annulerRaison, setAnnulerRaison] = useState("");
  const [actionErr, setActionErr] = useState("");

  const load = async () => {
    setLoading(true);
    setResultats(null);
    try {
      const res = await getElectionById(id);
      setElection(res.data);
      const s = res.data.statut;
      if (["DEPOUILLEMENT", "TERMINEE", "RESULTATS_PUBLIES", "ARCHIVEE"].includes(s)) {
        const rRes = await getResultats(id);
        setResultats(rRes.data);
      }
      const pRes = await getPositions(id);
      setPositions(pRes.data);
    } catch {
      setElection(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const doAction = async (fn) => {
    setActionErr("");
    try {
      await fn();
      load();
    } catch (err) {
      setActionErr(err?.response?.data?.message ?? "Erreur");
    }
  };

  const confirmThenDo = (message, fn) => {
    if (window.confirm(message)) doAction(fn);
  };

  const loadAudit = async () => {
    if (auditLogs !== null) return;
    try {
      const res = await getAuditLog(id);
      setAuditLogs(res.data);
    } catch {
      setAuditLogs([]);
    }
  };

  const confirmAnnuler = async () => {
    setActionErr("");
    try {
      await annulerElection(id, annulerRaison);
      setAnnulerModal(false);
      setAnnulerRaison("");
      load();
    } catch (err) {
      setActionErr(err?.response?.data?.message ?? "Erreur");
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Chargement…">
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      </AdminLayout>
    );
  }

  if (!election) {
    return (
      <AdminLayout title="Élection introuvable">
        <div className="px-7 py-12 text-center text-slate-400">Élection introuvable.</div>
      </AdminLayout>
    );
  }

  const s = election.statut;
  const now = new Date();
  const canOpenCandidatures =
    s === "BROUILLON" &&
    election.candidatureStartDate &&
    now >= new Date(election.candidatureStartDate) &&
    election.candidatureEndDate &&
    now < new Date(election.candidatureEndDate);

  return (
    <AdminLayout title={election.titre}>
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-7 py-6">

        {/* Annuler modal */}
        {annulerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-[15px]">Annuler l'élection</h3>
              <p className="text-[13px] text-slate-500 mb-3">Veuillez saisir la raison de l'annulation :</p>
              <textarea
                rows={3}
                autoFocus
                placeholder="Raison de l'annulation…"
                className="mb-3 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[13px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-400"
                value={annulerRaison}
                onChange={(e) => setAnnulerRaison(e.target.value)}
              />
              {actionErr && <p className="mb-3 text-[12px] text-red-500">{actionErr}</p>}
              <div className="flex justify-end gap-2">
                <button onClick={() => { setAnnulerModal(false); setActionErr(""); }} className="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50">
                  Fermer
                </button>
                <button
                  onClick={confirmAnnuler}
                  disabled={!annulerRaison.trim()}
                  className="rounded-md bg-red-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-600 disabled:opacity-40"
                >
                  Confirmer l'annulation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header card */}
        <div className="mb-6 overflow-hidden rounded-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate("/admin/processus/elections")}
                className="mt-0.5 rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft size={16} className="text-slate-500" />
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <ElectionStatusBadge statut={s} />
                  <ElectionTypeBadge type={election.type} />
                  {election.region && (
                    <span className="text-[12px] text-slate-400">· {election.region}</span>
                  )}
                  <span className="text-[12px] text-slate-400">· {election.seatsCount} siège(s)</span>
                  {election.corpsElectoral && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      {CORPS_LABELS[election.corpsElectoral] ?? election.corpsElectoral}
                      {election.corpsElectoral === "MEDECINS_REGION" && election.region
                        ? ` · ${election.region}`
                        : ""}
                    </span>
                  )}
                </div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{election.titre}</h1>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {actionErr && <p className="w-full text-[12px] text-red-500">{actionErr}</p>}
              {s === "BROUILLON" && canOpenCandidatures && (
                <ActionBtn icon={PlayCircle} label="Ouvrir candidatures" color="blue"
                  onClick={() => doAction(() => ouvrirCandidatures(id))} />
              )}
              {s === "BROUILLON" && !canOpenCandidatures && (
                <ActionBtn icon={PlayCircle}
                  label={election.candidatureStartDate
                    ? `Ouverture prévue le ${formatDt(election.candidatureStartDate)}`
                    : "Ouvrir candidatures"}
                  color="slate"
                  disabled />
              )}
              {s === "CANDIDATURE_OUVERTE" && (
                <ActionBtn icon={StopCircle} label="Clôturer candidatures" color="amber"
                  onClick={() => confirmThenDo("Clôturer les candidatures ? Aucune nouvelle candidature ne pourra être déposée.", () => cloturerCandidatures(id))} />
              )}
              {s === "VALIDATION_CANDIDATURES" && (
                <ActionBtn icon={PlayCircle} label="Ouvrir le vote" color="green"
                  onClick={() => confirmThenDo("Ouvrir le vote ? Les médecins éligibles pourront voter.", () => ouvrirVotes(id))} />
              )}
              {s === "VOTE_EN_COURS" && (
                <ActionBtn icon={StopCircle} label="Clôturer le vote" color="amber"
                  onClick={() => confirmThenDo("Clôturer le vote ? L'élection passera en phase de dépouillement.", () => cloturerVotes(id))} />
              )}
              {s === "DEPOUILLEMENT" && (
                <ActionBtn icon={CheckCircle2} label="Terminer dépouillement" color="amber"
                  onClick={() => confirmThenDo("Terminer le dépouillement ? Les résultats pourront ensuite être publiés.", () => terminerDepouillement(id))} />
              )}
              {s === "TERMINEE" && (
                <ActionBtn icon={Trophy} label="Publier résultats" color="green"
                  onClick={() => confirmThenDo("Publier les résultats ? Ils deviendront visibles pour les utilisateurs concernés.", () => publierResultats(id))} />
              )}
              {(s === "TERMINEE" || s === "RESULTATS_PUBLIES") && (
                <ActionBtn icon={Archive} label="Archiver" color="slate"
                  onClick={() => confirmThenDo("Archiver cette élection ? Elle ne pourra plus être modifiée.", () => archiverElection(id))} />
              )}
              {s !== "ARCHIVEE" && s !== "ANNULEE" && (
                <ActionBtn icon={Ban} label="Annuler" color="red"
                  onClick={() => { setActionErr(""); setAnnulerModal(true); }} />
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => { setTab(i); if (i === 4) loadAudit(); }}
                className={`whitespace-nowrap px-6 py-3.5 text-[13px] font-semibold border-b-2 transition-colors ${
                  tab === i
                    ? "border-[#16A34A] text-[#16A34A]"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                {t}
                {t === "Candidatures" && (
                  <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px]">
                    {election.candidatures?.length ?? 0}
                  </span>
                )}
                {t === "Postes électoraux" && (
                  <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px]">
                    {positions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Tab 0: Informations */}
            {tab === 0 && (
              <div className="space-y-6">
                {election.description && (
                  <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">{election.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Candidatures", value: `${formatDt(election.candidatureStartDate)} → ${formatDt(election.candidatureEndDate)}` },
                    { label: "Vote", value: `${formatDt(election.voteStartDate)} → ${formatDt(election.voteEndDate)}` },
                    { label: "Sièges", value: election.seatsCount },
                    { label: "Votes max.", value: election.maxVotesParElecteur },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-md bg-slate-50 dark:bg-slate-800 p-4">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">{label}</p>
                      <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{value}</p>
                    </div>
                  ))}
                </div>
                {/* Process timeline */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
                  <p className="text-[11px] font-bold uppercase text-slate-400 mb-3">Avancement du processus</p>
                  <ElectionTimeline steps={[
                    { label: "Candidatures",  date: formatDateShort(election.candidatureStartDate), status: computeTimelineStatus(s, "CANDIDATURE_OUVERTE") },
                    { label: "Validation",    date: formatDateShort(election.candidatureEndDate),   status: computeTimelineStatus(s, "VALIDATION_CANDIDATURES") },
                    { label: "Vote",          date: formatDateShort(election.voteStartDate),        status: computeTimelineStatus(s, "VOTE_EN_COURS") },
                    { label: "Dépouillement", date: null,                                           status: computeTimelineStatus(s, "DEPOUILLEMENT") },
                    { label: "Résultats",     date: null,                                           status: computeTimelineStatus(s, "RESULTATS_PUBLIES") },
                  ]} />
                </div>
                {election.raisonAnnulation && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 p-4">
                    <p className="text-[12px] font-semibold text-red-600 mb-1">Raison d'annulation</p>
                    <p className="text-[13px] text-red-500">{election.raisonAnnulation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 1: Candidatures */}
            {tab === 1 && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/admin/processus/elections/${id}/candidats`)}
                    className="rounded-lg bg-blue-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-800"
                  >
                    Vue complète des candidats →
                  </button>
                </div>
                {(!election.candidatures || election.candidatures.length === 0) ? (
                  <p className="py-8 text-center text-[13px] text-slate-400">Aucune candidature</p>
                ) : (
                  election.candidatures.map((c) => (
                    <div key={c.id} className="rounded-md border border-slate-100 dark:border-slate-800 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              Dr. {c.medecinPrenom} {c.medecinNom}
                            </span>
                            <CandidatureStatusBadge statut={c.statut} />
                            {c.position && (
                              <span className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                                {c.position.libelle}
                              </span>
                            )}
                          </div>
                          {c.specialite && <p className="text-[12px] text-slate-400">{c.specialite}</p>}
                          {c.declarationCandidature && (
                            <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-400 line-clamp-2">
                              {c.declarationCandidature}
                            </p>
                          )}
                          {c.commentaireValidation && (
                            <p className="mt-1 text-[12px] text-amber-600 italic">Note: {c.commentaireValidation}</p>
                          )}
                        </div>
                        {(c.statut === "SOUMISE" || c.statut === "EN_REVUE") &&
                          (s === "CANDIDATURE_OUVERTE" || s === "VALIDATION_CANDIDATURES") && (
                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() => doAction(() => validerCandidature(id, c.id))}
                              className="flex items-center gap-1 rounded-md bg-green-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-green-800"
                            >
                              <CheckCircle2 size={12} /> Valider
                            </button>
                            <div className="flex gap-1">
                              <input
                                placeholder="Motif de rejet…"
                                className="h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none"
                                value={rejComment[c.id] ?? ""}
                                onChange={(e) => setRejComment((p) => ({ ...p, [c.id]: e.target.value }))}
                              />
                              <button
                                onClick={() => doAction(() => rejeterCandidature(id, c.id, rejComment[c.id] ?? ""))}
                                disabled={!rejComment[c.id]?.trim()}
                                className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <XCircle size={12} /> Rejeter
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Postes électoraux */}
            {tab === 2 && (
              <div className="space-y-4">
                <p className="text-[12px] text-slate-400 italic">
                  Les postes sont générés automatiquement selon le type d'élection et ne sont pas modifiables depuis cette page.
                </p>
                {positions.length === 0 ? (
                  <p className="py-8 text-center text-[13px] text-slate-400">Aucun poste défini.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {positions.map((p) => (
                      <li key={p.id} className="px-4 py-3">
                        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{p.libelle}</span>
                        <span className="ml-2 text-[11px] text-slate-400">ordre {p.ordre} · {p.nombreSieges} siège(s)</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Tab 3: Résultats */}
            {tab === 3 && (
              <div>
                {!resultats ? (
                  <p className="py-8 text-center text-[13px] text-slate-400">
                    {s === "VOTE_EN_COURS" || s === "VALIDATION_CANDIDATURES" || s === "CANDIDATURE_OUVERTE" || s === "BROUILLON"
                      ? "Les résultats seront disponibles après la clôture du vote."
                      : "Résultats non disponibles."}
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-4">
                        <p className="text-[10px] uppercase text-slate-400 mb-1">Votants</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{resultats.nbVotants}</p>
                      </div>
                      <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-4">
                        <p className="text-[10px] uppercase text-slate-400 mb-1">Participation</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                          {resultats.tauxParticipation?.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Validity banner */}
                    {resultats.messageResultat && (
                      <div className={`rounded-md px-4 py-3 border text-[13px] font-semibold ${
                        resultats.resultatsValidables
                          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-700 dark:text-green-300"
                          : "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/10 dark:border-orange-700 dark:text-orange-300"
                      }`}>
                        {resultats.messageResultat}
                      </div>
                    )}

                    {/* Ex-aequo warning */}
                    {resultats.contientExAequo && (
                      <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 dark:bg-amber-900/10 dark:border-amber-700">
                        <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300">
                          {resultats.messageExAequo ?? "Des candidats sont à égalité de voix."}
                        </p>
                      </div>
                    )}

                    {resultats.resultatsParPosition ? (
                      resultats.resultatsParPosition.map((rPos) => {
                        const maxVotes = rPos.candidats?.[0]?.nbVotes ?? 1;
                        return (
                          <div key={rPos.position.id} className="space-y-2">
                            <p className="text-[12px] font-bold uppercase text-slate-500 dark:text-slate-400">
                              {rPos.position.libelle} — {rPos.position.nombreSieges} siège(s)
                            </p>
                            {rPos.candidats.map((c, i) => {
                              const isWinner = rPos.gagnants?.some((g) => g.id === c.id);
                              const pct = maxVotes > 0 ? (c.nbVotes / maxVotes) * 100 : 0;
                              return (
                                <div key={c.id} className={`rounded-md border p-4 ${isWinner ? "border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10" : "border-slate-100 dark:border-slate-800"}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {isWinner && <Star size={14} className="text-amber-500" />}
                                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                                        {i + 1}. Dr. {c.medecinPrenom} {c.medecinNom}
                                      </span>
                                      {c.exAequo && (
                                        <span className="rounded bg-amber-100 dark:bg-amber-900/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                          Ex-æquo
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{c.nbVotes} vote(s)</span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.6, ease: "easeOut" }}
                                      className={`h-2 rounded-full ${isWinner ? "bg-amber-400" : "bg-blue-500"}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })
                    ) : (
                      resultats.tousLesCandidats?.map((c, i) => {
                        const isWinner = resultats.gagnants?.some((g) => g.id === c.id);
                        const maxVotes = resultats.tousLesCandidats?.[0]?.nbVotes ?? 1;
                        const pct = maxVotes > 0 ? (c.nbVotes / maxVotes) * 100 : 0;
                        return (
                          <div key={c.id} className={`rounded-md border p-4 ${isWinner ? "border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10" : "border-slate-100 dark:border-slate-800"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {isWinner && <Star size={14} className="text-amber-500" />}
                                <span className="font-semibold text-slate-800 dark:text-slate-100">
                                  {i + 1}. Dr. {c.medecinPrenom} {c.medecinNom}
                                </span>
                                {c.exAequo && (
                                  <span className="rounded bg-amber-100 dark:bg-amber-900/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                    Ex-æquo
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{c.nbVotes} vote(s)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`h-2 rounded-full ${isWinner ? "bg-amber-400" : "bg-blue-500"}`}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Historique */}
            {tab === 4 && (
              <div>
                {auditLogs === null ? (
                  <div className="flex py-12 justify-center">
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <p className="py-8 text-center text-[13px] text-slate-400">Aucun événement enregistré.</p>
                ) : (
                  <ul className="space-y-2">
                    {auditLogs.map((log) => {
                      const severityStyle = log.severity === "ERROR"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : log.severity === "WARNING"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                      return (
                        <li key={log.id} className="flex items-start gap-3 rounded-md border border-slate-100 dark:border-slate-800 px-4 py-3">
                          <Clock size={13} className="mt-0.5 shrink-0 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {log.severity && (
                                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${severityStyle}`}>
                                  {log.severity}
                                </span>
                              )}
                              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{log.action}</span>
                              <span className="text-[11px] text-slate-400">par {log.acteurEmail}</span>
                            </div>
                            {(log.entityType || log.entityId) && (
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {log.entityType}{log.entityId != null ? ` #${log.entityId}` : ""}
                              </p>
                            )}
                            {log.details && (
                              <p className="mt-0.5 text-[11px] text-slate-500">{log.details}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-[11px] text-slate-400">{formatDt(log.dateAction)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
