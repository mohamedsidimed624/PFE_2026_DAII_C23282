import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle, Clock3, XCircle, User, Mail, CalendarDays,
  ArrowLeft, AlertTriangle, LogIn, RefreshCw, ShieldCheck,
  FileSearch, MessageSquare, Search,
} from "lucide-react";
import { getSuiviDossier, getDemandePourReprise } from "../services/demandeSuiviApi";
import Breadcrumb from "../components/public/Breadcrumb";
import { useFormData } from "../context/FormContext";

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const STATUS_CONFIG = {
  PENDING: {
    label: "En attente de traitement",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot:   "bg-amber-400",
    icon:  <Clock3 size={15} />,
    bar:   "bg-amber-400",
    barW:  "45%",
  },
  APPROUVED: {
    label: "Demande approuvée",
    badge: "bg-green-50 text-green-700 border-green-200",
    dot:   "bg-green-500",
    icon:  <CheckCircle size={15} />,
    bar:   "bg-green-500",
    barW:  "100%",
  },
  REJECTED: {
    label: "Demande rejetée",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot:   "bg-red-500",
    icon:  <XCircle size={15} />,
    bar:   "bg-red-400",
    barW:  "100%",
  },
};

const TIMELINE_STEPS = [
  { key: "submitted",  label: "Dossier soumis",     },
  { key: "processing", label: "En cours d'examen",  },
  { key: "decision",   label: "Décision rendue",    },
];

const getTimelineStep = (statut) => {
  if (statut === "PENDING")   return 1;
  if (statut === "APPROUVED") return 2;
  if (statut === "REJECTED")  return 2;
  return 0;
};

