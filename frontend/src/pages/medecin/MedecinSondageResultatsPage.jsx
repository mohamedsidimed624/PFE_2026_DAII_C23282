import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  BarChart3,
  Users,
  Loader2,
  Lock,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getSondageResultats } from "../../services/medecinSondageApi";

const CHART_COLORS = [
  "#03A84E",
  "#2563EB",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="font-semibold text-[#123F4A] dark:text-slate-100">
        {label || payload[0]?.name}
      </p>

      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Réponses :{" "}
        <span className="font-bold text-[#03A84E]">
          {payload[0]?.value}
        </span>
      </p>
    </div>
  );
}

function StatCard({ Icon, label, value, tone = "green" }) {
  const tones = {
    green: {
      box: "border-green-100 bg-green-50 dark:border-green-900/40 dark:bg-green-900/20",
      icon: "text-[#03A84E]",
    },
    blue: {
      box: "border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20",
      icon: "text-blue-600",
    },
    purple: {
      box: "border-purple-100 bg-purple-50 dark:border-purple-900/40 dark:bg-purple-900/20",
      icon: "text-purple-600",
    },
  };

  const current = tones[tone] || tones.green;

  return (
    <div className={`rounded-2xl border px-5 py-4 shadow-sm ${current.box}`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} className={current.icon} />

        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>

      <p className="text-2xl font-bold text-[#123F4A] dark:text-white">
        {value}
      </p>
    </div>
  );
}

function QuestionResultCard({ qs, index }) {
  const isTextual = qs.typeQuestion === "TEXTE" || qs.typeQuestion === "DATE";
  const isGauge =
    qs.typeQuestion === "ECHELLE" || qs.typeQuestion === "NUMERIQUE";
  const isOuiNon = qs.typeQuestion === "OUI_NON";

  const chartData = useMemo(() => {
    return Object.entries(qs.repartition || {}).map(([name, value]) => ({
      name,
      value,
    }));
  }, [qs.repartition]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#03A84E] text-xs font-bold text-white">
            {index + 1}
          </div>

          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[#123F4A] dark:text-white">
              {qs.titre || `Question ${index + 1}`}
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {qs.totalReponses || 0} réponse
              {qs.totalReponses !== 1 ? "s" : ""}
              {qs.moyenne != null && ` · Moyenne : ${qs.moyenne.toFixed(1)}`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isTextual ? (
          <TextualResults chartData={chartData} />
        ) : isOuiNon ? (
          <OuiNonResults chartData={chartData} total={total} />
        ) : isGauge ? (
          <BarResults chartData={chartData} />
        ) : chartData.length > 0 ? (
          <PieResults chartData={chartData} total={total} />
        ) : (
          <EmptyQuestion />
        )}
      </div>
    </motion.div>
  );
}

function TextualResults({ chartData }) {
  if (!chartData.length) return <EmptyQuestion />;

  return (
    <div className="space-y-2">
      {chartData.slice(0, 8).map((item, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
        >
          {item.name}
        </div>
      ))}

      {chartData.length > 8 && (
        <p className="pt-1 text-xs text-slate-400">
          + {chartData.length - 8} autre(s) réponse(s)
        </p>
      )}
    </div>
  );
}

function OuiNonResults({ chartData, total }) {
  if (!chartData.length) return <EmptyQuestion />;

  return (
    <div className="space-y-4">
      {chartData.map((item, index) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const isOui = item.name.toUpperCase() === "OUI";
        const color = isOui ? "#03A84E" : "#EF4444";

        return (
          <div key={index}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#123F4A] dark:text-slate-100">
                {item.name}
              </span>

              <span className="text-sm font-bold" style={{ color }}>
                {pct}%{" "}
                <span className="text-xs font-normal text-slate-400">
                  ({item.value})
                </span>
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BarResults({ chartData }) {
  if (!chartData.length) return <EmptyQuestion />;

  return (
    <div className="h-[210px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barCategoryGap="35%">
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis hide />

          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="value" fill="#03A84E" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieResults({ chartData, total }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[0.9fr_1.1fr]">
      <div className="h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={78}
              innerRadius={44}
              paddingAngle={2}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col justify-center space-y-3">
        {chartData.map((item, index) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const color = CHART_COLORS[index % CHART_COLORS.length];

          return (
            <div key={index}>
              <div className="mb-1 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />

                  <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>

                <span className="shrink-0 text-xs font-bold text-[#123F4A] dark:text-slate-100">
                  {pct}%{" "}
                  <span className="font-normal text-slate-400">
                    ({item.value})
                  </span>
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.45 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyQuestion() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle size={24} className="mb-2 text-slate-300" />

      <p className="text-sm text-slate-400">Aucune réponse enregistrée</p>
    </div>
  );
}

export default function MedecinSondageResultatsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSondageResultats(id)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err?.response?.status === 403) {
          setError(
            "Les résultats de ce sondage ne sont pas encore disponibles ou vous n'y avez pas participé."
          );
        } else {
          navigate("/medecin/sondages");
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const tauxPct = useMemo(() => {
    if (!data?.nbParticipationsDemarrees) return 0;

    return Math.round(
      (data.nbCompletes / data.nbParticipationsDemarrees) * 100
    );
  }, [data]);

  if (loading) {
    return (
      <MedecinLayout title="Chargement…">
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#03A84E]" />
        </div>
      </MedecinLayout>
    );
  }

  if (error) {
    return (
      <MedecinLayout title="Résultats indisponibles">
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="max-w-md rounded-2xl border border-slate-100 bg-white px-8 py-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Lock size={24} className="text-slate-400 dark:text-slate-500" />
            </div>

            <h1 className="text-lg font-bold text-[#123F4A] dark:text-white">
              Résultats indisponibles
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <button
              onClick={() => navigate("/medecin/sondages")}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-[#03A84E] px-5 text-sm font-semibold text-white transition hover:bg-[#029646]"
            >
              Retour aux sondages
            </button>
          </div>
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout title="Résultats du sondage">
      <div className="space-y-5">
        {/* Header simple */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#123F4A] dark:text-white">
              Résultats du sondage
            </h1>

          
          </div>

          <button
            onClick={() => navigate("/medecin/sondages")}
            className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={15} />
            Retour aux sondages
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            Icon={Users}
            label="Participants"
            value={data?.nbCompletes ?? 0}
            tone="green"
          />

          <StatCard
            Icon={BarChart3}
            label="Taux de complétion"
            value={`${tauxPct}%`}
            tone="blue"
          />

          <StatCard
            Icon={ClipboardList}
            label="Questions"
            value={data?.questionStats?.length ?? 0}
            tone="purple"
          />
        </div>

        {/* Results */}
        {data?.questionStats?.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-[#03A84E]" />

              <h2 className="text-[16px] font-bold text-[#123F4A] dark:text-white">
                Résultats par question
              </h2>
            </div>

            {data.questionStats.map((qs, index) => (
              <QuestionResultCard
                key={qs.questionOrdre || index}
                qs={qs}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <AlertCircle size={28} className="mb-3 text-slate-300" />

            <p className="text-sm text-slate-400">Aucune donnée disponible</p>
          </div>
        )}
      </div>
    </MedecinLayout>
  );
}