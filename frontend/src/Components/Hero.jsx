// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { Search, ArrowRight, TrendingUp, PieChart, Loader2 } from "lucide-react";
// import { getSuiviDossier } from "../services/demandeSuiviApi";
// import hero from "../assets/hero.jpg";

// const fadeUp = {
//   hidden: { opacity: 0, y: 22 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
//   },
// };

// const scaleIn = {
//   hidden: { opacity: 0, scale: 0.92 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
//   },
// };

// function Hero() {
//   const [numero, setNumero] = useState("");
//   const [error, setError] = useState("");
//   const [loadingSearch, setLoadingSearch] = useState(false);

//   const navigate = useNavigate();

//   const handleSearch = async () => {
//     const valeur = numero.trim();

//     if (!valeur) {
//       setError("Veuillez saisir votre numéro de dossier.");
//       return;
//     }

//     try {
//       setLoadingSearch(true);
//       setError("");

//       await getSuiviDossier(valeur);
//       navigate(`/suivi-dossier?numero=${encodeURIComponent(valeur)}`);
//     } catch (err) {
//       console.error(err);
//       setError("Aucun dossier trouvé pour ce numéro. Vérifiez votre saisie.");
//     } finally {
//       setLoadingSearch(false);
//     }
//   };

//   return (
//     <section className="relative overflow-hidden bg-white pt-28 pb-20 lg:pt-32 lg:pb-24">
//       {/* Background shapes */}
//       <div className="pointer-events-none absolute inset-0">
//         <div className="absolute -left-28 -top-16 h-[430px] w-[430px] rounded-full bg-slate-100/90" />
//         <div className="absolute right-[-140px] top-10 h-[560px] w-[560px] rounded-full bg-slate-100/80" />
//         <div className="absolute right-[10%] top-[18%] h-[340px] w-[340px] rounded-full bg-green-50/80" />
//       </div>

//       <div className="relative z-10 mx-auto max-w-7xl px-6">
//         <div className="grid items-center gap-14 lg:grid-cols-2">
//           {/* LEFT */}
//           <div className="max-w-2xl">
//             <motion.p
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               className="mb-5 text-2xl font-semibold leading-relaxed text-slate-800 md:text-3xl"
//             >
//               السلك الوطني للأطباء الموريتانيين
//             </motion.p>

//             <motion.h1
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               transition={{ delay: 0.08 }}
//               className="mb-6 text-4xl font-bold leading-tight text-slate-900 md:text-5xl xl:text-6xl"
//             >
//               Ordre National des Médecins Mauritaniens
//             </motion.h1>

//             <motion.p
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               transition={{ delay: 0.14 }}
//               className="mb-10 max-w-2xl text-base leading-8 text-slate-600 md:text-lg"
//             >
//               L’Ordre National des Médecins Mauritaniens joue un rôle crucial dans la
//               régulation et le développement de la profession médicale en Mauritanie.
//               Il encadre l’adhésion, supervise le registre officiel et facilite
//               l’accès aux services institutionnels.
//             </motion.p>

//             <motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               transition={{ delay: 0.2 }}
//               className="flex flex-col gap-4 sm:flex-row sm:items-start"
//             >
//               {/* Search field */}
//               <div className="w-full sm:max-w-md">
//                 <div
//                   className={`flex h-14 items-center rounded-full border bg-white px-4 shadow-sm transition-all ${
//                     error
//                       ? "border-red-300"
//                       : "border-green-200 focus-within:border-green-400 focus-within:shadow-md"
//                   }`}
//                 >
//                   <input
//                     type="text"
//                     value={numero}
//                     onChange={(e) => {
//                       setNumero(e.target.value);
//                       if (error) setError("");
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") handleSearch();
//                     }}
//                     placeholder="Entrer votre numéro de dossier"
//                     className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 md:text-base"
//                   />

//                   <button
//                     onClick={handleSearch}
//                     type="button"
//                     disabled={loadingSearch}
//                     aria-label="Rechercher un dossier"
//                     className="flex h-10 w-10 items-center justify-center rounded-full text-green-600 transition hover:bg-green-50 disabled:opacity-60"
//                   >
//                     {loadingSearch ? (
//                       <Loader2 size={18} className="animate-spin" />
//                     ) : (
//                       <Search size={18} />
//                     )}
//                   </button>
//                 </div>

//                 <AnimatePresence>
//                   {error && (
//                     <motion.p
//                       initial={{ opacity: 0, y: -4 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0 }}
//                       className="mt-3 px-2 text-sm text-red-600"
//                     >
//                       {error}
//                     </motion.p>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* CTA */}
//               <Link
//                 to="/adhesion"
//                 className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-green-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 md:text-base"
//               >
//                 Soumettre votre dossier
//                 <ArrowRight size={18} />
//               </Link>
//             </motion.div>
//           </div>

//           {/* RIGHT */}
//           <motion.div
//             variants={scaleIn}
//             initial="hidden"
//             animate="visible"
//             className="relative flex justify-center lg:justify-end"
//           >
//             <div className="relative h-[460px] w-full max-w-[560px]">
//               {/* Main circles */}
//               <div className="absolute right-2 top-2 h-[430px] w-[430px] rounded-full bg-slate-100" />
//               <div className="absolute right-14 top-16 h-[330px] w-[330px] rounded-full bg-green-50" />

//               {/* Accent shape */}
//               <div
//                 className="absolute left-10 top-20 h-16 w-16 bg-green-500 shadow-md"
//                 style={{ borderRadius: "50% 50% 50% 0" }}
//               />

