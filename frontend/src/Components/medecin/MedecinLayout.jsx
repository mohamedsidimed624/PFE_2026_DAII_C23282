import MedecinSidebar from "./MedecinSidebar";
import MedecinTopbar from "./MedecinTopbar";

function MedecinLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <MedecinSidebar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <MedecinTopbar title={title} subtitle={subtitle} />
          {children}
        </div>
      </main>
    </div>
  );
}

export default MedecinLayout;