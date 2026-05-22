import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ArrowRight, BarChart3, PieChart } from "lucide-react";
import { getSuiviDossier } from "../services/demandeSuiviApi";
import hero from "../assets/hero.jpg";

function Hero() {
  const [numero, setNumero] = useState("");
  const [error, setError] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    const valeur = numero.trim();

    if (!valeur) {
      setError("Veuillez saisir un numéro de dossier.");
      return;
    }

    try {
      setLoadingSearch(true);
      setError("");
      await getSuiviDossier(valeur);
      navigate(`/suivi-dossier?numero=${encodeURIComponent(valeur)}`);
    } catch {
      setError("Aucun dossier trouvé pour ce numéro.");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white pt-[92px] pb-16">
      {/* Background shapes */}
      <div className="pointer-events-none absolute -left-48 -top-40 h-[560px] w-[560px] rounded-full bg-slate-100/70" />
      <div className="pointer-events-none absolute right-10 top-28 h-[470px] w-[470px] rounded-full bg-slate-100/80" />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT CONTENT */}
        <div className="max-w-[680px]">
          <p className="mb-6 text-[25px] font-semibold leading-tight text-slate-900">
            السلك الوطني للأطباء الموريتانيين
          </p>

          <h1 className="mb-6 text-[42px] font-semibold leading-[1.18] tracking-[-0.03em] text-slate-950 lg:text-[50px]">
            Ordre National des
            <span className="block text-green-600">
              Médecins Mauritaniens
            </span>
          </h1>

          <p className="mb-10 max-w-[680px] text-[18px] leading-[1.9] text-slate-600">
            L’ONMM joue un rôle essentiel dans l’organisation, la régulation et
            le développement de la profession médicale en Mauritanie, à travers
            la gestion des adhésions, la publication des informations officielles
            et le suivi du registre des médecins.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
  <div className="w-full sm:w-[330px]">
    <div className="flex h-[48px] items-center rounded-full border border-green-200 bg-white px-5 shadow-sm">
      <input
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Entrez votre numéro de dossier"
        className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
      />

      <button
        onClick={handleSearch}
        disabled={loadingSearch}
        className="flex h-8 w-8 items-center justify-center rounded-full text-green-600 transition hover:bg-green-50 disabled:opacity-50"
      >
        <Search size={20} />
      </button>
    </div>

    {error && (
      <p className="mt-2 px-2 text-sm text-red-600">{error}</p>
    )}
  </div>

  <Link
    to="/adhesion"
    className="inline-flex h-[48px] w-full items-center justify-center gap-4 rounded-full bg-green-600 px-8 text-[16px] font-semibold text-white shadow-sm transition hover:bg-green-700 sm:w-[250px]"
  >
    <span className="whitespace-nowrap">Soumettre votre dossier</span>
    <ArrowRight size={20} />
  </Link>
</div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="relative hidden h-[560px] lg:block">
          <div className="absolute right-0 top-12 h-[470px] w-[470px] rounded-full bg-slate-100" />
          <div className="absolute right-[65px] top-[125px] h-[340px] w-[340px] rounded-full bg-green-50" />

          <div className="absolute left-[60px] top-[125px] h-[70px] w-[70px] rounded-tl-full rounded-tr-full rounded-br-full bg-green-500" />

          <div className="absolute right-[105px] top-[118px] h-[300px] w-[300px] overflow-hidden rounded-[34px] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.18)]">
            <img
              src={hero}
              alt="Médecin"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute left-[20px] top-[260px] flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <BarChart3 size={25} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Suivi</p>
              <p className="text-xl font-semibold text-slate-900">Dossiers</p>
            </div>
          </div>

          <div className="absolute right-[15px] top-[150px] flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-green-600 text-white shadow-[0_18px_45px_rgba(22,163,74,0.28)]">
            <PieChart size={34} />
          </div>

          <div className="absolute bottom-[85px] right-[45px] rounded-2xl bg-white px-7 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
            <p className="text-[15px] text-slate-500">Registre actif</p>
            <p className="text-[24px] font-bold leading-tight text-green-600">
              500 Docteurs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;