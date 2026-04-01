import {
  Bell,
  Moon,
  Sun,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Check,
} from "lucide-react";


function MedecinTopbar({ title, subtitle }) {
  return (
    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 border-slate-200 bg-white">
      {/* LEFT */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-xs text-slate-400\">{subtitle}</p>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* icons */}
        <button className="p-2 rounded-lg hover:bg-slate-100">
          <Moon size={18} />
        </button>

        <button className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell size={18} />
          <span className="absolute right-1 top-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        {/* user */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="h-9 w-9 rounded-full overflow-hidden bg-green-600 text-white flex items-center justify-center text-sm font-bold">
            {/* image or fallback */}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800">
              Med Ahmed
            </p>
            <p className="text-xs text-slate-400">Medecin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedecinTopbar;