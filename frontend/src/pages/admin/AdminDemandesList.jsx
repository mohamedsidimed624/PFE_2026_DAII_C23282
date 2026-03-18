import { useEffect, useState } from "react";
import { getAllDemandes } from "../../services/adminApi";
import { useNavigate } from "react-router-dom";

function AdminDemandesList() {

  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {

    const fetchDemandes = async () => {
      try {
        const data = await getAllDemandes();
        setDemandes(data);
      } catch (error) {
        console.error("Erreur chargement demandes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemandes();

  }, []);

  if (loading) {
    return <p className="p-6">Chargement...</p>;
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (

    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-semibold mb-6">
        Liste des demandes
      </h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th className="p-4">Nom</th>
              <th className="p-4">Email</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>

            {demandes.map((d) => (

              <tr key={d.id} className="border-t hover:bg-gray-50 transition">

                <td className="p-4 font-medium">
                  {d.nom} {d.prenom}
                </td>

                <td className="p-4 text-gray-600">
                  {d.email}
                </td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(d.statut)}`}>
                    {d.statut}
                  </span>
                </td>

                <td className="p-4">

                  <button
                    onClick={() => navigate(`/admin/demandes/${d.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm"
                  >
                    Voir
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminDemandesList;