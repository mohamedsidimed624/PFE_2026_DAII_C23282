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

<div className="space-y-6">

<button
onClick={() => setIsAdding(true)}
className="flex items-center gap-2
        border-2 border-dashed border-green-400
        text-green-600
        px-5 py-3
        rounded-lg
        hover:bg-green-50
        transition"
>

<Plus size={18}/>
Ajouter une education

</button>

{error && (
            <p className="text-red-500 text-sm mt-2">
                {error}
            </p>
        )}

      {/* si aucune formation */}

      {education.length === 0 && (

        <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">
          Aucune education ajoutée pour le moment.
        </div>

      )}

{education.map((item, index) => (

<div
key={index}
className="bg-white border rounded-xl p-5 flex justify-between items-center"
>

<div className="flex items-center gap-4">

<div className="bg-green-100 text-green-600 p-3 rounded-lg">
<GraduationCap size={20}/>
</div>

<div>

<div className="font-semibold text-gray-800">
{item.specialiteNom || "Formation"}
</div>

<div className="text-sm text-gray-500">
{item.pays} — {item.universite} ({item.annee})
</div>

</div>

</div>


<div className="flex gap-4">

<button
onClick={()=>{
setEditingIndex(index);
setIsAdding(true);
}}
className="text-gray-500 hover:text-green-600"
>

<Pencil size={18}/>

</button>


<button
onClick={()=>deleteEducation(index)}
className="text-gray-400 hover:text-red-600"
>

<Trash2 size={18}/>

</button>

</div>

</div>

))}


<div className="flex justify-between pt-6">

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
onClick={()=>{

if(education.length === 0){
setError("Veuillez ajouter au moins une education.");
return;
}

setError("");
nextStep();

}}
className="bg-green-600 text-white px-8 py-3 rounded-lg"
>

Suivant

</button>

</div>

</div>

);

}

export default EducationList;