import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { UserCircleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Handle scroll effect for premium sticky nav
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { label: "Accueil", to: "/" },
        { label: "Annuaire", to: "/annuaire" },
        { label: "Annonces", to: "/annonces" },
        { label: "Galerie", to: "/galerie" },
        { label: "À propos", to: "/a-propos" },
        { label: "Contact", to: "/contact" },
      
    ];

    return (
        <nav 
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white backdrop-blur-xl border-b border-slate-200 shadow-sm py-3"
                    : "bg-white/60 backdrop-blur-md border-b border-transparent py-5"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                {/* LOGO + BRAND */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                        <img src={logo} alt="logo" className="w-10 h-10 relative z-10 drop-shadow-sm transition-transform duration-500 group-hover:scale-105" />
                    </div>

                    <div className="leading-tight">
                        <span className="block font-bold text-slate-900 text-sm tracking-tight transition-colors group-hover:text-green-800">
                            Ordre National
                        </span>
                        <span className="block text-sm text-slate-900 font-bold tracking-tight transition-colors group-hover:text-green-800">
                            des Médecins
                        </span>
                        <span className="block text-[10px] text-slate-400 tracking-wide">
                            République Islamique de Mauritanie
                        </span>
                    </div>
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `relative px-4 py-2 text-sm font-semibold transition-colors rounded-full
                                ${isActive ? "text-green-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className="relative z-10">{link.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute inset-0 bg-green-50 rounded-full border border-green-100/50 -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* CTA */}
                    <Link
                        to="/login"
                        className="ml-6 flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-slate-900/10 hover:bg-green-700 hover:shadow-green-700/20 hover:text-white transition-all duration-300 active:scale-95"
                    >
                        <UserCircleIcon className="w-5 h-5" /> 
                        Espace Médecin
                    </Link>
                </div>

                {/* MOBILE BUTTON */}
                <button
                    className="md:hidden p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? (
                        <XMarkIcon className="w-6 h-6" />
                    ) : (
                        <Bars3Icon className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 pb-8 pt-4 space-y-2">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `block px-5 py-3.5 rounded-2xl text-base font-semibold transition-colors ${
                                            isActive
                                                ? "bg-green-50 text-green-700 border border-green-100/50"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}

                            <Link
                                to="/login"
                                className="mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-4 rounded-2xl font-bold shadow-lg shadow-slate-900/10 hover:bg-green-700 transition-colors active:scale-[0.98]"
                            >
                                <UserCircleIcon className="w-6 h-6" />
                                Espace Médecin
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export default Navbar;