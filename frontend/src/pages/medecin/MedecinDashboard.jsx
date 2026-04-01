import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyProfile } from "../../services/medecinApi";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Bell,
  FileText,
  Settings,
  IdCard,
  MapPin,
  Globe,
  Stethoscope,
  ChevronRight,
  Activity,
  CheckCircle2,
  Key,
  LogIn,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

function MedecinDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMyProfile();
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les informations du médecin.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const p = profile || {};

  const completion = useMemo(() => {
    const fields = [
      "nom",
      "prenom",
      "email",
      "telephone",
      "nni",
      "sexe",
      "nationalite",
      "adresse",
      "numeroInscription",
      "statut",
      "specialite",
    ];

    const filled = fields.filter(
      (field) => p[field] && String(p[field]).trim() !== ""
    ).length;

    return Math.round((filled / fields.length) * 100);
  }, [p]);

  const statusIsActive = useMemo(() => {
    return ["ACTIF", "ACTIVE", "APPROVED"].includes(
      (p.statut || "").toUpperCase()
    );
  }, [p.statut]);

  const statusBadgeClass = statusIsActive
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-slate-50 text-slate-700 border-slate-200";

  if (loading) {
    return (
      <MedecinLayout
        title="Dashboard"
        subtitle="Chargement des informations de votre espace médecin."
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">Chargement du tableau de bord...</p>
        </div>
      </MedecinLayout>
    );
  }

  if (error) {
    return (
      <MedecinLayout
        title="Dashboard"
        subtitle="Une erreur est survenue lors du chargement."
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout
      title="Dashboard"
      subtitle="Vue d’ensemble de votre espace médecin."
    >
      <div className="space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-green-900 to-green-700 p-8 text-white shadow-sm">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-24 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/60">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Tableau de bord médecin
            </div>

            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              Bonjour, Dr. {p.prenom} {p.nom} 👋
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
              Bienvenue dans votre espace personnel. Consultez votre profil,
              suivez votre statut et accédez rapidement aux services essentiels
              de l’Ordre.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                {statusIsActive ? "Compte actif" : p.statut || "Statut inconnu"}
              </span>

              {p.specialite && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  <Stethoscope size={14} />
                  {p.specialite}
                </span>
              )}

              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <TrendingUp size={14} />
                Profil à {completion}%
              </span>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <StatCard
            icon={<ShieldCheck size={18} />}
            iconClassName="bg-green-50 text-green-600"
            label="Statut"
            value={p.statut || "—"}
          />

          <StatCard
            icon={<Stethoscope size={18} />}
            iconClassName="bg-blue-50 text-blue-600"
            label="Spécialité"
            value={p.specialite || "—"}
          />

          <StatCard
            icon={<Activity size={18} />}
            iconClassName="bg-purple-50 text-purple-600"
            label="Profil complété"
            value={`${completion}%`}
            progress={completion}
          />
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* APERÇU PROFIL */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Aperçu du profil
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Informations principales de votre compte médecin
                  </p>
                </div>

                <button
                  onClick={() => navigate("/medecin/profil")}
                  className="inline-flex items-center gap-2 self-start rounded-xl border border-green-100 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                >
                  Voir tout
                  <ArrowUpRight size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard
                  icon={<User size={16} />}
                  label="Nom complet"
                  value={`${p.prenom || ""} ${p.nom || ""}`.trim()}
                />
                <InfoCard
                  icon={<Mail size={16} />}
                  label="Email"
                  value={p.email}
                />
                <InfoCard
                  icon={<Phone size={16} />}
                  label="Téléphone"
                  value={p.telephone}
                />
                <InfoCard
                  icon={<IdCard size={16} />}
                  label="NNI"
                  value={p.nni}
                />
                <InfoCard
                  icon={<ShieldCheck size={16} />}
                  label="Sexe"
                  value={p.sexe}
                />
                <InfoCard
                  icon={<Globe size={16} />}
                  label="Nationalité"
                  value={p.nationalite}
                />
                <InfoCard
                  icon={<IdCard size={16} />}
                  label="Numéro d’inscription"
                  value={p.numeroInscription}
                />
                <InfoCard
                  icon={<Stethoscope size={16} />}
                  label="Spécialité"
                  value={p.specialite}
                />

                <div className="md:col-span-2">
                  <InfoCard
                    icon={<MapPin size={16} />}
                    label="Adresse"
                    value={p.adresse}
                  />
                </div>
              </div>
            </section>

            {/* ACTIVITÉ */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Activité récente
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Historique des dernières actions sur votre compte
                </p>
              </div>

              <div className="space-y-0">
                <ActivityRow
                  icon={<CheckCircle2 size={15} />}
                  iconClassName="bg-green-50 text-green-600"
                  title="Compte activé"
                  desc="Votre espace médecin a été activé avec succès."
                  showLine
                />

                <ActivityRow
                  icon={<Key size={15} />}
                  iconClassName="bg-blue-50 text-blue-600"
                  title="Mot de passe défini"
                  desc="Votre mot de passe a été enregistré en toute sécurité."
                  showLine
                />

                <ActivityRow
                  icon={<LogIn size={15} />}
                  iconClassName="bg-purple-50 text-purple-600"
                  title="Connexion réussie"
                  desc="Dernière connexion à votre espace personnel."
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* ETAT COMPTE */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                État du compte
              </p>

              <div
                className={`mb-4 flex items-center gap-3 rounded-2xl border p-4 ${statusIsActive ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${statusIsActive ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"}`}
                >
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Statut
                  </p>
                  <p
                    className={`text-base font-bold ${statusIsActive ? "text-green-700" : "text-slate-700"}`}
                  >
                    {p.statut || "Inconnu"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Stethoscope size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Espace
                  </p>
                  <p className="text-base font-bold text-slate-800">Médecin</p>
                </div>
              </div>
            </section>

            {/* ACTIONS RAPIDES */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Actions rapides
              </p>

              <div className="space-y-3">
                <ActionCard
                  icon={<User size={16} />}
                  iconClassName="bg-green-50 text-green-600"
                  title="Mon profil"
                  desc="Consulter mes informations"
                  onClick={() => navigate("/medecin/profil")}
                />

                <ActionCard
                  icon={<FileText size={16} />}
                  iconClassName="bg-blue-50 text-blue-600"
                  title="Mes documents"
                  desc="Accéder à mes pièces"
                  onClick={() => navigate("/medecin/documents")}
                />

                <ActionCard
                  icon={<Bell size={16} />}
                  iconClassName="bg-orange-50 text-orange-600"
                  title="Notifications"
                  desc="Voir les alertes récentes"
                  onClick={() => navigate("/medecin/notifications")}
                />

                <ActionCard
                  icon={<Settings size={16} />}
                  iconClassName="bg-purple-50 text-purple-600"
                  title="Paramètres"
                  desc="Gérer mon compte"
                  onClick={() => navigate("/medecin/parametres")}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </MedecinLayout>
  );
}

function StatCard({ icon, iconClassName, label, value, progress }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="truncate text-xl font-bold text-slate-900">{value}</p>

          {typeof progress === "number" && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-700 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <span className="text-green-600">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className={`break-words text-sm font-semibold ${value ? "text-slate-800" : "text-slate-300 font-normal"}`}>
        {value || "Non renseigné"}
      </p>
    </div>
  );
}

function ActivityRow({ icon, iconClassName, title, desc, showLine = false }) {
  return (
    <div className="flex gap-4 border-b border-slate-100 py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex w-8 shrink-0 flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClassName}`}
        >
          {icon}
        </div>
        {showLine && <div className="mt-2 w-px flex-1 bg-slate-200" />}
      </div>

      <div className="pt-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon, iconClassName, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-green-200 hover:bg-white hover:shadow-sm"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{desc}</p>
      </div>

      <ChevronRight size={16} className="text-slate-300" />
    </button>
  );
}

export default MedecinDashboard;