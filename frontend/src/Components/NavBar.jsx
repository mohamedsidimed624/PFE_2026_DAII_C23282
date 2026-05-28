import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
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
    { label: "Annonces", to: "/annonces" },
    { label: "Annuaire", to: "/annuaire" },
    { label: "À propos", to: "/a-propos" },
    { label: "Contactez-nous", to: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex h-[86px] max-w-[1240px] items-center justify-between px-6">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src={logo}
            alt="ONMM"
            className="h-[62px] w-[62px] object-contain"
          />

          <div className="leading-[1.15]">
            <span className="block text-[13px] font-semibold text-slate-900">
              السلك الوطني للأطباء الموريتانيين
            </span>
            <span className="block text-[13px] font-medium text-slate-900">
              Ordre National des Médecins
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-slate-800 transition hover:text-green-600"
            >
              <span>{link.label}</span>
              {link.dropdown && <ChevronDownIcon className="h-3.5 w-3.5" />}
            </NavLink>
          ))}

          <Link
            to="/login"
            className="inline-flex h-[42px] items-center gap-2 rounded-full bg-[#03A84E] px-6 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#029646]"
          >
            <UserCircleIcon className="h-4 w-4" />
            Connexion
          </Link>
        </div>

        <button
          className="rounded-md bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

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
                    `block rounded-lg px-3 py-2.5 text-[14px] font-medium transition ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <Link
                to="/login"
                className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#03A84E] px-4 py-2.5 text-[14px] font-semibold text-white"
              >
                <UserCircleIcon className="h-4 w-4" />
                Connexion
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;