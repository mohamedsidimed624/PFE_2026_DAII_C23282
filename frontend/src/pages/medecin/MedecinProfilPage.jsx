import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Briefcase,
  FileText,
  Pencil,
  X,
  Plus,
  Trash2,
  Upload,
  Download,
  Loader2,
  Camera,
} from "lucide-react";

import MedecinLayout from "../../components/medecin/MedecinLayout";

import {
  getMyProfile,
  updateMyProfile,
  uploadMyPhoto,
  getMyEducations,
  addMyEducation,
  deleteMyEducation,
  getMyExperiences,
  addMyExperience,
  deleteMyExperience,
  getMyDocuments,
  uploadMyDocument,
  deleteMyDocument,
} from "../../services/medecinApi";

import { getSpecialites, getSousSpecialites } from "../../services/api";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const TABS = [
  { id: "profil", label: "Profil personnel", icon: User },
  { id: "education", label: "Éducation", icon: GraduationCap },
  { id: "experience", label: "Expériences", icon: Briefcase },
  { id: "documents", label: "Documents", icon: FileText },
];

const DOC_TYPES = [
  "DIPLOME",
  "CERTIFICAT",
  "ATTESTATION",
  "AUTORISATION",
  "AUTRE",
];

const DOC_CATS = [
  "DIPLOME",
  "CERTIFICAT",
  "AUTORISATION",
  "EXPERIENCE",
  "AUTRE",
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function maskNni(value) {
  if (!value) return "—";

  const raw = String(value);
  if (raw.length <= 4) return "****";

  return `${raw.slice(0, 4)}********${raw.slice(-2)}`;
}

function formatDate(value) {
  if (!value) return "—";
  return String(value).slice(0, 10);
}

function StatutBadge({ statut }) {
  const s = String(statut || "").toUpperCase();

  if (["ACTIF", "ACTIVE"].includes(s)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Actif
      </span>
    );
  }

  if (["EN_ATTENTE", "PENDING"].includes(s)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        En attente
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      {statut || "—"}
    </span>
  );
}

function Field({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
        {value || "—"}
      </p>
    </div>
  );
}

