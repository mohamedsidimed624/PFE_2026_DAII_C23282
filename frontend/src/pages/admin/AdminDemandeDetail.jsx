import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDemandeById,
  approveDemande,
  rejectDemande,
} from "../../services/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  AlertTriangle,
  X,
  Hash,
  User,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

async function downloadFile(url, filename) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (e) {
    console.error("Download failed:", e);
  }
}

const getStatusClasses = (status) => {
  switch ((status || "").toUpperCase()) {
    case "APPROVED":
      return { pill: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800", dot: "bg-green-500", label: "Approuvé" };
    case "APPROUVED":
      return { pill: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800", dot: "bg-green-500", label: "Approuvé" };
    case "REJECTED":
      return { pill: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800", dot: "bg-red-500", label: "Rejeté" };
    default:
      return { pill: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800", dot: "bg-amber-400", label: "En attente" };
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

function AdminDemandeDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [demande,           setDemande]           = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [rejectComment,     setRejectComment]     = useState("");
  const [showRejectModal,   setShowRejectModal]   = useState(false);
  const [showApprouveModal, setShowApprouveModal] = useState(false);
  const [actionLoading,     setActionLoading]     = useState(false);
  const [toastMsg,          setToastMsg]          = useState("");

  const isPending = demande?.statut === "PENDING";

  useEffect(() => {
    (async () => {
      try {
        const data = await getDemandeById(id);
        setDemande(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveDemande(id);
      setShowApprouveModal(false);
      showToast("Demande approuvée avec succès.");
      setTimeout(() => navigate("/admin/demandes"), 1500);
    } catch (e) {
      showToast(e.response?.data?.message || "Erreur lors de l'approbation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) return;
    try {
      setActionLoading(true);
      await rejectDemande(id, rejectComment);
      setShowRejectModal(false);
      showToast("Demande rejetée.");
      setTimeout(() => navigate("/admin/demandes"), 1500);
    } catch (e) {
      showToast(e.response?.data?.message || "Erreur lors du rejet.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Détail de la demande">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          Chargement…
        </div>
      </AdminLayout>
    );
  }

  if (!demande) {
    return (
      <AdminLayout title="Détail de la demande">
        <div className="flex flex-col items-center gap-3 py-16 text-slate-400 dark:text-slate-500">
          <AlertTriangle size={32} />
          <p className="text-sm">Demande introuvable.</p>
          <button onClick={() => navigate("/admin/demandes")} className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Retour à la liste
          </button>
        </div>
      </AdminLayout>
    );
  }

  const sc = getStatusClasses(demande.statut);

  return (
    <AdminLayout title="Détail de la demande">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-400 shrink-0" />
          {toastMsg}
        </div>
      )}

      <div className="space-y-5 max-w-5xl">

        {/* Back */}
        <button
          onClick={() => navigate("/admin/demandes")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={15} />
          Retour à la liste
        </button>

        {/* ── Info cards (header) ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
          <h1 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
            Détail de la demande
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoCard icon={<Hash size={15} />}          label="ID Demande"  value={`#${demande.id}`} />
            <InfoCard icon={<User size={15} />}          label="Demandeur"   value={`${demande.nom} ${demande.prenom}`} />
            <InfoCard icon={<CalendarDays size={15} />}  label="Date"        value={formatDate(demande.dateCreation || demande.date)} />
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-green-500 dark:text-green-400"><ShieldCheck size={15} /></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Statut</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${sc.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
            {demande.email     && <span>✉ {demande.email}</span>}
            {demande.telephone && <span>📞 {demande.telephone}</span>}
          </div>
        </div>

        {/* ── Éducation + Expérience ── */}
        <div className="grid sm:grid-cols-2 gap-5">

          <SectionCard icon={<GraduationCap size={17} />} title="Éducation">
            {demande.educations?.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {demande.educations.map((edu) => (
                  <div key={edu.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{edu.diplome}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{edu.specialiteLibelle || "—"}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{edu.sousSpecialiteLibelle || "—"}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {edu.universite} {edu.pays ? `— ${edu.pays}` : ""}
                    </p>
                    {edu.annee && <p className="text-xs text-slate-400 dark:text-slate-500">{edu.annee}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="Aucune formation renseignée" />
            )}
          </SectionCard>

          <SectionCard icon={<Briefcase size={17} />} title="Expérience">
            {demande.experiences?.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {demande.experiences.map((exp) => (
                  <div key={exp.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{exp.poste}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{exp.nomEtablissement}</p>
                    {(exp.dateDebut || exp.dateFin) && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(exp.dateDebut)} – {exp.dateFin ? formatDate(exp.dateFin) : "Présent"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="Aucune expérience renseignée" />
            )}
          </SectionCard>
        </div>

        {/* ── Documents ── */}
        <SectionCard icon={<FileText size={17} />} title="Documents">
          {demande.documents?.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {demande.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <FileText size={15} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{doc.fileName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`http://localhost:8080/${doc.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye size={13} />
                      Voir
                    </a>
                    <button
                      onClick={() => downloadFile(`http://localhost:8080/${doc.filePath}`, doc.fileName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    >
                      <Download size={13} />
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="Aucun document joint" />
          )}
        </SectionCard>

        {/* ── Actions ── */}
        {isPending && (
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => setShowApprouveModal(true)}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              <CheckCircle2 size={16} />
              Approuver la demande
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all disabled:opacity-60 shadow-sm"
            >
              <XCircle size={16} />
              Rejeter la demande
            </button>
          </div>
        )}
      </div>

      {/* ── Modal Approuve ── */}
      {showApprouveModal && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Approuver la demande</h2>
              <button
                onClick={() => setShowApprouveModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setShowApprouveModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={15} />
                Confirmer l'approbation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Rejet ── */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Rejeter la demande</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Veuillez saisir un motif de rejet.
                </p>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Commentaire <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Ex: Documents insuffisants, diplôme non reconnu…"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/15 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectComment.trim() || actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={15} />
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 transition-colors duration-200">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-green-500 dark:text-green-400">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">
        {value || <span className="text-slate-300 dark:text-slate-600 font-normal">—</span>}
      </p>
    </div>
  );
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">{label}</p>
  );
}

export default AdminDemandeDetail;
