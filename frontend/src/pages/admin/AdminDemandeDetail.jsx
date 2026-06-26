import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDemandeById,
  approveDemande,
  rejectDemande,
} from "../../services/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";
import { resolveFileUrl } from "../../config/api";
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
  const [selectedSection,   setSelectedSection]   = useState("");
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
      await approveDemande(id, selectedSection || demande.sectionProposee);
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
          <button
            onClick={() => navigate("/admin/demandes")}
            className="mb-2 inline-flex items-center gap-2 text-[14px] font-medium text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft size={15} />
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

      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-7 py-6">
        <div className="max-w-6xl space-y-6">
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
          <h1 className="mb-5 text-[17px] font-semibold text-slate-700 dark:text-slate-100">
            Détail de la demande
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoCard icon={<Hash size={15} />}          label="ID Demande"  value={`#${demande.id}`} />
            <InfoCard icon={<User size={15} />}          label="Demandeur"   value={`${demande.nom} ${demande.prenom}`} />
            <InfoCard icon={<CalendarDays size={15} />}  label="Date"        value={formatDate(demande.submissionDate || demande.date)} />
            <div className="rounded-md bg-white dark:bg-slate-800 px-5 py-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-green-500">
                <ShieldCheck size={15} />
                  </span>
                  <span className="text-[13px] font-semibold uppercase text-slate-400">
                    Statut
                  </span>
                </div>

                <span
                  className={`text-[14px] font-bold ${
                    demande.statut === "REJECTED"
                      ? "text-red-500"
                      : demande.statut === "PENDING"
                      ? "text-yellow-500"
                      : "text-green-600"
                  }`}
                >
                  {sc.label}
                </span>
              </div>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
            {demande.email     && <span>✉ {demande.email}</span>}
            {demande.telephone && <span>📞 {demande.telephone}</span>}
          </div>

          {/* Section proposée */}
          {demande.sectionProposee && (
            <div className="mt-3 flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
              <span className="font-medium">Section proposée :</span>
              <SectionBadge section={demande.sectionProposee} />
              {demande.estEnseignantChercheur && (
                <span className="text-[11px] text-slate-400">(déclaré enseignant-chercheur)</span>
              )}
            </div>
          )}
        </div>

        {/* ── Éducation + Expérience ── */}
        
        <div className="grid sm:grid-cols-2 gap-5 ">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
          <SectionCard icon={<GraduationCap size={17} />} title="Éducation">
            {demande.educations?.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 ">
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
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
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
        </div>

        {/* ── Documents ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors duration-200">
        <SectionCard icon={<FileText size={17} />} title="Documents">
          {demande.documents?.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 ">
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
                      href={resolveFileUrl(doc.filePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye size={13} />
                      Voir
                    </a>
                    <button
                      onClick={() => downloadFile(resolveFileUrl(doc.filePath), doc.fileName)}
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
        </div>

        {/* ── Actions ── */}
        {isPending && (
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => { setSelectedSection(demande.sectionProposee || "GENERALISTE"); setShowApprouveModal(true); }}
              disabled={actionLoading}
              className="h-10 rounded-md bg-green-500 px-5 text-[13px] font-semibold text-white shadow-sm hover:bg-green-600 disabled:opacity-60"
            >
              Approuver la demande
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="h-10 rounded-md border border-red-100 bg-white px-5 text-[13px] font-semibold text-red-500 shadow-sm hover:bg-red-50 disabled:opacity-60"
            >
              Rejeter la demande
            </button>
          </div>
        )}
        </div>
      </div>

      {/* ── Modal Approuve ── */}
      {/* ── Modal Approuve ── */}
{showApprouveModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      
      <div className="flex items-start justify-between border-b border-slate-100 bg-green-50/70 px-5 py-4 dark:border-slate-800 dark:bg-green-900/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Approuver la demande
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Valider le dossier et attribuer une section.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowApprouveModal(false)}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X size={17} />
        </button>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Section à attribuer
          </label>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="GENERALISTE">Section A — Médecins généralistes</option>
            <option value="SPECIALISTE">Section B — Médecins spécialistes</option>
            <option value="ENSEIGNANT_CHERCHEUR">Section C — Médecins enseignants-chercheurs</option>
          </select>

          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Section proposée automatiquement :
              <span className="ml-1 font-semibold text-slate-700 dark:text-slate-200">
                {demande.sectionProposee ?? "—"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
        <button
          onClick={() => setShowApprouveModal(false)}
          disabled={actionLoading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Annuler
        </button>

        <button
          onClick={handleApprove}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 size={15} />
          Confirmer
        </button>
      </div>
    </div>
  </div>
)}

{/* ── Modal Rejet ── */}
{showRejectModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      
      <div className="flex items-start justify-between border-b border-slate-100 bg-red-50/70 px-5 py-4 dark:border-slate-800 dark:bg-red-900/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <XCircle size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Rejeter la demande
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Le motif sera conservé dans le dossier.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRejectModal(false)}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X size={17} />
        </button>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Commentaire <span className="text-red-500">*</span>
          </label>

          <textarea
            placeholder="Ex : Documents insuffisants, diplôme non reconnu…"
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />

          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Donnez un motif clair pour faciliter la correction du dossier.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
        <button
          onClick={() => setShowRejectModal(false)}
          disabled={actionLoading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Annuler
        </button>

        <button
          onClick={handleReject}
          disabled={!rejectComment.trim() || actionLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <XCircle size={15} />
          Confirmer
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
    <div className="rounded-md bg-white dark:bg-slate-800 px-5 py-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-green-500">{icon}</span>
        <span className="text-[13px] font-semibold uppercase text-slate-400">
          {label}
        </span>
      </div>

      <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="rounded-md bg-white dark:bg-slate-900 p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-green-500">{icon}</span>
        <h2 className="text-[17px] font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </h2>
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

const SECTION_META = {
  GENERALISTE:          { label: "Section A — Généraliste",          cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
  SPECIALISTE:          { label: "Section B — Spécialiste",          cls: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800" },
  ENSEIGNANT_CHERCHEUR: { label: "Section C — Enseignant-chercheur", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
};

function SectionBadge({ section }) {
  const meta = SECTION_META[section];
  if (!meta) return <span className="text-xs text-slate-400">{section}</span>;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

export default AdminDemandeDetail;
