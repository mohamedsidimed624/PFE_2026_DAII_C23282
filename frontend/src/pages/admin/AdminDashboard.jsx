import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ClipboardList, UserCheck, UserX, Stethoscope, ChevronRight, Clock } from "lucide-react";
import { getAdminDashboardStats } from "../../services/adminDashboardApi";
import AdminLayout from "../../components/admin/AdminLayout";

const STATUS_CFG = {
  PENDING:   { label: "En attente", bg: "bg-amber-50 dark:bg-amber-900/20",  text: "text-amber-700 dark:text-amber-400",  border: "border-amber-200 dark:border-amber-800",  dot: "bg-amber-500"  },
  APPROUVED: { label: "Acceptée",   bg: "bg-green-50 dark:bg-green-900/20",  text: "text-green-700 dark:text-green-400",  border: "border-green-200 dark:border-green-800",  dot: "bg-green-500"  },
  REJECTED:  { label: "Rejetée",    bg: "bg-red-50 dark:bg-red-900/20",      text: "text-red-700 dark:text-red-400",      border: "border-red-200 dark:border-red-800",      dot: "bg-red-500"    },
};

const PIE_COLORS = ["#16A34A", "#F472B6", "#60A5FA"];

function StatCard({ Icon, label, value, iconCls, bgCls, loading }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors duration-200">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bgCls}`}>
        <Icon size={22} className={iconCls} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {loading
          ? <div className="mt-1 h-7 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          : <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value ?? 0}</p>
        }
      </div>
    </div>
  );
}

function StatusBadge({ statut }) {
  const c = STATUS_CFG[statut] || STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [isDark, setIsDark]   = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    getAdminDashboardStats()
      .then(setStats)
      .catch((err) => setError(`Erreur ${err.response?.status ?? ""}: ${err.response?.data?.message ?? err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const chartGrid    = isDark ? "#1E293B" : "#F1F5F9";
  const chartTick    = isDark ? "#94A3B8" : "#64748B";
  const tooltipStyle = isDark
    ? { borderRadius: 10, border: "1px solid #334155", background: "#1E293B", color: "#E2E8F0", fontSize: 12 }
    : { borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 };

  const barData = stats ? [
    { name: "En attente", value: Number(stats.demandesEnAttente), fill: "#F59E0B" },
    { name: "Acceptées",  value: Number(stats.demandesAcceptees), fill: "#16A34A" },
    { name: "Rejetées",   value: Number(stats.demandesRejetees),  fill: "#EF4444" },
  ] : [];

  const pieData = stats ? [
    { name: "Hommes", value: Number(stats.medecinsHommes) },
    { name: "Femmes", value: Number(stats.medecinsFemmes) },
    { name: "Autres", value: Math.max(0, Number(stats.totalMedecins) - Number(stats.medecinsHommes) - Number(stats.medecinsFemmes)) },
  ].filter(d => d.value > 0) : [];

  if (error) return (
    <AdminLayout title="Dashboard">
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>

        {/* 4 stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard Icon={Clock}         label="Demandes en attente" value={stats?.demandesEnAttente}  iconCls="text-amber-600"  bgCls="bg-amber-50 dark:bg-amber-900/20"  loading={loading} />
          <StatCard Icon={UserX}         label="Demandes rejetées"   value={stats?.demandesRejetees}   iconCls="text-red-600"    bgCls="bg-red-50 dark:bg-red-900/20"      loading={loading} />
          <StatCard Icon={UserCheck}     label="Demandes acceptées"  value={stats?.demandesAcceptees}  iconCls="text-green-600"  bgCls="bg-green-50 dark:bg-green-900/20"  loading={loading} />
          <StatCard Icon={ClipboardList} label="Total des demandes"  value={stats?.totalDemandes}      iconCls="text-blue-600"   bgCls="bg-blue-50 dark:bg-blue-900/20"    loading={loading} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Bar chart */}
          <div className="col-span-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors duration-200">
            <h2 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-100">Demandes par statut</h2>
            {loading ? (
              <div className="h-56 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={42}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartTick }} />
                  <YAxis tick={{ fontSize: 12, fill: chartTick }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? "#1E293B" : "#F8FAFC" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stats panel */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors duration-200">
            <h2 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Statistiques</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />)}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2 text-xs">
                  {[
                    { label: "Médecins Hommes",  value: stats?.medecinsHommes,   dot: "bg-green-500" },
                    { label: "Médecins Femmes",  value: stats?.medecinsFemmes,   dot: "bg-pink-400"  },
                    { label: "Spécialités",      value: stats?.totalSpecialites, dot: "bg-blue-400"  },
                  ].map(({ label, value, dot }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${dot}`} />
                        <span className="text-slate-600 dark:text-slate-400">{label}</span>
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Total médecins</span>
                    <span className="text-slate-800 dark:text-slate-100">{stats?.totalMedecins}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent demandes */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <Stethoscope size={16} className="text-green-600 dark:text-green-400" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Demandes récentes</h2>
            </div>
            <Link to="/admin/demandes" className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
              Voir tout <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : !stats?.recentDemandes?.length ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">Aucune demande pour le moment.</p>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {stats.recentDemandes.map((d) => (
                <Link key={d.id} to={`/admin/demandes/${d.id}`} className="flex items-center gap-4 px-6 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-xs font-bold text-green-700 dark:text-green-400">
                    {d.nom?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{d.nom} {d.prenom}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{d.numeroDossier ?? `#${d.id}`} · {fmtDate(d.submissionDate)}</p>
                  </div>
                  <StatusBadge statut={d.statut} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
