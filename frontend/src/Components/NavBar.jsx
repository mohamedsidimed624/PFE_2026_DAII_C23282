// // import { Link } from "react-router-dom";
// // import { UserCircleIcon } from "@heroicons/react/24/outline";
// // import logo from "../assets/logo.png";

// // function Navbar() {
// //   return (
// //     <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur shadow">

// //       <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

// //         {/* Logo */}
// //         <div className="flex items-center gap-3">
// //           <img src={logo} alt="logo" className="w-10 h-10"/>
// //           <span className="font-bold text-lg text-gray-800">
// //             Ordre des Médecins
// //           </span>
// //         </div>

// //         {/* Menu */}
// //         <div className="flex items-center gap-6">

// //           <Link className="text-gray-700 hover:text-green-600 transition" to="/">
// //             Accueil
// //           </Link>

// //           <Link className="text-gray-700 hover:text-green-600 transition" to="/annuaire">
// //             Annuaire
// //           </Link>

// //           <Link className="text-gray-700 hover:text-green-600 transition" to="/annonces">
// //             Annonces
// //           </Link>

// //           <Link className="text-gray-700 hover:text-green-600 transition" to="/contact">
// //             Contact
// //           </Link>

// //           {/* Connexion Button */}
// //           <Link
// //             className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
// //             to="/login"
// //           >
// //             <UserCircleIcon className="w-5 h-5" />
// //             Connexion
// //           </Link>

// //         </div>

// //       </div>

// //     </nav>
// //   );
// // }

// // export default Navbar;


// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { UserCircleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
// import logo from "../assets/logo.png";

// function Navbar() {
//   const [menuOpen, setMenuOpen] = useState(false);

//   const navLinks = [
//     { label: "Accueil", to: "/" },
//     { label: "Annuaire", to: "/annuaire" },
//     { label: "Annonces", to: "/annonces" },
//     { label: "Contact", to: "/contact" },
//   ];

//   return (
//     <nav
//       className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200"
//       aria-label="Navigation principale"
//     >
//       <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
//         {/* Logo */}
//         <Link to="/" className="flex items-center gap-3" aria-label="Accueil">
//           <img src={logo} alt="" className="w-10 h-10" aria-hidden="true" />
//           <div className="leading-tight">
//             <span className="block font-bold text-base text-slate-900">
//               Ordre des Médecins
//             </span>
//             <span className="block text-[11px] text-slate-500">
//               République Islamique de Mauritanie
//             </span>
//           </div>
//         </Link>

//         {/* Desktop menu */}
//         <div className="hidden md:flex items-center gap-1">
//           {navLinks.map((link) => (
//             <Link
//               key={link.to}
//               to={link.to}
//               className="px-3 py-2 text-sm text-slate-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition"
//             >
//               {link.label}
//             </Link>
//           ))}

//           <Link
//             to="/login"
//             className="ml-3 flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition"
//           >
//             <UserCircleIcon className="w-4 h-4" />
//             Connexion
//           </Link>
//         </div>

//         {/* Mobile toggle */}
//         <button
//           className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
//           onClick={() => setMenuOpen(!menuOpen)}
//           aria-expanded={menuOpen}
//           aria-label="Ouvrir le menu"
//         >
//           {menuOpen ? (
//             <XMarkIcon className="w-6 h-6" />
//           ) : (
//             <Bars3Icon className="w-6 h-6" />
//           )}
//         </button>
//       </div>

//       {/* Mobile menu */}
//       {menuOpen && (
//         <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-4">
//           {navLinks.map((link) => (
//             <Link
//               key={link.to}
//               to={link.to}
//               className="block py-3 text-sm text-slate-700 hover:text-green-700 border-b border-slate-100"
//               onClick={() => setMenuOpen(false)}
//             >
//               {link.label}
//             </Link>
//           ))}
//           <Link
//             to="/login"
//             className="mt-3 flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
//             onClick={() => setMenuOpen(false)}
//           >
//             <UserCircleIcon className="w-4 h-4" />
//             Connexion
//           </Link>
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Navbar;
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { UserCircleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Accueil", to: "/" },
    { label: "Annuaire", to: "/annuaire" },
    { label: "Annonces", to: "/annonces" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO + BRAND */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="logo" className="w-10 h-10" />

          <div className="leading-tight">
            <span className="block font-bold text-slate-900 text-sm">
              Ordre National
            </span>
            <span className="block text-sm text-slate-900 font-semibold">
              des Médecins
            </span>
            <span className="block text-[11px] text-slate-500">
              Mauritanie
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
              `group relative px-3 py-2 text-sm font-medium transition
              ${
                isActive ? "text-green-700" : "text-slate-700 hover:text-green-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {link.label}

                <span
                  className={`
                    absolute left-0 -bottom-1 h-[2px] w-full bg-green-600
                    transform origin-left transition-transform duration-300 bg-gradient-to-r from-green-600 to-emerald-400
                    ${isActive ? "scale-x-100" : "scale-x-0 bg-gradient-to-r from-green-600 to-emerald-400"}
                  `}
                ></span>
              </>
            )}
          </NavLink>
          ))}

          {/* CTA */}
          <Link
            to="/login"
            className="ml-4 flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-green-700 transition"
          >
            <UserCircleIcon className="w-5 h-5" />
            Espace Médecin
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <XMarkIcon className="w-6 h-6 text-slate-700" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-slate-700" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-6 pb-6 pt-4 space-y-3">

          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-4 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-semibold"
          >
            <UserCircleIcon className="w-5 h-5" />
            Espace Médecin
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;