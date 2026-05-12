import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { forgotPassword } from "../services/authApi";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Veuillez saisir votre adresse email."); return; }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-sm flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Email envoyé</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Si l'adresse <span className="font-semibold text-slate-700">{email}</span> est
              associée à un compte, vous recevrez un email avec un lien pour réinitialiser votre
              mot de passe.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Vérifiez votre dossier spam si vous ne recevez pas l'email dans les prochaines minutes.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
          >
            <ArrowLeft size={15} /> Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <Mail size={22} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Mot de passe oublié ?</h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Saisissez votre email et nous vous enverrons un lien pour réinitialiser votre mot de
              passe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  autoFocus
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1.5">
                <span className="shrink-0">⚠</span> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-all shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-1 text-green-600 font-semibold hover:text-green-700 transition-colors"
          >
            <ArrowLeft size={12} /> Retour à la connexion
          </button>
        </p>

      </div>
    </div>
  );
}

export default ForgotPasswordPage;
