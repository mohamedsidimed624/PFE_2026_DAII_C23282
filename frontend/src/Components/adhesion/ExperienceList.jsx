import { useFormData } from "../../context/FormContext";
import { Pencil, Trash2, Briefcase, Plus } from "lucide-react";
import { useState } from "react";
function ExperienceList({ setIsAdding, setEditingIndex, nextStep, prevStep }) {

  const { formData, updateSection } = useFormData();

  const [error, setError] = useState("");

  const experience = formData.experience || [];

  const deleteExperience = (index) => {

    const confirmDelete = window.confirm(
      "Supprimer cette expérience ?"
    );

    if (!confirmDelete) return;

    const updated = experience.filter((_, i) => i !== index);

    updateSection("experience", updated);

  };

  return (

    <div className="space-y-6">

      {/* bouton ajouter */}

      <button
        onClick={() => setIsAdding(true)}
        className="
        flex items-center gap-2
        border-2 border-dashed border-green-400
        text-green-600
        px-5 py-3
        rounded-lg
        hover:bg-green-50
        transition
        "
      >
        <Plus size={18}/>
        Ajouter une expérience
      </button>

       {error && (
            <p className="text-red-500 text-sm mt-2">
                {error}
            </p>
        )}


      {/* message si aucune expérience */}

      {experience.length === 0 && (

        <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">
          Aucune expérience ajoutée.
        </div>

      )}


      {/* liste expériences */}

      {experience.map((item, index) => (

        <div
          key={index}
          className="
          bg-white
          border
          rounded-xl
          p-5
          flex
          justify-between
          items-center
          hover:shadow-lg
          transition
          "
        >

          {/* infos */}

          <div className="flex items-center gap-4">

            <div className="
              bg-green-100
              text-green-600
              p-3
              rounded-lg
            ">
              <Briefcase size={20}/>
            </div>

            <div>

              <div className="font-semibold text-gray-800">
                {item.poste}
              </div>

              <div className="text-sm text-gray-500">
                {item.etablissement} — {item.ville}
              </div>

            </div>

          </div>


          {/* actions */}

          <div className="flex gap-4">

            <button
              onClick={() => {
                setEditingIndex(index);
                setIsAdding(true);
              }}
              className="text-gray-500 hover:text-green-600"
            >
              <Pencil size={18}/>
            </button>

            <button
              onClick={() => deleteExperience(index)}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 size={18}/>
            </button>

          </div>

        </div>

      ))}


      {/* navigation */}

      <div className="flex justify-between pt-6">

        <button
          onClick={prevStep}
          className="
          border
          px-6 py-3
          rounded-lg
          hover:bg-gray-100
          transition
          "
        >
          Retour
        </button>

        <button
          onClick={() => {
            if (!experience || experience.length === 0) {
                setError("Veuillez ajouter au moins une expérience.");
                return;
            }
            setError("");
            nextStep();
          }}
          className="
          bg-green-600
          text-white
          px-8 py-3
          rounded-lg
          hover:bg-green-700
          transition
          "
        >
          Suivant
        </button>

      </div>

    </div>

  );

}

export default ExperienceList;