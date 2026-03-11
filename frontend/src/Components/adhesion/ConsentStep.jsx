import { useState } from "react";
import { useFormData } from "../../context/FormContext";
import { createDemande } from "../../services/api";

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

  const handleSubmit = async () => {

    if (!consent) {
      setError("Veuillez accepter la déclaration.");
      return;
    }

    try {
      await createDemande(formData.personal);
      console.log("Demande cree :");
    } catch (error) {
      setError(error.message);
    }

    console.log("Form data :", formData);

    
  };

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
          className="border px-6 py-3 rounded-lg"
        >
          Retour
        </button>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-8 py-3 rounded-lg"
        >
          Soumettre la demande
        </button>
        
      </div>

    </div>

  );

}

export default ConsentStep;