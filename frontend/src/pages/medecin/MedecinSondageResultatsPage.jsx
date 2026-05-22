import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BarChart3, Users, CheckCircle2, ShieldCheck,
  Loader2, Lock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getSondageResultats } from "../../services/medecinSondageApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  CONSULTATION_INSTITUTIONNELLE: "Consultation institutionnelle",
  PULSE: "Pulse",
  QUESTIONNAIRE_SCIENTIFIQUE: "Questionnaire scientifique",
  SATISFACTION: "Satisfaction",
  ETUDE_EFFECTIFS: "Étude des effectifs",
};

const TYPE_COLORS = {
  CONSULTATION_INSTITUTIONNELLE: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
  PULSE: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
  QUESTIONNAIRE_SCIENTIFIQUE: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  SATISFACTION: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
  ETUDE_EFFECTIFS: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

const CHART_COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color = "text-slate-400" }) {
  const Icon = icon;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon size={14} className={color} />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        </div>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

// ── Question result card ──────────────────────────────────────────────────────

function QuestionResultCard({ qs, index }) {
  const isTextual = qs.typeQuestion === "TEXTE" || qs.typeQuestion === "DATE";
  const isGauge   = qs.typeQuestion === "ECHELLE" || qs.typeQuestion === "NUMERIQUE";
  const isOuiNon  = qs.typeQuestion === "OUI_NON";

  const chartData = Object.entries(qs.repartition || {}).map(([name, value]) => ({ name, value }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Question header */}
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-[12px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {index + 1}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">{qs.titre}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {qs.totalReponses} réponse{qs.totalReponses !== 1 ? "s" : ""}
              {qs.moyenne != null && ` · Moyenne : ${qs.moyenne.toFixed(1)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="p-5">
        {isTextual ? (
          <div className="space-y-2">
            {chartData.length === 0 ? (
              <p className="text-[13px] text-slate-400">Aucune réponse</p>
            ) : (
              chartData.map((item, i) => (
                <div key={i} className="rounded-lg bg-slate-50 px-4 py-2.5 text-[13px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {item.name}
                </div>
              ))
            )}
          </div>
        ) : isOuiNon ? (
          <div className="space-y-3">
            {chartData.map((item, i) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const isOui = item.name.toUpperCase() === "OUI";
              return (
                <div key={i}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                    <span className="text-[13px] font-bold" style={{ color: isOui ? "#16a34a" : "#ef4444" }}>
                      {pct}% <span className="text-[11px] font-normal text-slate-400">({item.value})</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 + 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: isOui ? "#16a34a" : "#ef4444" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : isGauge ? (
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => [v, "Réponses"]} />
              <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : chartData.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Pie chart */}
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={30}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, "Réponses"]} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend with bars */}
            <div className="flex flex-col justify-center space-y-2.5">
              {chartData.map((item, i) => {
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-[12px] text-slate-600 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 + i * 0.08 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="py-4 text-center text-[13px] text-slate-400">Aucune réponse enregistrée</p>
        )}
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MedecinSondageResultatsPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getSondageResultats(id)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err?.response?.status === 403) {
          setError("Les résultats de ce sondage ne sont pas encore disponibles ou vous n'y avez pas participé.");
        } else {
          navigate("/medecin/sondages");
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <MedecinLayout title="Chargement…">
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-300" />
        </div>
      </MedecinLayout>
    );
  }

  if (error) {
    return (
      <MedecinLayout title="Résultats non disponibles">
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#FAFBFC] dark:bg-slate-950 px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Lock size={28} className="text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-slate-700 dark:text-slate-200">Résultats indisponibles</p>
            <p className="mt-1 max-w-sm text-[13px] text-slate-500 dark:text-slate-400">{error}</p>
          </div>
          <button
            onClick={() => navigate("/medecin/sondages")}
            className="rounded-xl bg-green-700 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-green-800"
          >
            Retour aux sondages
          </button>
        </div>
      </MedecinLayout>
    );
  }

  const tauxPct = Math.round(
    data.nbParticipationsDemarrees > 0
      ? (data.nbCompletes / data.nbParticipationsDemarrees) * 100
      : 0
  );

  return (
    <MedecinLayout title="Résultats du sondage">
      <div className="min-h-screen bg-[#FAFBFC] px-4 py-6 dark:bg-slate-950 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-6">

          {/* Back */}
          <button
            onClick={() => navigate("/medecin/sondages")}
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
          >
            <ArrowLeft size={14} />
            Retour aux sondages
          </button>

          {/* Header card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="px-6 py-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_COLORS[data.type] ?? "bg-slate-100 text-slate-500"}`}>
                  {TYPE_LABELS[data.type] ?? data.type}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <CheckCircle2 size={10} /> Résultats publiés
                </span>
              </div>

              <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {data.titre}
              </h1>

              <p className="mt-1.5 text-[13px] text-slate-400">
                Du {formatDate(data.dateDebut)} au {formatDate(data.dateFin)}
              </p>
            </div>

            {/* Anonymous notice */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} className="text-slate-400" />
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  Ces résultats sont agrégés et anonymisés — aucune réponse individuelle n'est identifiable.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              icon={Users}
              label="Participants"
              value={data.nbCompletes ?? 0}
              color="text-green-500"
            />
            <StatCard
              icon={BarChart3}
              label="Taux de complétion"
              value={`${tauxPct}%`}
              color="text-blue-500"
            />
            <StatCard
              icon={CheckCircle2}
              label="Questions"
              value={data.questionStats?.length ?? 0}
              color="text-purple-500"
            />
          </div>

          {/* Question results */}
          {data.questionStats?.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-slate-700 dark:text-slate-200">
                Résultats par question
              </h2>
              {data.questionStats.map((qs, i) => (
                <QuestionResultCard key={qs.questionOrdre} qs={qs} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
              <BarChart3 size={28} className="mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-[13px] text-slate-400">Aucune donnée disponible</p>
            </div>
          )}

          {/* Footer */}
          <div className="pb-4 text-center">
            <button
              onClick={() => navigate("/medecin/sondages")}
              className="rounded-xl bg-green-700 px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-green-800"
            >
              Retour aux sondages
            </button>
          </div>

        </div>
      </div>
    </MedecinLayout>
  );
}
