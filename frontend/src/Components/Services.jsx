import React from 'react'

function Services() {

  return (

    <section className="py-16 bg-gray-100">

      <div className="max-w-6xl mx-auto">

        <h2 className="text-3xl font-bold text-center mb-10">
          Nos Services
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white p-6 shadow rounded text-center">
            <h3 className="font-semibold text-xl mb-3">
              Annuaire des médecins
            </h3>
            <p>
              Rechercher un médecin inscrit.
            </p>
          </div>

          <div className="bg-white p-6 shadow rounded text-center">
            <h3 className="font-semibold text-xl mb-3">
              Soumettre une demande
            </h3>
            <p>
              Déposer votre dossier d’adhésion.
            </p>
          </div>

          <div className="bg-white p-6 shadow rounded text-center">
            <h3 className="font-semibold text-xl mb-3">
              Annonces
            </h3>
            <p>
              Consulter les actualités médicales.
            </p>
          </div>

        </div>

      </div>

    </section>

  );

}

export default Services;