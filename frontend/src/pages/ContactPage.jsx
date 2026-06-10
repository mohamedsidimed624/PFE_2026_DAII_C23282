import { useState } from "react";
import { Link } from "react-router-dom";
import { createContactMessage } from "../services/contactApi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Breadcrumb from "../components/public/Breadcrumb";
import {
  Mail, Phone, MapPin, Clock, Send,
  CheckCircle2, AlertCircle,
} from "lucide-react";

const CONTACT_INFOS = [
  { icon: MapPin, label: "Adresse",            value: "Tevragh Zeina, Nouakchott",    sub: "République Islamique de Mauritanie" },
  { icon: Phone,  label: "Téléphone",          value: "+222 45 25 00 00",             sub: "+222 36 00 00 00" },
  { icon: Mail,   label: "Email",              value: "contact@ordre-medecins.mr",    sub: "support@ordre-medecins.mr" },
  { icon: Clock,  label: "Heures d'ouverture", value: "Dim – Jeu : 08h00 – 16h00",   sub: "Vendredi & Samedi : Fermé" },
];

const DEPARTMENTS = [
  { name: "Secrétariat général",        email: "secretariat@ordre-medecins.mr",   phone: "+222 45 25 00 01" },
  { name: "Inscriptions & Adhésions",   email: "inscriptions@ordre-medecins.mr",  phone: "+222 45 25 00 02" },
  { name: "Réclamations & Déontologie", email: "reclamations@ordre-medecins.mr",  phone: "+222 45 25 00 03" },
  { name: "Communication",              email: "communication@ordre-medecins.mr", phone: "+222 45 25 00 04" },
];

const SUBJECTS = [
  "Demande d'inscription à l'Ordre",
  "Suivi de dossier",
  "Réclamation déontologique",
  "Renseignement sur l'annuaire",
  "Problème technique",
  "Autre",
];

const inp = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/15";

const BREADCRUMB = [{ label: "Accueil", to: "/" }, { label: "Contact" }];

export default function ContactPage() {
  const [form, setForm]           = useState({ nom: "", email: "", telephone: "", sujet: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createContactMessage(form);
      setSubmitted(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.");
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setSubmitted(false);
    setError("");
    setForm({ nom: "", email: "", telephone: "", sujet: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Breadcrumb items={BREADCRUMB} />

      {/* ── Page header ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-10 bg-green-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">Contact · ONMM</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Contactez l'ONMM
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Notre équipe est disponible du Dimanche au Jeudi pour répondre à vos questions administratives, d'inscription ou de renseignement.
          </p>
        </div>
        <div className="h-px bg-linear-to-r from-green-500 via-emerald-300 to-transparent" />
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ── Left column ── */}
          <div className="space-y-6">

            {/* Info cards 2×2 */}
            <div className="grid grid-cols-2 gap-4">
              {CONTACT_INFOS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800 leading-snug">{item.value}</p>
                      {item.sub && <p className="text-xs text-slate-400 mt-0.5 leading-snug">{item.sub}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Departments */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <p className="text-sm font-bold text-slate-900">Contacts par département</p>
                <p className="text-xs text-slate-500">Joignez directement le service concerné</p>
              </div>
              <div className="divide-y divide-slate-100">
                {DEPARTMENTS.map((dept) => (
                  <div key={dept.name} className="flex flex-col gap-1 px-5 py-3.5 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{dept.name}</p>
                      <a href={`mailto:${dept.email}`} className="text-xs text-slate-400 hover:text-green-600 transition-colors">
                        {dept.email}
                      </a>
                    </div>
                    <a href={`tel:${dept.phone.replace(/\s/g, "")}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700 transition-colors self-start sm:self-auto">
                      <Phone size={10} />{dept.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Reclamation alert */}
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Signalement déontologique ?</p>
                  <p className="text-xs leading-5 text-amber-700">Utilisez le formulaire dédié — traitement confidentiel garanti.</p>
                </div>
              </div>
              <Link to="/reclamations"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 transition-colors self-start sm:self-auto">
                Déposer une réclamation
              </Link>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Localisation</p>
                    <p className="text-xs text-slate-500">Siège ONMM — Tevragh Zeina, Nouakchott</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Ouvert aujourd'hui
                </span>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120377.58554227181!2d-16.04690750402271!3d18.086395156475734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xea0cc25cd7d48d7%3A0x1d2105151b75cb45!2sNouakchott%2C%20Mauritania!5e0!3m2!1sfr!2s!4v1684347209307!5m2!1sfr!2s"
                width="100%" height="240"
                style={{ border: 0, display: "block" }}
                allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Siège ONMM"
              />
            </div>
          </div>

          {/* ── Right column: form ── */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3.5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Send size={14} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Envoyer un message</p>
                <p className="text-xs text-slate-500">Réponse sous 5 jours ouvrables</p>
              </div>
            </div>

            <div className="px-5 py-5">
              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 size={28} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Message envoyé !</h3>
                    <p className="mt-1 max-w-xs text-sm text-slate-500">Nous vous répondrons dans les meilleurs délais.</p>
                  </div>
                  <button onClick={onReset}
                    className="mt-2 rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nom complet" required>
                      <input type="text" name="nom" value={form.nom} onChange={onChange}
                        placeholder="Dr. Ahmed Ould Mohamed" required className={inp} />
                    </Field>
                    <Field label="Adresse email" required>
                      <input type="email" name="email" value={form.email} onChange={onChange}
                        placeholder="vous@exemple.mr" required className={inp} />
                    </Field>
                  </div>

                  <Field label="Téléphone">
                    <input type="tel" name="telephone" value={form.telephone} onChange={onChange}
                      placeholder="+222 00 00 00 00" className={inp} />
                  </Field>

                  <Field label="Sujet" required>
                    <select name="sujet" value={form.sujet} onChange={onChange} required
                      className={`${inp} appearance-none`}>
                      <option value="">Choisissez un sujet…</option>
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>

                  <Field label="Message" required>
                    <textarea name="message" value={form.message} onChange={onChange} rows={5} required
                      placeholder="Décrivez votre demande en détail…"
                      className={`${inp} resize-none`} />
                  </Field>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                      <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-green-700 active:scale-[.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    <Send size={14} />
                    {loading ? "Envoi en cours…" : "Envoyer le message"}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Vos données sont traitées conformément à notre politique de confidentialité.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-green-600">*</span>}
      </label>
      {children}
    </div>
  );
}
