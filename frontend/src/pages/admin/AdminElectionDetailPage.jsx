import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Trophy,
  PlayCircle, StopCircle, Archive, Ban, Clock,
  Building2, CalendarDays, Users, AlertCircle, MapPin, Hash,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import {
  getElectionById, getResultats, ouvrirCandidatures, cloturerCandidatures,
  ouvrirVotes, cloturerVotes, publierResultats, archiverElection, annulerElection,
  getPositions, getAuditLog,
} from "../../services/adminElectionApi";
import ElectionStatusBadge from "../../components/elections/ElectionStatusBadge";
import ElectionTypeBadge from "../../components/elections/ElectionTypeBadge";
import ElectionTimeline from "../../components/elections/ElectionTimeline";

/* ─────────────────────────────────────────────────────────────
   Constants & helpers — inchangés
───────────────────────────────────────────────────────────── */

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
  RESULTATS_PUBLIES:       "Résultats publiés",
  ARCHIVEE:                "Archivée",
  ANNULEE:                 "Annulée",
};


const formatDt = (d) =>
  d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const TABS = ["Informations", "Candidatures", "Postes électoraux", "Résultats", "Historique"];

/* Status accent bar color */
const STATUS_ACCENT = {
  BROUILLON:               "bg-slate-300",
  CANDIDATURE_OUVERTE:     "bg-blue-500",
  VALIDATION_CANDIDATURES: "bg-amber-500",
  VOTE_EN_COURS:           "bg-green-600",
  DEPOUILLEMENT:           "bg-violet-500",
  RESULTATS_PUBLIES:       "bg-green-500",
  ARCHIVEE:                "bg-slate-400",
  ANNULEE:                 "bg-red-500",
};

/* ─────────────────────────────────────────────────────────────
   UI atoms
───────────────────────────────────────────────────────────── */

