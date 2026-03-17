import { Link } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur shadow">

      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="w-10 h-10"/>
          <span className="font-bold text-lg text-gray-800">
            Ordre des Médecins
          </span>
        </div>

        {/* Menu */}
        <div className="flex items-center gap-6">

          <Link className="text-gray-700 hover:text-green-600 transition" to="/">
            Accueil
          </Link>

          <Link className="text-gray-700 hover:text-green-600 transition" to="/annuaire">
            Annuaire
          </Link>

          <Link className="text-gray-700 hover:text-green-600 transition" to="/annonces">
            Annonces
          </Link>

          <Link className="text-gray-700 hover:text-green-600 transition" to="/contact">
            Contact
          </Link>

          {/* Connexion Button */}
          <Link
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            to="/login"
          >
            <UserCircleIcon className="w-5 h-5" />
            Connexion
          </Link>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;