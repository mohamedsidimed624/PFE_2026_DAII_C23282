import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, BarChart3, Users, CheckCircle2,
  Send, X, Archive, Loader2, Calendar, Clock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getSondageById, getSondageStats, publishSondage,
  closeSondage, archiveSondage, publishResultats,
} from "../../services/adminSondageApi";

// ── Publication modal (same as AdminSondagesPage) ─────────────────────────────

const toIso = (v) => (v ? (v.length === 16 ? v + ":00" : v) : null);

function PublishModal({ sondage, onClose, onDone }) {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin,   setDateFin]   = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const isFuture = dateDebut && new Date(dateDebut) > new Date();
  const buttonLabel = isFuture ? "Planifier" : "Publier maintenant";

  const handleSubmit = async () => {
    setError("");
    if (!dateFin) { setError("La date de clôture est obligatoire."); return; }
    if (dateDebut && dateFin && new Date(dateFin) <= new Date(dateDebut)) {
      setError("La date de clôture doit être postérieure à la date d'ouverture.");
      return;
    }
    setLoading(true);
    try {
      await publishSondage(sondage.id, {
        dateDebut: toIso(dateDebut) || null,
        dateFin:   toIso(dateFin),
      });
      onDone();
    } catch (err) {
      setError(err?.response?.data?.message || "Impossible de publier le sondage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
                <Send size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Publication du sondage</p>
                <p className="max-w-[240px] truncate text-[11px] text-slate-400 dark:text-slate-500">{sondage.titre}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-5 px-6 py-5">
            <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              Définissez la période de participation. Sans date d'ouverture, le sondage est publié immédiatement.
            </p>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Date d'ouverture <span className="font-normal normal-case text-slate-300">(optionnelle)</span>
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="datetime-local" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
              </div>
              {isFuture && <p className="mt-1 text-[11px] text-blue-500">Le sondage sera planifié et activé automatiquement à cette date.</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Date de clôture <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="datetime-local" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <button onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-[13px] font-semibold text-white hover:bg-green-600 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {buttonLabel}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  CONSULTATION_INSTITUTIONNELLE: "Consultation institutionnelle",
  PULSE: "Pulse",
  QUESTIONNAIRE_SCIENTIFIQUE: "Questionnaire scientifique",
  SATISFACTION: "Satisfaction",
  ETUDE_EFFECTIFS: "Étude des effectifs",
};

const TYPE_COLORS = {
  CONSULTATION_INSTITUTIONNELLE: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  PULSE: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  QUESTIONNAIRE_SCIENTIFIQUE: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  SATISFACTION: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  ETUDE_EFFECTIFS: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  EN_REVUE: "En revue",
  PLANIFIE: "Planifié",
  ACTIF: "Actif",
  CLOS: "Clôturé",
  ARCHIVE: "Archivé",
};

const STATUT_COLORS = {
  BROUILLON: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
  EN_REVUE:  "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  PLANIFIE:  "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  ACTIF:     "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  CLOS:      "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500",
  ARCHIVE:   "bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600",
};

const CHART_COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// ── Per-question chart ────────────────────────────────────────────────────────

function QuestionStat({ qs }) {
  const isTextual = qs.typeQuestion === "TEXTE" || qs.typeQuestion === "DATE";
  const isGauge   = qs.typeQuestion === "ECHELLE" || qs.typeQuestion === "NUMERIQUE";
  const isOuiNon  = qs.typeQuestion === "OUI_NON";

  const chartData = Object.entries(qs.repartition || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="overflow-hidden rounded-md border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-3">
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{qs.titre}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {qs.totalReponses} réponse{qs.totalReponses !== 1 ? "s" : ""}
          {qs.moyenne != null && ` · Moyenne : ${qs.moyenne.toFixed(1)}`}
        </p>
      </div>

      <div className="p-4">
        {isTextual ? (
          <div className="max-h-40 space-y-1.5 overflow-y-auto">
            {Object.keys(qs.repartition || {}).length === 0 ? (
              <p className="text-[12px] text-slate-400">Aucune réponse</p>
            ) : (
              Object.keys(qs.repartition).map((txt, i) => (
                <p key={i} className="rounded bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-[12px] text-slate-600 dark:text-slate-300">
                  {txt}
                </p>
              ))
            )}
          </div>
        ) : isOuiNon ? (
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={chartData} barCategoryGap="35%">
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => [v, "Réponses"]} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#16a34a" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : isGauge ? (
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => [v, "Réponses"]} />
              <Bar dataKey="value" fill="#16a34a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={62}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
                style={{ fontSize: 11 }}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, "Réponses"]} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-4 text-center text-[12px] text-slate-400">Aucune réponse</p>
        )}
      </div>
    </div>
  );
}

