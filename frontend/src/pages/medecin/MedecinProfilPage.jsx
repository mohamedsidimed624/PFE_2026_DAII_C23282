import { useEffect, useMemo, useState } from "react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import {
  getMyProfile,
  updateMyProfile,
  uploadMyPhoto,
} from "../../services/medecinApi";
import {
  User,
  Mail,
  Phone,
  IdCard,
  ShieldCheck,
  Globe,
  MapPin,
  Save,
  Pencil,
  X,
  Stethoscope,
  FileBadge,
  Lock,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react";

function MedecinProfilPage() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    nni: "",
    sexe: "",
    nationalite: "",
    adresse: "",
    numeroInscription: "",
    statut: "",
    specialite: "",
    photoProfilPath: "",
  });

  const [initialForm, setInitialForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMyProfile();
        const d = res.data;

        const normalized = {
          nom: d.nom || "",
          prenom: d.prenom || "",
          email: d.email || "",
          telephone: d.telephone || "",
          nni: d.nni || "",
          sexe: d.sexe || "",
          nationalite: d.nationalite || "",
          adresse: d.adresse || "",
          numeroInscription: d.numeroInscription || "",
          statut: d.statut || "",
          specialite: d.specialite || "",
          photoProfilPath: d.photoProfilPath || "",
        };

        setForm(normalized);
        setInitialForm(normalized);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le profil médecin.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const completion = useMemo(() => {
    const fields = [
      "nom",
      "prenom",
      "email",
      "telephone",
      "nni",
      "sexe",
      "nationalite",
      "adresse",
      "numeroInscription",
      "statut",
      "specialite",
    ];

    const filled = fields.filter(
      (field) => form[field] && String(form[field]).trim() !== ""
    ).length;

    return Math.round((filled / fields.length) * 100);
  }, [form]);

  const initials = useMemo(() => {
    const p = form.prenom?.[0] || "?";
    const n = form.nom?.[0] || "?";
    return `${p}${n}`.toUpperCase();
  }, [form.nom, form.prenom]);

  const statusClasses = useMemo(() => {
    const value = (form.statut || "").toUpperCase();

    if (["ACTIF", "ACTIVE", "APPROVED"].includes(value)) {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (["SUSPENDU", "SUSPENDED"].includes(value)) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (["PENDING"].includes(value)) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    return "bg-slate-50 text-slate-700 border-slate-200";
  }, [form.statut]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setSuccess("");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (initialForm) {
      setForm(initialForm);
    }
    setSuccess("");
    setError("");
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSuccess("");
      setError("");

      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
        nationalite: form.nationalite,
        adresse: form.adresse,
      };

      const res = await updateMyProfile(payload);
      const d = res.data;

      const updated = {
        ...form,
        nom: d.nom || "",
        prenom: d.prenom || "",
        telephone: d.telephone || "",
        nationalite: d.nationalite || "",
        adresse: d.adresse || "",
      };

      setForm(updated);
      setInitialForm(updated);
      setSuccess("Profil mis à jour avec succès.");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Impossible de mettre à jour le profil.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPhotoUploading(true);
      setSuccess("");
      setError("");

      const res = await uploadMyPhoto(file);
      const newPhotoPath = res.data.photoProfilPath;

      setForm((prev) => ({
        ...prev,
        photoProfilPath: newPhotoPath,
      }));

      setInitialForm((prev) => ({
        ...prev,
        photoProfilPath: newPhotoPath,
      }));

      setSuccess("Photo de profil mise à jour avec succès.");
    } catch (err) {
      console.error(err);
      setError("Impossible de mettre à jour la photo de profil.");
    } finally {
      setPhotoUploading(false);
    }
  };

  if (loading) {
    return (
      <MedecinLayout
        title="Mon profil"
        subtitle="Chargement des informations du profil."
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">Chargement du profil...</p>
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout
      title="Mon profil"
      subtitle="Consultez vos informations personnelles et professionnelles."
    >
      <div className="space-y-6">
        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* HERO */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="rounded-[22px] bg-gradient-to-br from-green-600 via-green-500 to-emerald-300 p-[3px]">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[19px] bg-white text-2xl font-bold text-green-700">
                    {form.photoProfilPath ? (
                      <img
                        src={`http://localhost:8080${form.photoProfilPath}`}
                        alt="Photo de profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                </div>

                <label
                  htmlFor="photo-upload"
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-green-600 text-white shadow-md transition hover:bg-green-700"
                  title="Changer la photo"
                >
                  <Camera size={16} />
                </label>

                <input
                  id="photo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Dr. {form.prenom} {form.nom}
                  </h2>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${statusClasses}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                    {form.statut || "Inconnu"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Stethoscope size={15} className="text-green-600" />
                    {form.specialite || "Spécialité non renseignée"}
                  </span>

                  {form.email && (
                    <span className="inline-flex items-center gap-2">
                      <Mail size={15} className="text-green-600" />
                      {form.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="min-w-[140px]">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Profil complété
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-700 transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-green-700">
                    {completion}%
                  </span>
                </div>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <Pencil size={16} />
                  Modifier
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  <Pencil size={15} />
                  Mode édition
                </div>
              )}
            </div>
          </div>

          {photoUploading && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Mise à jour de la photo en cours...
            </div>
          )}
        </section>

        {/* BODY */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {!isEditing ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    Informations du profil
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Vue complète des informations disponibles dans votre espace.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <ReadOnlyItem
                    label="Nom"
                    value={form.nom}
                    icon={<User size={18} />}
                  />
                  <ReadOnlyItem
                    label="Prénom"
                    value={form.prenom}
                    icon={<User size={18} />}
                  />
                  <ReadOnlyItem
                    label="Email"
                    value={form.email}
                    icon={<Mail size={18} />}
                  />
                  <ReadOnlyItem
                    label="Téléphone"
                    value={form.telephone}
                    icon={<Phone size={18} />}
                  />
                  <ReadOnlyItem
                    label="NNI"
                    value={form.nni}
                    icon={<IdCard size={18} />}
                  />
                  <ReadOnlyItem
                    label="Sexe"
                    value={form.sexe}
                    icon={<ShieldCheck size={18} />}
                  />
                  <ReadOnlyItem
                    label="Nationalité"
                    value={form.nationalite}
                    icon={<Globe size={18} />}
                  />
                  <ReadOnlyItem
                    label="Spécialité"
                    value={form.specialite}
                    icon={<Stethoscope size={18} />}
                  />
                  <ReadOnlyItem
                    label="Numéro d’inscription"
                    value={form.numeroInscription}
                    icon={<FileBadge size={18} />}
                  />
                  <ReadOnlyItem
                    label="Statut"
                    value={form.statut}
                    icon={<ShieldCheck size={18} />}
                  />
                  <div className="md:col-span-2">
                    <ReadOnlyItem
                      label="Adresse"
                      value={form.adresse}
                      icon={<MapPin size={18} />}
                    />
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    Modifier les informations
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Seuls certains champs peuvent être modifiés.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <InputField
                      label="Nom"
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      icon={<User size={18} />}
                    />

                    <InputField
                      label="Prénom"
                      name="prenom"
                      value={form.prenom}
                      onChange={handleChange}
                      icon={<User size={18} />}
                    />

                    <InputField
                      label="Téléphone"
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                      icon={<Phone size={18} />}
                    />

                    <SelectField
                      label="Nationalité"
                      name="nationalite"
                      value={form.nationalite}
                      onChange={handleChange}
                      icon={<Globe size={18} />}
                      options={[
                        { value: "", label: "Choisir" },
                        { value: "Mauritanienne", label: "Mauritanienne" },
                        { value: "Sénégalaise", label: "Sénégalaise" },
                        { value: "Marocaine", label: "Marocaine" },
                        { value: "Française", label: "Française" },
                        { value: "Autre", label: "Autre" },
                      ]}
                    />

                    <div className="md:col-span-2">
                      <InputField
                        label="Adresse"
                        name="adresse"
                        value={form.adresse}
                        onChange={handleChange}
                        icon={<MapPin size={18} />}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Lock size={16} className="text-slate-500" />
                      Champs non modifiables
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <MiniReadOnly label="Email" value={form.email} />
                      <MiniReadOnly label="NNI" value={form.nni} />
                      <MiniReadOnly label="Sexe" value={form.sexe} />
                      <MiniReadOnly
                        label="Numéro d’inscription"
                        value={form.numeroInscription}
                      />
                      <MiniReadOnly label="Statut" value={form.statut} />
                      <MiniReadOnly label="Spécialité" value={form.specialite} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      <Save size={16} />
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <X size={16} />
                      Annuler
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Données administratives
              </p>

              <div className="space-y-4">
                <AdminRow
                  icon={<Mail size={16} />}
                  label="Email"
                  value={form.email}
                />
                <AdminRow
                  icon={<IdCard size={16} />}
                  label="NNI"
                  value={form.nni}
                />
                <AdminRow
                  icon={<FileBadge size={16} />}
                  label="N° inscription"
                  value={form.numeroInscription}
                />
                <AdminRow
                  icon={<Stethoscope size={16} />}
                  label="Spécialité"
                  value={form.specialite}
                />
                <AdminRow
                  icon={<ShieldCheck size={16} />}
                  label="Statut"
                  value={form.statut}
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-300">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Données protégées</h3>
                  <p className="text-sm text-slate-300">
                    Informations verrouillées
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-300">
                Certaines données sont verrouillées car elles proviennent de
                votre dossier validé par l’administration de l’Ordre des
                Médecins. Pour toute correction, une procédure administrative
                sera nécessaire.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}

function InputField({ label, name, value, onChange, icon }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-3.5 text-slate-400">
          {icon}
        </span>

        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/15"
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, icon, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-3.5 z-10 text-slate-400">
          {icon}
        </span>

        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/15"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ReadOnlyItem({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <span>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>

      <p className="break-words font-semibold text-slate-800">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}

function MiniReadOnly({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      <p className="break-words text-sm font-semibold text-slate-800">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}

function AdminRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">
          {value || "Non renseigné"}
        </p>
      </div>
    </div>
  );
}

export default MedecinProfilPage;