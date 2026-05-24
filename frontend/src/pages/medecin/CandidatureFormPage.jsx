import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Loader2, Upload, FileText, X,
  AlertTriangle, AlertCircle,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import {
  getElectionDetail, candidater, uploadCandidatureDocument,
  finaliserCandidature, deleteDocument,
} from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";

const STEPS = ["Poste & Déclaration", "Documents", "Confirmation"];

const DOCUMENT_TYPES = [
  { key: "PHOTO",               label: "Photo professionnelle",  required: true,  accept: "image/*" },
  { key: "LETTRE_CANDIDATURE",  label: "Lettre de candidature",  required: true,  accept: ".pdf,.doc,.docx" },
  { key: "PROGRAMME_ELECTORAL", label: "Programme électoral",    required: false, accept: ".pdf,.doc,.docx" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DECLARATIONS = [
  "Je certifie l'exactitude des informations fournies dans ma candidature.",
  "Je m'engage à respecter le règlement électoral de l'ONMM.",
  "J'autorise la publication de ma candidature auprès des électeurs éligibles.",
  "Je m'engage à mener une campagne loyale et conforme à l'éthique médicale.",
];

const STATUTS_BLOQUANTS = ["SOUMISE", "EN_REVUE", "VALIDEE"];

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  SOUMISE:   "Soumise",
  EN_REVUE:  "En revue",
  VALIDEE:   "Validée",
  REJETEE:   "Rejetée",
  RETIREE:   "Retirée",
};

const INPUT_CLS =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[13px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500";

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10 p-4 flex gap-3">
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
      <p className="text-[12px] text-red-700 dark:text-red-400">{msg}</p>
    </div>
  );
}

