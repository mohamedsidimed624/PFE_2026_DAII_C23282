import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authApi";
import Navbar from "../components/Navbar";
import { Stethoscope, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

/*
 * ── Remplacez par vos chemins d'images ──
 * MEDECIN_LOGO : logo affiché dans l'onglet Médecin (cercle vert au-dessus de la card)
 * ORDRE_LOGO   : laissez "/images/ordre-logo.png" — vous pourrez le remplir plus tard
 */
const MEDECIN_LOGO = "/logo.png";
const ORDRE_LOGO   = "./assets/logo.png";

const TABS = [
  { key: "MEDECIN", label: "Médecin", icon: Stethoscope },
  { key: "ORDRE",   label: "Ordre",   icon: Shield },
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

  /* placeholder des inputs selon l'onglet */
  const emailPlaceholder = isMedecin ? "Email" : "Email de l'Ordre";
  const pwdPlaceholder   = isMedecin ? "Mot de passe" : "Mot de passe de l'Ordre";

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 overflow-hidden">

      {/* ── Navbar existante ── */}
      <Navbar />

      {/* ── Fond décoratif (courbes comme la maquette) ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Cadenas bas-gauche */}
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border-[28px] border-slate-200/60" />
        <div className="absolute bottom-28 left-28 w-20 h-20 rounded-full border-[14px] border-slate-200/40" />
        {/* Courbes droite */}
        <div className="absolute -right-20 top-1/4 w-96 h-96 rounded-full border-[2px] border-green-200/50" />
        <div className="absolute -right-32 top-1/3 w-[500px] h-[500px] rounded-full border-[2px] border-green-100/40" />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-[2px] border-green-200/30" />
        {/* Blob top-left */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-green-100/40 rounded-full blur-3xl" />
      </div>

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

        {/* ── Tabs centrés ── */}
        <div className="bg-white/90 backdrop-blur rounded-full border border-slate-200 shadow-md p-1.5 flex gap-1 mb-12">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
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

        {/* ── Wrapper : logo flottant + card ── */}
        <div className="relative w-full max-w-md flex flex-col items-center">

          {/* Logo centré qui chevauche le bord supérieur de la card */}
          <div className="relative z-10 -mb-9">
            {isMedecin ? (
              /* Médecin : logo dans un cercle vert */
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center shadow-lg ring-4 ring-white">
                <img
                  src={MEDECIN_LOGO}
                  alt="Logo Médecin"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <Stethoscope size={28} className="text-white hidden" />
              </div>
            ) : (
              /* Ordre : espace réservé pour votre logo */
              <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center shadow-lg ring-4 ring-white">
                {/*
                  ── Remplacez ce bloc par votre logo Ordre ──
                  <img src={ORDRE_LOGO} alt="Logo Ordre" className="w-10 h-10 object-contain" />
                */}
                <img
                  src={ORDRE_LOGO}
                  alt="Logo Ordre"
                  className="w-10 h-10 object-contain"
                />
                

              </div>
            )}
          </div>

          {/* ── Card ── */}
          <div className="w-full bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-100 pt-12 pb-8 px-8">

            <h2 className="text-xl font-bold text-slate-800 text-center mb-6">
              Saisissez vos identifiants
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Email */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={emailPlaceholder}
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all placeholder:text-slate-400"
              />

              {/* Mot de passe */}
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={pwdPlaceholder}
                  className="w-full border border-slate-200 rounded-xl px-4 pr-11 py-3.5 text-sm text-slate-800 bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Bouton connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 active:scale-[.99] transition-all shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Connexion en cours…
                  </>
                ) : (
                  "Connexion"
                )}
              </button>

            </form>
          </div>
        </div>

        {/* ── Liens bas ── */}
        <div className="flex items-center justify-center gap-4 mt-7 text-sm">
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

      </div>
    </div>
  );
}

export default LoginPage;