const cx = (...c) => c.filter(Boolean).join(" ");

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── Sub-components ─────────────────────────────────── */
function StatusBadge({ statut }) {
  const cfg = STATUS_CONFIG[statut];
  if (!cfg) return <span className="badge border-slate-200">{statut}</span>;
  return (
    <span className={cx("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium", cfg.badge)}>
      <span className={cx("h-2 w-2 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
      <div className="mb-1.5 flex items-center gap-2 text-slate-400">
        <span className="text-green-600">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 break-words">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}

function Timeline({ statut }) {
  const activeStep = getTimelineStep(statut);
  return (
    <div className="flex items-start gap-0">
      {TIMELINE_STEPS.map((s, idx) => {
        const isCompleted = activeStep >= TIMELINE_STEPS.length - 1;

        const done =
          activeStep > idx || (isCompleted && idx === activeStep);

        const current =
          activeStep === idx && !isCompleted;
        const isLast  = idx === TIMELINE_STEPS.length - 1;
        return (
          <div key={s.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* Line left */}
              <div className={cx(
                "h-0.5 flex-1 transition-all",
                idx === 0 ? "invisible" : done ? "bg-green-400" : "bg-slate-200"
              )} />
              {/* Dot */}
              <div className={cx(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                done    ? "border-green-500 bg-green-500 text-white"
                : current ? "border-green-500 bg-green-50 text-green-600"
                : "border-slate-200 bg-white text-slate-300"
              )}>
                {done
                  ? <CheckCircle size={14} />
                  : <span className="text-xs font-bold">{idx + 1}</span>
                }
              </div>
              {/* Line right */}
              <div className={cx(
                "h-0.5 flex-1 transition-all",
                isLast ? "invisible" : done ? "bg-green-400" : "bg-slate-200"
              )} />
            </div>
            <p className={cx(
              "mt-2 text-center text-xs font-medium leading-tight",
              current ? "text-green-700" : done ? "text-slate-600" : "text-slate-400"
            )}>
              {s.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main ───────────────────────────────────────────── */
function SuiviDossierPage() {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const { setFormData, setStep, setSubmitted } = useFormData();

  const [numeroDossier, setNumeroDossier] = useState("");
  const [searchInput, setSearchInput]     = useState("");
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(true);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [noNumero, setNoNumero]           = useState(false);

  useEffect(() => {
    const numero = searchParams.get("numero");
    if (!numero?.trim()) { setNoNumero(true); setLoading(false); return; }
    setNoNumero(false);
    setNumeroDossier(numero);
    (async () => {
      try {
        setLoading(true); setError(""); setResult(null);
        const data = await getSuiviDossier(numero.trim());
        setResult(data);
      } catch { setError("Impossible de charger le dossier demandé."); }
      finally { setLoading(false); }
    })();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const valeur = searchInput.trim();
    if (!valeur) { setError("Veuillez saisir un numéro de dossier."); return; }
    navigate(`/suivi-dossier?numero=${encodeURIComponent(valeur)}`);
  };

  const handleResume = async () => {
    try {
      setResumeLoading(true); setError("");
      const data = await getDemandePourReprise(result.numeroDossier);
      const prepared = {
        personal: data.personal || {},
        education: data.education || [],
        experience: data.experience || [],
        documents: { diplomes: [], certificats: [], autres: [] },
      };
      setFormData(prepared);
      localStorage.setItem("adhesionForm", JSON.stringify(prepared));
      setStep(1); setSubmitted(false);
      navigate("/adhesion");
    } catch { setError("Impossible de charger les données pour reprise."); }
    finally { setResumeLoading(false); }
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <Navbar className="mb-6" />
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Suivi de dossier" }]} />
      <div className="min-h-screen mt-15 bg-slate-50">
        <main className="mx-auto max-w-3xl px-6 py-10">
          <div className="space-y-4 animate-pulse">
            <div className="h-32 rounded-2xl bg-slate-200" />
            <div className="h-52 rounded-2xl bg-slate-200" />
            <div className="h-28 rounded-2xl bg-slate-200" />
          </div>
        </main>
      </div>
    </>
  );

  /* ── Aucun numéro fourni : champ de saisie ── */
  if (noNumero) return (
    <>
      <Navbar />
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Suivi de dossier" }]} />
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-2xl px-6 py-10">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-green-50/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <FileSearch size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Suivre mon dossier</p>
                  <p className="text-xs text-slate-500">Saisissez votre numéro de dossier pour consulter son état</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSearchSubmit} className="px-6 py-5">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Numéro de dossier
              </label>
              <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10">
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Entrez votre numéro de dossier"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <Search size={15} /> Rechercher
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={15} /> Retour à l'accueil
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );

  /* ── Error (no result) ── */
  if (error && !result) return (
    <>
      <Navbar />
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Suivi de dossier" }]} />
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-2xl px-6 py-10">
          <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-red-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-700">Dossier introuvable</p>
                  <p className="text-xs text-red-500">Vérifiez votre numéro de dossier</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600">{error}</p>
              {numeroDossier && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-400">Numéro recherché</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-slate-700">{numeroDossier}</p>
                </div>
              )}
              <form onSubmit={handleSearchSubmit} className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Réessayer avec un autre numéro
                </label>
                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10">
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Entrez votre numéro de dossier"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    <Search size={15} /> Rechercher
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={15} /> Retour à l'accueil
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );

  const cfg = STATUS_CONFIG[result?.statut] || {};

  return (
    <>
      <Navbar />
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Suivi de dossier" }]} />
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-3xl space-y-5 px-6 py-10">

          {/* ── Header ── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-green-600">
              Suivi de dossier
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              État de votre demande
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Consultez l'avancement de votre dossier d'adhésion à l'ONMM.
            </p>
          </motion.div>

          {/* ── Error inline ── */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Numéro + statut ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Barre colorée selon statut */}
            <div className={cx("h-1 w-full", cfg.bar)} />

            <div className="px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-slate-400">Numéro de dossier</p>
                  <p className="mt-1 font-mono text-xl font-bold text-slate-900">
                    {result.numeroDossier}
                  </p>
                </div>
                <StatusBadge statut={result.statut} />
              </div>

              {/* Timeline */}
              <div className="mt-6">
                <Timeline statut={result.statut} />
              </div>
            </div>
          </motion.div>

          {/* ── Informations ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
              <FileSearch size={14} className="text-green-600" />
              <h2 className="text-sm font-semibold text-slate-800">Informations du dossier</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
              <InfoCard label="Nom"               value={result.nom}                    icon={<User size={13} />} />
              <InfoCard label="Prénom"            value={result.prenom}                 icon={<User size={13} />} />
              <InfoCard label="Email"             value={result.email}                  icon={<Mail size={13} />} />
              <InfoCard label="Soumis le"         value={formatDate(result.dateSoumission)} icon={<CalendarDays size={13} />} />
              {result.dateDecision && (
                <div className="sm:col-span-2">
                  <InfoCard label="Décision le"   value={formatDate(result.dateDecision)}   icon={<CheckCircle size={13} />} />
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Commentaire admin (REJECTED) ── */}
          {result.statut === "REJECTED" && result.commentaireAdmin && (
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm"
            >
              <div className="flex items-center gap-2.5 border-b border-red-100 bg-red-50/60 px-5 py-3.5">
                <MessageSquare size={14} className="text-red-500" />
                <h2 className="text-sm font-semibold text-red-700">
                  Motif de rejet
                </h2>
              </div>
              <div className="p-5">
                <p className="text-sm leading-6 text-slate-700">{result.commentaireAdmin}</p>
              </div>
            </motion.div>
          )}

          {/* ── Message statut ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
              <ShieldCheck size={14} className="text-green-600" />
              <h2 className="text-sm font-semibold text-slate-800">Que se passe-t-il ?</h2>
            </div> */}
            {/* <div className="p-5">
              {result.statut === "PENDING" && (
                <p className="text-sm leading-6 text-slate-600">
                  Votre dossier est en cours d'examen par l'administration de l'Ordre.
                  Aucune action n'est requise pour le moment — vous serez notifié dès qu'une décision sera prise.
                </p>
              )}
              {result.statut === "APPROUVED" && !result.compteActive && (
                <p className="text-sm leading-6 text-slate-600">
                  Félicitations, votre demande a été approuvée. Votre compte a été créé
                  mais n'est pas encore activé. Utilisez le lien d'activation pour finaliser votre inscription.
                </p>
              )}
              {result.statut === "APPROUVED" && result.compteActive && (
                <p className="text-sm leading-6 text-slate-600">
                  Votre demande est approuvée et votre compte est actif.
                  Vous pouvez vous connecter à votre espace médecin dès maintenant.
                </p>
              )}
              {result.statut === "REJECTED" && (
                <p className="text-sm leading-6 text-slate-600">
                  Votre demande a été rejetée par l'administration.
                  Vous pouvez consulter le motif ci-dessus, corriger votre dossier et le resoumettre.
                </p>
              )}
            </div> */}
          </motion.div>

          {/* ── Actions ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="flex flex-wrap items-center gap-3"
          >
            {result.peutActiverCompte && result.activationLink && (
              <button
                onClick={() => { window.location.href = result.activationLink; }}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <ShieldCheck size={15} />
                Activer mon compte
              </button>
            )}

            {result.compteActive && (
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <LogIn size={15} />
                Se connecter
              </button>
            )}

            {result.peutCompleterDossier && (
              <button
                onClick={handleResume}
                disabled={resumeLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resumeLoading
                  ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Chargement…</>
                  : <><RefreshCw size={15} />Corriger et resoumettre</>
                }
              </button>
            )}

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={15} />
              Retour à l'accueil
            </button>
          </motion.div>

        </main>
      </div>
    </>
  );
}

export default SuiviDossierPage;