import { useState } from "react";
import { useFormData } from "../../context/FormContext";
import { Pencil, Trash2, GraduationCap, Plus } from "lucide-react";

function EducationList({ setIsAdding, setEditingIndex, nextStep, prevStep }) {
  const { formData, updateSection } = useFormData();
  const [error, setError] = useState("");

  const education = formData.education || [];

  const deleteEducation = (index) => {
    const updated = education.filter((_, i) => i !== index);
    updateSection("education", updated);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 rounded-xl border-2 border-dashed border-green-400 px-5 py-3 text-sm font-semibold text-green-600 transition hover:bg-green-50"
      >
        <Plus size={16} />
        Ajouter une formation
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {education.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          Aucune formation ajoutée pour le moment.
        </div>
      )}

      {education.map((item, index) => (
        <div key={index} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="font-semibold text-slate-800">{item.specialiteLibelle || "Formation"}</div>
              <div className="text-sm text-slate-500">{item.diplome} · {item.anneeObtention}</div>
              <div className="text-xs text-slate-400">{item.pays} — {item.ville}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setEditingIndex(index); setIsAdding(true); }}
              className="text-slate-400 transition-colors hover:text-green-600"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => deleteEducation(index)}
              className="text-slate-400 transition-colors hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
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
            if (education.length === 0) {
              setError("Veuillez ajouter au moins une formation.");
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

export default EducationList;
