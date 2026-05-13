import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyProfile, downloadCertificat } from "../../services/medecinApi";
import {
  getMedecinNotifications,
  markMedecinNotifAsRead,
} from "../../services/medecinNotificationApi";

import {
  Bell,
  BellOff,
  ChevronRight,
  Clock,
  Download,
  HelpCircle,
  Loader2,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const isActiveStatus = (statut) =>
  ["ACTIF", "ACTIVE", "APPROVED", "VALIDE"].includes(
    String(statut || "").toUpperCase()
  );

function MedecinDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setProfileError("");

        const profileRes = await getMyProfile();
        setProfile(profileRes.data);

        try {
          const notifRes = await getMedecinNotifications();
          setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
        } catch {
          setNotifications([]);
        }
      } catch (err) {
        console.error(err);
        setProfileError("Impossible de charger votre tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const p = profile || {};

  const specialite = useMemo(() => {
    const educations = Array.isArray(p.educations) ? p.educations : [];

    const labels = educations
      .map((e) => {
        if (e.specialiteLibelle && e.sousSpecialiteLibelle) {
          return `${e.specialiteLibelle} — ${e.sousSpecialiteLibelle}`;
        }
        return e.specialiteLibelle;
      })
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);

    return labels.join(", ") || "Médecin";
  }, [p.educations]);

  const isActive = isActiveStatus(p.statut);
  const unreadCount = notifications.filter((n) => !n.lu).length;

  const handleDownloadCertificat = async () => {
    try {
      setCertLoading(true);
      setCertError("");

      const res = await downloadCertificat();

      const url = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "certificat-onmm.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error(err);
      setCertError("Impossible de générer le certificat.");
    } finally {
      setCertLoading(false);
    }
  };

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    );

    try {
      await markMedecinNotifAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <MedecinLayout title="Tableau de bord">
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-green-600" />
        </div>
      </MedecinLayout>
    );
  }

  if (profileError) {
    return (
      <MedecinLayout title="Tableau de bord">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {profileError}
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout title="Tableau de bord">
      <div className="space-y-5">
        <PageIntro />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.9fr]">
          <DoctorOverview
            profile={p}
            specialite={specialite}
            isActive={isActive}
          />

          <CertificatePanel
            loading={certLoading}
            error={certError}
            onDownload={handleDownloadCertificat}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.9fr]">
          <ServicesPanel navigate={navigate} />

          <NotificationsPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onRead={markRead}
            onOpenAll={() => navigate("/medecin/notifications")}
          />
        </div>
      </div>
    </MedecinLayout>
  );
}

function PageIntro() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
    >
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Espace médecin ONMM
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Gérez vos informations professionnelles, téléchargez vos documents
          officiels et suivez vos échanges avec l’Ordre.
        </p>
      </div>

      <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Espace sécurisé
      </span>
    </motion.div>
  );
}

function DoctorOverview({ profile, specialite, isActive }) {
  const photoUrl = profile.photoProfilPath
    ? `${API_BASE_URL}${profile.photoProfilPath}`
    : null;

  const initials =
    `${profile.prenom?.[0] || ""}${profile.nom?.[0] || ""}`.toUpperCase() ||
    "?";

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Photo de profil"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
              Dr. {profile.prenom} {profile.nom}
            </h2>

            <StatusBadge active={isActive} statut={profile.statut} />
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Stethoscope size={14} className="text-green-600" />
            {specialite}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 border-t border-slate-100 sm:grid-cols-3 dark:border-slate-800">
        <InfoMini label="N° inscription" value={profile.numeroInscription} />
        <InfoMini label="Statut ordinal" value={profile.statut} />
        <InfoMini label="Conseil / région" value={profile.sectionOrdre || "—"} />
      </div>
    </section>
  );
}

function CertificatePanel({ loading, error, onDownload }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <ShieldCheck size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Certificat officiel d’adhésion
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Document PDF attestant votre inscription auprès de l’Ordre.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <Meta label="Format" value="PDF" />
            <Meta label="Dernière génération" value="—" />
          </div>

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

          <button
            type="button"
            onClick={onDownload}
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            {loading ? "Génération…" : "Télécharger le certificat"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ServicesPanel({ navigate }) {
  const services = [
    {
      title: "Mes informations professionnelles",
      desc: "Consulter ou mettre à jour mes coordonnées",
      icon: User,
      to: "/medecin/profil",
    },
    {
      title: "Mes demandes et réclamations",
      desc: "Déposer une demande ou suivre mes échanges",
      icon: MessageSquareWarning,
      to: "/medecin/reclamations",
    },
    {
      title: "Communications de l’Ordre",
      desc: "Lire les informations importantes",
      icon: Bell,
      to: "/medecin/notifications",
    },
    {
      title: "Paramètres du compte",
      desc: "Gérer la sécurité et les préférences",
      icon: Settings,
      to: "/medecin/parametres",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Services essentiels
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Accès rapide aux services les plus utiles.
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {services.map(({ title, desc, icon: Icon, to }) => (
          <button
            key={title}
            onClick={() => navigate(to)}
            className="group flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Icon size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {desc}
              </p>
            </div>

            <ChevronRight
              size={16}
              className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-green-600"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

function NotificationsPanel({ notifications, unreadCount, onRead, onOpenAll }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Communications récentes de l’Ordre
          </h2>

          {unreadCount > 0 && (
            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/40 dark:text-green-400">
              {unreadCount}
            </span>
          )}
        </div>

        <button
          onClick={onOpenAll}
          className="text-xs font-semibold text-green-700 hover:underline dark:text-green-400"
        >
          Voir tout
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
          <BellOff size={22} className="mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Aucune communication pour le moment
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Les messages importants de l’Ordre apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.slice(0, 5).map((notification) => (
            <button
              key={notification.id}
              onClick={() => onRead(notification.id)}
              className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  !notification.lu ? "bg-green-500" : "bg-transparent"
                }`}
              />

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm ${
                    !notification.lu
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {notification.titre || "Communication"}
                </p>

                {notification.message && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                    {notification.message}
                  </p>
                )}
              </div>

              {notification.date && (
                <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
                  <Clock size={10} />
                  {notification.date}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ active, statut }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-green-500" : "bg-slate-400"
        }`}
      />
      {active ? "Compte actif" : statut || "Statut inconnu"}
    </span>
  );
}

function InfoMini({ label, value }) {
  return (
    <div className="px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

export default MedecinDashboard;