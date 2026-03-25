import MedecinSidebar from "../../components/medecin/MedecinSidebar";

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <MedecinSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">{title}</h1>
          <p className="text-slate-500">
            Cette section sera développée dans l’étape suivante.
          </p>
        </div>
      </main>
    </div>
  );
}

export default PlaceholderPage;