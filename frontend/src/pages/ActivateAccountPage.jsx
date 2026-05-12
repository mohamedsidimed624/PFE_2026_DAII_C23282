import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { verifyActivationEmail } from "../services/authApi";

function ActivateAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-lg font-bold text-red-800 mb-2">Lien invalide</h2>
          <p className="text-sm text-red-600 mb-6">
            Ce lien d'activation est manquant ou invalide. Veuillez utiliser le lien reçu par email.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-800"
          >
            <ArrowLeft size={14} /> Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Veuillez saisir votre adresse email."); return; }

    setLoading(true);
    try {
      await verifyActivationEmail(token, email.trim());
      navigate(`/set-password?token=${token}`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Email incorrect ou lien invalide."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <ShieldCheck size={22} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Activation du compte</h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Veuillez saisir l'adresse email associée à votre dossier d'adhésion pour confirmer
              votre identité.
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
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-all shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Vérification…
                </>
              ) : (
                "Confirmer et continuer"
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

export default ActivateAccountPage;
