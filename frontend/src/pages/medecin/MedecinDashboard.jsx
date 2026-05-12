import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import { getMyProfile, downloadCertificat } from "../../services/medecinApi";
import { getMedecinNotifications, markMedecinNotifAsRead } from "../../services/medecinNotificationApi";
import {
  Download,
  Bell,
  BellOff,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ statut }) {
  const s = String(statut || "").toUpperCase();
  if (["ACTIF", "ACTIVE", "APPROVED", "VALIDE"].includes(s))
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Actif
      </span>
    );
  if (["EN_ATTENTE", "PENDING", "SOUMIS", "SUBMITTED"].includes(s))
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        En attente
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {statut || "—"}
    </span>
  );
}

// ── Notification item ─────────────────────────────────────────────────────────

function NotificationItem({ n, onRead }) {
  return (
    <button
      onClick={() => onRead(n.id)}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition hover:shadow-sm ${
        !n.lu ? "border-teal-200 bg-teal-50/50" : "border-[#E2E8F0] bg-white hover:bg-slate-50"
      }`}
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.lu ? "bg-teal-500" : "bg-transparent"}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${!n.lu ? "font-semibold text-slate-900" : "text-slate-600"}`}>{n.titre}</p>
        {n.message && <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{n.message}</p>}
      </div>
      {n.date && (
        <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
          <Clock size={10} />{n.date}
        </span>
      )}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MedecinDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [certLoading, setCertLoading] = useState(false);
  const [certError,   setCertError]   = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile()
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    getMedecinNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => {});
  }, []);

  const p = profile || {};

  const specialite = useMemo(() => {
    const educations = Array.isArray(p.educations) ? p.educations : [];
    const labels = educations
      .map((e) => e.specialiteLibelle)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
    return labels.join(", ") || "Médecin";
  }, [p.educations]);

  const isActive = ["ACTIF", "ACTIVE", "APPROVED", "VALIDE"].includes(
    String(p.statut || "").toUpperCase()
  );

  const unread = notifications.filter((n) => !n.lu).length;

  const markRead = (id) => {
    markMedecinNotifAsRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  };

  const handleDownloadCertificat = async () => {
    setCertLoading(true);
    setCertError("");
    try {
      const res = await downloadCertificat();
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificat-onmm.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setCertError("Impossible de générer le certificat. Veuillez réessayer.");
    } finally {
      setCertLoading(false);
    }
  };

  if (loading) {
    return (
      <MedecinLayout title="Tableau de bord">
        <div className="flex h-60 items-center justify-center">
          <Loader2 size={22} className="animate-spin text-teal-600" />
        </div>
      </MedecinLayout>
    );
  }

  return (
    <MedecinLayout title="Tableau de bord">
      <div className="mx-auto max-w-3xl space-y-8 py-2">

        {/* ── Welcome ── */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900">
              Bienvenue Dr. {p.prenom} {p.nom} !
            </h1>
            <StatusBadge statut={p.statut} />
          </div>

          <p className="mt-1.5 text-sm text-slate-500">
            {specialite}
            {p.numeroInscription && (
              <> · <span className="font-mono font-semibold text-slate-600">{p.numeroInscription}</span></>
            )}
          </p>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xl">
            Vous pouvez consulter votre dossier, gérer votre profil, déposer une réclamation
            et télécharger vos documents officiels depuis cet espace.
          </p>
        </div>

        {/* ── Certificate ── */}
        {isActive ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">Certificat d'adhésion ONMM</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Votre certificat officiel est disponible et prêt à être téléchargé.
                </p>
              </div>
              <button
                onClick={handleDownloadCertificat}
                disabled={certLoading}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:bg-slate-300"
              >
                {certLoading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                {certLoading ? "Génération…" : "Télécharger le certificat"}
              </button>
            </div>
            {certError && (
              <p className="mt-2 text-xs text-red-600">{certError}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div>
              <p className="font-semibold text-amber-900">Dossier en cours d'examen</p>
              <p className="mt-0.5 text-sm text-amber-700">
                Votre demande d'adhésion est en attente de validation par l'administration.
              </p>
            </div>
            <button
              onClick={() => navigate("/suivi-dossier")}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Suivre mon dossier <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* ── Recent notifications ── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700">Dernières notifications</h2>
              {unread > 0 && (
                <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">
                  {unread}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate("/medecin/notifications")}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Voir toutes →
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-white py-10 text-center">
              <BellOff size={20} className="mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">Aucune notification pour le moment</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Les mises à jour importantes apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <NotificationItem key={n.id} n={n} onRead={markRead} />
              ))}
            </div>
          )}
        </div>

      </div>
    </MedecinLayout>
  );
}
