import { useState } from "react";
import { useFormData } from "../../context/FormContext";
import { createDemande } from "../../services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  GraduationCap,
  Briefcase,
  FileText
} from "lucide-react";

function ConsentStep({ prevStep }) {

  const { formData } = useFormData();

  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {

  if (!consent) {
    setError("Veuillez accepter la déclaration.");
    return;
  }

  try {

    setLoading(true);
    setError("");

    console.log("DATA ENVOYEE :", formData);

    // 1️⃣ créer demande
    const demande = await createDemande(formData.personal);
    console.log("DEMANDE CREEE :", demande);
    const demandeId = demande.id;
    console.log("ID DEMANDE :", demandeId);
    
    // 2️⃣ envoyer  
    for (const edu of formData.education) {
      await axios.post(
        `http://localhost:8080/api/demandes/${demandeId}/educations`,
        {
          specialite: edu.specialite,
          sousSpecialite: edu.sousSpecialite,
          diplome: edu.diplome,
          anneeObtention: edu.annee,
          pays: edu.pays,
          ville: edu.ville,
          universite: edu.universite
        }

      );
    }

    // 3️⃣ envoyer experience
    for (const exp of formData.experience) {

  const experiencePayload = {
    poste: exp.poste,
    nomEtablissement: exp.etablissement,
    ville: exp.ville,
    pays: exp.pays,
    dateDebut: exp.dateDebut,
    dateFin: exp.dateFin || null,
    description: exp.description
  };
  console.log("PAYLOAD EXPERIENCE :", experiencePayload);

  await axios.post(
    `http://localhost:8080/api/demandes/${demandeId}/experiences`,
    experiencePayload
  );
  console.log("PAYLOAD EXPERIENCE :", experiencePayload);

}

    // 4️⃣ function upload document
    const uploadDocument = async (type, categorie, file) => {

      const data = new FormData();

      data.append("typeDocument", type);
      data.append("categorie", categorie);
      data.append("file", file);

      await axios.post(
        `http://localhost:8080/api/demandes/${demandeId}/documents`,
        data
      );
    };

    // 5️⃣ upload diplômes
    for (const doc of formData.documents.diplomes) {
      await uploadDocument("DIPLOME", "diplome", doc.file);
    }

    // 6️⃣ upload certificats
    for (const doc of formData.documents.certificats) {
      await uploadDocument("CERTIFICAT", "certificat", doc.file);
    }

    // 7️⃣ upload autres
    for (const doc of formData.documents.autres) {
      await uploadDocument("AUTRE", "autre", doc.file);
    }

    // succès
    setSuccess(true);

  } catch (error) {

    console.error(error);
    setError(error.message || "Erreur lors de la soumission.");

  } finally {

    setLoading(false);

  }
    

};
  if (success) {
  return (
    <div className="text-center space-y-6 p-10">

      <h2 className="text-2xl font-semibold mb-4">
        Demande soumise avec succès !
      </h2>

      <p className="text-gray-600">
        Votre demande a été soumise avec succès. Nous vous contacterons bientôt.
      </p>

      <p className="text-gray-500 text-sm">
        Vous recevrez un email de confirmation
      </p>

      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Retour à l'accueil
      </button>

    </div>
  );
}
  return (

    <div className="space-y-8">

      {/* ===================== */}
      {/* RESUME GRID */}
      {/* ===================== */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* PERSONAL */}

        <div className="border rounded-xl p-6 bg-gray-50">

          <div className="flex items-center gap-2 mb-4">

            <User size={18}/>
            <h2 className="font-semibold">
              Informations personnelles
            </h2>

          </div>

          <div className="text-sm space-y-2">

            <p><b>Nom :</b> {formData.personal.nom}</p>
            <p><b>Prénom :</b> {formData.personal.prenom}</p>
            <p><b>Email :</b> {formData.personal.email}</p>
            <p><b>Téléphone :</b> {formData.personal.telephone}</p>

          </div>

        </div>


        {/* EDUCATION */}

        <div className="border rounded-xl p-6 bg-gray-50">

          <div className="flex items-center gap-2 mb-4">

            <GraduationCap size={18}/>
            <h2 className="font-semibold">
              Education
            </h2>

          </div>

          {formData.education.map((edu, i) => (

            <div key={i} className="text-sm mb-2">

              <p className="font-medium">
                {edu.specialite}
              </p>

              <p className="text-gray-500">
                {edu.universite} - {edu.pays}
              </p>

            </div>

          ))}

        </div>


        {/* EXPERIENCE */}

        <div className="border rounded-xl p-6 bg-gray-50">

          <div className="flex items-center gap-2 mb-4">

            <Briefcase size={18}/>
            <h2 className="font-semibold">
              Expérience
            </h2>

          </div>

          {formData.experience.map((exp, i) => (

            <div key={i} className="text-sm mb-2">

              <p className="font-medium">
                {exp.poste}
              </p>

              <p className="text-gray-500">
                {exp.etablissement}
              </p>

            </div>

          ))}

        </div>


        {/* DOCUMENTS */}

        <div className="border rounded-xl p-6 bg-gray-50">

          <div className="flex items-center gap-2 mb-4">

            <FileText size={18}/>
            <h2 className="font-semibold">
              Documents
            </h2>

          </div>

          <p className="text-sm">
            Diplômes : {formData.documents.diplomes.length}
          </p>

          <p className="text-sm">
            Certificats : {formData.documents.certificats.length}
          </p>

          <p className="text-sm">
            Autres : {formData.documents.autres.length}
          </p>

        </div>

      </div>


      {/* ===================== */}
      {/* CONSENT */}
      {/* ===================== */}

      <div className="border rounded-xl p-6">

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />

          <span className="text-sm">

            Je certifie que les informations fournies sont exactes
            et accepte les conditions.

          </span>

        </label>

        {error && (

          <p className="text-red-500 text-sm mt-2">
            {error}
          </p>

        )}

      </div>


      {/* ===================== */}
      {/* BUTTONS */}
      {/* ===================== */}

      <div className="flex justify-between">

        <button
          onClick={prevStep}
          className="border
          px-6 py-3
          rounded-lg
          hover:bg-gray-100
          transition"
        >
          Retour
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 text-white px-8 py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Envoi en cours..." : "Soumettre la demande"}
        </button>
        
      </div>

    </div>

  );

}

export default ConsentStep;