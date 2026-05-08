import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMedecinById,
  suspendMedecin,
  reactivateMedecin,
  deleteMedecin,
} from "../../services/adminApi";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  ArrowLeft,
  Trash2,
  PauseCircle,
  RotateCcw,
  Download,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

/* ── Helpers ── */
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

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
};

const formatFileSize = (size) => {
  if (!size && size !== 0) return "";
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getStatusClasses = (status) => {
  switch ((status || "").toUpperCase()) {
    case "ACTIF":
    case "VALIDÉ":
    case "VALIDE":
      return { pill: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" };
    case "SUSPENDU":
      return { pill: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" };
    default:
      return { pill: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  }
};

/* ═══════════════════════════════════════════
   Page
═══════════════════════════════════════════ */
function AdminMedecinDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [medecin,          setMedecin]          = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [actionLoading,    setActionLoading]    = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [suspendComment,   setSuspendComment]   = useState("");
  const [success,          setSuccess]          = useState("");
  const [error,            setError]            = useState("");

  const loadMedecin = async () => {
    try {
      setLoading(true);
      const data = await getMedecinById(id);
      setMedecin(data);
    } catch {
      setError("Impossible de charger les informations du médecin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMedecin(); }, [id]);

  const flash = (msg, type = "success") => {
    type === "success" ? setSuccess(msg) : setError(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  };

  const handleSuspend = async () => {
    if (!suspendComment.trim()) return;
    try {
      setActionLoading(true);
      await suspendMedecin(id, suspendComment);
      setShowSuspendModal(false);
      setSuspendComment("");
      flash("Le médecin a été suspendu avec succès.");
      await loadMedecin();
    } catch (e) {
      flash(e.response?.data?.message || "Impossible de suspendre ce médecin.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setActionLoading(true);
      await reactivateMedecin(id);
      flash("Le médecin a été réactivé avec succès.");
      await loadMedecin();
    } catch (e) {
      flash(e.response?.data?.message || "Impossible de réactiver ce médecin.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteMedecin(id);
      navigate("/admin/medecins");
    } catch (e) {
      flash(e.response?.data?.message || "Impossible de supprimer ce médecin.", "error");
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Gestion des Médecins">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          Chargement…
        </div>
      </AdminLayout>
    );
  }

  if (!medecin) {
    return (
      <AdminLayout title="Gestion des Médecins">
        <div className="text-slate-500 text-sm">Médecin introuvable.</div>
      </AdminLayout>
    );
  }

  const isActif    = (medecin.statut || "").toUpperCase() === "ACTIF";
  const isSuspendu = (medecin.statut || "").toUpperCase() === "SUSPENDU";
  const sc = getStatusClasses(medecin.statut);

  return (
    <AdminLayout title="Gestion des Médecins">
      <div className="space-y-6 max-w-6xl">

        {/* ── Alertes ── */}
        {success && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
            <CheckCircle2 size={16} className="shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── En-tête : titre + actions ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={() => navigate("/admin/medecins")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Detail
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {isActif && (
              <button
                onClick={() => { setError(""); setSuccess(""); setShowSuspendModal(true); }}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-60"
              >
                <PauseCircle size={15} />
                Suspendre
              </button>
            )}
            {isSuspendu && (
              <button
                onClick={handleReactivate}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-60"
              >
                <RotateCcw size={15} />
                Réactiver
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 text-red-500 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60"
            >
              <Trash2 size={15} />
              Supprimer
            </button>
          </div>
        </div>

        {/* ── Profile hero ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {medecin.photoProfilPath ? (
            <img
              src={`http://localhost:8080${medecin.photoProfilPath}`}
              alt={`${medecin.prenom} ${medecin.nom}`}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl font-bold text-green-700 dark:text-green-400 border-4 border-white dark:border-slate-800 shadow-md shrink-0">
              {(medecin.prenom?.[0] || "").toUpperCase()}{(medecin.nom?.[0] || "").toUpperCase()}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-1">Médecin</p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
              Dr. {medecin.prenom} {medecin.nom}
            </h2>
            {medecin.specialiteLibelle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{medecin.specialiteLibelle}{medecin.sousSpecialiteLibelle ? ` · ${medecin.sousSpecialiteLibelle}` : ""}</p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${sc.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {medecin.statut || "—"}
              </span>
              {medecin.numeroInscription && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                  N° {medecin.numeroInscription}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Information personnelle ── */}
        <Section title="Information personnelle">
          <InfoGrid>
            <InfoCell label="NOM & PRÉNOM"    value={`${medecin.nom || ""} ${medecin.prenom || ""}`.trim()} />
            <InfoCell label="NNI"             value={medecin.nni} />
            <InfoCell label="GENRE"           value={medecin.sexe} />
            <InfoCell label="TÉLÉPHONE"       value={medecin.telephone} />
            <InfoCell label="DATE DE NAISSANCE" value={formatDate(medecin.dateNaissance)} />
            <InfoCell label="NATIONALITÉ"     value={medecin.nationalite} />
            <InfoCell label="ADRESSE MAIL"    value={medecin.email} />
            <InfoCell label="ADRESSE"         value={medecin.adresse} />
          </InfoGrid>

          {/* Statut + commentaire admin */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Statut</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${sc.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {medecin.statut || "—"}
            </span>
          </div>

          {medecin.adminComment && (
            <div className="mx-6 mb-5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">
                Commentaire administratif
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">{medecin.adminComment}</p>
            </div>
          )}
        </Section>

        {/* ── Information sur l'éducation ── */}
        <Section title="Information sur l'éducation">
          {medecin.educations?.length ? (
            <div className="space-y-4">
              {medecin.educations.map((edu, i) => (
                <div key={edu.id || i}>
                  {i > 0 && <div className="border-t border-slate-100 dark:border-slate-800" />}
                  <InfoGrid>
                    <InfoCell label="SPÉCIALITÉ"                  value={edu.specialiteLibelle} />
                    <InfoCell label="PAYS"                        value={edu.pays} />
                    <InfoCell label="VILLE"                       value={edu.ville} />
                    <InfoCell label="UNIVERSITÉ"                  value={edu.universite} />
                    <InfoCell label="SOUS-SPÉCIALITÉ"             value={edu.sousSpecialiteLibelle} />
                    <InfoCell label="DIPLÔME OBTENU"              value={edu.diplome} />
                    <InfoCell label="ANNÉE D'OBTENTION DE DIPLÔME" value={edu.anneeObtention} />
                    <InfoCell label="VILLE"                       value={edu.ville} />
                  </InfoGrid>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow label="Aucune information d'éducation disponible." />
          )}
        </Section>

        {/* ── Expérience professionnelle ── */}
        <Section title="Expérience professionnelle">
          {medecin.experiences?.length ? (
            <div className="space-y-4">
              {medecin.experiences.map((exp, i) => (
                <div key={exp.id || i}>
                  {i > 0 && <div className="border-t border-slate-100 dark:border-slate-800" />}
                  <InfoGrid cols={4}>
                    <InfoCell label="POSTE OCCUPÉ"  value={exp.poste} />
                    <InfoCell label="DATE DE DÉBUT" value={formatDate(exp.dateDebut)} />
                    <InfoCell label="DATE DE FIN"   value={formatDate(exp.dateFin)} />
                    <InfoCell label="VILLE"         value={exp.ville} />
                  </InfoGrid>
                  <div className="px-6 pb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      DESCRIPTION
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {exp.description || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow label="Aucune expérience professionnelle disponible." />
          )}
        </Section>

        {/* ── Documents requis ── */}
        <Section title="Documents requis">
          {medecin.documents?.length ? (
            <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {medecin.documents.map((doc, i) => (
                <div
                  key={doc.id || i}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  {/* Icône PDF */}
                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {doc.fileName || "Document"}
                    </p>
                    {doc.size != null && (
                      <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(doc.size)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`http://localhost:8080/${doc.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Voir"
                    >
                      <Eye size={14} />
                    </a>
                    <button
                      onClick={() => downloadFile(`http://localhost:8080/${doc.filePath}`, doc.fileName)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Télécharger"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow label="Aucun document disponible." />
          )}
        </Section>

      </div>

      {/* ── Modal Suspension ── */}
      {showSuspendModal && (
        <Modal onClose={() => { setShowSuspendModal(false); setSuspendComment(""); }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Suspendre le médecin</h2>
              <p className="text-xs text-slate-400 mt-0.5">Un motif est obligatoire.</p>
            </div>
            <button onClick={() => { setShowSuspendModal(false); setSuspendComment(""); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={18} />
            </button>
          </div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Commentaire <span className="text-red-500">*</span>
          </label>
          <textarea
            value={suspendComment}
            onChange={(e) => setSuspendComment(e.target.value)}
            placeholder="Raison de la suspension…"
            rows={4}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/15 transition-all resize-none"
          />
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => { setShowSuspendModal(false); setSuspendComment(""); }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSuspend}
              disabled={!suspendComment.trim() || actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PauseCircle size={15} />
              {actionLoading ? "Suspension…" : "Confirmer"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Suppression ── */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Supprimer le médecin</h2>
              <p className="text-xs text-slate-400 mt-0.5">Cette action est irréversible.</p>
            </div>
            <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
            Voulez-vous vraiment supprimer{" "}
            <span className="font-semibold text-slate-800 dark:text-white">
              Dr. {medecin.prenom} {medecin.nom}
            </span>{" "}
            du registre ?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={15} />
              {actionLoading ? "Suppression…" : "Supprimer définitivement"}
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

/* ═══════════════════════════════════════════
   Sous-composants
═══════════════════════════════════════════ */
function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">{title}</h2>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function InfoGrid({ children, cols = 4 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols === 4 ? "xl:grid-cols-4" : "xl:grid-cols-2"} divide-y divide-slate-100 dark:divide-slate-800 sm:divide-x sm:divide-y-0 xl:divide-x xl:divide-y-0`}>
      {children}
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-words">
        {value || <span className="text-slate-300 dark:text-slate-600 font-normal">—</span>}
      </p>
    </div>
  );
}

function EmptyRow({ label }) {
  return (
    <div className="px-6 py-8 text-center text-sm text-slate-400">{label}</div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/35 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-800">
        {children}
      </div>
    </div>
  );
}

export default AdminMedecinDetail;