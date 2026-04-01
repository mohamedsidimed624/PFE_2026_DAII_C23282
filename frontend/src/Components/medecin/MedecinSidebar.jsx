import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  Bell,
  TriangleAlert,
  BarChart3,
  Vote,
  Settings,
  LogOut,
  Stethoscope,
} from "lucide-react";

const NAV_ITEMS = [
  {
    section: "Principal",
    links: [
      {
        to: "/medecin/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      {
        to: "/medecin/profil",
        icon: User,
        label: "Mon profil",
      },
      {
        to: "/medecin/documents",
        icon: FileText,
        label: "Mes documents",
      },
      {
        to: "/medecin/notifications",
        icon: Bell,
        label: "Notifications",
        badge: 3,
      },
    ],
  },
  {
    section: "Services",
    links: [
      {
        to: "/medecin/reclamations",
        icon: TriangleAlert,
        label: "Réclamations",
      },
      {
        to: "/medecin/sondages",
        icon: BarChart3,
        label: "Sondages",
      },
      {
        to: "/medecin/elections",
        icon: Vote,
        label: "Élections",
      },
    ],
  },
  {
    section: "Compte",
    links: [
      {
        to: "/medecin/parametres",
        icon: Settings,
        label: "Paramètres",
      },
    ],
  },
];

function MedecinSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
      isActive
        ? "border-green-100 bg-green-50 text-green-700"
        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800",
    ].join(" ");

  return (
    <div className="sticky top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-green-500 text-white shadow-sm">
            <Stethoscope size={20} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">Espace Médecin</h2>
            <p className="text-xs font-medium text-slate-400">
              Ordre des Médecins
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((section) => (
          <div key={section.section} className="mb-5">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-300">
              {section.section}
            </p>

            <div className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink key={link.to} to={link.to} className={navClass}>
                    {({ isActive }) => (
                      <>
                        <span
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
                            isActive
                              ? "bg-green-100 text-green-600"
                              : "bg-transparent text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600",
                          ].join(" ")}
                        >
                          <Icon size={17} />
                        </span>

                        <span className="truncate">{link.label}</span>

                        {link.badge ? (
                          <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                            {link.badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition group-hover:bg-red-100">
            <LogOut size={17} />
          </span>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default MedecinSidebar;