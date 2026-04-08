import { useState } from "react";
import Navbar from "../components/Navbar";
import { createPublicReclamation } from "../services/publicReclamationApi";
import {
  Send,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  MessageSquare,
  UserRound,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const OBJET_OPTIONS = [
  "Retard de traitement",
  "Problème administratif",
  "Erreur sur dossier",
  "Demande d'information",
  "Autre",
];

function PublicReclamationPage() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    ville: "",
    adresse: "",
    telephone: "",
    email: "",
    message: "",
  });

  const [selectedObjet, setSelectedObjet] = useState("");
  const [customObjet, setCustomObjet] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [numeroReclamation, setNumeroReclamation] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.nom.trim() ||
      !form.prenom.trim() ||
      !form.ville.trim() ||
      !form.adresse.trim() ||
      !form.telephone.trim() ||
      !form.email.trim() ||
      !form.message.trim()
    ) {
      setError("Tous les champs obligatoires doivent être remplis.");
      return;
    }

    if (!selectedObjet) {
      setError("Veuillez choisir l'objet de la réclamation.");
      return;
    }

    if (selectedObjet === "Autre" && !customObjet.trim()) {
      setError("Veuillez préciser l'objet de la réclamation.");
      return;
    }

    const finalObjet =
      selectedObjet === "Autre" ? customObjet.trim() : selectedObjet;

    try {
      setLoading(true);

      const res = await createPublicReclamation(
        {
          ...form,
          objet: finalObjet,
        },
        file
      );

      setSuccess("Votre réclamation a été envoyée avec succès.");
      setNumeroReclamation(res.numeroReclamation || "");

      setForm({
        nom: "",
        prenom: "",
        ville: "",
        adresse: "",
        telephone: "",
        email: "",
        message: "",
      });
      setSelectedObjet("");
      setCustomObjet("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Impossible d'envoyer votre réclamation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-green-600">
            Espace public
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Déposer une réclamation
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Si vous êtes citoyen, vous pouvez transmettre une réclamation à
            l’administration via ce formulaire. Fournissez des informations
            claires et exactes afin de faciliter le traitement de votre demande.
          </p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Form */}
          <div className="space-y-6">
            {success && (
              <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">{success}</p>
                  {numeroReclamation && (
                    <p className="mt-1 text-xs text-green-600">
                      Numéro de réclamation :{" "}
                      <span className="font-bold">{numeroReclamation}</span>
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

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identité */}
                <FormSectionTitle
                  icon={<UserRound size={16} className="text-green-600" />}
                  title="Informations personnelles"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Nom"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Prénom"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Ville"
                    name="ville"
                    value={form.ville}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Adresse"
                    name="adresse"
                    value={form.adresse}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Téléphone"
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Objet */}
                <FormSectionTitle
                  icon={<MessageSquare size={16} className="text-green-600" />}
                  title="Objet de la réclamation"
                />

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

                {/* Message */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={8}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Décrivez votre réclamation..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15 resize-none"
                  />
                </div>

                {/* Fichier */}
                <FormSectionTitle
                  icon={<FileText size={16} className="text-green-600" />}
                  title="Pièce jointe"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Pièce jointe (optionnelle)
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-green-400 hover:bg-green-50/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                      <Paperclip size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {file ? file.name : "Ajouter un fichier"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Document justificatif si nécessaire
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
                        Envoyer la réclamation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            <InfoCard
              icon={<ShieldCheck size={18} className="text-green-600" />}
              title="Traitement administratif"
              text="Votre réclamation sera enregistrée, examinée par l’administration puis clôturée avec une réponse adaptée."
            />

            <InfoCard
              icon={<FileText size={18} className="text-slate-600" />}
              title="Pièces justificatives"
              text="Vous pouvez joindre un document utile si cela permet d’appuyer ou de clarifier votre demande."
            />

            <InfoCard
              icon={<MessageSquare size={18} className="text-slate-600" />}
              title="Conseil"
              text="Rédigez un message précis, factuel et structuré. Cela améliore la compréhension et accélère le traitement."
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800">
                Informations fournies
              </h3>

              <div className="mt-4 space-y-3">
                <PreviewRow
                  icon={<UserRound size={15} />}
                  value={`${form.prenom || ""} ${form.nom || ""}`.trim() || "Nom et prénom"}
                />
                <PreviewRow
                  icon={<Mail size={15} />}
                  value={form.email || "Adresse e-mail"}
                />
                <PreviewRow
                  icon={<Phone size={15} />}
                  value={form.telephone || "Téléphone"}
                />
                <PreviewRow
                  icon={<MapPin size={15} />}
                  value={form.ville || "Ville"}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function FormSectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-green-50">
        {icon}
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
        </div>
      </div>
    </section>
  );
}

function PreviewRow({ icon, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
        {icon}
      </div>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/15"
      />
    </div>
  );
}

export default PublicReclamationPage;