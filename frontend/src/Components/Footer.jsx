import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import logo from "../assets/logo.png";

function Footer() {
    return (
        <footer className="bg-slate-900 pt-20 pb-10 text-slate-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-full">
                                <img src={logo} alt="logo" className="w-10 h-10" />
                            </div>
                            <div className="leading-tight text-white">
                                <span className="block font-bold text-sm">Ordre National</span>
                                <span className="block text-sm font-bold">des Médecins</span>
                            </div>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Institution officielle en charge de la régulation, de l'organisation et du développement de la profession médicale en Mauritanie.
                        </p>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Navigation</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link to="/" className="hover:text-green-400 transition-colors">Accueil</Link></li>
                            <li><Link to="/about" className="hover:text-green-400 transition-colors">À propos</Link></li>
                            <li><Link to="/annuaire" className="hover:text-green-400 transition-colors">Annuaire des médecins</Link></li>
                            <li><Link to="/annonces" className="hover:text-green-400 transition-colors">Actualités & Annonces</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Services en ligne</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link to="/adhesion" className="hover:text-green-400 transition-colors">Demande d'adhésion</Link></li>
                            <li><Link to="/suivi" className="hover:text-green-400 transition-colors">Suivi de dossier</Link></li>
                            <li><Link to="/reclamations" className="hover:text-green-400 transition-colors">Déposer une réclamation</Link></li>
                            <li><Link to="/login" className="hover:text-green-400 transition-colors">Espace Médecin</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Socials */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact</h4>
                        <ul className="space-y-4 text-sm mb-8 text-slate-400">
                            <li>Tevragh Zeina, Nouakchott</li>
                            <li>+222 45 25 00 00</li>
                            <li>contact@ordre-medecins.mr</li>
                        </ul>
                        
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>

                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
                    <p>&copy; {new Date().getFullYear()} Ordre National des Médecins Mauritaniens. Tous droits réservés.</p>
                    <div className="flex gap-6">
                        <Link to="#" className="hover:text-white transition-colors">Mentions légales</Link>
                        <Link to="#" className="hover:text-white transition-colors">Politique de confidentialité</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
