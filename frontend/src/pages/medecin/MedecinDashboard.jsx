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
  ArrowUpRight,
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
        console.log("Profile data:", res.data);
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

  const specialiteDisplay = useMemo(() => {
    if (p.specialiteLibelle && p.sousSpecialiteLibelle) {
      return `${p.specialiteLibelle} — ${p.sousSpecialiteLibelle}`;
    }
    return p.specialiteLibelle || "Médecin";
  }, [p.specialiteLibelle, p.sousSpecialiteLibelle]);

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
      "specialiteLibelle",
    ];

    const filled = fields.filter(
      (field) => p[field] && String(p[field]).trim() !== ""
    ).length;

    return Math.round((filled / fields.length) * 100);
  }, [p]);

  const statusIsActive = useMemo(() => {
    return ["ACTIF", "ACTIVE", "APPROVED"].includes(
      String(p.statut || "").toUpperCase()
    );
  }, [p.statut]);

  if (loading) {
    return (
      <MedecinLayout title="Dashboard" subtitle="Chargement…">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
          <p className="text-slate-500 dark:text-slate-400">
            Chargement du tableau de bord...
          </p>
        </div>
      </MedecinLayout>
    );
  }

  if (error) {
    return (
      <MedecinLayout title="Dashboard" subtitle="Une erreur est survenue.">
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 transition-colors">
          {error}
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout
      title="Dashboard"
      subtitle="Vue d'ensemble de votre espace médecin."
    >
      <div className="space-y-6">
        {/* GREETING */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-6 backdrop-blur-sm shadow-sm transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Stethoscope
              size={200}
              className="text-green-600 dark:text-green-400 -mt-10 -mr-10"
            />
          </div>

          <div className="relative z-10">
            <h1 className="text-2xl justify-center font-bold text-slate-900 dark:text-white transition-colors">
              Bonjour, Dr. {p.prenom} {p.nom} 👋
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {specialiteDisplay} · N° {p.numeroInscription || "—"}
            </p>

            <span
              className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                statusIsActive
                  ? "border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full animate-pulse ${
                  statusIsActive
                    ? "bg-green-500 dark:bg-green-400"
                    : "bg-slate-400 dark:bg-slate-500"
                }`}
              />
              {statusIsActive ? "Compte actif" : p.statut || "Statut inconnu"}
            </span>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<ShieldCheck size={20} />}
            iconClassName="bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400"
            label="Statut"
            value={p.statut || "—"}
          />

          <StatCard
            icon={<Stethoscope size={20} />}
            iconClassName="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
            label="Spécialité"
            value={specialiteDisplay || "—"}
          />

          <StatCard
            icon={<Activity size={20} />}
            iconClassName="bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
            label="Profil complété"
            value={`${completion}%`}
            progress={completion}
          />
        </section>

        {/* PROFIL & ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PROFIL */}
          <section className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Profil
              </h2>

              <button
                onClick={() => navigate("/medecin/profil")}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:underline transition-colors"
              >
                Voir tout
                <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                icon={<Globe size={16} />}
                label="Nationalité"
                value={p.nationalite}
              />

              <InfoCard
                icon={<ShieldCheck size={16} />}
                label="Sexe"
                value={p.sexe}
              />

              <InfoCard
                icon={<IdCard size={16} />}
                label="N° inscription"
                value={p.numeroInscription}
              />

              <InfoCard
                icon={<Stethoscope size={16} />}
                label="Spécialité"
                value={p.specialiteLibelle}
              />

              <InfoCard
                icon={<Stethoscope size={16} />}
                label="Sous-spécialité"
                value={p.sousSpecialiteLibelle}
              />

              <div className="sm:col-span-2">
                <InfoCard
                  icon={<MapPin size={16} />}
                  label="Adresse"
                  value={p.adresse}
                />
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors flex flex-col">
            <h2 className="text-lg mb-5 font-bold text-slate-800 dark:text-slate-100">
              Actions rapides
            </h2>

            <div className="flex-1 space-y-3">
              <ActionCard
                icon={<User size={18} />}
                iconClassName="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                title="Mon profil"
                desc="Consulter mes informations"
                onClick={() => navigate("/medecin/profil")}
              />

              <ActionCard
                icon={<FileText size={18} />}
                iconClassName="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Mes documents"
                desc="Accéder à mes pièces"
                onClick={() => navigate("/medecin/documents")}
              />

              <ActionCard
                icon={<Bell size={18} />}
                iconClassName="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                title="Notifications"
                desc="Voir les alertes récentes"
                onClick={() => navigate("/medecin/notifications")}
              />

              <ActionCard
                icon={<Settings size={18} />}
                iconClassName="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Paramètres"
                desc="Gérer mon compte"
                onClick={() => navigate("/medecin/parametres")}
              />
            </div>
          </section>
        </div>
      </div>
    </MedecinLayout>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StatCard({ icon, iconClassName, label, value, progress }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconClassName}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </p>

          <p className="mt-1 truncate text-lg font-extrabold text-slate-900 dark:text-white transition-colors">
            {value}
          </p>
        </div>
      </div>

      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-400 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-3 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-200">
      <div className="mb-1.5 flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <span className="text-green-600 dark:text-green-500 opacity-80">
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>

      <p
        className={`text-sm ${
          value
            ? "font-semibold text-slate-800 dark:text-slate-200"
            : "text-slate-400 dark:text-slate-600 italic"
        }`}
      >
        {value || "Non renseigné"}
      </p>
    </div>
  );
}

function ActionCard({ icon, iconClassName, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-transparent px-4 py-3 text-left transition-all hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-900/20 group"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${iconClassName}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
          {title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
          {desc}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-green-600 dark:group-hover:text-green-500"
      />
    </button>
  );
}

export default MedecinDashboard;