function ActionBtn({ icon, label, onClick, color = "slate", disabled = false }) {
  const Icon = icon;
  const styles = {
    green: "bg-green-600 text-white shadow-sm hover:bg-green-700",
    blue:  "bg-blue-600  text-white shadow-sm hover:bg-blue-700",
    amber: "bg-amber-500 text-white shadow-sm hover:bg-amber-600",
    slate: "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
    red:   "border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/60 dark:text-red-400 dark:hover:bg-red-950/20",
  }[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center gap-2 rounded-md px-4 text-[13px] font-semibold transition ${styles} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <p className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {children}
      </p>
      <div className="flex-1 border-t border-slate-100 dark:border-slate-800" />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-baseline gap-4 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="text-[13px] text-slate-700 dark:text-slate-200">{value || "—"}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */

export default function AdminElectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [resultats, setResultats] = useState(null);
  const [positions, setPositions] = useState([]);
  const [auditLogs, setAuditLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [annulerModal, setAnnulerModal] = useState(false);
  const [annulerRaison, setAnnulerRaison] = useState("");
  const [actionErr, setActionErr] = useState("");

  const load = async () => {
    setLoading(true);
    setResultats(null);
    try {
      const res = await getElectionById(id);
      setElection(res.data);
      const st = res.data.statut;
      if (["DEPOUILLEMENT", "RESULTATS_PUBLIES", "ARCHIVEE"].includes(st)) {
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

  /* Loading */
  if (loading) {
    return (
      <AdminLayout title="Chargement…">
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={22} className="animate-spin text-slate-400" />
        </div>
      </AdminLayout>
    );
  }

  if (!election) {
    return (
      <AdminLayout title="Élection introuvable">
        <div className="px-7 py-20 text-center text-[14px] text-slate-400">
          Élection introuvable.
        </div>
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

  const showDestructive = s !== "ARCHIVEE" && s !== "ANNULEE";
  const hasOperationalAction =
    canOpenCandidatures ||
    s === "CANDIDATURE_OUVERTE" ||
    s === "VALIDATION_CANDIDATURES" ||
    s === "VOTE_EN_COURS" ||
    s === "DEPOUILLEMENT" ||
    s === "RESULTATS_PUBLIES";

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <AdminLayout title={election.titre}>
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">

        {/* Annuler modal */}
        {annulerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
                    Annuler l'élection
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-400">
                    Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="px-6 py-5">
                <label htmlFor="annuler-raison-detail" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Raison de l'annulation *
                </label>
                <textarea
                  id="annuler-raison-detail"
                  rows={3}
                  autoFocus
                  placeholder="Indiquez la raison de l'annulation…"
                  className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  value={annulerRaison}
                  onChange={(e) => setAnnulerRaison(e.target.value)}
                />
                {actionErr && (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] text-red-600 dark:text-red-400">
                    <AlertCircle size={12} /> {actionErr}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
                <button
                  onClick={() => { setAnnulerModal(false); setActionErr(""); }}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Fermer
                </button>
                <button
                  onClick={confirmAnnuler}
                  disabled={!annulerRaison.trim()}
                  className="rounded-md bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
                >
                  Confirmer l'annulation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────── */}
        <div className="mb-5 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Status accent bar */}
          <div className={`h-0.5 w-full ${STATUS_ACCENT[s] || "bg-slate-300"}`} />

          <div className="px-6 py-5">
            {/* Top row: back + status badge */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => navigate("/admin/processus/elections")}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <ArrowLeft size={14} />
                Retour aux élections
              </button>
              <ElectionStatusBadge statut={s} />
            </div>

            {/* Election title */}
            <h1 className="text-[20px] font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
              {election.titre}
            </h1>

            {/* Metadata row */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <ElectionTypeBadge type={election.type} />
              {election.corpsElectoral && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="flex items-center gap-1 text-[13px] text-slate-500 dark:text-slate-400">
                    <Users size={12} />
                    {CORPS_LABELS[election.corpsElectoral] ?? election.corpsElectoral}
                  </span>
                </>
              )}
              {election.region && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="flex items-center gap-1 text-[13px] text-slate-500 dark:text-slate-400">
                    <MapPin size={12} />
                    {election.region}
                  </span>
                </>
              )}
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-[13px] text-slate-500 dark:text-slate-400">
                {election.seatsCount} siège{election.seatsCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Action bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {/* Operational actions */}
              {s === "BROUILLON" && canOpenCandidatures && (
                <ActionBtn icon={PlayCircle} label="Ouvrir les candidatures" color="blue"
                  onClick={() => doAction(() => ouvrirCandidatures(id))} />
              )}
              {s === "BROUILLON" && !canOpenCandidatures && (
                <ActionBtn icon={PlayCircle}
                  label={election.candidatureStartDate
                    ? `Ouverture prévue le ${formatDt(election.candidatureStartDate)}`
                    : "Ouvrir les candidatures"}
                  color="slate"
                  disabled />
              )}
              {s === "CANDIDATURE_OUVERTE" && (
                <ActionBtn icon={StopCircle} label="Clôturer les candidatures" color="amber"
                  onClick={() => confirmThenDo(
                    "Clôturer les candidatures ? Aucune nouvelle candidature ne pourra être déposée.",
                    () => cloturerCandidatures(id)
                  )} />
              )}
              {s === "VALIDATION_CANDIDATURES" && (
                <ActionBtn icon={PlayCircle} label="Ouvrir le vote" color="green"
                  onClick={() => confirmThenDo(
                    "Ouvrir le vote ? Les médecins éligibles pourront voter.",
                    () => ouvrirVotes(id)
                  )} />
              )}
              {s === "VOTE_EN_COURS" && (
                <ActionBtn icon={StopCircle} label="Clôturer le vote" color="amber"
                  onClick={() => confirmThenDo(
                    "Clôturer le vote ? L'élection passera en phase de dépouillement.",
                    () => cloturerVotes(id)
                  )} />
              )}
              {s === "DEPOUILLEMENT" && (
                <ActionBtn icon={Trophy} label="Publier les résultats" color="green"
                  onClick={() => confirmThenDo(
                    "Publier les résultats ? Ils deviendront visibles pour les utilisateurs concernés.",
                    () => publierResultats(id)
                  )} />
              )}
              {s === "RESULTATS_PUBLIES" && (
                <ActionBtn icon={Archive} label="Archiver" color="slate"
                  onClick={() => confirmThenDo(
                    "Archiver cette élection ? Elle ne pourra plus être modifiée.",
                    () => archiverElection(id)
                  )} />
              )}

              {/* Visual separator between operational and destructive */}
              {showDestructive && hasOperationalAction && (
                <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />
              )}

              {/* Destructive action */}
              {showDestructive && (
                <ActionBtn icon={Ban} label="Annuler l'élection" color="red"
                  onClick={() => { setActionErr(""); setAnnulerModal(true); }} />
              )}
            </div>

            {/* Action error */}
            {actionErr && !annulerModal && (
              <p className="mt-3 flex items-center gap-1.5 text-[12px] text-red-600 dark:text-red-400">
                <AlertCircle size={12} /> {actionErr}
              </p>
            )}
          </div>
        </div>

        {/* ── Tabs + content ─────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => { setTab(i); if (i === 4) loadAudit(); }}
                className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-6 py-3.5 text-[13px] font-semibold transition-colors ${
                  tab === i
                    ? "text-green-600 dark:text-green-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {t}
                {t === "Candidatures" && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {election.candidatures?.length ?? 0}
                  </span>
                )}
                {t === "Postes électoraux" && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {positions.length}
                  </span>
                )}
                {/* Active indicator */}
                {tab === i && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-green-600 dark:bg-green-500"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">

            {/* ── Tab 0: Informations ─────────────────────── */}
            {tab === 0 && (
              <div className="space-y-6">
                {/* Description */}
                {/* {election.description && (
                  <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/30">
                    <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {election.description}
                    </p>
                  </div>
                )} */}

                {/* Election parameters */}
                <div>
                  <SectionLabel>Paramètres électoraux</SectionLabel>
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
                      <InfoRow
                        label="Corps électoral"
                        value={CORPS_LABELS[election.corpsElectoral] ?? election.corpsElectoral}
                      />
                      <InfoRow
                        label="Nombre de sièges"
                        value={`${election.seatsCount} siège${election.seatsCount !== 1 ? "s" : ""}`}
                      />
                      <InfoRow
                        label="Votes par électeur"
                        value={`${election.maxVotesParElecteur} maximum`}
                      />
                      {election.region && (
                        <InfoRow label="Région" value={election.region} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div>
                  <SectionLabel>Calendrier électoral</SectionLabel>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* Phase 1 */}
                    <div className="overflow-hidden rounded-lg border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/30">
                        <CalendarDays size={13} className="text-slate-400" />
                        <p className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                          Phase 1 — Candidatures
                        </p>
                      </div>
                      <div className="divide-y divide-slate-100 px-4 dark:divide-slate-800">
                        <InfoRow label="Ouverture" value={formatDt(election.candidatureStartDate)} />
                        <InfoRow label="Clôture"   value={formatDt(election.candidatureEndDate)} />
                      </div>
                    </div>

                    {/* Phase 2 */}
                    <div className="overflow-hidden rounded-lg border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/30">
                        <CalendarDays size={13} className="text-slate-400" />
                        <p className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                          Phase 2 — Vote
                        </p>
                      </div>
                      <div className="divide-y divide-slate-100 px-4 dark:divide-slate-800">
                        <InfoRow label="Ouverture" value={formatDt(election.voteStartDate)} />
                        <InfoRow label="Clôture"   value={formatDt(election.voteEndDate)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process timeline */}
                <div>
                  <SectionLabel>Avancement du processus</SectionLabel>
                  <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/60 px-5 py-5 dark:border-slate-800 dark:bg-slate-800/30">
                    <ElectionTimeline steps={[
                      { label: "Candidatures",  date: formatDateShort(election.candidatureStartDate), status: computeTimelineStatus(s, "CANDIDATURE_OUVERTE") },
                      { label: "Validation",    date: formatDateShort(election.candidatureEndDate),   status: computeTimelineStatus(s, "VALIDATION_CANDIDATURES") },
                      { label: "Vote",          date: formatDateShort(election.voteStartDate),        status: computeTimelineStatus(s, "VOTE_EN_COURS") },
                      { label: "Dépouillement", date: null,                                           status: computeTimelineStatus(s, "DEPOUILLEMENT") },
                      { label: "Résultats",     date: null,                                           status: computeTimelineStatus(s, "RESULTATS_PUBLIES") },
                    ]} />
                  </div>
                </div>

                {/* Annulation reason */}
                {election.raisonAnnulation && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 dark:border-red-800/40 dark:bg-red-950/20">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                      <AlertCircle size={13} />
                      Raison d'annulation
                    </p>
                    <p className="text-[13px] leading-relaxed text-red-700 dark:text-red-300">
                      {election.raisonAnnulation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 1: Candidatures ─────────────────────── */}
            {tab === 1 && (
              <div className="space-y-6">
                {/* Synthèse par statut */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    { label: "Total",    count: election.candidatures?.length ?? 0,
                      cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
                    { label: "Soumises", count: election.candidatures?.filter(c => c.statut === "SOUMISE").length ?? 0,
                      cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
                    { label: "En revue", count: election.candidatures?.filter(c => c.statut === "EN_REVUE").length ?? 0,
                      cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
                    { label: "Validées", count: election.candidatures?.filter(c => c.statut === "VALIDEE").length ?? 0,
                      cls: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
                    { label: "Rejetées", count: election.candidatures?.filter(c => c.statut === "REJETEE").length ?? 0,
                      cls: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" },
                  ].map(({ label, count, cls }) => (
                    <div key={label} className={`flex flex-col items-center rounded-lg px-4 py-3 text-center ${cls}`}>
                      <span className="text-[22px] font-bold">{count}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA vers la page de gestion dédiée */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => navigate(`/admin/processus/elections/${id}/candidats`)}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-green-700"
                  >
                    Gérer les candidatures →
                  </button>
                </div>
              </div>
            )}

            {/* ── Tab 2: Postes électoraux ────────────────── */}
            {tab === 2 && (
              <div className="space-y-4">
                <p className="text-[12px] italic text-slate-400 dark:text-slate-500">
                  Les postes électoraux sont générés automatiquement selon le type d'élection. Ils ne sont pas modifiables depuis cette page.
                </p>

                {positions.length === 0 ? (
                  <div className="py-16 text-center text-[13px] text-slate-400 dark:text-slate-500">
                    Aucun poste défini.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40">
                          <th className="w-12 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Ord.
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Libellé du poste
                          </th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Sièges
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {positions.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="px-4 py-3 text-[13px] tabular-nums text-slate-400">
                              {p.ordre}
                            </td>
                            <td className="px-4 py-3 text-[13px] font-medium text-slate-700 dark:text-slate-200">
                              {p.libelle}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-green-50 px-1.5 text-[12px] font-bold text-green-600 dark:bg-green-950/30 dark:text-green-400">
                                {p.nombreSieges}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 3: Résultats ────────────────────────── */}
            {tab === 3 && (
              <div>
                {!resultats ? (
                  <div className="py-16 text-center text-[13px] text-slate-400 dark:text-slate-500">
                    {["VOTE_EN_COURS", "VALIDATION_CANDIDATURES", "CANDIDATURE_OUVERTE", "BROUILLON"].includes(s)
                      ? "Les résultats seront disponibles après la clôture du vote."
                      : "Résultats non disponibles."}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Global stats */}
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30 sm:grid-cols-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Votants
                        </p>
                        <p className="mt-1 text-[22px] font-bold text-slate-800 dark:text-slate-100">
                          {resultats.nbVotants}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Participation
                        </p>
                        <p className="mt-1 text-[22px] font-bold text-slate-800 dark:text-slate-100">
                          {resultats.tauxParticipation?.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Validity banner */}
                    {resultats.messageResultat && (
                      <div className={`rounded-lg border px-4 py-3 text-[13px] font-semibold ${
                        resultats.resultatsValidables
                          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800/40 dark:bg-green-950/20 dark:text-green-300"
                          : "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800/40 dark:bg-orange-950/20 dark:text-orange-300"
                      }`}>
                        {resultats.messageResultat}
                      </div>
                    )}

                    {/* Ex-aequo warning */}
                    {resultats.contientExAequo && (
                      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/20">
                        <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300">
                          {resultats.messageExAequo ?? "Des candidats sont à égalité de voix."}
                        </p>
                      </div>
                    )}

                    {/* Results per position */}
                    {resultats.resultatsParPosition ? (
                      resultats.resultatsParPosition.map((rPos) => {
                        const totalVotes = rPos.candidats?.reduce((sum, c) => sum + (c.nbVotes ?? 0), 0) ?? 0;
                        return (
                          <div key={rPos.position.id} className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                            {/* Position header */}
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/50">
                              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                                {rPos.position.libelle}
                              </p>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                                <span>{rPos.position.nombreSieges} siège{rPos.position.nombreSieges !== 1 ? "s" : ""}</span>
                                <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
                                <span>{rPos.candidats?.length ?? 0} candidats</span>
                                <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
                                <span>{totalVotes} votes exprimés</span>
                              </div>
                            </div>

                            {/* Candidate table */}
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                  <th className="w-10 px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">#</th>
                                  <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Candidat</th>
                                  <th className="w-20 px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Votes</th>
                                  <th className="w-40 px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">%</th>
                                  <th className="w-24 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Statut</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rPos.candidats.map((c, i) => {
                                  const isWinner = rPos.gagnants?.some((g) => g.id === c.id);
                                  const pct = totalVotes > 0 ? (c.nbVotes / totalVotes) * 100 : 0;
                                  return (
                                    <tr
                                      key={c.id}
                                      className={isWinner
                                        ? "bg-green-50/70 dark:bg-green-950/10"
                                        : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"}
                                    >
                                      <td className="px-4 py-2 text-[12px] tabular-nums text-slate-400 dark:text-slate-500">
                                        {i + 1}
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className={`text-[13px] font-medium ${isWinner ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-200"}`}>
                                          Dr. {c.medecinPrenom} {c.medecinNom}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-right text-[13px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                                        {c.nbVotes}
                                      </td>
                                      <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                          <div className="h-1 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                              className={`h-full rounded-full ${isWinner ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                          <span className="w-9 text-right text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
                                            {pct.toFixed(1)}%
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        {isWinner && (
                                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                            Élu
                                          </span>
                                        )}
                                        {c.exAequo && (
                                          <span className="ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                                            Ex-æquo
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })
                    ) : (
                      /* Flat results (no position grouping) */
                      (() => {
                        const totalVotes = resultats.tousLesCandidats?.reduce((sum, c) => sum + (c.nbVotes ?? 0), 0) ?? 0;
                        return (
                          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                  <th className="w-10 px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">#</th>
                                  <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Candidat</th>
                                  <th className="w-20 px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Votes</th>
                                  <th className="w-40 px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">%</th>
                                  <th className="w-24 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Statut</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {resultats.tousLesCandidats?.map((c, i) => {
                                  const isWinner = resultats.gagnants?.some((g) => g.id === c.id);
                                  const pct = totalVotes > 0 ? (c.nbVotes / totalVotes) * 100 : 0;
                                  return (
                                    <tr
                                      key={c.id}
                                      className={isWinner
                                        ? "bg-green-50/70 dark:bg-green-950/10"
                                        : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"}
                                    >
                                      <td className="px-4 py-2 text-[12px] tabular-nums text-slate-400 dark:text-slate-500">
                                        {i + 1}
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className={`text-[13px] font-medium ${isWinner ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-200"}`}>
                                          Dr. {c.medecinPrenom} {c.medecinNom}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-right text-[13px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                                        {c.nbVotes}
                                      </td>
                                      <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                          <div className="h-1 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                              className={`h-full rounded-full ${isWinner ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                          <span className="w-9 text-right text-[12px] tabular-nums text-slate-500 dark:text-slate-400">
                                            {pct.toFixed(1)}%
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        {isWinner && (
                                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                            Élu
                                          </span>
                                        )}
                                        {c.exAequo && (
                                          <span className="ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                                            Ex-æquo
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 4: Historique ───────────────────────── */}
            {tab === 4 && (
              <div>
                {auditLogs === null ? (
                  <div className="flex justify-center py-16">
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="py-16 text-center text-[13px] text-slate-400 dark:text-slate-500">
                    Aucun événement enregistré.
                  </div>
                ) : (
                  <div className="relative space-y-0">
                    {/* Timeline track */}
                    <div className="absolute left-[19px] top-3 bottom-3 w-px bg-slate-100 dark:bg-slate-800" />

                    {auditLogs.map((log, idx) => {
                      const isError   = log.severity === "ERROR";
                      const isWarning = log.severity === "WARNING";

                      const dotCls = isError
                        ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                        : isWarning
                        ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900";

                      const badgeCls = isError
                        ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                        : isWarning
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

                      return (
                        <div key={log.id} className="relative flex gap-4 pb-4">
                          {/* Timeline dot */}
                          <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${dotCls}`}>
                            <Clock size={13} className={isError ? "text-red-500" : isWarning ? "text-amber-500" : "text-slate-400"} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 overflow-hidden rounded-lg border border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {log.severity && (
                                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${badgeCls}`}>
                                    {log.severity}
                                  </span>
                                )}
                                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                                  {log.action}
                                </span>
                                <span className="text-[12px] text-slate-400 dark:text-slate-500">
                                  par {log.acteurEmail}
                                </span>
                              </div>
                              <span className="shrink-0 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                                {formatDt(log.dateAction)}
                              </span>
                            </div>

                            {(log.entityType || log.entityId) && (
                              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                                {log.entityType}{log.entityId != null ? ` #${log.entityId}` : ""}
                              </p>
                            )}
                            {log.details && (
                              <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                                {log.details}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
