import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getMyProfile,
  updateMyProfile,
  uploadMyPhoto,
  changePassword,
} from "../../services/adminProfileApi";
import {
  User,
  Pencil,
  Camera,
  Eye,
  EyeOff,
  Lock,
  Check,
  AlertCircle,
  LayoutDashboard,
  X,
  Shield,
} from "lucide-react";

const BASE_URL = "http://localhost:8080";

/* ── helpers ── */
const inputCls =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-700/50 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed";

function Label({ children }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

function Feedback({ type, message, onClose }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
        isSuccess
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
      }`}
    >
      {isSuccess ? <Check size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function PasswordInput({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputCls} pl-9 pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Avatar                                              */
/* ─────────────────────────────────────────────────── */
function Avatar({ src, name, size = "lg" }) {
  const dim = size === "lg" ? "w-20 h-20 text-2xl rounded-2xl" : "w-14 h-14 text-lg rounded-xl";
  const initial = name ? name.charAt(0).toUpperCase() : "A";
  if (src) {
    return (
      <img
        src={`${BASE_URL}${src}`}
        alt={name}
        className={`${dim} object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold flex items-center justify-center shrink-0 select-none`}
    >
      {initial}
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  VIEW: Mon Profil (Figure 5.51)                      */
/* ─────────────────────────────────────────────────── */
function ProfileView({ profile, onEdit, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 animate-pulse">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Top profile band */}
      <div className="px-8 py-7 flex items-center gap-6 border-b border-slate-100 dark:border-slate-800">
        <Avatar src={profile?.photoProfilPath} name={profile?.nomComplet} size="lg" />
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {profile?.nomComplet || profile?.email?.split("@")[0] || "Administrateur"}
          </h2>
          <span className="inline-flex items-center mt-1.5 gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <User size={11} />
            Administrateur
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-8 py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Informations personnelles
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400 w-20">Email</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {profile?.email || "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400 w-20">Téléphone</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {profile?.telephone || <span className="text-slate-400 italic">Non renseigné</span>}
            </span>
          </div>
          {profile?.dateCreation && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400 w-20">Membre depuis</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{profile.dateCreation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Pencil size={14} />
          Modifier le profil
        </button>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <LayoutDashboard size={14} />
          Tableau de bord admin
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  FORM: Modifier le profil (Figure 5.52)              */
/* ─────────────────────────────────────────────────── */
function EditProfileForm({ profile, onCancel, onSaved }) {
  const [form, setForm] = useState({
    nomComplet: profile?.nomComplet || "",
    telephone:  profile?.telephone  || "",
  });
  const [photo, setPhoto]         = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [feedback, setFeedback]   = useState({ type: "", message: "" });
  const fileRef                   = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nomComplet.trim()) {
      setFeedback({ type: "error", message: "Le nom complet est obligatoire." });
      return;
    }
    try {
      setLoading(true);

      // Upload photo first if changed
      if (photo) {
        await uploadMyPhoto(photo);
      }

      const res = await updateMyProfile({
        nomComplet: form.nomComplet.trim(),
        telephone:  form.telephone.trim() || null,
      });

      onSaved(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de la mise à jour.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const currentPhoto = preview || (profile?.photoProfilPath ? `${BASE_URL}${profile.photoProfilPath}` : null);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Modifier le profil administrateur
        </h2>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <User size={11} />
          Administrateur
        </span>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
        {feedback.message && (
          <Feedback
            {...feedback}
            onClose={() => setFeedback({ type: "", message: "" })}
          />
        )}

        {/* Photo */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt="Photo"
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-2xl font-bold flex items-center justify-center">
                {(form.nomComplet || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center shadow-sm transition-colors"
            >
              <Camera size={13} />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Photo de profil
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Choisir un fichier
            </button>
            {photo ? (
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{photo.name}</span>
            ) : (
              <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">Aucun fichier choisi</span>
            )}
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Formats supportés : JPG, PNG (max 5Mo)
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        {/* Nom complet */}
        <div>
          <Label>Nom complet *</Label>
          <input
            type="text"
            value={form.nomComplet}
            onChange={(e) => setForm((p) => ({ ...p, nomComplet: e.target.value }))}
            placeholder="Ex : Mohamed Sidi Med"
            className={inputCls}
          />
        </div>

        {/* Email (readonly) */}
        <div>
          <Label>Email</Label>
          <input
            type="email"
            value={profile?.email || ""}
            disabled
            className={inputCls}
          />
        </div>

        {/* Téléphone */}
        <div>
          <Label>Numéro de téléphone *</Label>
          <input
            type="tel"
            value={form.telephone}
            onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
            placeholder="Ex : 44076356"
            className={inputCls}
          />
        </div>

        {/* Membre depuis */}
        {profile?.dateCreation && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Membre depuis : <span className="font-medium">{profile.dateCreation}</span>
          </p>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            <X size={14} />
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  TAB: Sécurité — Changer le mot de passe            */
/* ─────────────────────────────────────────────────── */
function SecurityTab() {
  const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [loading, setLoading]   = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const strength = (() => {
    const p = form.newPwd;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p))  s++;
    return s;
  })();

  const strengthMeta = [
    null,
    { label: "Faible",    color: "bg-red-500",    text: "text-red-500" },
    { label: "Moyen",     color: "bg-amber-400",  text: "text-amber-500" },
    { label: "Fort",      color: "bg-green-400",  text: "text-green-500" },
    { label: "Très fort", color: "bg-green-600",  text: "text-green-600 dark:text-green-400" },
  ][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.current || !form.newPwd || !form.confirm) {
      setFeedback({ type: "error", message: "Tous les champs sont obligatoires." });
      return;
    }
    if (form.newPwd.length < 8) {
      setFeedback({ type: "error", message: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (form.newPwd !== form.confirm) {
      setFeedback({ type: "error", message: "Les mots de passe ne correspondent pas." });
      return;
    }
    try {
      setLoading(true);
      await changePassword({ currentPassword: form.current, newPassword: form.newPwd });
      setFeedback({ type: "success", message: "Mot de passe modifié avec succès." });
      setForm({ current: "", newPwd: "", confirm: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors du changement de mot de passe.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Shield size={16} className="text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Changer le mot de passe</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Minimum 8 caractères avec majuscule, chiffre et symbole.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
        {feedback.message && (
          <Feedback
            {...feedback}
            onClose={() => setFeedback({ type: "", message: "" })}
          />
        )}

        <PasswordInput
          label="Mot de passe actuel"
          value={form.current}
          onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
          placeholder="Votre mot de passe actuel"
        />

        <PasswordInput
          label="Nouveau mot de passe"
          value={form.newPwd}
          onChange={(e) => setForm((p) => ({ ...p, newPwd: e.target.value }))}
          placeholder="Nouveau mot de passe"
        />

        {/* Strength bar */}
        {form.newPwd && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength ? strengthMeta.color : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sécurité :{" "}
              <span className={`font-semibold ${strengthMeta?.text}`}>
                {strengthMeta?.label}
              </span>
            </p>
          </div>
        )}

        <PasswordInput
          label="Confirmer le nouveau mot de passe"
          value={form.confirm}
          onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
          placeholder="Répétez le nouveau mot de passe"
        />

        {/* Match indicator */}
        {form.confirm && form.newPwd && (
          <p className={`text-xs font-medium ${
            form.newPwd === form.confirm
              ? "text-green-600 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          }`}>
            {form.newPwd === form.confirm ? "✓ Les mots de passe correspondent" : "✗ Les mots de passe ne correspondent pas"}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Lock size={14} />
            )}
            {loading ? "Modification..." : "Changer le mot de passe"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Page principale                                     */
/* ─────────────────────────────────────────────────── */
const TABS = [
  { key: "profil",   label: "Mon compte", icon: <User size={14} /> },
  { key: "securite", label: "Sécurité",   icon: <Shield size={14} /> },
];

function AdminParametresPage() {
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState(
    pathname.includes("securite") ? "securite" : "profil"
  );
  const [editMode,  setEditMode]  = useState(false);
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyProfile();
        setProfile(res.data);
      } catch {
        setError("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaved = (updated) => {
    setProfile(updated);
    setEditMode(false);
  };

  return (
    <AdminLayout title="Paramètres">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Paramètres</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gérez votre profil et votre sécurité.
          </p>
        </div>

        {/* Error (API unreachable) */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setEditMode(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "profil" && (
          editMode ? (
            <EditProfileForm
              profile={profile}
              onCancel={() => setEditMode(false)}
              onSaved={handleSaved}
            />
          ) : (
            <ProfileView
              profile={profile}
              loading={loading}
              onEdit={() => setEditMode(true)}
            />
          )
        )}

        {activeTab === "securite" && <SecurityTab />}
      </div>
    </AdminLayout>
  );
}

export default AdminParametresPage;