function InfoCard({ title, onEdit, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">
          {title}
        </h2>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Modifier"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  const IconComp = icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <IconComp
        size={24}
        className="mb-2 text-slate-300 dark:text-slate-600"
      />

      <p className="text-sm text-slate-400 dark:text-slate-500">{text}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Modal base
───────────────────────────────────────────── */

function ModalBase({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <p className="font-bold text-slate-900 dark:text-white">{title}</p>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex shrink-0 gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Education modal
───────────────────────────────────────────── */

function EducationModal({ onClose, onSaved }) {
  const [f, setF] = useState({
    diplome: "",
    specialiteId: "",
    sousSpecialiteId: "",
    anneeObtention: "",
    universite: "",
    pays: "",
    ville: "",
  });

  const [specialites, setSpecialites] = useState([]);
  const [sousSpecialites, setSousSpecialites] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    getSpecialites()
      .then((r) => setSpecialites(r.data || []))
      .catch(() => {});
  }, []);

  const handleSpecialite = (id) => {
    setF((p) => ({
      ...p,
      specialiteId: id,
      sousSpecialiteId: "",
    }));

    setSousSpecialites([]);

    if (id) {
      getSousSpecialites(id)
        .then((r) => setSousSpecialites(r.data || []))
        .catch(() => {});
    }
  };

  const submit = async () => {
    if (
      !f.diplome ||
      !f.universite ||
      !f.pays ||
      !f.ville ||
      !f.anneeObtention
    ) {
      setErr("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const res = await addMyEducation({
        diplome: f.diplome,
        specialiteId: f.specialiteId ? Number(f.specialiteId) : null,
        sousSpecialiteId: f.sousSpecialiteId
          ? Number(f.sousSpecialiteId)
          : null,
        anneeObtention: Number(f.anneeObtention),
        universite: f.universite,
        pays: f.pays,
        ville: f.ville,
      });

      onSaved(res.data);
    } catch {
      setErr("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const inp =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <ModalBase
      title="Ajouter une formation"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:bg-slate-300"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Enregistrer
          </button>
        </>
      }
    >
      {err && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {err}
        </p>
      )}

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
          Diplôme *
        </label>
        <input
          value={f.diplome}
          onChange={(e) =>
            setF((p) => ({ ...p, diplome: e.target.value }))
          }
          placeholder="Ex : Doctorat en médecine"
          className={inp}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Spécialité
          </label>
          <select
            value={f.specialiteId}
            onChange={(e) => handleSpecialite(e.target.value)}
            className={`${inp} cursor-pointer`}
          >
            <option value="">— Choisir —</option>
            {specialites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.libelle}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Sous-spécialité
          </label>
          <select
            value={f.sousSpecialiteId}
            onChange={(e) =>
              setF((p) => ({
                ...p,
                sousSpecialiteId: e.target.value,
              }))
            }
            disabled={!sousSpecialites.length}
            className={`${inp} cursor-pointer disabled:opacity-50`}
          >
            <option value="">— Choisir —</option>
            {sousSpecialites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.libelle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
          Université *
        </label>
        <input
          value={f.universite}
          onChange={(e) =>
            setF((p) => ({ ...p, universite: e.target.value }))
          }
          placeholder="Nom de l'université"
          className={inp}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Pays *
          </label>
          <input
            value={f.pays}
            onChange={(e) =>
              setF((p) => ({ ...p, pays: e.target.value }))
            }
            placeholder="France"
            className={inp}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Ville *
          </label>
          <input
            value={f.ville}
            onChange={(e) =>
              setF((p) => ({ ...p, ville: e.target.value }))
            }
            placeholder="Paris"
            className={inp}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Année *
          </label>
          <input
            type="number"
            value={f.anneeObtention}
            onChange={(e) =>
              setF((p) => ({
                ...p,
                anneeObtention: e.target.value,
              }))
            }
            placeholder={String(currentYear)}
            min={1950}
            max={currentYear}
            className={inp}
          />
        </div>
      </div>
    </ModalBase>
  );
}

/* ─────────────────────────────────────────────
   Experience modal
───────────────────────────────────────────── */

function ExperienceModal({ onClose, onSaved }) {
  const [f, setF] = useState({
    poste: "",
    nomEtablissement: "",
    pays: "",
    ville: "",
    dateDebut: "",
    dateFin: "",
    description: "",
  });

  const [actuel, setActuel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!f.poste || !f.nomEtablissement || !f.dateDebut) {
      setErr("Veuillez remplir les champs obligatoires (*).");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const res = await addMyExperience({
        ...f,
        dateFin: actuel ? null : f.dateFin,
      });

      onSaved(res.data);
    } catch {
      setErr("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const inp =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <ModalBase
      title="Ajouter une expérience"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:bg-slate-300"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Enregistrer
          </button>
        </>
      }
    >
      {err && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {err}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Poste *
          </label>
          <input
            value={f.poste}
            onChange={(e) =>
              setF((p) => ({ ...p, poste: e.target.value }))
            }
            placeholder="Ex : Médecin généraliste"
            className={inp}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Établissement *
          </label>
          <input
            value={f.nomEtablissement}
            onChange={(e) =>
              setF((p) => ({
                ...p,
                nomEtablissement: e.target.value,
              }))
            }
            placeholder="Nom de la structure"
            className={inp}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Pays
          </label>
          <input
            value={f.pays}
            onChange={(e) =>
              setF((p) => ({ ...p, pays: e.target.value }))
            }
            placeholder="Mauritanie"
            className={inp}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Ville
          </label>
          <input
            value={f.ville}
            onChange={(e) =>
              setF((p) => ({ ...p, ville: e.target.value }))
            }
            placeholder="Nouakchott"
            className={inp}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Date début *
          </label>
          <input
            type="date"
            value={f.dateDebut}
            onChange={(e) =>
              setF((p) => ({ ...p, dateDebut: e.target.value }))
            }
            className={inp}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Date fin
          </label>
          <input
            type="date"
            value={f.dateFin}
            onChange={(e) =>
              setF((p) => ({ ...p, dateFin: e.target.value }))
            }
            disabled={actuel}
            className={`${inp} ${actuel ? "opacity-40" : ""}`}
          />
        </div>
      </div>

      <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          checked={actuel}
          onChange={(e) => {
            setActuel(e.target.checked);
            if (e.target.checked) {
              setF((p) => ({ ...p, dateFin: "" }));
            }
          }}
          className="rounded"
        />
        Poste actuel
      </label>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
          Description
        </label>
        <textarea
          value={f.description}
          onChange={(e) =>
            setF((p) => ({ ...p, description: e.target.value }))
          }
          rows={3}
          placeholder="Décrivez vos responsabilités..."
          className={`${inp} resize-none`}
        />
      </div>
    </ModalBase>
  );
}

/* ─────────────────────────────────────────────
   Document modal
───────────────────────────────────────────── */

function DocumentModal({ onClose, onSaved }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("AUTRE");
  const [cat, setCat] = useState("AUTRE");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const fileRef = useRef();

  const submit = async () => {
    if (!file) {
      setErr("Veuillez sélectionner un fichier.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const res = await uploadMyDocument(file, type, cat);
      onSaved(res.data);
    } catch {
      setErr("Erreur lors du téléversement.");
    } finally {
      setSaving(false);
    }
  };

  const sel =
    "w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <ModalBase
      title="Téléverser un document"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:bg-slate-300"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Téléverser
          </button>
        </>
      }
    >
      {err && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {err}
        </p>
      )}

      <div
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 transition hover:border-green-400 hover:bg-green-50/30 dark:border-slate-700 dark:hover:bg-green-900/10"
      >
        <Upload size={24} className="mb-2 text-slate-400" />

        {file ? (
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {file.name}
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Cliquez pour sélectionner un fichier
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              PDF, JPG, PNG — max 10 Mo
            </p>
          </>
        )}

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={sel}
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Catégorie
          </label>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className={sel}
          >
            {DOC_CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ModalBase>
  );
}

/* ─────────────────────────────────────────────
   Profile header
───────────────────────────────────────────── */

function ProfileHeader({ profile, educations, onPhotoUpload, uploading }) {
  const fileRef = useRef();

  const specialite = educations[0]?.specialiteLibelle || "Médecin";
  const photoUrl = profile.photoProfilPath
    ? `${BASE_URL}${profile.photoProfilPath}`
    : null;

  const initials =
    `${profile.prenom?.[0] || ""}${profile.nom?.[0] || ""}`.toUpperCase() ||
    "?";

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-5">
          <div
            onClick={() => fileRef.current?.click()}
            className="group relative h-24 w-24 shrink-0 cursor-pointer"
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Photo de profil"
                className="h-24 w-24 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-md">
                <span className="text-2xl font-bold text-green-700">
                  {initials}
                </span>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/35">
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-white" />
              ) : (
                <Camera
                  size={18}
                  className="text-white opacity-0 transition group-hover:opacity-100"
                />
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && onPhotoUpload(e.target.files[0])
              }
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Dr. {profile.prenom} {profile.nom}
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="text-green-700 dark:text-green-400">
                {specialite}
              </span>

              {profile.sectionOrdre && (
                <> | {String(profile.sectionOrdre).replace(/_/g, " ")}</>
              )}
            </p>

            <div className="mt-3">
              <StatutBadge statut={profile.statut} />
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 dark:border-slate-800">
          <Field label="N° inscription" value={profile.numeroInscription} />
          <Field label="Téléphone" value={profile.telephone} />
          <Field label="Email" value={profile.email} />
          <Field label="NNI" value={maskNni(profile.nni)} />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

export default function MedecinProfilPage() {
  const [profile, setProfile] = useState(null);
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [activeTab, setActiveTab] = useState("profil");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const [showEduModal, setShowEduModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      getMyProfile(),
      getMyEducations(),
      getMyExperiences(),
      getMyDocuments(),
    ])
      .then(([p, e, ex, d]) => {
        if (p.status === "fulfilled") {
          const data = p.value.data;

          setProfile(data);
          setForm({
            nom: data.nom || "",
            prenom: data.prenom || "",
            telephone: data.telephone || "",
            nationalite: data.nationalite || "",
            adresse: data.adresse || "",
          });
        } else {
          setLoadError("Impossible de charger votre profil.");
        }

        if (e.status === "fulfilled") {
          setEducations(e.value.data || []);
        }

        if (ex.status === "fulfilled") {
          setExperiences(ex.value.data || []);
        }

        if (d.status === "fulfilled") {
          setDocuments(d.value.data || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveErr("");

    try {
      const res = await updateMyProfile(form);
      setProfile(res.data);
      setEditing(false);
    } catch {
      setSaveErr("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (file) => {
    setUploading(true);

    try {
      const res = await uploadMyPhoto(file);
      setProfile((p) => ({
        ...p,
        photoProfilPath: res.data.photoProfilPath,
      }));
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteEducation = async (id) => {
    const ok = window.confirm(
      "Voulez-vous vraiment supprimer cette formation ?"
    );

    if (!ok) return;

    await deleteMyEducation(id);
    setEducations((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmDeleteExperience = async (id) => {
    const ok = window.confirm(
      "Voulez-vous vraiment supprimer cette expérience ?"
    );

    if (!ok) return;

    await deleteMyExperience(id);
    setExperiences((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmDeleteDocument = async (id) => {
    const ok = window.confirm(
      "Voulez-vous vraiment supprimer ce document ?"
    );

    if (!ok) return;

    await deleteMyDocument(id);
    setDocuments((prev) => prev.filter((item) => item.id !== id));
  };

  const inp =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

  if (loading) {
    return (
      <MedecinLayout title="Mon profil">
        <div className="flex h-60 items-center justify-center">
          <Loader2 size={22} className="animate-spin text-slate-400" />
        </div>
      </MedecinLayout>
    );
  }

  if (loadError || !profile) {
    return (
      <MedecinLayout title="Mon profil">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {loadError || "Profil introuvable."}
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout title="Mon profil">
      <AnimatePresence>
        {showEduModal && (
          <EducationModal
            onClose={() => setShowEduModal(false)}
            onSaved={(edu) => {
              setEducations((p) => [...p, edu]);
              setShowEduModal(false);
            }}
          />
        )}

        {showExpModal && (
          <ExperienceModal
            onClose={() => setShowExpModal(false)}
            onSaved={(exp) => {
              setExperiences((p) => [...p, exp]);
              setShowExpModal(false);
            }}
          />
        )}

        {showDocModal && (
          <DocumentModal
            onClose={() => setShowDocModal(false)}
            onSaved={(doc) => {
              setDocuments((p) => [...p, doc]);
              setShowDocModal(false);
            }}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Mon profil 
          </h1>

          {/* <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Consultez et mettez à jour vos informations personnelles, vos
            formations, vos expériences et vos documents justificatifs.
          </p> */}
        </div>

        <ProfileHeader
          profile={profile}
          educations={educations}
          onPhotoUpload={handlePhoto}
          uploading={uploading}
        />

        {/* Tab bar */}
        <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Profil personnel */}
        {activeTab === "profil" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InfoCard
              title="Informations personnelles"
              onEdit={!editing ? () => setEditing(true) : undefined}
            >
              {editing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Prénom
                      </label>
                      <input
                        className={inp}
                        value={form.prenom || ""}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            prenom: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Nom
                      </label>
                      <input
                        className={inp}
                        value={form.nom || ""}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            nom: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Téléphone
                    </label>
                    <input
                      className={inp}
                      value={form.telephone || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          telephone: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Nationalité
                    </label>
                    <input
                      className={inp}
                      value={form.nationalite || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          nationalite: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Adresse
                    </label>
                    <input
                      className={inp}
                      value={form.adresse || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          adresse: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {saveErr && (
                    <p className="text-xs font-medium text-red-600">
                      {saveErr}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setSaveErr("");
                      }}
                      className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      Annuler
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 py-2 text-sm font-bold text-white transition hover:bg-green-800 disabled:bg-slate-300"
                    >
                      {saving && (
                        <Loader2 size={13} className="animate-spin" />
                      )}
                      Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <Field label="Prénom" value={profile.prenom} />
                  <Field label="Nom" value={profile.nom} />
                  <Field label="Téléphone" value={profile.telephone} />
                  <Field label="Nationalité" value={profile.nationalite} />
                  <Field
                    label="Adresse"
                    value={profile.adresse}
                    className="sm:col-span-2"
                  />
                </div>
              )}
            </InfoCard>

            <InfoCard title="Informations professionnelles">
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <Field
                  label="Email"
                  value={profile.email}
                  className="sm:col-span-2"
                />

                <Field label="NNI" value={maskNni(profile.nni)} />
                <Field label="Sexe" value={profile.sexe} />

                <Field
                  label="Spécialité"
                  value={
                    educations
                      .map((e) => e.specialiteLibelle)
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                  className="sm:col-span-2"
                />

                <Field
                  label="Section"
                  value={profile.sectionOrdre?.replace(/_/g, " ")}
                />

                <Field
                  label="Ville d'exercice"
                  value={profile.villeExercice}
                />

                <Field
                  label="N° inscription"
                  value={profile.numeroInscription}
                />

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Statut
                  </p>
                  <StatutBadge statut={profile.statut} />
                </div>
              </div>
            </InfoCard>
          </div>
        )}

        {/* Éducation */}
        {activeTab === "education" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Formations ({educations.length})
              </h2>

              <button
                type="button"
                onClick={() => setShowEduModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-800"
              >
                <Plus size={13} />
                Ajouter
              </button>
            </div>

            {educations.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                text="Aucune formation enregistrée"
              />
            ) : (
              <div className="space-y-3">
                {educations.map((e) => (
                  <div
                    key={e.id}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
                      <GraduationCap
                        size={16}
                        className="text-green-700 dark:text-green-400"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {e.diplome || "Formation"}
                      </p>

                      {e.specialiteLibelle && (
                        <p className="mt-0.5 text-xs font-medium text-green-700">
                          {e.specialiteLibelle}
                          {e.sousSpecialiteLibelle &&
                            ` · ${e.sousSpecialiteLibelle}`}
                        </p>
                      )}

                      <p className="mt-0.5 text-xs text-slate-500">
                        {e.universite || "—"}
                        {(e.ville || e.pays) &&
                          ` · ${[e.ville, e.pays].filter(Boolean).join(", ")}`}
                      </p>

                      {e.anneeObtention && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          Obtenu en {e.anneeObtention}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => confirmDeleteEducation(e.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-100 hover:text-red-500"
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expériences */}
        {activeTab === "experience" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Expériences ({experiences.length})
              </h2>

              <button
                type="button"
                onClick={() => setShowExpModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-800"
              >
                <Plus size={13} />
                Ajouter
              </button>
            </div>

            {experiences.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                text="Aucune expérience enregistrée"
              />
            ) : (
              <div className="space-y-3">
                {experiences.map((e) => (
                  <div
                    key={e.id}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
                      <Briefcase
                        size={16}
                        className="text-green-700 dark:text-green-400"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {e.poste || "Poste"}
                      </p>

                      <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {e.nomEtablissement || e.etablissement || "—"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDate(e.dateDebut)} →{" "}
                        {e.dateFin ? formatDate(e.dateFin) : "Présent"}
                        {(e.ville || e.pays) && (
                          <>
                            {" "}
                            · {[e.ville, e.pays].filter(Boolean).join(", ")}
                          </>
                        )}
                      </p>

                      {e.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {e.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => confirmDeleteExperience(e.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-100 hover:text-red-500"
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {activeTab === "documents" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Documents ({documents.length})
              </h2>

              <button
                type="button"
                onClick={() => setShowDocModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-800"
              >
                <Upload size={13} />
                Téléverser
              </button>
            </div>

            {documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                text="Aucun document téléversé"
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500">
                        <th className="px-5 py-3">Fichier</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Catégorie</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Taille</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {documents.map((d) => (
                        <tr
                          key={d.id}
                          className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <FileText
                                size={14}
                                className="shrink-0 text-slate-400 dark:text-slate-500"
                              />

                              <span className="max-w-[180px] truncate font-medium text-slate-800 dark:text-slate-100">
                                {d.fileName || "Document"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                            {d.typeDocument || "—"}
                          </td>

                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                            {d.categorie || "—"}
                          </td>

                          <td className="px-4 py-3 text-slate-400 dark:text-slate-500">
                            {formatDate(d.uploadDate)}
                          </td>

                          <td className="px-4 py-3 text-slate-400 dark:text-slate-500">
                            {d.size ? `${(d.size / 1024).toFixed(0)} Ko` : "—"}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <a
                                href={`${BASE_URL}${d.filePath}`}
                                download={d.fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-100 hover:text-blue-600"
                                title="Télécharger"
                              >
                                <Download size={13} />
                              </a>

                              <button
                                type="button"
                                onClick={() => confirmDeleteDocument(d.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-500"
                                title="Supprimer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MedecinLayout>
  );
}