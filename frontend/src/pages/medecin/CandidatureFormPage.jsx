import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Upload,
  X,
  AlertTriangle,
  AlertCircle,
  Send,
  Save,
  ShieldCheck,
} from "lucide-react";

import MedecinLayout from "../../components/medecin/MedecinLayout";
import {
  getElectionDetail,
  candidater,
  uploadCandidatureDocument,
  finaliserCandidature,
  deleteDocument,
} from "../../services/medecinElectionApi";
import { extractApiError } from "../../utils/apiUtils";

const STEPS = ["Candidature", "Documents", "Confirmation"];

const DOCUMENT_TYPES = [
  {
    key: "PHOTO",
    label: "Photo professionnelle",
    required: true,
    accept: "image/*",
    hint: "Photo claire du candidat.",
  },
  {
    key: "LETTRE_CANDIDATURE",
    label: "Lettre de candidature",
    required: true,
    accept: ".pdf,.doc,.docx",
    hint: "Document officiel présentant votre candidature.",
  },
  {
    key: "PROGRAMME_ELECTORAL",
    label: "Programme électoral",
    required: false,
    accept: ".pdf,.doc,.docx",
    hint: "Programme ou engagements proposés aux électeurs.",
  },
];

const DECLARATIONS = [
  "Je certifie l’exactitude des informations fournies dans ma candidature.",
  "Je m’engage à respecter le règlement électoral de l’ONMM.",
  "J’autorise la publication de ma candidature auprès des électeurs éligibles.",
  "Je m’engage à mener une campagne loyale et conforme à l’éthique médicale.",
];

const STATUTS_BLOQUANTS = ["SOUMISE", "EN_REVUE", "VALIDEE"];

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  SOUMISE: "Soumise",
  EN_REVUE: "En revue",
  VALIDEE: "Validée",
  REJETEE: "Rejetée",
  RETIREE: "Retirée",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

const textAreaCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      {hint && <p className="mb-2 text-xs text-slate-400">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Stepper({ current }) {
  return (
    <div className="mb-8 border-b border-slate-100 pb-7 dark:border-slate-800">
      <div className="flex items-center justify-between gap-4">
        {STEPS.map((label, i) => {
          const active = i === current;
          const done = i < current;

          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    active || done
                      ? "bg-green-600 text-white"
                      : "bg-slate-300 text-white dark:bg-slate-700"
                  }`}
                >
                  {done ? <CheckCircle2 size={16} /> : i + 1}
                </div>

                <span
                  className={`hidden text-sm font-semibold md:block ${
                    active
                      ? "text-green-600 dark:text-green-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <ChevronRight
                  size={18}
                  className="mx-6 shrink-0 text-slate-300 dark:text-slate-600"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>{message}</p>
      </div>
    </div>
  );
}

function InfoBox({ children, tone = "blue" }) {
  const styles = {
    blue: "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-400",
    amber:
      "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-400",
    green:
      "border-green-100 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>
      <div className="flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <p>{children}</p>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(size) {
  if (!size) return "—";
  return `${Math.round(size / 1024)} Ko`;
}

function getElectionTitle(election) {
  return election?.titre || election?.nom || election?.libelle || "Élection ordinale";
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}

function StatePage({ icon: Icon, title, message, action, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  };

  return (
    <MedecinLayout title={title}>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 text-center shadow-sm dark:bg-slate-900">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${tones[tone]}`}
          >
            <Icon size={30} />
          </div>

          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {message}
          </p>

          {action}
        </div>
      </div>
    </MedecinLayout>
  );
}

function StepCandidature({
  election,
  positions,
  positionId,
  setPositionId,
  declaration,
  setDeclaration,
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">
        Informations de candidature
      </h2>

      <p className="mb-6 text-sm text-slate-500">
        Choisissez le poste visé puis présentez clairement votre motivation.
      </p>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
        <p className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">
          Élection concernée
        </p>

        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <SummaryItem label="Titre" value={getElectionTitle(election)} />
          <SummaryItem label="Statut" value={election?.statut} />
          <SummaryItem
            label="Candidatures"
            value={
              election?.candidatureEndDate
                ? `Jusqu’au ${formatDate(election.candidatureEndDate)}`
                : "—"
            }
          />
          <SummaryItem
            label="Postes disponibles"
            value={`${positions.length} poste${positions.length > 1 ? "s" : ""}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {positions.length > 0 ? (
          <Field label="Poste visé" required>
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              className={inputCls}
            >
              <option value="">Sélectionner un poste</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.libelle}
                </option>
              ))}
            </select>
          </Field>
        ) : election?.positions?.length > 0 ? (
          <InfoBox tone="amber">
            Aucun poste éligible pour votre profil dans cette élection.
          </InfoBox>
        ) : null}

        <Field
          label="Déclaration de candidature"
          required
          hint="Présentez votre motivation, votre expérience et votre vision pour le mandat."
        >
          <textarea
            rows={6}
            value={declaration}
            onChange={(e) => setDeclaration(e.target.value)}
            placeholder="Présentez votre candidature..."
            className={textAreaCls}
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Minimum conseillé : 40 caractères</span>
            <span>{declaration.length}</span>
          </div>
        </Field>
      </div>
    </section>
  );
}

function DocumentRow({
  doc,
  selectedFile,
  existingDoc,
  progress,
  onSelect,
  onRemoveSelected,
  onRemoveExisting,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {doc.label}
            {doc.required && <span className="ml-1 text-red-500">*</span>}
          </p>
          <p className="mt-1 text-xs text-slate-400">{doc.hint}</p>
        </div>

        {(selectedFile || existingDoc) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 size={11} />
            Ajouté
          </span>
        )}
      </div>

      {selectedFile ? (
        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-white px-4 py-3 dark:border-green-900/40 dark:bg-slate-900">
          <FileText size={16} className="shrink-0 text-green-600" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-400">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>

          {progress === "uploading" ? (
            <Loader2 size={15} className="animate-spin text-green-600" />
          ) : progress === "done" ? (
            <span className="text-xs font-bold text-green-600">Envoyé</span>
          ) : (
            <button
              type="button"
              onClick={onRemoveSelected}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              <X size={15} />
            </button>
          )}
        </div>
      ) : existingDoc ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <FileText size={16} className="shrink-0 text-slate-400" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
              {existingDoc.name || "Document déjà téléversé"}
            </p>
            <p className="text-xs text-slate-400">Document existant</p>
          </div>

          <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Remplacer
            <input
              type="file"
              className="hidden"
              accept={doc.accept}
              onChange={(e) => onSelect(e.target.files?.[0] || null)}
            />
          </label>

          <button
            type="button"
            onClick={onRemoveExisting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-4 transition hover:border-green-400 hover:bg-green-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-green-700 dark:hover:bg-green-900/10">
          <Upload size={18} className="shrink-0 text-slate-400" />

          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Choisir un fichier
            </p>
            <p className="text-xs text-slate-400">PDF, DOC, DOCX ou image — max 5 Mo</p>
          </div>

          <input
            type="file"
            className="hidden"
            accept={doc.accept}
            onChange={(e) => onSelect(e.target.files?.[0] || null)}
          />
        </label>
      )}
    </div>
  );
}

function StepDocuments({
  files,
  existingDocs,
  uploadProgress,
  onFileChange,
  onRemoveExisting,
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">
        Documents de candidature
      </h2>

      <p className="mb-6 text-sm text-slate-500">
        Téléversez les documents requis. Les fichiers ne doivent pas dépasser 5 Mo.
      </p>

      <div className="space-y-4">
        {DOCUMENT_TYPES.map((doc) => (
          <DocumentRow
            key={doc.key}
            doc={doc}
            selectedFile={files[doc.key]}
            existingDoc={existingDocs[doc.key]}
            progress={uploadProgress[doc.key]}
            onSelect={(file) => onFileChange(doc.key, file)}
            onRemoveSelected={() => onFileChange(doc.key, null)}
            onRemoveExisting={() => onRemoveExisting(doc.key)}
          />
        ))}
      </div>
    </section>
  );
}

function StepConfirmation({
  election,
  positions,
  positionId,
  declaration,
  docsCount,
  declarations,
  setDeclarations,
}) {
  const selectedPosition =
    positions.find((p) => String(p.id) === String(positionId))?.libelle || "—";

  return (
    <section>
      <h2 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">
        Aperçu & confirmation
      </h2>

      <p className="mb-6 text-sm text-slate-500">
        Vérifiez votre dossier puis confirmez la soumission officielle.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
        <p className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">
          Résumé
        </p>

        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <SummaryItem label="Élection" value={getElectionTitle(election)} />
          <SummaryItem label="Poste" value={selectedPosition} />
          <SummaryItem label="Documents" value={`${docsCount} fichier(s)`} />
          <SummaryItem label="Transmission" value="Après confirmation finale" />
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Déclaration
          </p>
          <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {declaration || "—"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-400">
        En soumettant cette candidature, vous confirmez formellement les déclarations ci-dessous.
      </div>

      <div className="mt-5 space-y-3">
        {DECLARATIONS.map((text, index) => (
          <label
            key={text}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-green-200 hover:bg-green-50/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-green-900/50 dark:hover:bg-green-900/10"
          >
            <input
              type="checkbox"
              checked={declarations[index]}
              onChange={(e) => {
                const next = [...declarations];
                next[index] = e.target.checked;
                setDeclarations(next);
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-green-600"
            />

            <span className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {text}
            </span>
          </label>
        ))}
      </div>
    </section>
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

  const [files, setFiles] = useState({});
  const [existingDocs, setExistingDocs] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const [declarations, setDeclarations] = useState(DECLARATIONS.map(() => false));

  const [submitting, setSubmitting] = useState(false);
  const [candidatureId, setCandidatureId] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getElectionDetail(id);
        const currentElection = res.data;

        setElection(currentElection);

        const candidature = currentElection?.maCandidature;

        if (candidature) {
          setCandidatureId(candidature.id);

          if (candidature.statut === "BROUILLON") {
            setPositionId(candidature.position?.id?.toString() || "");
            setDeclaration(candidature.declarationCandidature || "");

            const docsMap = {};
            (candidature.documents || []).forEach((doc) => {
              const type = doc.typeDocument || doc.type;
              if (!type) return;

              docsMap[type] = {
                id: doc.id,
                name: doc.originalFilename || doc.fileName || doc.nomFichier,
                url: doc.fileUrl || doc.filePath,
              };
            });

            setExistingDocs(docsMap);

            if (docsMap.PHOTO && docsMap.LETTRE_CANDIDATURE) {
              setStep(1);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setElection(null);
        setError("Impossible de charger cette élection.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const maCandidature = election?.maCandidature;

  const existingBlocks =
    maCandidature && STATUTS_BLOQUANTS.includes(maCandidature.statut);

  const peutCandidater =
    election?.peutCandidater ??
    (election?.statut === "CANDIDATURE_OUVERTE" && !existingBlocks);

  const positions = election?.positionsEligibles ?? election?.positions ?? [];

  const docsCount = useMemo(() => {
    const selected = Object.values(files).filter(Boolean).length;
    const existing = Object.keys(existingDocs).filter((key) => !files[key]).length;
    return selected + existing;
  }, [files, existingDocs]);

  const allDeclarationChecked = declarations.every(Boolean);

  const handleFileChange = (type, file) => {
    if (!file) {
      setFiles((prev) => ({ ...prev, [type]: null }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`Le fichier "${file.name}" dépasse la taille maximale autorisée de 5 Mo.`);
      return;
    }

    setError("");
    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleRemoveExisting = async (type) => {
    const doc = existingDocs[type];

    if (!doc || !candidatureId) return;

    try {
      await deleteDocument(candidatureId, doc.id);

      setExistingDocs((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const validateStep = () => {
    setError("");

    if (step === 0) {
      if (positions.length > 0 && !positionId) {
        setError("Veuillez choisir le poste visé.");
        return false;
      }

      if (!declaration.trim()) {
        setError("La déclaration de candidature est obligatoire.");
        return false;
      }

      if (declaration.trim().length < 40) {
        setError("La déclaration doit contenir au moins 40 caractères.");
        return false;
      }
    }

    if (step === 1) {
      const missing = DOCUMENT_TYPES.filter(
        (doc) => doc.required && !files[doc.key] && !existingDocs[doc.key]
      );

      if (missing.length > 0) {
        setError(
          `Document(s) obligatoire(s) manquant(s) : ${missing
            .map((doc) => doc.label)
            .join(", ")}.`
        );
        return false;
      }
    }

    if (step === 2 && !allDeclarationChecked) {
      setError("Veuillez cocher toutes les déclarations avant de soumettre.");
      return false;
    }

    return true;
  };

  const next = async () => {
    if (!validateStep()) return;

    if (step === 0) {
      setSubmitting(true);

      try {
        const res = await candidater(id, {
          positionId: positionId ? Number(positionId) : null,
          declarationCandidature: declaration.trim(),
          soumettre: false,
        });

        setCandidatureId(res.data.id);
        setStep(1);
      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setSubmitting(false);
      }

      return;
    }

    if (step === 1) {
      if (!candidatureId) {
        setError("Aucun brouillon de candidature n’a été trouvé.");
        return;
      }

      setSubmitting(true);

      try {
        for (const doc of DOCUMENT_TYPES) {
          const file = files[doc.key];
          if (!file) continue;

          setUploadProgress((prev) => ({ ...prev, [doc.key]: "uploading" }));

          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", doc.key);

          await uploadCandidatureDocument(candidatureId, formData);

          setUploadProgress((prev) => ({ ...prev, [doc.key]: "done" }));

          setExistingDocs((prev) => ({
            ...prev,
            [doc.key]: {
              name: file.name,
              url: null,
            },
          }));
        }

        setStep(2);
      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setSubmitting(false);
      }

      return;
    }
  };

  const prev = () => {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  };

  const finalSubmit = async () => {
    if (!validateStep()) return;

    if (!candidatureId) {
      setError("Aucun brouillon de candidature n’a été trouvé.");
      return;
    }

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

  if (loading) {
    return (
      <MedecinLayout title="Candidature">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={24} className="animate-spin text-green-500" />
        </div>
      </MedecinLayout>
    );
  }

  if (maCandidature && STATUTS_BLOQUANTS.includes(maCandidature.statut)) {
    return (
      <StatePage
        icon={AlertCircle}
        tone="amber"
        title="Candidature déjà soumise"
        message={`Vous avez déjà une candidature ${
          STATUT_LABELS[maCandidature.statut] || maCandidature.statut
        } pour cette élection.`}
        action={
          <button
            onClick={() => navigate(`/medecin/elections/${id}`)}
            className="mt-6 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Retour à l’élection
          </button>
        }
      />
    );
  }

  if (!election || (!peutCandidater && !maCandidature)) {
    return (
      <StatePage
        icon={AlertCircle}
        title="Candidature indisponible"
        message={
          election?.raisonIneligibilite ||
          (election?.statut !== "CANDIDATURE_OUVERTE"
            ? "Les candidatures ne sont pas ouvertes pour cette élection."
            : "Vous ne pouvez pas déposer une candidature pour cette élection.")
        }
        action={
          <button
            onClick={() => navigate(`/medecin/elections/${id}`)}
            className="mt-6 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Retour à l’élection
          </button>
        }
      />
    );
  }

  if (done) {
    return (
      <StatePage
        icon={CheckCircle2}
        tone="green"
        title="Candidature soumise"
        message="Votre candidature a été enregistrée et sera examinée par l’administration de l’ONMM. Vous serez notifié du résultat."
        action={
          <button
            onClick={() => navigate("/medecin/elections")}
            className="mt-6 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Retour aux élections
          </button>
        }
      />
    );
  }

  return (
    <MedecinLayout title="Soumettre ma candidature">
      <div className="min-h-screen bg-[#FAFBFC] px-7 py-6 dark:bg-slate-950">
        <button
          onClick={() => navigate(`/medecin/elections/${id}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <ArrowLeft size={15} />
          Retour à l’élection
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Soumettre ma candidature
          </h1>

          {/* <p className="mt-1 text-sm text-slate-500">
            Complétez votre dossier de candidature pour l’élection sélectionnée.
          </p> */}
        </div>

        {maCandidature?.statut === "BROUILLON" && (
          <div className="mb-5">
            <InfoBox tone="blue">
              Vous reprenez un brouillon existant. Vérifiez vos informations avant de soumettre.
            </InfoBox>
          </div>
        )}

        {election?.raisonIneligibilite && maCandidature?.statut === "REJETEE" && (
          <div className="mb-5">
            <InfoBox tone="amber">{election.raisonIneligibilite}</InfoBox>
          </div>
        )}

        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
          <Stepper current={step} />

          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {step === 0 && (
                  <StepCandidature
                    election={election}
                    positions={positions}
                    positionId={positionId}
                    setPositionId={setPositionId}
                    declaration={declaration}
                    setDeclaration={setDeclaration}
                  />
                )}

                {step === 1 && (
                  <StepDocuments
                    files={files}
                    existingDocs={existingDocs}
                    uploadProgress={uploadProgress}
                    onFileChange={handleFileChange}
                    onRemoveExisting={handleRemoveExisting}
                  />
                )}

                {step === 2 && (
                  <StepConfirmation
                    election={election}
                    positions={positions}
                    positionId={positionId}
                    declaration={declaration}
                    docsCount={docsCount}
                    declarations={declarations}
                    setDeclarations={setDeclarations}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {error && (
            <div className="mt-6">
              <ErrorBox message={error} />
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
            <button
              onClick={step === 0 ? () => navigate(`/medecin/elections/${id}`) : prev}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ChevronLeft size={15} />
              {step === 0 ? "Quitter" : "Précédent"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    Suivant
                    <ChevronRight size={15} />
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/medecin/elections")}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Save size={15} />
                  Garder brouillon
                </button>

                <button
                  onClick={finalSubmit}
                  disabled={submitting || !allDeclarationChecked}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={15} />
                      Soumettre
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={14} />
          Les informations soumises seront examinées par l’administration de l’Ordre.
        </div>
      </div>
    </MedecinLayout>
  );
}