//               {/* Main image */}
//               <div className="absolute right-24 top-24 h-[275px] w-[275px] overflow-hidden rounded-[2rem] bg-white shadow-2xl">
//                 <img
//                   src={hero}
//                   alt="Médecin"
//                   className="h-full w-full object-cover"
//                 />
//               </div>

//               {/* Left floating card */}
//               <motion.div
//                 initial={{ opacity: 0, x: -10, y: 10 }}
//                 animate={{ opacity: 1, x: 0, y: 0 }}
//                 transition={{ delay: 0.35, duration: 0.45 }}
//                 className="absolute left-2 top-52 rounded-2xl bg-white px-5 py-4 shadow-xl"
//               >
//                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
//                   <TrendingUp size={24} />
//                 </div>
//               </motion.div>

//               {/* Top right icon */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.85 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 0.45, duration: 0.45 }}
//                 className="absolute right-5 top-28 rounded-2xl bg-green-500 p-4 text-white shadow-xl"
//               >
//                 <PieChart size={28} />
//               </motion.div>

//               {/* Bottom stat */}
//               <motion.div
//                 initial={{ opacity: 0, y: 10, scale: 0.92 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ delay: 0.55, duration: 0.45 }}
//                 className="absolute bottom-10 right-10 rounded-2xl bg-white px-5 py-3 shadow-xl"
//               >
//                 <p className="text-sm text-slate-500">Registre actif</p>
//                 <p className="text-xl font-bold text-green-600">500 Docteurs</p>
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default Hero;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ArrowRight, BarChart3, PieChart } from "lucide-react";
import { getSuiviDossier } from "../services/demandeSuiviApi";
import hero from "../assets/hero.jpg";
import { heroLogos } from "../constant/data";
import Marquee from "react-fast-marquee";


function Hero() {
  const [numero, setNumero] = useState("");
  const [error, setError] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);

  const navigate = useNavigate();

  const handleSearch = async () => {
    const valeur = numero.trim();

    if (!valeur) {
      setError("Veuillez saisir un numéro de dossier.");
      return;
    }

    try {
      setLoadingSearch(true);
      setError("");

      await getSuiviDossier(valeur);

      navigate(`/suivi-dossier?numero=${encodeURIComponent(valeur)}`);
    } catch (err) {
      console.error(err);
      setError(
        "Aucun dossier trouvé pour ce numéro. Vérifiez votre numéro de dossier."
      );
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-20">
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
            <span className="block text-green-600">Médecins Mauritaniens</span>
          </h1>

          <p className="max-w-2xl text-gray-600 text-base md:text-lg leading-8 mb-10">
            L’ONMM joue un rôle essentiel dans l’organisation, la régulation et
            le développement de la profession médicale en Mauritanie, à travers
            la gestion des adhésions, la publication des informations
            officielles et le suivi du registre des médecins.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start">
            <div className="w-full sm:max-w-md">
              <div className="flex items-center bg-white border border-green-200 rounded-full shadow-sm px-4 h-14">
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Entrez votre numéro de dossier"
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                />

                <button
                  onClick={handleSearch}
                  type="button"
                  disabled={loadingSearch}
                  className="group flex items-center justify-center h-10 w-10 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition disabled:opacity-60 focus-within:border-green-400 focus-within:shadow-md"
                  aria-label="Rechercher un dossier"
                >
                  <Search size={18} />
                </button>
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-600 bg-white-50 border border-none px-2 py-1">
                  {error}
                </p>
              )}
            </div>

            <Link
              to="/adhesion"
              className="inline-flex items-center justify-center gap-2 h-14 w-110 px-7 rounded-full bg-green-600 text-white font-medium shadow-sm hover:bg-green-700 transition"
            >
              Soumettre votre dossier
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative z-10 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[540px] h-[460px]">
            <div className="absolute right-2 top-2 h-[420px] w-[420px] rounded-full bg-gray-100"></div>
            <div className="absolute right-14 top-16 h-[320px] w-[320px] rounded-full bg-green-50"></div>
            <div className="absolute left-10 top-16 h-16 w-16 rounded-tl-full rounded-tr-full rounded-br-full bg-green-500"></div>

            <div className="absolute right-24 top-24 h-[270px] w-[270px] overflow-hidden rounded-[2rem] shadow-2xl bg-white">
              <img
                src={hero}
                alt="Médecin"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute left-2 top-52 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Suivi</p>
                <p className="font-semibold text-gray-800">Dossiers</p>
              </div>
            </div>

            <div className="absolute right-4 top-28 bg-green-500 text-white rounded-2xl shadow-xl p-4">
              <PieChart size={28} />
            </div>

            <div className="absolute right-10 bottom-10 bg-white rounded-2xl shadow-xl px-5 py-3">
              <p className="text-sm text-gray-500">Registre actif</p>
              <p className="text-xl font-bold text-green-600">500 Docteurs</p>
            </div>
          </div>
        </div>
      </div>
      {/* Clients logo */}
      <div className="mt-8 lg:mt-[100px] relative overflow-hidden">
        <Marquee pauseOnHover={true}>
          {heroLogos.map((logo) => (

            <div className="px-20 py-5" key={logo.id}>
              <img src={logo.img} alt="logo" width={logo.width} height={28} />
            </div>
            
          ))}
        </Marquee>

        <div className="absolute top-0 left-0 bg-gradient-to-r from-white-97 via-white-97/80 to-transparent w-24 h-full z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bg-gradient-to-l from-white-97 via-white-97/80 to-transparent w-24 h-full z-10 pointer-events-none" />
      </div>

    </section>
  );
}

export default Hero;