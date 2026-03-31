import Navbar from "../Components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Clock3,
  XCircle,
  User,
  Mail,
  CalendarDays,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import {
  getSuiviDossier,
  getDemandePourReprise,
} from "../services/demandeSuiviApi";
import { useFormData } from "../context/FormContext";

function SuiviDossierPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setFormData, setStep, setSubmitted } = useFormData();

  const [numeroDossier, setNumeroDossier] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [resumeLoading, setResumeLoading] = useState(false);

  useEffect(() => {
    const numero = searchParams.get("numero");

    if (!numero || !numero.trim()) {
      setError("Aucun numéro de dossier n’a été fourni.");
      setLoading(false);
      return;
    }

    setNumeroDossier(numero);

    const fetchSuivi = async () => {
      try {
        setLoading(true);
        setError("");
        setResult(null);

        const data = await getSuiviDossier(numero.trim());
        setResult(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le dossier demandé.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuivi();
  }, [searchParams]);

  const handleResume = async () => {
        try {
            setResumeLoading(true);
            setError("");

            const data = await getDemandePourReprise(result.numeroDossier);

            console.log("DATA POUR REPRISE :", data);

            const preparedData = {
            personal: data.personal || {},
            education: data.education || [],
            experience: data.experience || [],
            documents: {
                diplomes: [],
                certificats: [],
                autres: [],
            },
            };

            console.log("DATA PREPAREE POUR REPRISE :", preparedData);

            setFormData(preparedData);
            localStorage.setItem("adhesionForm", JSON.stringify(preparedData));

            setStep(1);
            setSubmitted(false);

            navigate("/adhesion");
        } catch (err) {
            console.error(err);
            setError("Impossible de charger les données du dossier pour reprise.");
        } finally {
            setResumeLoading(false);
     }
    };

  const getStatusBadge = (statut) => {
    if (statut === "PENDING") {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-medium">
          <Clock3 size={16} />
          En attente
        </span>
      );
    }

    if (statut === "APPROUVED") {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
          <CheckCircle size={16} />
          Approuvée
        </span>
      );
    }

    if (statut === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          <XCircle size={16} />
          Rejetée
        </span>
      );
    }

    return (
      <span className="inline-flex px-4 py-2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-sm font-medium">
        {statut}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50">
          <main className="max-w-5xl mx-auto px-6 py-10">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <p className="text-slate-600">Chargement du suivi de dossier...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error && !result) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50">
          <main className="max-w-4xl mx-auto px-6 py-10">
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={26} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-600 mb-2">
                    Suivi de dossier
                  </p>

                  <h1 className="text-2xl font-bold text-slate-800 mb-3">
                    Erreur de chargement
                  </h1>

                  <p className="text-slate-600 mb-4">{error}</p>

                  {numeroDossier && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                      <p className="text-sm text-slate-500 mb-1">
                        Numéro demandé
                      </p>
                      <p className="font-semibold text-slate-800 break-all">
                        {numeroDossier}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
                  >
                    <ArrowLeft size={18} />
                    Retour à l’accueil
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50">
        <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <p className="text-sm font-semibold text-green-600 mb-2">
              Suivi de dossier
            </p>

            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              État de votre demande
            </h1>

            <p className="text-slate-500 max-w-2xl">
              Voici les informations actuelles de votre dossier d’adhésion ainsi
              que les actions disponibles selon son état.
            </p>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4">
              {error}
            </div>
          )}

          <section className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Numéro de dossier</p>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {result.numeroDossier}
                  </h2>
                </div>

                <div>{getStatusBadge(result.statut)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoItem
                  label="Nom"
                  value={result.nom}
                  icon={<User size={18} />}
                />
                <InfoItem
                  label="Prénom"
                  value={result.prenom}
                  icon={<User size={18} />}
                />
                <InfoItem
                  label="Email"
                  value={result.email}
                  icon={<Mail size={18} />}
                />
                <InfoItem
                  label="Date de soumission"
                  value={formatDate(result.dateSoumission)}
                  icon={<CalendarDays size={18} />}
                />
              </div>

              {result.dateDecision && (
                <div className="mt-5">
                  <InfoItem
                    label="Date de décision"
                    value={formatDate(result.dateDecision)}
                    icon={<CheckCircle size={18} />}
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                État de votre demande
              </h3>

              {result.statut === "PENDING" && (
                <p className="text-slate-600">
                  Votre demande est actuellement en cours de traitement par
                  l’administration. Aucune action n’est requise pour le moment.
                </p>
              )}

              {result.statut === "APPROUVED" && !result.compteActive && (
                <p className="text-slate-600">
                  Votre demande a été approuvée. Votre compte a été créé mais
                  n’est pas encore activé.
                </p>
              )}

              {result.statut === "APPROUVED" && result.compteActive && (
                <p className="text-slate-600">
                  Votre demande a été approuvée et votre compte est déjà activé.
                  Vous pouvez vous connecter à votre espace médecin.
                </p>
              )}

              {result.statut === "REJECTED" && (
                <div className="space-y-4">
                  <p className="text-slate-600">
                    Votre demande a été rejetée. Vous pouvez consulter le
                    commentaire de l’administration puis compléter et resoumettre
                    votre dossier.
                  </p>

                  {result.commentaireAdmin && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                      <p className="text-sm font-medium text-red-700 mb-2">
                        Commentaire de l’administration
                      </p>
                      <p className="text-red-800">{result.commentaireAdmin}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Actions disponibles
              </h3>

              <div className="flex flex-wrap gap-4">
                {result.peutActiverCompte && result.activationLink && (
                  <button
                    onClick={() => {
                      window.location.href = result.activationLink;
                    }}
                    className="px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
                  >
                    Activer mon compte
                  </button>
                )}
                {result.compteActive && (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                  >
                    Se connecter
                  </button>
                )}

                {result.peutCompleterDossier && (
                  <button
                    onClick={handleResume}
                    disabled={resumeLoading}
                    className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {resumeLoading
                      ? "Chargement du dossier..."
                      : "Compléter et resoumettre"}
                  </button>
                )}

                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
                >
                  Retour à l’accueil
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        <span>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>

      <p className="text-slate-800 font-semibold break-words">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "Non disponible";

  const date = new Date(dateString);

  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default SuiviDossierPage;