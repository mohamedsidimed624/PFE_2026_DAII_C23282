import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className={`fixed top-0 z-50 w-full bg-white border-b border-slate-200 transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex h-[74px] max-w-[1320px] items-center justify-between px-6">
        {/* Logo + wordmark */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src={logo}
            alt="ONMM"
            className="h-[50px] w-[50px] object-contain"
          />
          <div className="leading-[1.25]">
            <span className="block text-[13.5px] font-bold text-slate-900">
              Ordre National
            </span>
            <span className="block text-[13.5px] font-bold text-slate-900">
              des Médecins
            </span>
            <span className="block text-[10px] font-normal text-slate-400">
              République Islamique de Mauritanie
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-green-700"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="navbar-line"
                      className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-green-600"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          <Link
            to="/login"
            className="ml-2 inline-flex h-[35px] items-center gap-1.5 rounded-md bg-green-600 px-4 text-[13px] font-semibold text-white transition hover:bg-green-700"
          >
            <UserCircleIcon className="h-4 w-4" />
            Espace Médecin
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md bg-slate-50 p-1.5 text-slate-700 transition hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <Bars3Icon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <div className="space-y-1 px-5 pb-5 pt-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/login"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-2.5 text-[13px] font-semibold text-white"
              >
                <UserCircleIcon className="h-4 w-4" />
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
