import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyProfile } from "../../services/medecinApi";

import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  FileText,
  IdCard,
  MapPin,
  Stethoscope,
  ChevronRight,
  TriangleAlert,
  Bell,
  Newspaper,
  Search,
  Award,
  ClipboardList,
  Vote,
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
  const educations = Array.isArray(p.educations) ? p.educations : [];

  const specialitesDisplay = useMemo(() => {
    if (educations.length === 0) return "Médecin";

    return educations
      .map((e) => {
        if (e.specialiteLibelle && e.sousSpecialiteLibelle) {
          return `${e.specialiteLibelle} — ${e.sousSpecialiteLibelle}`;
        }
        return e.specialiteLibelle;
      })
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .join(", ");
  }, [educations]);

  const completion = useMemo(() => {
    const requiredFields = [
      p.nom,
      p.prenom,
      p.email,
      p.telephone,
      p.nni,
      p.sexe,
      p.nationalite,
      p.adresse,
      p.numeroInscription,
      p.statut,
    ];

    const filledFields = requiredFields.filter(
      (value) => value && String(value).trim() !== ""
    ).length;

    const total = requiredFields.length + 1;
    const filled = filledFields + (educations.length > 0 ? 1 : 0);

    return Math.round((filled / total) * 100);
  }, [p, educations]);

  const statusIsActive = useMemo(() => {
    return ["ACTIF", "ACTIVE", "APPROVED", "VALIDE"].includes(
      String(p.statut || "").toUpperCase()
    );
  }, [p.statut]);

  if (loading) {
    return (
      <MedecinLayout title="Dashboard" subtitle="Chargement…">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Chargement du tableau de bord...
          </p>
        </div>
      </MedecinLayout>
    );
  }

  if (error) {
    return (
      <MedecinLayout title="Dashboard" subtitle="Une erreur est survenue.">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout
      title="Tableau de bord"
      subtitle="Accédez rapidement aux services essentiels de votre espace médecin."
    >
      <div className="space-y-6">
        <WelcomeBlock
          profile={p}
          specialitesDisplay={specialitesDisplay}
          statusIsActive={statusIsActive}
        />

        <PriorityAction
          statusIsActive={statusIsActive}
          completion={completion}
          onProfile={() => navigate("/medecin/profil")}
          onCertificate={() => navigate("/medecin/certificat")}
          onDemand={() => navigate("/suivi-dossier")}
        />

        <QuickActions navigate={navigate} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <ProfileSummary
              profile={p}
              specialitesDisplay={specialitesDisplay}
              completion={completion}
              onOpen={() => navigate("/medecin/profil")}
            />
          </section>

          <section>
            <NotificationsPreview navigate={navigate} />
          </section>
        </div>
      </div>
    </MedecinLayout>
  );
}

function WelcomeBlock({ profile, specialitesDisplay, statusIsActive }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Bonjour, Dr. {profile.prenom} {profile.nom}
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {specialitesDisplay} · N° {profile.numeroInscription || "—"}
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            statusIsActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              statusIsActive ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {statusIsActive ? "Compte actif" : profile.statut || "Statut inconnu"}
        </span>
      </div>
    </section>
  );
}

function PriorityAction({
  statusIsActive,
  completion,
  onProfile,
  onCertificate,
  onDemand,
}) {
  if (!statusIsActive) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-900/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Action prioritaire
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Votre dossier nécessite un suivi
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Consultez l’état de votre demande ou complétez vos informations.
            </p>
          </div>

          <button
            onClick={onDemand}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Suivre ma demande
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
    );
  }

  if (completion < 80) {
    return (
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-900/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Action recommandée
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Votre profil est complété à {completion}%
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Mettez à jour vos informations professionnelles pour améliorer la
              fiabilité de votre profil.
            </p>
          </div>

          <button
            onClick={onProfile}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Compléter mon profil
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-900/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Espace actif
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Votre espace médecin est opérationnel
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Vous pouvez accéder à vos documents et services professionnels.
          </p>
        </div>

        <button
          onClick={onCertificate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Télécharger mon certificat
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}

function QuickActions({ navigate }) {
  const actions = [
    {
      title: "Mon dossier",
      desc: "Suivre mon adhésion",
      icon: ClipboardList,
      to: "/suivi-dossier",
      color: "emerald",
    },
    {
      title: "Mon certificat",
      desc: "Retirer mon certificat",
      icon: Award,
      to: "/medecin/certificat",
      color: "blue",
    },
    {
      title: "Réclamations",
      desc: "Déposer ou suivre",
      icon: TriangleAlert,
      to: "/medecin/reclamations",
      color: "amber",
    },
    {
      title: "Annonces médecins",
      desc: "Publications privées",
      icon: Newspaper,
      to: "/medecin/annonces",
      color: "slate",
    },
    {
      title: "Annuaire",
      desc: "Rechercher un médecin",
      icon: Search,
      to: "/annuaire",
      color: "purple",
    },
    {
      title: "Élections",
      desc: "Vote et candidature",
      icon: Vote,
      to: "/medecin/elections",
      color: "red",
    },
  ];

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Actions rapides
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Les services les plus utilisés par les médecins.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <ServiceCard
            key={action.title}
            {...action}
            onClick={() => navigate(action.to)}
          />
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ title, desc, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900/60 dark:hover:bg-emerald-900/10"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {desc}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700"
      />
    </button>
  );
}

function ProfileSummary({
  profile,
  specialitesDisplay,
  completion,
  onOpen,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Résumé du profil
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Informations principales enregistrées auprès de l’Ordre.
          </p>
        </div>

        <button
          onClick={onOpen}
          className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Modifier
        </button>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Complétion du profil
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {completion}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-600"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoLine icon={<User size={15} />} label="Nom" value={`${profile.prenom || ""} ${profile.nom || ""}`} />
        <InfoLine icon={<Mail size={15} />} label="Email" value={profile.email} />
        <InfoLine icon={<Phone size={15} />} label="Téléphone" value={profile.telephone} />
        <InfoLine icon={<IdCard size={15} />} label="NNI" value={profile.nni} />
        <InfoLine icon={<ShieldCheck size={15} />} label="N° inscription" value={profile.numeroInscription} />
        <InfoLine icon={<Stethoscope size={15} />} label="Spécialité" value={specialitesDisplay} />
        <div className="sm:col-span-2">
          <InfoLine icon={<MapPin size={15} />} label="Adresse" value={profile.adresse} />
        </div>
      </div>
    </section>
  );
}

function InfoLine({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
        {label}
      </div>

      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}

function NotificationsPreview({ navigate }) {
  const notifications = [
    {
      title: "Nouvelle annonce réservée aux médecins",
      date: "Aujourd’hui",
    },
    {
      title: "Votre profil peut être complété",
      date: "Cette semaine",
    },
    {
      title: "Module sondages bientôt disponible",
      date: "Information",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Notifications
        </h2>

        <button
          onClick={() => navigate("/medecin/notifications")}
          className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Voir tout
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Bell size={15} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {n.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{n.date}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MedecinDashboard;