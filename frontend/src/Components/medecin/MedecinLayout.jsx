import MedecinSidebar from "./MedecinSidebar";
import MedecinTopbar from "./MedecinTopbar";

function MedecinLayout({ title, subtitle, children, profile }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Sidebar — fixed height, no scroll */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <MedecinSidebar />
      </aside>

      {/* Right column — topbar + content */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Topbar — stays at top naturally */}
        <div className="shrink-0 border-b border-slate-200 bg-white">
          <MedecinTopbar title={title} subtitle={subtitle} profile={profile} />
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

      </div>
    </div>
  );
}

export default MedecinLayout;