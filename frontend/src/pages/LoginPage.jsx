import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser } from "../services/authApi";
import Navbar from "../components/Navbar";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Footer from "../components/Footer";
import ordreLogo from "../assets/logo.png";

function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
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

            if (data.role === "ADMIN") navigate("/admin/dashboard");
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

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
            <Navbar />

            {/* Premium Animated Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-green-200/40 rounded-full blur-[100px] hidden sm:block"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-emerald-300/30 rounded-full blur-[100px] hidden sm:block"
                />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 relative z-10">
                {/* Login Card Wrapper */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-lg flex flex-col items-center"
                >
                    {/* Floating Logo */}
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 20 }}
  className="relative z-20 -mb-12"
>
  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-100">
    <img
      src={ordreLogo}
      alt="Logo ONMM"
      className="h-24 w-24 scale-125 rounded-full object-cover"
      style={{
        clipPath: "circle(42% at 50% 50%)",
        mixBlendMode: "multiply",
      }}
    />
  </div>
</motion.div>

                    {/* Card Container */}
                    <div className="w-full bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 pt-16 pb-10 px-10 relative overflow-hidden">
                        {/* Decorative inner glow */}
                        

                        <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
                            Connexion
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 ml-1">Adresse e-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    className="w-full border border-slate-200 rounded-xl px-5 py-3.5 text-sm text-slate-800 bg-white/50 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-slate-400"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/forgot-password")}
                                        className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
                                    >
                                        Oublié ?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPwd ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full border border-slate-200 rounded-xl px-5 pr-12 py-3.5 text-sm text-slate-800 bg-white/50 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd((v) => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error State */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                                            <AlertCircle size={16} className="shrink-0" />
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-base font-bold shadow-lg shadow-green-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-green-500/30"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                        Connexion en cours…
                                    </>
                                ) : (
                                    "Se connecter"
                                )}
                            </motion.button>

                            {/* Bottom CTA */}
                            <div className="text-center pt-6 mt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-600">
                                    Nouveau médecin ?{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/adhesion")}
                                        className="font-bold text-green-600 hover:text-green-700 transition-colors"
                                    >
                                        Créer mon espace
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
             <Footer />
        </div>
    );
}

export default LoginPage;