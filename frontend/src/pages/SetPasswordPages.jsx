import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get("token");

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [message,         setMessage]         = useState("");
  const [error,           setError]           = useState("");

  /* ── Règles de force du mot de passe ── */
  const rules = [
    { label: "Au moins 8 caractères",         pass: password.length >= 8 },
    { label: "Une lettre majuscule",           pass: /[A-Z]/.test(password) },
    { label: "Une lettre minuscule",           pass: /[a-z]/.test(password) },
    { label: "Un chiffre",                     pass: /[0-9]/.test(password) },
  ];
  const strength = rules.filter((r) => r.pass).length;
  const strengthLabel = ["", "Faible", "Moyen", "Bon", "Fort"][strength];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-green-500",
  ][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token)                             return setError("Token manquant ou invalide.");
    if (!password || !confirmPassword)      return setError("Veuillez remplir tous les champs.");
    if (password !== confirmPassword)       return setError("Les mots de passe ne correspondent pas.");
    if (strength < 2)                       return setError("Votre mot de passe est trop faible.");

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8080/api/auth/set-password", {
        token,
        password,
        confirmPassword,
      });
      setMessage(res.data || "Mot de passe défini avec succès.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Erreur lors de la définition du mot de passe."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Écran succès ── */
  if (message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Mot de passe activé !
            </h2>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
          <p className="text-xs text-slate-400">
            Vous allez être redirigé vers la page de connexion…
          </p>
          <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full animate-[shrink_2.5s_linear_forwards]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          {/* En-tête */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <ShieldCheck size={22} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Définir votre mot de passe
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Créez un mot de passe sécurisé pour activer votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisir le mot de passe"
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-800 bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Barre de force */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  {strengthLabel && (
                    <p className={`text-xs font-semibold ${
                      strength <= 1 ? "text-red-500" :
                      strength === 2 ? "text-amber-500" :
                      strength === 3 ? "text-blue-500" : "text-green-600"
                    }`}>
                      {strengthLabel}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Règles */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {rules.map((r) => (
                  <div key={r.label} className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      r.pass ? "bg-green-500" : "bg-slate-200"
                    }`}>
                      {r.pass && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className={`text-[11px] ${r.pass ? "text-green-600 font-medium" : "text-slate-400"}`}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className={`w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm bg-white outline-none focus:ring-2 transition-all ${
                    confirmPassword.length > 0
                      ? password === confirmPassword
                        ? "border-green-400 focus:border-green-500 focus:ring-green-500/15 text-slate-800"
                        : "border-red-300 focus:border-red-400 focus:ring-red-400/15 text-slate-800"
                      : "border-slate-200 focus:border-green-500 focus:ring-green-500/15 text-slate-800"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Indicateur correspondance */}
              {confirmPassword.length > 0 && (
                <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${
                  password === confirmPassword ? "text-green-600" : "text-red-500"
                }`}>
                  {password === confirmPassword
                    ? <><CheckCircle2 size={12} /> Les mots de passe correspondent</>
                    : <><AlertCircle size={12} /> Les mots de passe ne correspondent pas</>
                  }
                </p>
              )}
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-[.99] transition-all shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Validation en cours…
                </>
              ) : (
                <>
                  Valider le mot de passe
                  <ArrowRight size={15} />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Problème avec votre lien ?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-600 font-semibold hover:text-green-700 transition-colors"
          >
            Retour à la connexion
          </button>
        </p>

      </div>
    </div>
  );
}

export default SetPasswordPage;