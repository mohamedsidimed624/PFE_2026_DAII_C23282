import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authApi";
import Navbar from "../components/Navbar";
import { Stethoscope, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

/* ── Logos ── */
import medecinLogo from "../assets/logo.png"; // logo Médecin
import ordreLogo   from "../assets/logo.png"; // ← remplacez par votre logo Ordre si différent

const TABS = [
  { key: "MEDECIN", label: "Médecin", Icon: Stethoscope },
  { key: "ORDRE",   label: "Ordre",   Icon: Shield },
];

function LoginPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("MEDECIN");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setEmail("");
    setPassword("");
  };

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
      localStorage.setItem("role",  data.role);
      localStorage.setItem("email", data.email);

      if      (data.role === "ADMIN")   navigate("/admin/demandes");
      else if (data.role === "MEDECIN") navigate("/medecin/dashboard");
      else navigate("/");

    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Email ou mot de passe invalide."
      );
    } finally {
      setLoading(false);
    }
  };

  const isMedecin = activeTab === "MEDECIN";
  const logo      = isMedecin ? medecinLogo : ordreLogo;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">

      {/* ── Navbar existante ── */}
      <Navbar />

      {/* ── Fond décoratif ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* Cadenas bas-gauche */}
        <div className="absolute bottom-8 left-8 w-52 h-52 rounded-full border-[32px] border-slate-200/50" />
        <div className="absolute bottom-32 left-32 w-24 h-24 rounded-full border-[16px] border-slate-200/40" />
        {/* Courbes droite */}
        <div className="absolute -right-24 top-1/4 w-[420px] h-[420px] rounded-full border border-green-200/50" />
        <div className="absolute -right-40 top-1/3 w-[560px] h-[560px] rounded-full border border-green-100/40" />
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-green-200/30" />
      </div>

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">

        {/* ── Tabs ── */}
        <div className="bg-white rounded-full border border-slate-200 shadow-sm p-1.5 flex gap-1 mb-16">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-white text-green-700 shadow border border-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={16} className={activeTab === key ? "text-green-600" : "text-slate-400"} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Wrapper logo + card ── */}
        <div className="relative w-full max-w-lg flex flex-col items-center">

          {/* Logo flottant au-dessus de la card */}
          <div className="relative z-10 -mb-8">
            <div className="w-16 h-16 rounded-full  flex items-center justify-center shadow-lg ring-4 ring-slate-100">
              <img
                src={logo}
                alt="Logo"
                className="w-500 h-500 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling.style.display = "flex";
                }}
              />
              {/* Fallback icône */}
              <span className="hidden items-center justify-center">
                {isMedecin
                  ? <Stethoscope size={28} className="text-white" />
                  : <Shield      size={28} className="text-white" />
                }
              </span>
            </div>
          </div>

          {/* ── Card ── */}
          <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 pt-14 pb-8 px-10">

            <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
              Saisissez vos identifiants
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isMedecin ? "Email" : "Email de l'Ordre"}
                className="w-full border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-800 bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all placeholder:text-slate-400"
              />

              {/* Mot de passe */}
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isMedecin ? "Mot de passe" : "Mot de passe de l'Ordre"}
                  className="w-full border border-slate-200 rounded-xl px-5 pr-12 py-4 text-sm text-slate-800 bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Bouton connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-green-600 text-white text-base font-bold hover:bg-green-700 active:scale-[.99] transition-all shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Connexion en cours…
                  </>
                ) : (
                  "Connexion"
                )}
              </button>

              {/* ── Liens à l'intérieur de la card ── */}
              <div className="flex items-center justify-center gap-5 pt-3 text-sm border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => navigate("/adhesion")}
                  className="text-slate-500 hover:text-green-700 underline underline-offset-4 transition-colors"
                >
                  Créer mon espace
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-slate-500 hover:text-green-700 underline underline-offset-4 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>

            </form>
          </div>
          {/* ── fin card ── */}

        </div>
        {/* ── fin wrapper ── */}

      </div>
    </div>
  );
}

export default LoginPage;