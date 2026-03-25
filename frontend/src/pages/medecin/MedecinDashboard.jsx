import { useEffect, useState } from "react";
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
  BadgeCheck,
} from "lucide-react";

function MedecinDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <MedecinLayout
        title="Dashboard"
        subtitle="Chargement des informations de votre espace médecin."
      >
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
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
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4">
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
    {/* Hero principal */}
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-700 to-emerald-600 text-white p-8 shadow-lg">
      <div className="relative z-10 max-w-3xl">
        <p className="text-sm uppercase tracking-wider text-green-100 mb-2">
          Tableau de bord médecin
        </p>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          Bonjour Dr. {profile?.prenom} {profile?.nom}
        </h1>

        <p className="mt-3 text-green-50 text-base md:text-lg">
          Bienvenue dans votre espace personnel. Vous pouvez consulter votre
          profil, suivre vos informations et accéder rapidement aux services
          essentiels.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-medium">
            Compte activé
          </span>

          <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-medium">
            Profil disponible
          </span>
        </div>
      </div>

      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute right-20 bottom-0 w-28 h-28 rounded-full bg-white/10" />
    </section>

    {/* Ligne de contenu principale */}
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Colonne gauche */}
      <div className="xl:col-span-2 space-y-6">
        {/* Aperçu profil */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Aperçu du profil
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Informations principales de votre compte médecin
              </p>
            </div>

            <button className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition">
              Voir le profil
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoItem
              icon={<User size={18} />}
              label="Nom complet"
              value={`${profile?.prenom || ""} ${profile?.nom || ""}`}
            />

            <InfoItem
              icon={<Mail size={18} />}
              label="Email"
              value={profile?.email}
            />

            <InfoItem
              icon={<Phone size={18} />}
              label="Téléphone"
              value={profile?.telephone}
            />

            <InfoItem
              icon={<IdCard size={18} />}
              label="NNI"
              value={profile?.nni}
            />

            <InfoItem
              icon={<ShieldCheck size={18} />}
              label="Sexe"
              value={profile?.sexe || "Non renseigné"}
            />

            <InfoItem
              icon={<Globe size={18} />}
              label="Nationalité"
              value={profile?.nationalite || "Non renseignée"}
            />

            <div className="md:col-span-2">
              <InfoItem
                icon={<MapPin size={18} />}
                label="Adresse"
                value={profile?.adresse || "Non renseignée"}
              />
            </div>
            <InfoItem
              icon={<IdCard size={18} />}
              label="Numéro d’inscription"
              value={profile?.numero_inscription}
            />

          <InfoItem
            icon={<ShieldCheck size={18} />}
            label="Statut"
            value={profile?.statut}
          />

          <InfoItem
            icon={<User size={18} />}
            label="Spécialité"
            value={profile?.specialite}
          />
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Activité récente
          </h2>

          <p className="text-sm text-slate-500 mb-6">
            Historique rapide des dernières actions liées à votre compte.
          </p>

          <div className="space-y-4">
            <ActivityItem
              title="Compte activé"
              subtitle="Votre espace médecin a été activé avec succès."
            />

            <ActivityItem
              title="Mot de passe défini"
              subtitle="Votre mot de passe a été enregistré en toute sécurité."
            />

            <ActivityItem
              title="Connexion réussie"
              subtitle="Dernière connexion à votre espace personnel."
            />
          </div>
        </div>
      </div>

      {/* Colonne droite */}
      <div className="space-y-6">
        {/* Statut */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            État du compte
          </h2>

          <div className="space-y-4">
            <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-700 font-medium">Statut</p>
              <p className="text-xl font-bold text-green-800 mt-1">Actif</p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-500 font-medium">Espace</p>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                Médecin
              </p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Actions rapides
          </h2>

          <p className="text-sm text-slate-500 mb-5">
            Accès direct aux sections essentielles.
          </p>

          <div className="space-y-3">
            <ActionCard
              icon={<User size={20} />}
              title="Mon profil"
              description="Consulter mes informations"
            />

            <ActionCard
              icon={<FileText size={20} />}
              title="Mes documents"
              description="Accéder à mes pièces"
            />

            <ActionCard
              icon={<Bell size={20} />}
              title="Notifications"
              description="Voir les alertes récentes"
            />

            <ActionCard
              icon={<Settings size={20} />}
              title="Paramètres"
              description="Gérer mon compte"
            />
          </div>
        </div>
      </div>
    </section>
  </MedecinLayout>
);
}

function InfoItem({ icon, label, value }) {
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

function ActionCard({ icon, title, description }) {
  return (
    <button
      type="button"
      className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-4 transition"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}

function ActivityItem({ title, subtitle }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50">
      <div className="w-3 h-3 mt-2 rounded-full bg-green-500 shrink-0" />
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export default MedecinDashboard;