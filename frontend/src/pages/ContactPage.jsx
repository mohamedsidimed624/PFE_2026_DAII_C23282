import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const CONTACT_INFOS = [
  {
    icon: MapPin,
    label: "Adresse",
    value: "Tevragh Zeina, Nouakchott",
    sub: "République Islamique de Mauritanie",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+222 45 25 00 00",
    sub: "+222 36 00 00 00",
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@ordre-medecins.mr",
    sub: "support@ordre-medecins.mr",
  },
  {
    icon: Clock,
    label: "Heures d'ouverture",
    value: "Dim – Jeu : 08h00 – 16h00",
    sub: "Vendredi & Samedi : Fermé",
  },
];

const DEPARTMENTS = [
  {
    name: "Secrétariat général",
    email: "secretariat@ordre-medecins.mr",
    phone: "+222 45 25 00 01",
  },
  {
    name: "Inscriptions & Adhésions",
    email: "inscriptions@ordre-medecins.mr",
    phone: "+222 45 25 00 02",
  },
  {
    name: "Réclamations & Déontologie",
    email: "reclamations@ordre-medecins.mr",
    phone: "+222 45 25 00 03",
  },
  {
    name: "Communication",
    email: "communication@ordre-medecins.mr",
    phone: "+222 45 25 00 04",
  },
];

const INPUT_CLS =
  "w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#0F766E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/15";

export default function ContactPage() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    sujet: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const onReset = () => {
    setSubmitted(false);
    setForm({ nom: "", email: "", telephone: "", sujet: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* ── En-tête avec identité visuelle ── */}
      <div className="relative overflow-hidden border-b border-[#E2E8F0] bg-linear-to-br from-teal-50/50 to-white pt-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 0h6v17h17v6H23v17h-6V23H0v-6h17z' fill='%230F766E'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">

            {/* Gauche : texte */}
            <div className="lg:flex-1">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-[#0F766E]">
                <MessageSquare size={12} />
                Contact · ONMM
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] md:text-3xl">
                Contactez l&apos;ONMM
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#64748B]">
                Contactez l&apos;Ordre National des Médecins de Mauritanie pour toute
                demande administrative, inscription ou renseignement.
              </p>
            </div>

            {/* Droite : contact rapide */}
            <div className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm lg:w-60">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                Contact rapide
              </p>
              <a
                href="tel:+22245250000"
                className="flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs text-[#0F172A] transition hover:border-teal-200 hover:bg-teal-50"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-teal-50">
                  <Phone size={11} className="text-[#0F766E]" />
                </div>
                +222 45 25 00 00
              </a>
              <a
                href="mailto:contact@ordre-medecins.mr"
                className="flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs text-[#0F172A] transition hover:border-teal-200 hover:bg-teal-50"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-teal-50">
                  <Mail size={11} className="text-[#0F766E]" />
                </div>
                contact@ordre-medecins.mr
              </a>
              <div className="flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs text-[#64748B]">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-50">
                  <Clock size={11} className="text-[#64748B]" />
                </div>
                Dim – Jeu · 08h00 – 16h00
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Corps ── */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">

          {/* ── Colonne gauche : informations ── */}
          <div className="space-y-6">

            {/* Coordonnées */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                  Coordonnées
                </p>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {CONTACT_INFOS.map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="flex items-start gap-4 px-6 py-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                      <Icon size={15} className="text-[#0F766E]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#64748B]">{label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">{value}</p>
                      {sub && <p className="text-xs text-[#64748B]">{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacts par département */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                  Contacts par département
                </p>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  Contactez directement le service concerné.
                </p>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {DEPARTMENTS.map((dept) => (
                  <div
                    key={dept.name}
                    className="flex flex-col gap-1.5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {dept.name}
                      </p>
                      <a
                        href={`mailto:${dept.email}`}
                        className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-[#64748B] transition hover:text-[#0F766E]"
                      >
                        <Mail size={11} />
                        {dept.email}
                      </a>
                    </div>
                    <a
                      href={`tel:${dept.phone.replace(/\s/g, "")}`}
                      className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#0F172A] transition hover:border-teal-200 hover:bg-teal-50 hover:text-[#0F766E] sm:self-auto"
                    >
                      <Phone size={11} />
                      {dept.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Institution officielle */}
            <div className="flex items-start gap-4 rounded-xl border border-[#E2E8F0] bg-white px-6 py-5 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                <Building2 size={15} className="text-[#0F766E]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Institution officielle
                </p>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  L&apos;ONMM est l&apos;autorité nationale de régulation de la profession
                  médicale en Mauritanie, établie par décret présidentiel.
                </p>
              </div>
            </div>
          </div>

          {/* ── Colonne droite : formulaire ── */}
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                Envoyer un message
              </p>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Nous vous répondrons dans les meilleurs délais.
              </p>
            </div>

            <div className="px-6 py-6">
              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
                    <CheckCircle2 size={28} className="text-[#0F766E]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      Message envoyé !
                    </h3>
                    <p className="mt-1.5 max-w-xs text-sm text-[#64748B]">
                      Notre équipe vous contactera dans un délai de 24 à 48 heures.
                    </p>
                  </div>
                  <button
                    onClick={onReset}
                    className="mt-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-white"
                  >
                    Nouveau message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Nom */}
                  <FormField label="Nom complet" required>
                    <input
                      type="text"
                      name="nom"
                      value={form.nom}
                      onChange={onChange}
                      placeholder="Dr. Ahmed Ould Mohamed"
                      required
                      className={INPUT_CLS}
                    />
                  </FormField>

                  {/* Email */}
                  <FormField label="Adresse email" required>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="vous@exemple.mr"
                      required
                      className={INPUT_CLS}
                    />
                  </FormField>

                  {/* Téléphone */}
                  <FormField label="Téléphone">
                    <input
                      type="tel"
                      name="telephone"
                      value={form.telephone}
                      onChange={onChange}
                      placeholder="+222 00 00 00 00"
                      className={INPUT_CLS}
                    />
                  </FormField>

                  {/* Sujet */}
                  <FormField label="Sujet" required>
                    <select
                      name="sujet"
                      value={form.sujet}
                      onChange={onChange}
                      required
                      className={`${INPUT_CLS} appearance-none`}
                    >
                      <option value="">Choisissez un sujet…</option>
                      <option>Demande d&apos;inscription à l&apos;Ordre</option>
                      <option>Suivi de dossier</option>
                      <option>Réclamation déontologique</option>
                      <option>Renseignement sur l&apos;annuaire</option>
                      <option>Problème technique</option>
                      <option>Autre</option>
                    </select>
                  </FormField>

                  {/* Message */}
                  <FormField label="Message" required>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      rows={5}
                      required
                      placeholder="Décrivez votre demande en détail…"
                      className={`${INPUT_CLS} resize-none`}
                    />
                  </FormField>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e6b62] active:scale-[.99]"
                  >
                    <Send size={14} />
                    Envoyer le message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── Localisation ── */}
        <div className="mt-8 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-6 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
              Localisation
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Siège de l&apos;ONMM — Tevragh Zeina, Nouakchott
            </p>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120377.58554227181!2d-16.04690750402271!3d18.086395156475734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xea0cc25cd7d48d7%3A0x1d2105151b75cb45!2sNouakchott%2C%20Mauritania!5e0!3m2!1sfr!2s!4v1684347209307!5m2!1sfr!2s"
            width="100%"
            height="280"
            style={{ border: 0, display: "block" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Siège ONMM"
            className="grayscale-[15%]"
          />
        </div>

        {/* ── Besoin d'aide ? ── */}
        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <AlertCircle size={15} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Besoin d&apos;aide ?</p>
              <p className="mt-0.5 max-w-md text-xs leading-5 text-[#64748B]">
                Pour toute réclamation officielle ou signalement déontologique,
                utilisez le formulaire dédié aux réclamations.
              </p>
            </div>
          </div>
          <Link
            to="/reclamation"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:border-[#0F766E] hover:text-[#0F766E] sm:self-auto self-start"
          >
            Déposer une réclamation
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A]">
        {label}
        {required && <span className="ml-1 text-[#0F766E]">*</span>}
      </label>
      {children}
    </div>
  );
}
