function MedecinDashboard() {
  const email = localStorage.getItem("email");

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow border p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Tableau de bord Médecin
        </h1>

        <p className="text-slate-600">
          Bienvenue {email}
        </p>

        <p className="text-slate-500 mt-4">
          Cette page est temporaire. Nous ajouterons ensuite le profil,
          les documents et les autres modules médecin.
        </p>
      </div>
    </div>
  );
}

export default MedecinDashboard;