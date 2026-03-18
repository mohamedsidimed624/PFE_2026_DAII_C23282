import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDemandeById,
  approveDemande,
  rejectDemande
} from "../../services/adminApi";

function AdminDemandeDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rejectComment, setRejectComment] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

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

  useEffect(() => {

    const fetchDemande = async () => {
      try {
        const data = await getDemandeById(id);
        setDemande(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemande();

  }, [id]);

  const handleApprove = async () => {
    await approveDemande(id);
    navigate("/admin/demandes");
  };

  const handleReject = async () => {
    await rejectDemande(id, rejectComment);
    navigate("/admin/demandes");
  };

  if (loading) return <p className="p-6">Chargement...</p>;
  if (!demande) return <p>Demande introuvable</p>;

  return (

    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="bg-white shadow rounded-xl p-6">

        <div className="flex justify-between items-center">

          <h1 className="text-xl font-semibold">
            {demande.nom} {demande.prenom}
          </h1>

          <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(demande.statut)}`}>
            {demande.statut}
          </span>

        </div>

        <p className="text-gray-600 mt-2">{demande.email}</p>
        <p className="text-gray-600">{demande.telephone}</p>

      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* EDUCATION */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="font-semibold mb-3">Éducation</h2>

          {demande.educations?.map((edu) => (
            <div key={edu.id} className="border-b py-2">
              <p className="font-medium">{edu.diplome}</p>
              <p className="text-sm text-gray-500">
                {edu.universite} - {edu.pays}
              </p>
            </div>
          ))}
        </div>

        {/* EXPERIENCE */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="font-semibold mb-3">Expérience</h2>

          {demande.experiences?.map((exp) => (
            <div key={exp.id} className="border-b py-2">
              <p className="font-medium">{exp.poste}</p>
              <p className="text-sm text-gray-500">
                {exp.nomEtablissement}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* DOCUMENTS */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="font-semibold mb-3">Documents</h2>

        {demande.documents?.map((doc) => (

          <div key={doc.id} className="flex justify-between items-center border-b py-2">

            <span className="text-sm">{doc.fileName}</span>

            <div className="flex gap-3">

              <a
                href={`http://localhost:8080/${doc.filePath}`}
                target="_blank"
                className="text-blue-500 text-sm"
              >
                Voir
              </a>

              <a
                href={`http://localhost:8080/${doc.filePath}`}
                download
                className="text-green-600 text-sm"
              >
                Télécharger
              </a>

            </div>

          </div>

        ))}

      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">

        <button
          onClick={handleApprove}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          Approuver
        </button>

        <button
          onClick={() => setShowRejectModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
        >
          Rejeter
        </button>

      </div>

      {/* MODAL */}
      {showRejectModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

            <h2 className="text-lg font-semibold">
              Confirmer le rejet
            </h2>

            <textarea
              placeholder="Commentaire obligatoire..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="border w-full p-2 rounded"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border rounded"
              >
                Annuler
              </button>

              <button
                onClick={async () => {
                  if (!rejectComment.trim()) return;
                  await handleReject();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirmer
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDemandeDetail;