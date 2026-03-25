import { Link } from "react-router-dom";
import { Search, ArrowRight, BarChart3, PieChart } from "lucide-react";
import hero from "../assets/hero.jpg";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-20">
      {/* soft background shapes */}
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gray-100/80 blur-3xl"></div>
      <div className="absolute top-20 right-0 h-[28rem] w-[28rem] rounded-full bg-gray-100/70 blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
        {/* LEFT */}
        <div className="relative z-10">
          <p className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 leading-relaxed">
            السلك الوطني للأطباء الموريتانيين
          </p>

          <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Ordre National des
            <span className="block text-green-600">Médecins Mauritanien</span>
          </h1>

          <p className="max-w-2xl text-gray-600 text-base md:text-lg leading-8 mb-10">
            L’ONMM joue un rôle essentiel dans l’organisation, la régulation et
            le développement de la profession médicale en Mauritanie, à travers
            la gestion des adhésions, la publication des informations
            officielles et le suivi du registre des médecins.
          </p>

          {/* action row */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* search dossier */}
            <div className="flex items-center bg-white border border-green-200 rounded-full shadow-sm px-4 h-14 w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Entrez votre numéro de dossier"
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
              />
              <button
                type="button"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition"
                aria-label="Rechercher un dossier"
              >
                <Search size={18} />
              </button>
            </div>

            {/* primary CTA */}
            <Link
              to="/adhesion"
              className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-full bg-green-600 text-white font-medium shadow-sm hover:bg-green-700 transition"
            >
              Soumettre votre dossier
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative z-10 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[540px] h-[460px]">
            {/* outer decorative circle */}
            <div className="absolute right-2 top-2 h-[420px] w-[420px] rounded-full bg-gray-100"></div>

            {/* inner decorative circle */}
            <div className="absolute right-14 top-16 h-[320px] w-[320px] rounded-full bg-green-50"></div>

            {/* green accent */}
            <div className="absolute left-10 top-16 h-16 w-16 rounded-tl-full rounded-tr-full rounded-br-full bg-green-500"></div>

            {/* main image */}
            <div className="absolute right-24 top-24 h-[270px] w-[270px] overflow-hidden rounded-[2rem] shadow-2xl bg-white">
              <img
                src={hero}
                alt="Médecin"
                className="h-full w-full object-cover"
              />
            </div>

            {/* floating stat 1 */}
            <div className="absolute left-2 top-52 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Suivi</p>
                <p className="font-semibold text-gray-800">Dossiers</p>
              </div>
            </div>

            {/* floating stat 2 */}
            <div className="absolute right-4 top-28 bg-green-500 text-white rounded-2xl shadow-xl p-4">
              <PieChart size={28} />
            </div>

            {/* floating stat 3 */}
            <div className="absolute right-10 bottom-10 bg-white rounded-2xl shadow-xl px-5 py-3">
              <p className="text-sm text-gray-500">Registre actif</p>
              <p className="text-xl font-bold text-green-600">500 Docteurs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;