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
      "nom", "prenom", "email", "telephone", "nni",
      "sexe", "nationalite", "adresse", "numeroInscription",
      "statut", "specialite",
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

  if (loading) {
    return (
      <MedecinLayout title="Dashboard" subtitle="Chargement…">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-500">Chargement du tableau de bord...</p>
        </div>
      </MedecinLayout>
    );
  }

  if (error) {
    return (
      <MedecinLayout title="Dashboard" subtitle="Une erreur est survenue.">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
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
      <div className="space-y-5">

        {/* GREETING */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h1 className="text-xl font-semibold text-slate-800">
            Bonjour, Dr. {p.prenom} {p.nom} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {p.specialite || "Médecin"} · N° {p.numeroInscription || "—"}
          </p>
          <span
            className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
              statusIsActive
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                statusIsActive ? "bg-green-500" : "bg-slate-400"
              }`}
            />
            {statusIsActive ? "Compte actif" : p.statut || "Statut inconnu"}
          </span>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={<ShieldCheck size={16} />}
            iconClassName="bg-green-50 text-green-600"
            label="Statut"
            value={p.statut || "—"}
          />
          <StatCard
            icon={<Stethoscope size={16} />}
            iconClassName="bg-blue-50 text-blue-600"
            label="Spécialité"
            value={p.specialite || "—"}
          />
          <StatCard
            icon={<Activity size={16} />}
            iconClassName="bg-purple-50 text-purple-600"
            label="Profil complété"
            value={`${completion}%`}
            progress={completion}
          />
        </section>

        {/* PROFIL */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Profil</h2>
            <button
              onClick={() => navigate("/medecin/profil")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:underline"
            >
              Voir tout
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<User size={14} />}
              label="Nom complet"
              value={`${p.prenom || ""} ${p.nom || ""}`.trim()}
            />
            <InfoCard icon={<Mail size={14} />} label="Email" value={p.email} />
            <InfoCard icon={<Phone size={14} />} label="Téléphone" value={p.telephone} />
            <InfoCard icon={<IdCard size={14} />} label="NNI" value={p.nni} />
            <InfoCard icon={<Globe size={14} />} label="Nationalité" value={p.nationalite} />
            <InfoCard icon={<ShieldCheck size={14} />} label="Sexe" value={p.sexe} />
            <InfoCard
              icon={<IdCard size={14} />}
              label="N° inscription"
              value={p.numeroInscription}
            />
            <InfoCard icon={<Stethoscope size={14} />} label="Spécialité" value={p.specialite} />
            <div className="sm:col-span-2">
              <InfoCard icon={<MapPin size={14} />} label="Adresse" value={p.adresse} />
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-slate-800">Actions rapides</h2>
          <div className="space-y-2">
            <ActionCard
              icon={<User size={15} />}
              iconClassName="bg-green-50 text-green-600"
              title="Mon profil"
              desc="Consulter mes informations"
              onClick={() => navigate("/medecin/profil")}
            />
            <ActionCard
              icon={<FileText size={15} />}
              iconClassName="bg-blue-50 text-blue-600"
              title="Mes documents"
              desc="Accéder à mes pièces"
              onClick={() => navigate("/medecin/documents")}
            />
            <ActionCard
              icon={<Bell size={15} />}
              iconClassName="bg-orange-50 text-orange-600"
              title="Notifications"
              desc="Voir les alertes récentes"
              onClick={() => navigate("/medecin/notifications")}
            />
            <ActionCard
              icon={<Settings size={15} />}
              iconClassName="bg-purple-50 text-purple-600"
              title="Paramètres"
              desc="Gérer mon compte"
              onClick={() => navigate("/medecin/parametres")}
            />
          </div>
        </section>

      </div>
    </MedecinLayout>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StatCard({ icon, iconClassName, label, value, progress }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="truncate text-base font-semibold text-slate-900">{value}</p>
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5 text-slate-400">
        <span className="text-green-600">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={`text-sm ${
          value ? "font-medium text-slate-800" : "text-slate-300"
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
      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-green-200 hover:bg-white"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <ChevronRight size={15} className="text-slate-300" />
    </button>
  );
}

export default MedecinDashboard;