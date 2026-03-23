import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Token manquant");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:8080/api/auth/set-password", {
        token,
        password,
        confirmPassword,
      });

      setMessage(res.data || "Mot de passe défini avec succès");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error(err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Erreur lors de la définition du mot de passe";

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          Définir votre mot de passe
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Veuillez saisir votre nouveau mot de passe pour activer votre compte.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Saisir le mot de passe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Confirmer le mot de passe"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          {message && (
            <p className="text-green-600 text-sm">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? "Envoi en cours..." : "Valider"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetPasswordPage;