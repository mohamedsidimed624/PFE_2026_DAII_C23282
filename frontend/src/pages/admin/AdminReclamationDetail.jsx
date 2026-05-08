import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../../components/admin/AdminLayout";
import { getReclamationById, startReclamation, closeReclamation } from "../../services/adminReclamationApi";
import {
  ArrowLeft, CheckCircle2, AlertCircle, PlayCircle, Lock,
  FileText, User, Mail, Phone, MapPin, X,
  CalendarDays, Clock3, Paperclip, Inbox,
} from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

const STATUS_CFG = {
  SUBMITTED:   { label: "Soumise",    color: "amber",  badge: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800", bar: "bg-amber-500" },
  IN_PROGRESS: { label: "En cours",   color: "blue",   badge: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",   bar: "bg-blue-500"  },
  CLOSED:      { label: "Clôturée",   color: "green",  badge: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800", bar: "bg-green-500" },
};

const STATUS_ORDER = { SUBMITTED: 0, IN_PROGRESS: 1, CLOSED: 2 };

const TIMELINE_STEPS = [
  { key: "SUBMITTED",   label: "Soumise",          field: "dateCreation" },
  { key: "IN_PROGRESS", label: "Prise en charge",  field: "datePriseEnCharge" },
  { key: "CLOSED",      label: "Clôturée",          field: "dateCloture" },
];

function fmt(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(v) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}
function getFileName(path) {
  if (!path) return "Pièce jointe";
  return decodeURIComponent(path).split("/").pop() || "Pièce jointe";
}

function AdminReclamationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reclamation, setReclamation]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [showModal, setShowModal]         = useState(false);

  const load = async () => {
    try {
      setLoading(true); setError("");
      const data = await getReclamationById(id);
      setReclamation(data);
      setAdminResponse(data.adminResponse || "");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le détail de la réclamation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStart = async () => {
    try {
      setActionLoading(true); setError(""); setSuccess("");
      await startReclamation(id);
      setShowModal(false);
      setSuccess("Réclamation prise en charge.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de prendre en charge la réclamation.");
    } finally { setActionLoading(false); }
  };

  const handleClose = async () => {
    if (!adminResponse.trim()) { setError("La réponse administrative est obligatoire pour clôturer."); return; }
    try {
      setActionLoading(true); setError(""); setSuccess("");
      await closeReclamation(id, adminResponse);
      setSuccess("Réclamation clôturée avec succès.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de clôturer la réclamation.");
    } finally { setActionLoading(false); }
  };

  const isSubmitted  = reclamation?.statut === "SUBMITTED";
  const isInProgress = reclamation?.statut === "IN_PROGRESS";
  const isClosed     = reclamation?.statut === "CLOSED";

  const authorLabel = reclamation?.typeAuteur === "MEDECIN" ? "Médecin" : "Citoyen";
  const authorName  = useMemo(() => {
    if (!reclamation) return "—";
    return `${reclamation.prenomAuteur || ""} ${reclamation.nomAuteur || ""}`.trim() || "—";
  }, [reclamation]);

  const cfg = STATUS_CFG[(reclamation?.statut || "").toUpperCase()] || STATUS_CFG.SUBMITTED;
  const currentOrder = STATUS_ORDER[(reclamation?.statut || "").toUpperCase()] ?? -1;

  if (loading) return (
    <AdminLayout title="Gestion des réclamations">
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        Chargement…
      </div>
    </AdminLayout>
  );

  if (!reclamation) return (
    <AdminLayout title="Gestion des réclamations">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Inbox size={24} /></div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Réclamation introuvable</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Gestion des réclamations">
      <motion.div
        className="space-y-5 max-w-6xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Back */}
        <button
          onClick={() => navigate("/admin/reclamations")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={15} />
          Retour à la liste
        </button>

        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 size={16} className="shrink-0" />{success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0" />{error}
          </div>
        )}

        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* colored top bar */}
          <div className={cx("h-1 w-full", cfg.bar)} />

          <div className="px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Réclamation
                  </span>
                  <span className={cx("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", cfg.badge)}>
                    {cfg.label}
                  </span>
                  <span className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    {authorLabel}
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {reclamation.numeroReclamation}
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {reclamation.objet || "Sans objet"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User size={12} /> {authorName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={12} /> {fmtDate(reclamation.dateCreation)}
                  </span>
                  {reclamation.pieceJointePath && (
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <Paperclip size={12} /> Pièce jointe
                    </span>
                  )}
                </div>
              </div>

              {isSubmitted && (
                <button
                  onClick={() => setShowModal(true)}
                  disabled={actionLoading}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlayCircle size={15} />
                  Prendre en charge
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">

          {/* Left — message + attachment + response */}
          <div className="space-y-5">

            {/* Message */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <FileText size={15} />
                </div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Message de la réclamation</h2>
              </div>
              <div className="px-5 py-5">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {reclamation.message || "—"}
                </p>
              </div>
            </div>

            {/* Attachment */}
            {reclamation.pieceJointePath && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <Paperclip size={15} />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Pièce jointe</h2>
                </div>
                <div className="px-5 py-4">
                  <a
                    href={`http://localhost:8080${reclamation.pieceJointePath}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 transition hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/30 dark:hover:bg-green-900/10 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-red-500">
                        <FileText size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {getFileName(reclamation.pieceJointePath)}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Cliquer pour ouvrir</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 group-hover:underline">
                      Ouvrir
                    </span>
                  </a>
                </div>
              </div>
            )}

            {/* Admin response */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className={cx(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    isClosed ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  )}>
                    <Lock size={15} />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Réponse administrative</h2>
                </div>
                {!isClosed && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">Obligatoire pour clôturer</span>
                )}
              </div>
              <div className="px-5 py-5 space-y-4">
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  disabled={isClosed}
                  rows={8}
                  placeholder="Rédigez ici la réponse officielle de l'administration…"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-green-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50 resize-none"
                />

                {isClosed ? (
                  <div className="flex items-center gap-2 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 size={15} className="shrink-0" />
                    Réclamation clôturée — réponse en lecture seule.
                  </div>
                ) : isInProgress ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-5">
                      La réponse enregistrée sera communiquée comme réponse finale de l'administration.
                    </p>
                    <button
                      onClick={handleClose}
                      disabled={actionLoading || !adminResponse.trim()}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Lock size={14} />
                      Clôturer
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    La réclamation doit d'abord être prise en charge avant de pouvoir être clôturée.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right — author + timeline */}
          <div className="space-y-5">

            {/* Author card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <User size={15} />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Déposant</h2>
                </div>
              </div>

              <div className="px-5 py-5">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-sm font-bold text-green-700 dark:text-green-400">
                    {(reclamation.prenomAuteur?.[0] || "").toUpperCase()}{(reclamation.nomAuteur?.[0] || "").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{authorName}</p>
                    <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                      {authorLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {reclamation.emailAuteur && (
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                      <Mail size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate text-xs">{reclamation.emailAuteur}</span>
                    </div>
                  )}
                  {reclamation.telephoneAuteur && (
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                      <Phone size={13} className="shrink-0 text-slate-400" />
                      <span className="text-xs">{reclamation.telephoneAuteur}</span>
                    </div>
                  )}
                  {(reclamation.adresseAuteur || reclamation.villeAuteur) && (
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                      <MapPin size={13} className="shrink-0 text-slate-400" />
                      <span className="text-xs">{reclamation.adresseAuteur || reclamation.villeAuteur}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <Clock3 size={15} />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Suivi du traitement</h2>
                </div>
              </div>
              <div className="px-5 py-5">
                {TIMELINE_STEPS.map((step, i) => {
                  const stepOrder = STATUS_ORDER[step.key];
                  const done      = currentOrder >= stepOrder;
                  const active    = currentOrder === stepOrder;
                  const isLast    = i === TIMELINE_STEPS.length - 1;
                  const date      = reclamation[step.field];
                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cx(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          active  ? "border-green-500 bg-green-500 text-white" :
                          done    ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                                    "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600"
                        )}>
                          {done ? <CheckCircle2 size={13} /> : <Clock3 size={12} />}
                        </div>
                        {!isLast && (
                          <div className={cx(
                            "mt-1 w-0.5 rounded-full",
                            done && currentOrder > stepOrder ? "bg-green-300 dark:bg-green-700" : "bg-slate-200 dark:bg-slate-700"
                          )} style={{ minHeight: 24 }} />
                        )}
                      </div>
                      <div className={cx("pb-4", isLast && "pb-0")}>
                        <p className={cx("text-sm font-medium", done ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-600")}>
                          {step.label}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {date ? fmt(date) : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Prendre en charge modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <PlayCircle size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Prendre en charge</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{reclamation.numeroReclamation}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
              En confirmant, cette réclamation passera au statut <strong className="text-slate-800 dark:text-slate-200">En cours</strong> et vous serez responsable de son traitement.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayCircle size={14} />
                {actionLoading ? "Traitement…" : "Confirmer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminReclamationDetail;
