import { useState } from "react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { createMedecinReclamation } from "../../services/medecinReclamationApi";
import {
  Send,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

const OBJET_OPTIONS = [
  "Retard de traitement",
  "Problème administratif",
  "Erreur sur dossier",
  "Demande d'information",
  "Autre",
];

function MedecinReclamationCreatePage() {
  const [selectedObjet, setSelectedObjet] = useState("");
  const [customObjet, setCustomObjet] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [createdNumero, setCreatedNumero] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedObjet) {
      setError("Veuillez choisir l'objet de la réclamation.");
      return;
    }

    if (selectedObjet === "Autre" && !customObjet.trim()) {
      setError("Veuillez préciser l'objet de la réclamation.");
      return;
    }

    if (!message.trim()) {
      setError("Le message est obligatoire.");
      return;
    }

    const finalObjet =
      selectedObjet === "Autre" ? customObjet.trim() : selectedObjet;

    try {
      setLoading(true);

      const res = await createMedecinReclamation(
        {
          objet: finalObjet,
          message,
        },
        file
      );

      setSuccess("Votre réclamation a été soumise avec succès.");
      setCreatedNumero(res.numeroReclamation || "");

      setSelectedObjet("");
      setCustomObjet("");
      setMessage("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Impossible de soumettre la réclamation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MedecinLayout
      title="Déposer une réclamation"
      subtitle="Soumettez une réclamation à l'administration."
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* intro */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-green-600">
            Réclamation
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Déposer une nouvelle réclamation
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Décrivez clairement votre demande afin de permettre à
            l’administration de la traiter dans les meilleures conditions.
          </p>
        </section>

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{success}</p>
              {createdNumero && (
                <p className="mt-1 text-xs text-green-600">
                  Numéro de réclamation :{" "}
                  <span className="font-bold">{createdNumero}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          {/* form */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Objet
                </label>

                <select
                  value={selectedObjet}
                  onChange={(e) => setSelectedObjet(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15"
                >
                  <option value="">Choisir un objet</option>
                  {OBJET_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {selectedObjet === "Autre" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Préciser l'objet
                  </label>
                  <input
                    type="text"
                    value={customObjet}
                    onChange={(e) => setCustomObjet(e.target.value)}
                    placeholder="Saisir l'objet..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Message
                </label>
                <textarea
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez clairement votre réclamation..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15 resize-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Pièce jointe (optionnelle)
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-green-400 hover:bg-green-50/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                    <Paperclip size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      {file ? file.name : "Ajouter un fichier"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      PDF, image ou document justificatif
                    </p>
                  </div>

                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Soumettre la réclamation
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* side info */}
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Bon à savoir
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Après soumission, votre réclamation passera par les étapes :
                    <span className="font-medium text-slate-700"> soumise</span>,
                    <span className="font-medium text-slate-700"> en cours</span>,
                    puis
                    <span className="font-medium text-slate-700"> clôturée</span>.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Conseil
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Rédigez un message précis, structuré et factuel afin de
                    faciliter le traitement de votre demande.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Pièces jointes
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Ajoutez un document justificatif lorsque cela peut appuyer
                    votre réclamation.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}

export default MedecinReclamationCreatePage;