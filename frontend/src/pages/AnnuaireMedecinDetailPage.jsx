import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPublicMedecinById } from "../services/publicAnnuaireApi";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  UserRound,
  GraduationCap,
  Briefcase,
  CreditCard,
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
    label: "Actif",
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


  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-28">
        {/* Back */}
        <button
          onClick={() => navigate("/annuaire")}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#64748B] transition-colors hover:text-[#0F172A]"
        >
          <ArrowLeft size={15} />
          Retour à l'annuaire
        </button>

        {/* Loading skeleton */}
        {loading && (
          <div className="animate-pulse overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="flex items-start gap-5 px-7 py-7">
              <div className="h-20 w-20 shrink-0 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-3 pt-1">
                <div className="h-5 w-44 rounded bg-slate-200" />
                <div className="h-3.5 w-28 rounded bg-slate-100" />
                <div className="h-5 w-32 rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="space-y-2 border-t border-[#E2E8F0] px-7 py-5">
              {[80, 60, 70, 50].map((w, i) => (
                <div key={i} className={`h-3.5 w-${w === 80 ? 'full' : w === 60 ? '3/5' : w === 70 ? '2/3' : '1/2'} rounded bg-slate-100`} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Not found */}
        {!loading && !error && !medecin && (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <UserRound size={26} className="text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-[#0F172A]">Médecin introuvable</h2>
            <p className="mt-1.5 text-sm text-[#64748B]">
              Ce profil n'est pas disponible dans l'annuaire public.
            </p>
          </div>
        )}

        {/* ── SINGLE UNIFIED PROFILE CARD ── */}
        {!loading && !error && medecin && (() => {
          const statusKey = String(medecin.statut || "ACTIF").toUpperCase();
          const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ACTIF;
          const workplace =
            medecin.lieuExercice ||
            medecin.experiences?.[0]?.nomEtablissement ||
            null;

          return (
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

              {/* ── 1. IDENTITY ── */}
              <div className="flex flex-col gap-5 px-7 py-7 sm:flex-row sm:items-start">
                {/* Avatar */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#E2E8F0] bg-slate-100">
                  {medecin.photoProfilPath ? (
                    <img
                      src={`http://localhost:8080${medecin.photoProfilPath}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#16A34A] text-2xl font-bold text-white">
                      {medecin.prenom?.[0]}{medecin.nom?.[0]}
                    </div>
                  )}
                </div>

                {/* Name + role + badges */}
                <div>
                  <h1 className="text-xl font-bold text-[#0F172A]">
                    Dr. {medecin.prenom} {medecin.nom}
                  </h1>
                  <p className="mt-0.5 text-sm text-[#64748B]">Médecin inscrit</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      <ShieldCheck size={11} />
                      Inscrit au registre ONMM
                    </span>
                  </div>
                </div>
              </div>

              {/* ── 2. INFORMATIONS PROFESSIONNELLES ── */}
              <div className="border-t border-[#E2E8F0] px-7 py-6">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                  Informations professionnelles
                </p>
                <div className="space-y-3">
                  <InfoRow label="Spécialité" value={medecin.specialiteLibelle} />
                  <InfoRow label="Sous-spécialité" value={medecin.sousSpecialiteLibelle} />
                  <InfoRow label="N° d'inscription" value={medecin.numeroInscription} icon={<CreditCard size={13} className="text-[#64748B]" />} />
                  {medecin.nationalite && <InfoRow label="Nationalité" value={medecin.nationalite} icon={<Globe size={13} className="text-[#64748B]" />} />}
                </div>
              </div>

              {/* ── 3. LIEU D'EXERCICE ── */}
              <div className="border-t border-[#E2E8F0] px-7 py-6">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                  Lieu d'exercice
                </p>
                <div className="space-y-3">
                  <InfoRow label="Ville / Wilaya" value={medecin.ville} icon={<MapPin size={13} className="text-[#64748B]" />} />
                  {workplace && <InfoRow label="Établissement" value={workplace} icon={<Building2 size={13} className="text-[#64748B]" />} />}
                  {medecin.adresse && <InfoRow label="Adresse" value={medecin.adresse} />}
                </div>
              </div>

              {/* ── 4. FORMATION ── */}
              {medecin.educations?.length > 0 && (
                <div className="border-t border-[#E2E8F0] px-7 py-6">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap size={12} />
                      Formation
                    </span>
                  </p>
                  <div className="space-y-4">
                    {medecin.educations.map((edu, i) => {
                      const eduSpec = edu.sousSpecialiteLibelle
                        ? `${edu.specialiteLibelle} — ${edu.sousSpecialiteLibelle}`
                        : edu.specialiteLibelle;
                      const eduMeta = [edu.universite, edu.ville, edu.pays].filter(Boolean).join(" · ");
                      return (
                        <div key={edu.id || i} className="flex items-start gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A34A]" />
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">
                              {edu.diplome || "Diplôme"}
                              {edu.anneeObtention && (
                                <span className="ml-2 font-normal text-[#64748B]">{edu.anneeObtention}</span>
                              )}
                            </p>
                            {eduSpec && <p className="text-xs text-[#16A34A]">{eduSpec}</p>}
                            {eduMeta && <p className="text-xs text-[#64748B]">{eduMeta}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 5. EXPÉRIENCE ── */}
              {medecin.experiences?.length > 0 && (
                <div className="border-t border-[#E2E8F0] px-7 py-6">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase size={12} />
                      Expérience professionnelle
                    </span>
                  </p>
                  <div className="space-y-4">
                    {medecin.experiences.map((exp, i) => {
                      const expMeta = [exp.ville, exp.pays].filter(Boolean).join(" · ");
                      return (
                        <div key={exp.id || i} className="flex items-start gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A34A]" />
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{exp.poste || "Poste"}</p>
                            <p className="text-xs text-[#64748B]">
                              {exp.nomEtablissement && `${exp.nomEtablissement} · `}
                              {exp.dateDebut ? formatDate(exp.dateDebut) : "—"}{" "}—{" "}
                              {exp.dateFin ? formatDate(exp.dateFin) : "Présent"}
                            </p>
                            {expMeta && <p className="text-xs text-[#64748B]">{expMeta}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 6. ACTION ── */}
              <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-7 py-5">
                <button
                  onClick={() => navigate("/annuaire")}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-slate-50"
                >
                  <ArrowLeft size={14} />
                  Retour à l'annuaire
                </button>
              </div>
            </div>
          );
        })()}
      </main>

      <Footer />
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="flex flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="w-36 shrink-0 text-xs text-[#64748B]">{label}</span>
        <span className="text-sm font-medium text-[#0F172A]">
          {value || <span className="font-normal text-slate-300">—</span>}
        </span>
      </div>
    </div>
  );
}

export default AnnuaireMedecinDetailPage;
