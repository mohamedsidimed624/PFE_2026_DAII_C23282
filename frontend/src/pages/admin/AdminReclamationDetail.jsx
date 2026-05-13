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
    <div className="min-h-screen bg-[#FAFBFC] px-7 py-6">
      <div className="max-w-6xl space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate("/admin/reclamations")}
          className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-400 hover:text-slate-600"
        >
          <ArrowLeft size={15} />
          Retour à la liste
        </button>

        {/* Alerts */}
        {success && (
          <div className="rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Résumé compact */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
        <section className="rounded-md bg-white p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="text-[13px] font-semibold uppercase text-slate-400">
                  Réclamation
                </span>

                <span
                  className={`text-[14px] font-bold ${
                    reclamation.statut === "CLOSED"
                      ? "text-green-600"
                      : reclamation.statut === "IN_PROGRESS"
                      ? "text-blue-500"
                      : "text-yellow-500"
                  }`}
                >
                  {cfg.label}
                </span>

                <span className="text-[14px] font-medium text-slate-500">
                  {authorLabel}
                </span>
              </div>

              <h1 className="text-[22px] font-semibold text-slate-800">
                {reclamation.numeroReclamation}
              </h1>

              <p className="mt-2 max-w-3xl text-[14px] leading-6 text-slate-500">
                {reclamation.objet || "Sans objet"}
              </p>
            </div>

            {isSubmitted && (
              <button
                onClick={() => setShowModal(true)}
                disabled={actionLoading}
                className="h-10 rounded-md bg-blue-500 px-5 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-600 disabled:opacity-60"
              >
                Prendre en charge
              </button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 md:grid-cols-4">
            <InfoItem label="Déposant" value={authorName} />
            <InfoItem label="Date" value={fmtDate(reclamation.dateCreation)} />
            <InfoItem label="Email" value={reclamation.emailAuteur || "—"} />
            <InfoItem label="Téléphone" value={reclamation.telephoneAuteur || "—"} />
          </div>
        </section>
        </div>

        {/* Contenu principal */}
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          {/* Left */}
          <div className="space-y-6">
            {/* Message */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
            <section className="rounded-md bg-white p-6">
              <h2 className="mb-4 text-[17px] font-semibold text-slate-700">
                Message
              </h2>

              <p className="whitespace-pre-line text-[14px] leading-7 text-slate-600">
                {reclamation.message || "—"}
              </p>

              {reclamation.pieceJointePath && (
                <a
                  href={`http://localhost:8080${reclamation.pieceJointePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-10 items-center rounded-md border border-slate-100 bg-slate-50 px-4 text-[13px] font-semibold text-slate-500 hover:bg-white hover:text-green-600"
                >
                  Pièce jointe : {getFileName(reclamation.pieceJointePath)}
                </a>
              )}
            </section>
            </div>

            {/* Réponse administrative */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
            <section className="rounded-md bg-white p-6"></section>
            <section className="rounded-md bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[17px] font-semibold text-slate-700">
                  Réponse administrative
                </h2>

                {isClosed && (
                  <span className="text-[13px] font-semibold text-green-600">
                    Clôturée
                  </span>
                )}
              </div>

              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                disabled={isClosed}
                rows={7}
                placeholder="Rédigez ici la réponse officielle..."
                className="w-full resize-none rounded-md border border-slate-100 bg-slate-50 px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-green-400 focus:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
              />

              {isInProgress && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleClose}
                    disabled={actionLoading || !adminResponse.trim()}
                    className="h-10 rounded-md bg-green-500 px-5 text-[13px] font-semibold text-white shadow-sm hover:bg-green-600 disabled:opacity-60"
                  >
                    Clôturer la réclamation
                  </button>
                </div>
              )}

              {isSubmitted && (
                <p className="mt-3 text-[13px] text-slate-400">
                  La réclamation doit d’abord être prise en charge avant clôture.
                </p>
              )}
            </section>
          </div>
          </div> 

          {/* Right */}
          <aside className="space-y-6">
            {/* Suivi */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
            <section className="rounded-md bg-white p-6"></section>
            <section className="rounded-md bg-white p-6">
              <h2 className="mb-5 text-[17px] font-semibold text-slate-700">
                Suivi
              </h2>

              <div className="space-y-5">
                {TIMELINE_STEPS.map((step) => {
                  const stepOrder = STATUS_ORDER[step.key];
                  const done = currentOrder >= stepOrder;
                  const active = currentOrder === stepOrder;
                  const date = reclamation[step.field];

                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          active
                            ? "bg-green-500"
                            : done
                            ? "bg-green-300"
                            : "bg-slate-200"
                        }`}
                      />

                      <div>
                        <p
                          className={`text-[14px] font-semibold ${
                            done ? "text-slate-700" : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>

                        <p className="mt-0.5 text-[13px] text-slate-400">
                          {date ? fmt(date) : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            </div>

            {/* Infos auteur compactes
            <section className="rounded-md bg-white p-6">
              <h2 className="mb-5 text-[17px] font-semibold text-slate-700">
                Informations
              </h2>

              <div className="space-y-4">
                <InfoItem label="Type auteur" value={authorLabel} />
                <InfoItem label="Nom complet" value={authorName} />
                <InfoItem label="Adresse" value={reclamation.adresseAuteur || reclamation.villeAuteur || "—"} />
                <InfoItem label="Statut" value={cfg.label} />
              </div>
            </section> */}
          </aside>
        </div>
      </div>
    </div>

    {/* Modal prise en charge */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
        <div className="w-full max-w-md rounded-md bg-white p-6 shadow-xl">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-slate-800">
                Prendre en charge
              </h2>
              <p className="mt-1 text-[13px] text-slate-400">
                {reclamation.numeroReclamation}
              </p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="text-slate-300 hover:text-slate-500"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mb-6 text-[14px] leading-6 text-slate-500">
            Cette réclamation passera au statut En cours.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="h-10 rounded-md border border-slate-100 bg-white px-4 text-[13px] font-semibold text-slate-400 hover:text-slate-600"
            >
              Annuler
            </button>

            <button
              onClick={handleStart}
              disabled={actionLoading}
              className="h-10 rounded-md bg-blue-500 px-5 text-[13px] font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {actionLoading ? "Traitement..." : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    )}
  </AdminLayout>
);
}
function InfoItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-[13px] font-semibold uppercase text-slate-400">
        {label}
      </p>
      <p className="break-words text-[14px] font-medium text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}
export default AdminReclamationDetail;
