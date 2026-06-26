import { useState } from "react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { changePassword } from "../../services/medecinApi";
import { Lock, Shield, Eye, EyeOff, Check, AlertCircle, X } from "lucide-react";

const inputCls =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

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

function MedecinParametresPage() {
  const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.current || !form.newPwd || !form.confirm) {
      setFeedback({ type: "error", message: "Tous les champs sont obligatoires." });
      return;
    }
    if (form.newPwd.length < 8) {
      setFeedback({ type: "error", message: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
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
    <MedecinLayout title="Paramètres">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gérez la sécurité de votre compte.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Shield size={16} className="text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Changer le mot de passe
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Minimum 8 caractères.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {feedback.message && (
              <Feedback {...feedback} onClose={() => setFeedback({ type: "", message: "" })} />
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

            <PasswordInput
              label="Confirmer le nouveau mot de passe"
              value={form.confirm}
              onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Répétez le nouveau mot de passe"
            />

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
      </div>
    </MedecinLayout>
  );
}

export default MedecinParametresPage;
