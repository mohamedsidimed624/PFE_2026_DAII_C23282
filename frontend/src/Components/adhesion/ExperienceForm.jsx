import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormData } from "../../context/FormContext";
import { experienceSchema } from "../../validation/validationSchemas";

import {
  Briefcase,
  Building,
  Calendar,
  MapPin,
  FileText
} from "lucide-react";

function ExperienceForm({ setIsAdding, editingIndex, setEditingIndex }) {

  const { formData, updateSection } = useFormData();

  const defaultValues =
    editingIndex !== null && formData.experience
      ? formData.experience[editingIndex]
      : {};

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues
  });

  const onSubmit = (data) => {

    let updated = [...(formData.experience || [])];

    if (editingIndex !== null) {
      updated[editingIndex] = data;
    } else {
      updated.push(data);
    }

    updateSection("experience", updated);

    reset();

    setEditingIndex(null);

    setIsAdding(false);

  };

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >

      {/* Poste */}

      <div>
        <label className="text-sm font-medium">Poste occupé</label>

        <div className="relative">

          <Briefcase
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <input
            {...register("poste")}
            placeholder="Médecin généraliste"
            className="w-full border rounded-lg p-3 pl-10"
          />

          <p className="text-red-500 text-sm">
          {errors.poste?.message}
        </p>
        </div>

        

      </div>


      {/* Établissement */}

      <div>
        <label className="text-sm font-medium">
          Nom de l’établissement
        </label>

        <div className="relative">

          <Building
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <input
            {...register("etablissement")}
            placeholder="Clinique XYZ"
            className="w-full border rounded-lg p-3 pl-10"
          />

          <p className="text-red-500 text-sm">
          {errors.etablissement?.message}
        </p>
        </div>

        
      </div>


      {/* Date début */}

      <div>
        <label className="text-sm font-medium">
          Date de début
        </label>

        <div className="relative">

          <Calendar
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <input
            type="date"
            {...register("dateDebut")}
            className="w-full border rounded-lg p-3 pl-10"
          />

          <p className="text-red-500 text-sm">
            {errors.dateDebut?.message}
          </p>

        </div>

      </div>


      {/* Date fin */}

      <div>
        <label className="text-sm font-medium">
          Date de fin
        </label>

        <div className="relative">

          <Calendar
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <input
            type="date"
            {...register("dateFin")}
            className="w-full border rounded-lg p-3 pl-10"
          />
          <p className="text-red-500 text-sm">
          {errors.dateFin?.message}
        </p>
        </div>

      </div>


      {/* Pays */}

      <div>
        <label className="text-sm font-medium">
          Pays
        </label>

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
        <label className="text-sm font-medium">
          Ville
        </label>

        <input
          {...register("ville")}
          placeholder="Nouakchott"
          className="w-full border rounded-lg p-3"
        />

        <p className="text-red-500 text-sm">
          {errors.ville?.message}
        </p>

      </div>


      {/* Description */}

      <div className="md:col-span-2">

        <label className="text-sm font-medium">
          Description
        </label>

        <div className="relative">

          <FileText
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <textarea
            {...register("description")}
            rows="4"
            placeholder="Décrire vos responsabilités..."
            className="w-full border rounded-lg p-3 pl-10"
          />

          <p className="text-red-500 text-sm">
          {errors.description?.message}
        </p>

        </div>

      </div>


      {/* Boutons */}

      <div className="md:col-span-2 flex justify-between mt-6">

        <button
          type="button"
          onClick={() => {
            setEditingIndex(null);
            setIsAdding(false);
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

export default ExperienceForm;