import { Link } from "react-router-dom";
import hero from "../assets/hero.jpg";

function Hero() {

  return (

    <section
      className="h-[500px] bg-cover bg-center flex items-center"
      style={{
        backgroundImage:
            `url('${hero}')`,
      }}
    >

      <div className="max-w-6xl mx-auto text-center text-white">

        <h1 className="text-4xl font-bold mb-6">
          Ordre National des Médecins
        </h1>

        <p className="text-lg mb-8">
          Plateforme officielle pour la gestion des médecins
          et des demandes d’adhésion.
        </p>

        <Link
            to="/adhesion"
            className="bg-green-600 text-white px-6 py-3 rounded"
            >
            Soumettre une demande
        </Link>

      </div>

    </section>

  );

}

export default Hero;