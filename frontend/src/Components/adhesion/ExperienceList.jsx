import { useState } from "react";
import { useFormData } from "../../context/FormContext";
import { Pencil, Trash2, Briefcase, Plus } from "lucide-react";

function ExperienceList({ setIsAdding, setEditingIndex, nextStep, prevStep }) {
  const { formData, updateSection } = useFormData();
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const experience = formData.experience || [];

  const deleteExperience = (index) => {
    const updated = experience.filter((_, i) => i !== index);
    updateSection("experience", updated);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 rounded-xl border-2 border-dashed border-green-400 px-5 py-3 text-sm font-semibold text-green-600 transition hover:bg-green-50"
      >
        <Plus size={16} />
        Ajouter une expérience
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {experience.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          Aucune expérience ajoutée pour le moment.
        </div>
      )}

      {experience.map((item, index) => (
        <div key={index} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Briefcase size={18} />
            </div>
            <div>
              <div className="font-semibold text-slate-800">{item.poste}</div>
              <div className="text-sm text-slate-500">{item.etablissement}</div>
              <div className="text-xs text-slate-400">{item.ville}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {confirmDelete === index ? (
              <>
                <span className="text-xs text-slate-500">Supprimer ?</span>
                <button onClick={() => deleteExperience(index)} className="text-xs font-semibold text-red-500 transition-colors hover:text-red-700">Oui</button>
                <button onClick={() => setConfirmDelete(null)} className="text-xs text-slate-400 transition-colors hover:text-slate-600">Non</button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setEditingIndex(index); setIsAdding(true); }}
                  className="text-slate-400 transition-colors hover:text-green-600"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmDelete(index)}
                  className="text-slate-400 transition-colors hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
          className="rounded-xl bg-green-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

export default ExperienceList;
