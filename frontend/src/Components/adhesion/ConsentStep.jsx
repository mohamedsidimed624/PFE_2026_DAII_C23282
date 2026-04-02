import { useState } from "react";
import { useFormData } from "../../context/FormContext";
import { createDemande } from "../../services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getSpecialites, getSousSpecialites } from "../../services/api";
import {
  User,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  Home,
  FolderSearch,
  ShieldCheck,
} from "lucide-react";

function ConsentStep({ prevStep }) {
  const { formData, setSubmitted, resetForm } = useFormData();

  const [consent,           setConsent]           = useState(false);
  const [error,             setError]             = useState("");
  const [success,           setSuccess]           = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [submissionResult,  setSubmissionResult]  = useState(null);

  const navigate = useNavigate();

  /* ── Soumission ── */
  const handleSubmit = async () => {
    if (!consent) {
      setError("Veuillez accepter la déclaration avant de soumettre.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1. Créer la demande
      const demande   = await createDemande(formData.personal);
      const demandeId = demande.id;
      if (!demandeId) throw new Error("ID de la demande introuvable après création.");

      // 2. Éducations
      
      const specialitesRes = await getSpecialites();
      const specialites = specialitesRes.data || [];

      for (const edu of formData.education) {
        const selectedSpecialite = specialites.find(
          (s) => String(s.id) === String(edu.specialite)
        );

        let sousSpecialites = [];
        if (edu.specialite) {
          const sousSpecialitesRes = await getSousSpecialites(edu.specialite);
          sousSpecialites = sousSpecialitesRes.data || [];
        }

        const selectedSousSpecialite = sousSpecialites.find(
          (ss) => String(ss.id) === String(edu.sousSpecialite)
        );

        await axios.post(`http://localhost:8080/api/demandes/${demandeId}/educations`, {
          specialite: selectedSpecialite?.nom || edu.specialite,
          sousSpecialite: selectedSousSpecialite?.nom || edu.sousSpecialite,
          diplome: edu.diplome,
          anneeObtention: edu.annee,
          pays: edu.pays,
          ville: edu.ville,
          universite: edu.universite,
        });
      }

      // 3. Expériences
      for (const exp of formData.experience) {
        await axios.post(`http://localhost:8080/api/demandes/${demandeId}/experiences`, {
          poste:            exp.poste,
          nomEtablissement: exp.etablissement,
          ville:            exp.ville,
          pays:             exp.pays,
          dateDebut:        exp.dateDebut,
          dateFin:          exp.dateFin || null,
          description:      exp.description,
        });
      }

      // 4. Upload documents
      const uploadDocument = async (type, categorie, file) => {
        const data = new FormData();
        data.append("typeDocument", type);
        data.append("categorie",    categorie);
        data.append("file",         file);
        await axios.post(`http://localhost:8080/api/demandes/${demandeId}/documents`, data);
      };

      for (const doc of formData.documents.diplomes)    await uploadDocument("DIPLOME",    "diplome",    doc.file);
      for (const doc of formData.documents.certificats) await uploadDocument("CERTIFICAT", "certificat", doc.file);
      for (const doc of formData.documents.autres)      await uploadDocument("AUTRE",      "autre",      doc.file);

      localStorage.removeItem("adhesionForm");
      setSubmissionResult(demande);
      setSuccess(true);
      setSubmitted(true);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Erreur lors de la soumission.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Écran de succès ── */
  if (success && submissionResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6">

        {/* Icône */}
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Demande soumise avec succès !
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Votre demande a bien été enregistrée. Conservez votre numéro de dossier pour suivre son état.
          </p>
        </div>

        {/* Numéro de dossier */}
        <div className="bg-green-50 border border-green-200 rounded-2xl px-8 py-5 w-full max-w-xs">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
            Numéro de dossier
          </p>
          <p className="text-2xl font-bold text-green-700 tracking-tight">
            {submissionResult.numeroDossier}
          </p>
        </div>

        <p className="text-xs text-slate-400">
          Vous recevrez également un e-mail de confirmation.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            onClick={() => { navigate("/"); resetForm(); }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Home size={15} />
            Retour à l'accueil
          </button>
          <button
            onClick={() => { navigate("/suivi-dossier"); resetForm(); }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm"
          >
            <FolderSearch size={15} />
            Suivre mon dossier
          </button>
        </div>
      </div>
    );
  }

  /* ── Formulaire principal ── */
  return (
    <div className="space-y-6">

      {/* ── Résumé ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Informations personnelles */}
        <ResumeCard icon={<User size={16} />} title="Informations personnelles">
          <div className="space-y-2">
            <ResumeRow label="Nom"       value={formData.personal.nom} />
            <ResumeRow label="Prénom"    value={formData.personal.prenom} />
            <ResumeRow label="Email"     value={formData.personal.email} />
            <ResumeRow label="Téléphone" value={formData.personal.telephone} />
          </div>
        </ResumeCard>

        {/* Éducation */}
        <ResumeCard icon={<GraduationCap size={16} />} title="Éducation">
          {formData.education.length === 0 ? (
            <EmptyEntry label="Aucune formation renseignée" />
          ) : (
            <div className="space-y-3">
              {formData.education.map((edu, i) => (
                <div key={i} className={i > 0 ? "pt-3 border-t border-slate-100" : ""}>
                  <p className="text-sm font-semibold text-slate-800">{edu.specialite}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {edu.universite}{edu.pays ? ` — ${edu.pays}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ResumeCard>

        {/* Expérience */}
        <ResumeCard icon={<Briefcase size={16} />} title="Expérience">
          {formData.experience.length === 0 ? (
            <EmptyEntry label="Aucune expérience renseignée" />
          ) : (
            <div className="space-y-3">
              {formData.experience.map((exp, i) => (
                <div key={i} className={i > 0 ? "pt-3 border-t border-slate-100" : ""}>
                  <p className="text-sm font-semibold text-slate-800">{exp.poste}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{exp.etablissement}</p>
                </div>
              ))}
            </div>
          )}
        </ResumeCard>

        {/* Documents */}
        <ResumeCard icon={<FileText size={16} />} title="Documents">
          <div className="space-y-2">
            <DocRow label="Diplômes"    count={formData.documents.diplomes.length} />
            <DocRow label="Certificats" count={formData.documents.certificats.length} />
            <DocRow label="Autres"      count={formData.documents.autres.length} />
          </div>
        </ResumeCard>

      </div>

      {/* ── Consentement ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck size={15} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-0.5">Déclaration sur l'honneur</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              En cochant cette case, vous certifiez que toutes les informations fournies dans ce formulaire sont exactes, complètes et conformes à la réalité. Toute fausse déclaration pourra entraîner le rejet de votre dossier.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <div className="relative shrink-0">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setError(""); }}
              className="peer sr-only"
            />
            <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-green-600 peer-checked:bg-green-600 transition-colors flex items-center justify-center">
              {consent && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
            </div>
          </div>
          <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
            Je certifie que les informations fournies sont exactes et j'accepte les conditions.
          </span>
        </label>

        {error && (
          <div className="flex items-center gap-2 mt-3 text-red-600 text-xs">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* ── Boutons navigation ── */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ArrowLeft size={15} />
          Retour
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Send size={15} />
              Soumettre la demande
            </>
          )}
        </button>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════
   Sous-composants
═══════════════════════════════════════════ */
function ResumeCard({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ResumeRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-semibold text-slate-400 w-20 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 font-medium break-all">{value || "—"}</span>
    </div>
  );
}

function DocRow({ label, count }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${count > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
        {count} fichier{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

function EmptyEntry({ label }) {
  return <p className="text-xs text-slate-400 italic">{label}</p>;
}

export default ConsentStep;