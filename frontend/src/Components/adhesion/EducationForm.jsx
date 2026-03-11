import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema } from "../../validation/validationSchemas";
import { useFormData } from "../../context/FormContext";

import {
  GraduationCap,
  Calendar,
  MapPin,
  Building
} from "lucide-react";

function EducationForm({ setIsAdding, editingIndex, setEditingIndex }) {

  const { formData, updateSection } = useFormData();

  const defaultValues =
    editingIndex !== null
      ? formData.education[editingIndex]
      : {};

 const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
    } = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues
    });

    const onSubmit = (data) => {

        console.log("Form data:", data);

    let updated = [...(formData.education || [])];

    if (editingIndex !== null) {

        updated[editingIndex] = data;

    } else {

        updated.push(data);

    }

    updateSection("education", updated);

    reset();

    setEditingIndex(null);

    setIsAdding(false);

    };

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >

      {/* Spécialité */}

      <div>
        <label className="text-sm font-medium">Spécialité</label>

        <div className="relative">

          <GraduationCap
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <input
            {...register("specialite")}
            placeholder="Médecine générale"
            className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-green-500"
          />

        </div>

        <p className="text-red-500 text-sm">
          {errors.specialite?.message}
        </p>

      </div>


      {/* Sous spécialité */}

      <div>
        <label className="text-sm font-medium">Sous-spécialité</label>

        <input
          {...register("sousSpecialite")}
          placeholder="Cardiologie"
          className="w-full border rounded-lg p-3"
        />

        <p className="text-red-500 text-sm">
          {errors.sousSpecialite?.message}
        </p>

      </div>


      {/* Diplôme */}

      <div>
        <label className="text-sm font-medium">Diplôme</label>

        <input
          {...register("diplome")}
          placeholder="Doctorat médecine"
          className="w-full border rounded-lg p-3"
        />

        <p className="text-red-500 text-sm">
          {errors.diplome?.message}
        </p>

      </div>


      {/* Année */}

      <div>
        <label className="text-sm font-medium">Année</label>

        <div className="relative">

          <Calendar
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <input
            {...register("annee")}
            placeholder="2022"
            className="w-full border rounded-lg p-3 pl-10"
          />

          <p className="text-red-500 text-sm">
          {errors.annee?.message}
        </p>

        </div>

      </div>


      {/* Pays */}

      <div>
        <label className="text-sm font-medium">Pays</label>

        <div className="relative">

          <MapPin
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <input
            {...register("pays")}
            placeholder="Mauritanie"
            className="w-full border rounded-lg p-3 pl-10"
          />

          <p className="text-red-500 text-sm">
            {errors.pays?.message}
          </p>

        </div>

      </div>


      {/* Ville */}

      <div>
        <label className="text-sm font-medium">Ville</label>

        <input
          {...register("ville")}
          placeholder="Nouakchott"
          className="w-full border rounded-lg p-3"
        />

        <p className="text-red-500 text-sm">
          {errors.ville?.message}
        </p>

      </div>


      {/* Université */}

      <div className="md:col-span-2">

        <label className="text-sm font-medium">
          Université / établissement
        </label>

        <div className="relative">

          <Building
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <input
            {...register("universite")}
            placeholder="Université de Nouakchott"
            className="w-full border rounded-lg p-3 pl-10"
          />

          <p className="text-red-500 text-sm">
          {errors.universite?.message}
        </p>

        </div>

      </div>


      {/* Boutons */}

      <div className="md:col-span-2 flex justify-between mt-6">

        <button
          type="button"
          onClick={() => {
            setIsAdding(false);
            setEditingIndex(null);
          }}
          className="border px-6 py-3 rounded-lg"
        >
          Retour
        </button>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-lg"
        >
          Enregistrer
        </button>

      </div>

    </form>

  );

}

export default EducationForm;