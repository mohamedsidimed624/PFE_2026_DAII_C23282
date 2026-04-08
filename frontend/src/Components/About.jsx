import { Link } from "react-router-dom";
import { ShieldCheck, Users, BadgeCheck, ArrowRight } from "lucide-react";
import aboutImg from "../assets/hero.jpg";
import { useEffect, useState } from "react";

function About() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "Régulation et déontologie",
      desc: "Veiller au respect des normes professionnelles et éthiques de la médecine.",
    },
    {
      icon: Users,
      title: "Services aux médecins",
      desc: "Faciliter l’adhésion, le suivi des dossiers et l’accès aux informations officielles.",
    },
    {
      icon: BadgeCheck,
      title: "Transparence et confiance",
      desc: "Offrir au public une meilleure visibilité sur les médecins inscrits et les publications institutionnelles.",
    },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT - Contenu principal */}
          <div>
            <span className="inline-flex items-center rounded-3xl bg-green-50 text-green-700 px-5 py-2 text-sm font-semibold mb-6">
              À propos de l’Ordre
            </span>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Une institution au service de la profession médicale
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed max-w-lg mb-10">
              L’Ordre National des Médecins Mauritanien encadre l’exercice de la profession, contribue au respect des règles déontologiques et met à disposition des services numériques pour faciliter les démarches des médecins et l’accès à l’information pour le public.
            </p>

            {/* Cartes highlights – style Dribbble / 2025 */}
            <div className="space-y-6">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                const [visible, setVisible] = useState(false);

                useEffect(() => {
                  const timer = setTimeout(() => setVisible(true), 80 + index * 90);
                  return () => clearTimeout(timer);
                }, [index]);

                return (
                  <div
                    key={index}
                    className={`flex gap-6 bg-white border border-gray-100 rounded-3xl p-6 transition-all duration-500 hover:border-green-200 hover:shadow-2xl hover:-translate-y-1
                      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    style={{ transitionDelay: `${index * 90}ms` }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                      <Icon size={26} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              to="/about"
              className="mt-10 inline-flex items-center gap-3 rounded-3xl bg-green-600 hover:bg-green-700 px-8 py-4 text-white font-medium text-base transition-all active:scale-95 shadow-sm"
            >
              Découvrir notre histoire
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* RIGHT - Image + carte flottante */}
          <div className="relative">
            {/* Blur décor */}
            <div className="absolute -top-10 -left-10 w-44 h-44 bg-green-100/60 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-10 w-56 h-56 bg-emerald-100/60 rounded-full blur-3xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white">
              <img
                src={aboutImg}
                alt="À propos de l’Ordre National des Médecins"
                className="w-full h-[520px] object-cover"
              />
            </div>

            {/* Carte flottante améliorée */}
            <div className="absolute -bottom-6 left-6 lg:-bottom-8 lg:left-8 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-7 max-w-[300px] border border-white/80">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <p className="uppercase text-xs font-semibold tracking-widest text-green-600">Notre mission</p>
              </div>
              <p className="text-gray-900 font-semibold leading-relaxed text-[17px]">
                Encadrer la profession médicale et renforcer l’accès aux services institutionnels pour tous.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;