export default function CandidatureFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  const [positionId, setPositionId] = useState("");
  const [declaration, setDeclaration] = useState("");
  const [programme, setProgramme] = useState("");

  // Fichiers sélectionnés dans la session courante
  const [files, setFiles] = useState({});
  // Documents déjà uploadés (depuis le brouillon)
  const [existingDocs, setExistingDocs] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const [declarations, setDeclarations] = useState([false, false, false, false]);
  const [submitting, setSubmitting] = useState(false);
  const [candidatureId, setCandidatureId] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    getElectionDetail(id)
      .then((res) => {
        const e = res.data;
        setElection(e);
        const mc = e.maCandidature;
        if (mc) {
          setCandidatureId(mc.id);
          if (mc.statut === "BROUILLON") {
            setPositionId(mc.position?.id?.toString() ?? "");
            setDeclaration(mc.declarationCandidature ?? "");
            setProgramme(mc.programmeElectoral ?? "");
            // Charger les documents existants
            const docsMap = {};
            (mc.documents ?? []).forEach((d) => {
              docsMap[d.typeDocument] = {
                id: d.id,
                name: d.originalFilename,
                url: d.fileUrl,
              };
            });
            setExistingDocs(docsMap);
            // Choisir l'étape selon les documents disponibles
            const hasRequired = docsMap["PHOTO"] && docsMap["LETTRE_CANDIDATURE"];
            setStep(hasRequired ? 1 : 0);
          }
        }
      })
      .catch(() => setElection(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Derived
  const maCandidature = election?.maCandidature;
  const existingBlocks = maCandidature && STATUTS_BLOQUANTS.includes(maCandidature.statut);
  const peutCandidater = election?.peutCandidater ??
    (election?.statut === "CANDIDATURE_OUVERTE" && !existingBlocks);
  const positions = election?.positionsEligibles ?? election?.positions ?? [];

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleFileChange = (type, file) => {
    if (!file) {
      setFiles((p) => ({ ...p, [type]: null }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`Fichier trop volumineux (max 5 Mo) : ${file.name}`);
      return;
    }
    setError("");
    setFiles((p) => ({ ...p, [type]: file }));
  };

  const handleRemoveExisting = async (type) => {
    const doc = existingDocs[type];
    if (!doc) return;
    try {
      await deleteDocument(candidatureId, doc.id);
      setExistingDocs((p) => { const n = { ...p }; delete n[type]; return n; });
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const handleStep0Submit = async () => {
    if (!declaration.trim()) { setError("La déclaration de candidature est requise."); return; }
    if (positions.length > 0 && !positionId) { setError("Veuillez choisir un poste."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await candidater(id, {
        positionId: positionId ? Number(positionId) : null,
        declarationCandidature: declaration,
        programmeElectoral: programme || null,
        soumettre: false,
      });
      setCandidatureId(res.data.id);
      setStep(1);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentsSubmit = async () => {
    const missing = DOCUMENT_TYPES.filter(
      (d) => d.required && !files[d.key] && !existingDocs[d.key]
    );
    if (missing.length > 0) {
      setError(`Document(s) requis manquant(s) : ${missing.map((d) => d.label).join(", ")}`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      for (const dt of DOCUMENT_TYPES) {
        if (!files[dt.key]) continue;
        setUploadProgress((p) => ({ ...p, [dt.key]: "uploading" }));
        const fd = new FormData();
        fd.append("file", files[dt.key]);
        fd.append("type", dt.key);
        await uploadCandidatureDocument(candidatureId, fd);
        setUploadProgress((p) => ({ ...p, [dt.key]: "done" }));
        // Marquer comme doc existant après upload
        setExistingDocs((p) => ({
          ...p,
          [dt.key]: { name: files[dt.key].name, url: null },
        }));
      }
      setStep(2);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const allDeclarationChecked = declarations.every(Boolean);

  const handleFinalSubmit = async () => {
    if (!allDeclarationChecked) { setError("Veuillez cocher toutes les déclarations."); return; }
    setError("");
    setSubmitting(true);
    try {
      await finaliserCandidature(candidatureId);
      setDone(true);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const nbDocsTotal =
    Object.values(files).filter(Boolean).length +
    Object.keys(existingDocs).filter((k) => !files[k]).length;

  // ── Early returns ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <MedecinLayout title="Candidature">
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      </MedecinLayout>
    );
  }

  // Statut bloquant (SOUMISE, EN_REVUE, VALIDEE)
  if (maCandidature && STATUTS_BLOQUANTS.includes(maCandidature.statut)) {
    return (
      <MedecinLayout title="Candidature">
        <div className="flex flex-col items-center py-16 gap-4 px-4 text-center">
          <AlertCircle size={32} className="text-amber-500" />
          <h2 className="font-bold text-[16px] text-slate-800 dark:text-slate-100">
            Candidature déjà soumise
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm">
            Vous avez déjà une candidature{" "}
            <span className="font-semibold">{STATUT_LABELS[maCandidature.statut]}</span>{" "}
            pour cette élection.
          </p>
          <button
            onClick={() => navigate(`/medecin/elections/${id}`)}
            className="text-[12px] font-semibold text-blue-600 hover:underline"
          >
            Retour à l'élection
          </button>
        </div>
      </MedecinLayout>
    );
  }

  // Non éligible (pas de brouillon)
  if (!election || (!peutCandidater && !maCandidature)) {
    return (
      <MedecinLayout title="Candidature">
        <div className="flex flex-col items-center py-16 gap-3 px-4 text-center">
          <AlertCircle size={32} className="text-slate-300 dark:text-slate-600" />
          <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm">
            {election?.raisonIneligibilite ??
              (election?.statut !== "CANDIDATURE_OUVERTE"
                ? "Les candidatures ne sont pas ouvertes pour cette élection."
                : "Vous ne pouvez pas déposer une candidature pour cette élection.")}
          </p>
          <button
            onClick={() => navigate(`/medecin/elections/${id}`)}
            className="text-[12px] font-semibold text-blue-600 hover:underline"
          >
            Retour à l'élection
          </button>
        </div>
      </MedecinLayout>
    );
  }

  // Succès
  if (done) {
    return (
      <MedecinLayout title="Candidature soumise">
        <div className="flex flex-col items-center py-16 text-center px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-6"
          >
            <CheckCircle2 size={40} className="text-green-600" />
          </motion.div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Candidature soumise
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
            Votre candidature a été enregistrée et sera examinée par l'administration de l'ONMM.
            Vous serez notifié du résultat.
          </p>
          <button
            onClick={() => navigate("/medecin/elections")}
            className="rounded-xl bg-green-700 px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-green-800"
          >
            Retour aux élections
          </button>
        </div>
      </MedecinLayout>
    );
  }

  // ── Formulaire principal ──────────────────────────────────────────────────────

  return (
    <MedecinLayout title="Soumettre ma candidature">
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-xl space-y-5">
          <button
            onClick={() => navigate(`/medecin/elections/${id}`)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={13} /> Retour à l'élection
          </button>

          {/* Bannière brouillon en cours */}
          {maCandidature?.statut === "BROUILLON" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 p-3 flex gap-2 text-[12px] text-blue-700 dark:text-blue-400">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              Vous reprenez un brouillon. Vérifiez vos informations avant de continuer.
            </div>
          )}

          {/* Inéligibilité avec brouillon existant (REJETEE) */}
          {election?.raisonIneligibilite && maCandidature?.statut === "REJETEE" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10 p-3 flex gap-2 text-[12px] text-amber-700 dark:text-amber-400">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {election.raisonIneligibilite}
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition ${
                  i < step
                    ? "bg-green-600 text-white"
                    : i === step
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                }`}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-[11px] font-semibold hidden sm:block ${
                  i === step ? "text-blue-700 dark:text-blue-400" : "text-slate-400"
                }`}>{label}</span>
                {i < STEPS.length - 1 && <div className="h-px w-6 bg-slate-200 dark:bg-slate-700" />}
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-5">

            {/* ─── STEP 0 : Poste & Déclaration ─── */}
            {step === 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">Poste visé & Déclaration</h2>

                  {positions.length > 0 ? (
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Poste visé <span className="text-red-400">*</span>
                      </label>
                      <select
                        className={INPUT_CLS}
                        value={positionId}
                        onChange={(e) => setPositionId(e.target.value)}
                      >
                        <option value="">Sélectionner un poste…</option>
                        {positions.map((p) => (
                          <option key={p.id} value={p.id}>{p.libelle}</option>
                        ))}
                      </select>
                    </div>
                  ) : election?.positions?.length > 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-3 text-[12px] text-amber-700 dark:text-amber-400">
                      Aucun poste éligible pour votre profil dans cette élection.
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Déclaration de candidature <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={5}
                      className={INPUT_CLS}
                      value={declaration}
                      onChange={(e) => setDeclaration(e.target.value)}
                      placeholder="Présentez votre motivation et votre vision pour ce mandat…"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Programme électoral (facultatif)
                    </label>
                    <textarea
                      rows={4}
                      className={INPUT_CLS}
                      value={programme}
                      onChange={(e) => setProgramme(e.target.value)}
                      placeholder="Détaillez vos engagements et objectifs si vous êtes élu(e)…"
                    />
                  </div>

                  <ErrorBanner msg={error} />

                  <button
                    onClick={handleStep0Submit}
                    disabled={submitting}
                    className="w-full rounded-xl bg-blue-700 py-2.5 text-[13px] font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Suivant : Documents →"}
                  </button>
                </motion.div>
              </AnimatePresence>
            )}

            {/* ─── STEP 1 : Documents ─── */}
            {step === 1 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">Documents de candidature</h2>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">
                    Téléchargez vos documents (max 5 Mo par fichier). Les documents marqués{" "}
                    <span className="text-red-400">*</span> sont obligatoires.
                  </p>

                  <div className="space-y-4">
                    {DOCUMENT_TYPES.map((dt) => (
                      <div key={dt.key}>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          {dt.label} {dt.required && <span className="text-red-400">*</span>}
                        </label>

                        {/* Nouveau fichier sélectionné */}
                        {files[dt.key] ? (
                          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 px-3 py-2.5">
                            <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                            <span className="text-[12px] text-green-700 dark:text-green-400 truncate flex-1">
                              {files[dt.key].name}
                            </span>
                            {uploadProgress[dt.key] === "done" && (
                              <span className="text-[10px] font-bold text-green-600">Envoyé</span>
                            )}
                            {uploadProgress[dt.key] === "uploading" && (
                              <Loader2 size={12} className="animate-spin text-green-600 shrink-0" />
                            )}
                            {!uploadProgress[dt.key] && (
                              <button onClick={() => handleFileChange(dt.key, null)}>
                                <X size={14} className="text-slate-400 hover:text-red-500" />
                              </button>
                            )}
                          </div>

                        /* Document existant (déjà uploadé) */
                        ) : existingDocs[dt.key] ? (
                          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 px-3 py-2.5">
                            <FileText size={14} className="text-slate-400 shrink-0" />
                            <span className="text-[12px] text-slate-600 dark:text-slate-400 truncate flex-1">
                              {existingDocs[dt.key].name}
                            </span>
                            <span className="text-[10px] font-semibold text-green-600">Déjà uploadé</span>
                            <label className="cursor-pointer text-[11px] text-blue-600 hover:underline font-semibold ml-1">
                              Remplacer
                              <input
                                type="file"
                                className="hidden"
                                accept={dt.accept}
                                onChange={(e) => handleFileChange(dt.key, e.target.files?.[0] ?? null)}
                              />
                            </label>
                            <button onClick={() => handleRemoveExisting(dt.key)} className="ml-1">
                              <X size={14} className="text-slate-400 hover:text-red-500" />
                            </button>
                          </div>

                        /* Zone d'upload vide */
                        ) : (
                          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-3 py-3 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition">
                            <Upload size={14} className="text-slate-400 shrink-0" />
                            <span className="text-[12px] text-slate-500">Choisir un fichier…</span>
                            <input
                              type="file"
                              className="hidden"
                              accept={dt.accept}
                              onChange={(e) => handleFileChange(dt.key, e.target.files?.[0] ?? null)}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>

                  <ErrorBanner msg={error} />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(0)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={handleDocumentsSubmit}
                      disabled={submitting}
                      className="flex-2 flex-grow rounded-xl bg-blue-700 py-2.5 text-[13px] font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Suivant : Confirmation →"}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* ─── STEP 2 : Résumé + Confirmation ─── */}
            {step === 2 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">Récapitulatif & Confirmation</h2>

                  {/* Résumé */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 space-y-2 text-[12px]">
                    <p>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Élection : </span>
                      <span className="text-slate-500 dark:text-slate-400">{election?.titre}</span>
                    </p>
                    {positions.length > 0 && positionId && (
                      <p>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Poste : </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {positions.find((p) => p.id?.toString() === positionId)?.libelle ?? "—"}
                        </span>
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Déclaration : </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {declaration.substring(0, 120)}{declaration.length > 120 ? "…" : ""}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Documents joints : </span>
                      <span className="text-slate-500 dark:text-slate-400">{nbDocsTotal} fichier(s)</span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 flex gap-3">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                    <p className="text-[12px] text-amber-700 dark:text-amber-400">
                      En soumettant cette candidature, vous vous engagez formellement aux déclarations ci-dessous.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {DECLARATIONS.map((text, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                          checked={declarations[i]}
                          onChange={(e) => setDeclarations((prev) => {
                            const next = [...prev];
                            next[i] = e.target.checked;
                            return next;
                          })}
                        />
                        <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition">
                          {text}
                        </span>
                      </label>
                    ))}
                  </div>

                  <ErrorBanner msg={error} />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={handleFinalSubmit}
                      disabled={submitting || !allDeclarationChecked}
                      className="flex-grow rounded-xl bg-green-700 py-2.5 text-[13px] font-semibold text-white hover:bg-green-800 disabled:opacity-40 transition"
                    >
                      {submitting
                        ? <Loader2 size={16} className="mx-auto animate-spin" />
                        : "Soumettre ma candidature"}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}
