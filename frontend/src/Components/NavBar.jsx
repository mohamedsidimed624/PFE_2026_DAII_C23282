import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
function Navbar() {
  return (
    <>
    <nav className="bg-white shadow">

      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="w-10 h-10"/>
          <span className="font-bold text-lg">
            Ordre des Médecins
          </span>
        </div>

        <div className="flex gap-6">

          <Link to="/">Accueil</Link>
          <Link to="/annuaire">Annuaire</Link>
          <Link to="/annonces">Annonces</Link>
          <Link to="/contact">Contact</Link>
          <Link className="bg-green-600 text-white px-4 py-2 rounded-lg" to="/login">Connexion</Link>

        </div>

      </div>
      

    </nav>
    </>
  );
}

export default Navbar;