// ── Info cell ────────────────────────────────────────────────────────────────

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}

// ── Stat mini-card ────────────────────────────────────────────────────────────

function MiniStat({ icon, label, value, sub }) {
  const Icon = icon;
  return (
    <div className="overflow-hidden rounded-md border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="px-5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <Icon size={14} className="text-slate-400" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        </div>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        {sub}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminSondageDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [sondage,       setSondage]       = useState(null);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [rejectComment, setRejectComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showPublish,   setShowPublish]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, stRes] = await Promise.allSettled([
        getSondageById(id),
        getSondageStats(id),
      ]);
      if (sRes.status === "fulfilled")  setSondage(sRes.value.data);
      if (stRes.status === "fulfilled") setStats(stRes.value.data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const action = async (fn) => {
    setActionLoading(true);
    try { await fn(); await load(); } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <AdminLayout title="Chargement…">
        <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] dark:bg-slate-950">
          <Loader2 size={22} className="animate-spin text-slate-300" />
        </div>
      </AdminLayout>
    );
  }

  if (!sondage) {
    return (
      <AdminLayout title="Non trouvé">
        <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] dark:bg-slate-950">
          <p className="text-[13px] text-slate-400">Sondage introuvable</p>
        </div>
      </AdminLayout>
    );
  }

  const tauxPct = Math.round(sondage.tauxCompletion ?? 0);

  return (
  <>
  <AdminLayout title={sondage.titre}>
    <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
      <button
        onClick={() => navigate("/admin/sondages")}
        className="mb-5 flex items-center gap-1.5 text-[13px] text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
      >
        <ArrowLeft size={14} />
        Retour aux sondages
      </button>

      <div className="mb-6 rounded-2xl bg-white px-8 py-6 shadow-sm dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="text-[13px] font-semibold text-green-500">
                {TYPE_LABELS[sondage.type] ?? sondage.type}
              </span>

              <span className="text-[13px] font-semibold text-slate-400">
                {STATUT_LABELS[sondage.statut] ?? sondage.statut}
              </span>

              <span className="text-[13px] text-slate-400">
                {sondage.anonyme ? "Anonyme" : "Nominatif"}
              </span>
            </div>

            <h1 className="text-[24px] font-semibold text-slate-800 dark:text-slate-100">
              {sondage.titre}
            </h1>

            {sondage.description && (
              <p className="mt-2 max-w-3xl text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                {sondage.description}
              </p>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Info label="Période" value={`Du ${formatDate(sondage.dateDebut)} au ${formatDate(sondage.dateFin)}`} />
              <Info label="Questions" value={`${sondage.nbQuestions} question${sondage.nbQuestions !== 1 ? "s" : ""}`} />
              <Info label="Taux de complétion" value={`${tauxPct}%`} />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {sondage.statut === "BROUILLON" && (
              <button
                onClick={() => navigate(`/admin/sondages/${id}/modifier`)}
                className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Modifier
              </button>
            )}

            {(sondage.statut === "BROUILLON" || sondage.statut === "PLANIFIE") && (
              <button
                onClick={() => setShowPublish(true)}
                className="h-10 rounded-md bg-green-500 px-5 text-[13px] font-semibold text-white shadow-sm hover:bg-green-600"
              >
                Publier / Planifier
              </button>
            )}

            {sondage.statut === "ACTIF" && (
              <button
                onClick={() => action(() => closeSondage(id))}
                disabled={actionLoading}
                className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Clôturer
              </button>
            )}

            {(sondage.statut === "ACTIF" || sondage.statut === "CLOS") && !sondage.resultatsPublies && (
              <button
                onClick={() => action(() => publishResultats(id))}
                disabled={actionLoading}
                className="h-10 rounded-md bg-blue-600 px-5 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Publier les résultats
              </button>
            )}

            {(sondage.statut === "ACTIF" || sondage.statut === "CLOS") && sondage.resultatsPublies && (
              <span className="inline-flex h-10 items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-4 text-[13px] font-semibold text-blue-600 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-400">
                Résultats publiés
              </span>
            )}

            {sondage.statut === "CLOS" && (
              <button
                onClick={() => action(() => archiveSondage(id))}
                disabled={actionLoading}
                className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Archiver
              </button>
            )}
          </div>
        </div>
      </div>

      {sondage.statut === "EN_REVUE" && (
        <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-6 py-5 dark:border-amber-800 dark:bg-amber-900/10">
          <p className="mb-3 text-[14px] font-semibold text-amber-700 dark:text-amber-400">
            Ce sondage est en attente de validation
          </p>

          <div className="flex flex-wrap items-start gap-3">
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Commentaire de rejet..."
              rows={2}
              className="min-w-0 flex-1 resize-none rounded-md border border-amber-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-amber-400 dark:border-amber-700 dark:bg-slate-800 dark:text-slate-200"
            />

            {/* <button
              onClick={() => action(() => validateSondage(id))}
              disabled={actionLoading}
              className="h-10 rounded-md bg-green-500 px-4 text-[13px] font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              Valider
            </button> */}

            {/* <button
              onClick={() => action(() => rejectSondage(id, rejectComment))}
              disabled={actionLoading}
              className="h-10 rounded-md border border-red-100 bg-white px-4 text-[13px] font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-slate-800 dark:hover:bg-red-900/20"
            >
              Rejeter
            </button> */}
          </div>
        </div>
      )}

      {/* {sondage.commentaireValidation && (
        <div className="mb-6 rounded-2xl bg-white px-6 py-4 shadow-sm dark:bg-slate-900">
          <p className="mb-1 text-[12px] font-semibold uppercase text-red-400">
            Commentaire de rejet
          </p>
          <p className="text-[14px] text-slate-600 dark:text-slate-300">
            {sondage.commentaireValidation}
          </p>
        </div>
      )} */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat icon={Users} label="Participants" value={sondage.nbParticipants} />
        <MiniStat icon={CheckCircle2} label="Complétés" value={sondage.nbCompletes} />
        <MiniStat
          icon={BarChart3}
          label="Taux de complétion"
          value={`${tauxPct}%`}
          sub={
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-1.5 rounded-full bg-green-500 transition-all"
                style={{ width: `${tauxPct}%` }}
              />
            </div>
          }
        />
      </div>

      {stats?.questionStats?.length > 0 ? (
        <div>
          <h2 className="mb-4 text-[17px] font-semibold text-slate-700 dark:text-slate-200">
            Résultats par question
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {stats.questionStats.map((qs) => (
              <QuestionStat key={qs.questionOrdre} qs={qs} />
            ))}
          </div>
        </div>
      ) : (
        sondage.questions?.length > 0 && (
          <div>
            <h2 className="mb-4 text-[17px] font-semibold text-slate-700 dark:text-slate-200">
              Questions
            </h2>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900">
              {sondage.questions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 border-b border-slate-100 px-6 py-4 last:border-0 dark:border-slate-800"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-900/20">
                    {i + 1}
                  </div>

                  <div>
                    <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                      {q.titre}
                      {q.obligatoire && <span className="ml-1 text-red-400">*</span>}
                    </p>

                    {q.description && (
                      <p className="mt-1 text-[13px] text-slate-400">
                        {q.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  </AdminLayout>

  {showPublish && sondage && (
    <PublishModal
      sondage={sondage}
      onClose={() => setShowPublish(false)}
      onDone={() => { setShowPublish(false); load(); }}
    />
  )}
</>
);
}
