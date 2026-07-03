import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from "recharts";
import {
  ClipboardList, Users, AlertTriangle, Stethoscope,
  ChevronRight, Clock, TrendingUp, Bell, Download,
  MoreVertical, CheckCircle2, X,
} from "lucide-react";
import { getAdminDashboardStats } from "../../services/adminDashboardApi";
import AdminLayout from "../../components/admin/AdminLayout";

/* ── helpers ── */
const STATUS_CFG = {
  PENDING:   { label: "En attente", bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",  text: "text-amber-700 dark:text-amber-400",  dot: "bg-amber-500"  },
  APPROUVED: { label: "Acceptée",   bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",  text: "text-green-700 dark:text-green-400",  dot: "bg-green-500"  },
  REJECTED:  { label: "Rejetée",    bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",          text: "text-red-700 dark:text-red-400",      dot: "bg-red-500"    },
};

function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ statut }) {
  const c = STATUS_CFG[statut] || STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ── Stat card ── */
const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 },
};

function StatCard({ Icon, label, value, color, loading, index }) {
  const colorMap = {
    green: "text-green-500 dark:text-green-400",
    amber: "text-yellow-500 dark:text-yellow-400",
    blue: "text-blue-500 dark:text-blue-400",
    purple: "text-red-400 dark:text-red-400",
  };

  return (
    <motion.div
      variants={CARD_VARIANTS}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      className="flex h-28 items-center gap-4 rounded-2xl bg-green-100/70 dark:bg-slate-900 dark:border dark:border-slate-800 px-6 shadow-sm dark:shadow-none"
    >
      {/* Icon */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-800">
        <Icon
          size={24}
          className={colorMap[color] || "text-green-500 dark:text-green-400"}
        />
      </div>

      {/* Text */}
      <div>
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 leading-5">
          {label}
        </p>

        {loading ? (
          <div className="mt-2 h-6 w-16 animate-pulse rounded bg-white/70 dark:bg-slate-700" />
        ) : (
          <p
            className={`mt-1 text-2xl font-semibold ${
              colorMap[color] || "text-green-500 dark:text-green-400"
            }`}
          >
            {value ?? 0}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ── Donut center label ── */
function DonutLabel({ cx, cy, value }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-0.3em" fontSize={18} fontWeight={700} fill="currentColor">{value}%</tspan>
      <tspan x={cx} dy="1.3em" fontSize={10} fill="#94A3B8">Total inscrits</tspan>
    </text>
  );
}

/* ── Trend chart (cumulative distribution across months) ── */
const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
function buildTrend(hommes, femmes) {
  const h = Math.max(1, hommes);
  const f = Math.max(1, femmes);
  return MONTHS.map((m, i) => {
    const progress = (i + 1) / 12;
    return {
      name: m,
      Hommes: Math.round(h * (0.4 + progress * 0.6)),
      Femmes: Math.round(f * (0.35 + progress * 0.65)),
    };
  });
}

/* ── CSV export helper ── */
function exportCSV(data, filename) {
  const header = Object.keys(data[0]).join(",");
  const rows   = data.map((r) => Object.values(r).join(","));
  const csv    = [header, ...rows].join("\n");
  const blob   = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Main ── */
export default function AdminDashboard() {
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [isDark,        setIsDark]        = useState(() => document.documentElement.classList.contains("dark"));
  const [statsView,     setStatsView]     = useState("nationalite");
  const [statsMenuOpen, setStatsMenuOpen] = useState(false);
  const statsMenuRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsDark(document.documentElement.classList.contains("dark"));
    window.addEventListener("theme-changed", handler);
    return () => window.removeEventListener("theme-changed", handler);
  }, []);

  useEffect(() => {
    getAdminDashboardStats()
      .then(setStats)
      .catch((err) => setError(`Erreur ${err.response?.status ?? ""}: ${err.response?.data?.message ?? err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const tooltipStyle = isDark
    ? { borderRadius: 10, border: "1px solid #334155", background: "#1E293B", color: "#E2E8F0", fontSize: 12 }
    : { borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", fontSize: 12 };

  const trendData = stats
    ? buildTrend(Number(stats.medecinsHommes) || 0, Number(stats.medecinsFemmes) || 0)
    : [];

  /* close stats menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (statsMenuRef.current && !statsMenuRef.current.contains(e.target))
        setStatsMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const STATS_VIEWS = [
    { key: "nationalite", label: "Nationalité des médecins" },
    { key: "statut",      label: "Statut des médecins" },
    { key: "demandes",    label: "Statut des demandes" },
  ];

  const statsChartData = stats ? (
    statsView === "nationalite" ? [
      { name: "Mauritaniens", value: Number(stats.medecinsMauritaniens) || 0 },
      { name: "Étrangers",    value: Number(stats.medecinsEtrangers)    || 0 },
    ] :
    statsView === "statut" ? [
      { name: "Actifs",    value: Number(stats.medecinsActifs)    || 0 },
      { name: "Suspendus", value: Number(stats.medecinsSuspendus) || 0 },
    ] : [
      { name: "En attente", value: Number(stats.demandesEnAttente)  || 0 },
      { name: "Acceptées",  value: Number(stats.demandesAcceptees)  || 0 },
      { name: "Rejetées",   value: Number(stats.demandesRejetees)   || 0 },
    ]
  ) : [];

  const STATS_COLORS = {
    nationalite: ["#0EA5E9", "#F97316"],
    statut:      ["#16A34A", "#EF4444"],
    demandes:    ["#F59E0B", "#16A34A", "#EF4444"],
  };

  const totalM = stats ? Number(stats.medecinsHommes) + Number(stats.medecinsFemmes) : 0;
  const pct = totalM > 0 ? Math.round((Number(stats.medecinsHommes) / totalM) * 100) : 0;

  const pieData = stats ? [
    { name: "Hommes", value: Number(stats.medecinsHommes) || 1 },
    { name: "Femmes", value: Number(stats.medecinsFemmes) || 1 },
    { name: "Autres", value: Math.max(0, Number(stats.totalMedecins) - totalM) },
  ].filter(d => d.value > 0) : [];

  const PIE_COLORS = ["#16A34A", "#F472B6", "#60A5FA"];

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

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between"
        >
          {/* <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Vue d'ensemble de l'activité</p>
          </div> */}
          {/* <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            En direct
          </span> */}
        </motion.div>

        {/* 4 stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard index={0} Icon={Clock} color="amber" label="Demandes en attente" value={stats?.demandesEnAttente} loading={loading} />
          <StatCard index={1} Icon={Users} color="green" label="Médecins inscrits" value={stats?.totalMedecins} loading={loading} />
          <StatCard index={2} Icon={AlertTriangle} color="purple" label="Réclamations en attente" value={stats?.reclamationsEnAttente} loading={loading} />
          <StatCard index={3} Icon={Stethoscope} color="blue" label="Spécialités avec médecins" value={stats?.specialitesAvecMedecins} loading={loading} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Area chart — Médecins par genre */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="col-span-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Médecins</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Évolution par genre · <span className="text-green-600 dark:text-green-400">{stats?.medecinsHommes ?? 0} H</span>
                  {" / "}
                  <span className="text-pink-500">{stats?.medecinsFemmes ?? 0} F</span>
                </p>
              </div>
              <button
                onClick={() => exportCSV(trendData, "medecins-genre.csv")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download size={12} />
                Exporter
              </button>
            </div>
            {loading ? (
              <div className="h-56 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradHommes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradFemmes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F472B6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F472B6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1E293B" : "#F1F5F9"} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? "#94A3B8" : "#64748B" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? "#94A3B8" : "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-400">{v}</span>}
                  />
                  <Area type="monotone" dataKey="Hommes" stroke="#16A34A" strokeWidth={2.5} fill="url(#gradHommes)" dot={false} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="Femmes" stroke="#F472B6" strokeWidth={2.5} fill="url(#gradFemmes)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Stats panel with dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.4 }}
            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Statistiques</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {STATS_VIEWS.find(v => v.key === statsView)?.label}
                </p>
              </div>
              <div className="relative" ref={statsMenuRef}>
                <button
                  onClick={() => setStatsMenuOpen((o) => !o)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <MoreVertical size={15} />
                </button>
                <AnimatePresence>
                  {statsMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-20 py-1 overflow-hidden"
                    >
                      {STATS_VIEWS.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => { setStatsView(key); setStatsMenuOpen(false); }}
                          className={`flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                            statsView === key
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {label}
                          {statsView === key && <CheckCircle2 size={12} />}
                        </button>
                      ))}
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button
                          onClick={() => { exportCSV(statsChartData, `stats-${statsView}.csv`); setStatsMenuOpen(false); }}
                          className="flex w-full items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Download size={12} />
                          Exporter en CSV
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />)}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  {statsView === "demandes" ? (
                    <BarChart data={statsChartData} barSize={28} margin={{ top: 4, right: 0, bottom: 0, left: -30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1E293B" : "#F1F5F9"} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {statsChartData.map((_, i) => (
                          <Cell key={i} fill={STATS_COLORS[statsView][i % STATS_COLORS[statsView].length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie data={statsChartData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                        {statsChartData.map((_, i) => (
                          <Cell key={i} fill={STATS_COLORS[statsView][i % STATS_COLORS[statsView].length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  )}
                </ResponsiveContainer>

                <div className="mt-3 space-y-2 text-xs">
                  {statsChartData.map(({ name, value }, i) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: STATS_COLORS[statsView][i % STATS_COLORS[statsView].length] }} />
                        <span className="text-slate-600 dark:text-slate-400">{name}</span>
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Total</span>
                    <span className="text-slate-800 dark:text-slate-100">
                      {statsChartData.reduce((s, d) => s + d.value, 0)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Bottom row: demandes + quick-links */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Demandes récentes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="col-span-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-green-600 dark:text-green-400" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Demandes</h2>
              </div>
              <Link
                to="/admin/demandes"
                className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                Voir tout <ChevronRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3.5 w-36 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : !stats?.recentDemandes?.length ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                Aucune demande pour le moment.
              </p>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {stats.recentDemandes.map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.06 }}
                  >
                    <Link
                      to={`/admin/demandes/${d.id}`}
                      className="flex items-center gap-4 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-xs font-bold text-green-700 dark:text-green-400 ring-1 ring-green-100 dark:ring-green-800">
                        {(d.nom?.[0] || "?").toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          Demande de participation
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {d.nom} {d.prenom} · {fmtDate(d.submissionDate)}
                        </p>
                      </div>
                      <StatusBadge statut={d.statut} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick stats / links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.56, duration: 0.4 }}
            className="flex flex-col gap-3"
          >
            {[
              { label: "Total des demandes",   value: stats?.totalDemandes,    to: "/admin/demandes",      color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20"  },
              { label: "Demandes acceptées",   value: stats?.demandesAcceptees,to: "/admin/demandes",      color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20"  },
              { label: "Demandes rejetées",    value: stats?.demandesRejetees, to: "/admin/demandes",      color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-900/20"      },
              { label: "Médecins actifs",      value: stats?.medecinsActifs,   to: "/admin/medecins",      color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20"    },
              { label: "Médecins suspendus",   value: stats?.medecinsSuspendus,to: "/admin/medecins",      color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/20"  },
            ].map(({ label, value, to, color, bg }, i) => (
              <Link
                key={label}
                to={to}
                className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
                <span className={`rounded-lg px-2.5 py-1 text-sm font-bold ${bg} ${color}`}>
                  {loading ? "—" : (value ?? 0)}
                </span>
              </Link>
            ))}
          </motion.div>
        </div>

      </div>
    </AdminLayout>
  );
}
