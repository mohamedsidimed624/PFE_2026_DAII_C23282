import MedecinSidebar from "./MedecinSidebar";
import MedecinTopbar from "./MedecinTopbar";

function MedecinLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 lg:block">
        <MedecinSidebar />
      </aside>

      {/* Main area */}
      <div className="lg:ml-64">
        {/* Topbar fixed */}
        <div className="fixed left-0 right-0 top-0 z-30 lg:left-64 border-b border-slate-200 bg-slate-50">
          
              <MedecinTopbar title={title} subtitle={subtitle} />
            
        </div>

        {/* Page content */}
        <main className="px-4 pb-8 pt-28 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MedecinLayout;