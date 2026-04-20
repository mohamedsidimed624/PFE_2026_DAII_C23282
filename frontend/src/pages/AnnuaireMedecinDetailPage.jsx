import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPublicMedecinById } from "../services/publicAnnuaireApi";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Stethoscope,
  FileBadge,
  UserRound,
  GraduationCap,
  Briefcase,
  BadgeCheck,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Building2,
  Globe,
} from "lucide-react";

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const STATUS_CONFIG = {
  ACTIF: {
    label: "Profil vérifié",
    cls: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  RETRAITE: {
    label: "Retraité",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  SUSPENDU: {
    label: "Suspendu",
    cls: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
  },
};

function AnnuaireMedecinDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPublicMedecinById(id);
        setMedecin(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger la fiche publique du médecin.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedecin();
  }, [id]);

  const specialiteDisplay = useMemo(() => {
    if (!medecin) return "Spécialité non renseignée";

    if (medecin.specialiteLibelle && medecin.sousSpecialiteLibelle) {
      return `${medecin.specialiteLibelle} — ${medecin.sousSpecialiteLibelle}`;
    }

    return medecin.specialiteLibelle || "Spécialité non renseignée";
  }, [medecin]);

  const profileSummary = useMemo(() => {
    if (!medecin) return [];

    return [
      {
        icon: <Stethoscope size={16} className="text-green-600" />,
        label: "Spécialité",
        value: specialiteDisplay,
      },
      {
        icon: <CreditCard size={16} className="text-green-600" />,
        label: "Numéro d'inscription",
        value: medecin.numeroInscription || "—",
      },
      {
        icon: <MapPin size={16} className="text-green-600" />,
        label: "Adresse",
        value: medecin.adresse || medecin.ville || "Non renseignée",
      },
    ];
  }, [medecin, specialiteDisplay]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <button
          onClick={() => navigate("/annuaire")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Retour à l'annuaire
        </button>

        {loading && (
          <div className="space-y-5 animate-pulse">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="h-48 bg-slate-200" />
              <div className="grid gap-4 p-6 md:grid-cols-3">
                <div className="h-24 rounded-2xl bg-slate-100" />
                <div className="h-24 rounded-2xl bg-slate-100" />
                <div className="h-24 rounded-2xl bg-slate-100" />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.6fr_0.8fr]">
              <div className="h-64 rounded-3xl border border-slate-200 bg-white" />
              <div className="h-64 rounded-3xl border border-slate-200 bg-white" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && !medecin && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UserRound size={26} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Médecin introuvable
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Ce profil n'est pas disponible dans l'annuaire public.
            </p>
          </div>
        )}

        {!loading && !error && medecin && (() => {
          const statusKey = String(medecin.statut || "ACTIF").toUpperCase();
          const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ACTIF;
          const isActif = statusKey === "ACTIF";

          return (
            <div className="space-y-6">
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-slate-900 via-green-900 to-emerald-700 px-8 py-10">
                  <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                    <div className="flex items-start gap-5">
                      {medecin.photoProfilPath ? (
                        <img
                          src={`http://localhost:8080${medecin.photoProfilPath}`}
                          alt={`Dr. ${medecin.nom}`}
                          className="h-24 w-24 shrink-0 rounded-3xl border-2 border-white/20 object-cover shadow-xl"
                        />
                      ) : (
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-3xl font-bold text-white shadow-xl backdrop-blur">
                          {medecin.prenom?.[0]}
                          {medecin.nom?.[0]}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-green-100 backdrop-blur">
                          <Sparkles size={12} />
                          Registre officiel ONMM
                        </div>

                        <h1 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">
                          Dr. {medecin.prenom} {medecin.nom}
                        </h1>

                        <p className="mt-3 inline-flex items-center gap-2 text-base font-medium text-green-100">
                          <Stethoscope size={16} />
                          {specialiteDisplay}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <span
                            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${status.cls}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>

                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur">
                            <CreditCard size={14} />
                            {medecin.numeroInscription || "N° non renseigné"}
                          </span>

                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur">
                            <MapPin size={14} />
                            {medecin.ville || "Ville non renseignée"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                      <p className="text-xs font-bold uppercase tracking-widest text-green-100/80">
                        Vérification publique
                      </p>
                      <h2 className="mt-2 text-lg font-bold text-white">
                        Profil consultable dans l'annuaire officiel
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-white/80">
                        Cette fiche confirme que le praticien est bien présent
                        dans le registre public de l’Ordre National des Médecins
                        Mauritanien.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-3">
                  {profileSummary.map((item) => (
                    <QuickValueCard
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
                <div className="space-y-6">
                  <Section
                    title="Présentation professionnelle"
                    subtitle="Informations essentielles issues du registre public"
                    icon={<BadgeCheck size={17} className="text-green-600" />}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoBox
                        label="Nom complet"
                        value={`Dr. ${medecin.prenom} ${medecin.nom}`}
                      />
                      <InfoBox
                        label="Spécialité principale"
                        value={medecin.specialiteLibelle}
                      />
                      <InfoBox
                        label="Sous-spécialité"
                        value={medecin.sousSpecialiteLibelle}
                      />
                      <InfoBox
                        label="Numéro d'inscription"
                        value={medecin.numeroInscription}
                      />
                      <InfoBox
                        label="Adresse"
                        value={medecin.adresse}
                        icon={<MapPin size={13} />}
                      />
                      <InfoBox label="Ville" value={medecin.ville} />
                      {medecin.nationalite && (
                        <InfoBox
                          label="Nationalité"
                          value={medecin.nationalite}
                          icon={<Globe size={13} />}
                        />
                      )}
                      {medecin.sexe && (
                        <InfoBox label="Genre" value={medecin.sexe} />
                      )}
                    </div>
                  </Section>

                  {medecin.educations?.length > 0 && (
                    <Section
                      title="Formation & qualifications"
                      subtitle="Parcours académique et diplômes déclarés"
                      icon={<GraduationCap size={17} className="text-green-600" />}
                    >
                      <div className="space-y-4">
                        {medecin.educations.map((edu, i) => {
                          const eduSpecialite = edu.sousSpecialiteLibelle
                            ? `${edu.specialiteLibelle} — ${edu.sousSpecialiteLibelle}`
                            : edu.specialiteLibelle || "Spécialité non renseignée";

                          return (
                            <TimelineCard
                              key={edu.id || i}
                              title={edu.diplome || "Diplôme"}
                              badge={edu.anneeObtention || ""}
                              subtitle={eduSpecialite}
                              meta={[edu.universite, edu.ville, edu.pays]
                                .filter(Boolean)
                                .join(" • ")}
                            />
                          );
                        })}
                      </div>
                    </Section>
                  )}

                  {medecin.experiences?.length > 0 && (
                    <Section
                      title="Expérience professionnelle"
                      subtitle="Résumé des expériences déclarées"
                      icon={<Briefcase size={17} className="text-green-600" />}
                    >
                      <div className="space-y-4">
                        {medecin.experiences.map((exp, i) => (
                          <TimelineCard
                            key={exp.id || i}
                            title={exp.poste || "Poste"}
                            badge={`${exp.dateDebut ? formatDate(exp.dateDebut) : "—"} — ${
                              exp.dateFin ? formatDate(exp.dateFin) : "Présent"
                            }`}
                            subtitle={exp.nomEtablissement || "Établissement non renseigné"}
                            meta={[exp.ville, exp.pays].filter(Boolean).join(" • ")}
                          />
                        ))}
                      </div>
                    </Section>
                  )}
                </div>

                <div className="space-y-6">
                  <SidePanel
                    title="Ce que cette fiche confirme"
                    icon={<ShieldCheck size={17} className="text-green-600" />}
                  >
                    <TrustItem
                      ok={isActif}
                      title="Inscription à l'Ordre"
                      text="Le praticien figure dans le registre public officiel."
                    />
                    <TrustItem
                      ok={Boolean(medecin.specialiteLibelle)}
                      title="Spécialité déclarée"
                      text="La spécialité affichée provient des données validées dans le registre."
                    />
                    <TrustItem
                      ok={Boolean(medecin.numeroInscription)}
                      title="Référence administrative"
                      text="Le numéro d'inscription identifie le praticien dans l'annuaire."
                    />
                  </SidePanel>

                  <SidePanel
                    title="Informations administratives"
                    icon={<FileBadge size={17} className="text-green-600" />}
                  >
                    <MiniRow label="Statut public" value={status.label} />
                    <MiniRow
                      label="Numéro d'inscription"
                      value={medecin.numeroInscription || "—"}
                    />
                    <MiniRow label="Ville" value={medecin.ville || "—"} />
                    <MiniRow label="Spécialité" value={specialiteDisplay || "—"} />
                  </SidePanel>

                  <div className="rounded-3xl border border-green-200 bg-green-50 p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100">
                      <Building2 size={18} className="text-green-700" />
                    </div>
                    <h3 className="text-sm font-bold text-green-800">
                      Source officielle
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-green-700">
                      Les informations visibles sur cette fiche sont publiées à
                      partir du registre de l’Ordre National des Médecins
                      Mauritanien.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          );
        })()}
      </main>
    </div>
  );
}

function Section({ title, subtitle, icon, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-50">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function SidePanel({ title, icon, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function QuickValueCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <p className="break-words text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function InfoBox({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-1.5 flex items-center gap-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
      </div>
      <p className="break-words text-sm font-semibold text-slate-800">
        {value || <span className="font-normal text-slate-300">Non renseigné</span>}
      </p>
    </div>
  );
}

function TimelineCard({ title, subtitle, badge, meta }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          {subtitle && (
            <p className="mt-1 text-sm font-medium text-green-700">{subtitle}</p>
          )}
        </div>

        {badge && (
          <span className="rounded-xl border border-green-100 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            {badge}
          </span>
        )}
      </div>

      {meta && <p className="mt-3 text-sm leading-7 text-slate-500">{meta}</p>}
    </div>
  );
}

function TrustItem({ ok, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          ok ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
        }`}
      >
        <CheckCircle2 size={16} />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function MiniRow({ label, value }) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default AnnuaireMedecinDetailPage;