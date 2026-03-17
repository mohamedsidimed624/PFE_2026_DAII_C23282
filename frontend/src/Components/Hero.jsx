import { Link } from "react-router-dom";
import hero from "../assets/hero.jpg";

function Hero() {
  return (
    <section className="bg-gray-50 py-20">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div>

          <h2 className="text-xl text-gray-600 mb-2">
            السلك الوطني للأطباء الموريتانيين
          </h2>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Ordre National des Médecins Mauritanien
          </h1>

          <p className="text-gray-600 mb-8">
            L’Ordre National des Médecins Mauritanien joue un rôle
            crucial dans la régulation et le développement de la
            profession médicale en Mauritanie.
          </p>
          <div className="">
          {/* Search */}
          <div className="flex flex-row gap-3 mb-6">

            <input
              type="text"
              placeholder="Entrer votre numero de dossier"
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button className="bg-green-600 text-white px-5 rounded-lg hover:bg-green-700">
              🔍
            </button>

          </div>

          {/* Button */}
          <Link
            to="/adhesion"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Soumettre votre dossier
          </Link>

        </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center">

          {/* circle background */}
          <div className=""></div>

          <img
            src={hero}
            alt="doctor"
            className="w-full max-w-md rounded-lg shadow-lg"
          />

          

        </div>

      </div>

    </section>
  );
}

export default Hero;