import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authApi";
import { Stethoscope, Shield, Users } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("MEDECIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);

      if (data.role === "ADMIN") {
        navigate("/admin/demandes");
      } else if (data.role === "MEDECIN") {
        navigate("/medecin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Email ou mot de passe invalide.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-40 -right-20 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-1/3 w-[28rem] h-[28rem] bg-teal-100 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-md">
            <Stethoscope size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800 leading-tight">
              Connexion
            </h1>
            <p className="text-slate-500 italic text-lg">
              Portail de l’Ordre des Médecins
            </p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 px-4 py-10">
        <div className="max-w-md mx-auto">
          {/* Sélecteur visuel */}
          <div className="bg-white/80 backdrop-blur rounded-full border border-slate-200 shadow-lg p-2 flex items-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab("MEDECIN")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition ${
                activeTab === "MEDECIN"
                  ? "bg-green-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Stethoscope size={18} />
              <span className="font-medium">Médecin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TIERS")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition ${
                activeTab === "TIERS"
                  ? "bg-green-600 text-white shadow"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Users size={18} />
              <span className="font-medium">Tiers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ORDRE")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition ${
                activeTab === "ORDRE"
                  ? "bg-green-600 text-white shadow"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Shield size={18} />
              <span className="font-medium">Ordre</span>
            </button>
          </div>

          {/* Carte login */}
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg mb-5">
                {activeTab === "ORDRE" ? (
                  <Shield size={34} />
                ) : activeTab === "TIERS" ? (
                  <Users size={34} />
                ) : (
                  <Stethoscope size={34} />
                )}
              </div>

              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Saisissez vos identifiants
              </h2>

              <p className="text-slate-500">
                Connectez-vous pour accéder à votre espace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Saisir votre email"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-800 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisir votre mot de passe"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-800 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl shadow-md transition disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {loading ? "Connexion en cours..." : "Connexion"}
              </button>

              <div className="flex items-center justify-center gap-4 pt-2 text-sm">
                <button
                  type="button"
                  className="text-slate-600 hover:text-green-700 underline underline-offset-4"
                >
                  Créer mon espace
                </button>

                <span className="text-slate-300">|</span>

                <button
                  type="button"
                  className="text-slate-600 hover:text-green-700 underline underline-offset-4"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Ordre des Médecins — Plateforme sécurisée
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;