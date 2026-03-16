import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormData } from "../../context/FormContext";
import { experienceSchema } from "../../validation/validationSchemas";
import { experienceData } from "../../data/experienceData";
import { useState, useEffect } from "react";
import { postes } from "../../data/postes";

import {
  Briefcase,
  Building,
  Calendar,
  MapPin,
  FileText
} from "lucide-react";
// import { set } from "zod";

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
    watch,
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

  const [villes, setVilles] = useState([]);
  const [etablissements, setEtablissements] = useState([]);

  const selectedPays = watch("pays");
  const selectedVille = watch("ville");

  useEffect(() => {
    if (!selectedPays) {
      setVilles([]);
      setEtablissements([]);
      return;
    }

    const villesPays = Object.keys(experienceData[selectedPays]) || [];

    setVilles(villesPays);
    setEtablissements([]);
  }, [selectedPays]);

  useEffect(() => {
    if (!selectedPays || !selectedVille) {
      setEtablissements([]);
      return;
    }
    setEtablissements(experienceData[selectedPays][selectedVille] || []);
  }, [selectedVille, selectedPays]);


  const isCurrent = watch("posteActuel");


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

          <select
            {...register("poste")}
            className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Sélectionner un poste</option>
            {postes.map((poste) => (
              <option key={poste} value={poste}>
                {poste}
              </option>
            ))}
          </select>


          <p className="text-red-500 text-sm">
          {errors.poste?.message}
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

          <select
            {...register("pays")}
            className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Sélectionner un pays</option>
            {Object.keys(experienceData).map((pays) => (
              <option key={pays} value={pays}>
                {pays}
              </option>
            ))}
          </select>


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

        <select
          {...register("ville")}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          disabled={!selectedPays}
        >
          <option value="">Sélectionner une ville</option>
          {villes.map((ville) => (
            <option key={ville} value={ville}>
              {ville}
            </option>
          ))}
        </select>


        <p className="text-red-500 text-sm">
          {errors.ville?.message}
        </p>

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

          <select
            {...register("etablissement")}
            className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            disabled={!selectedPays || !selectedVille}
          >
            <option value="">Sélectionner un établissement</option>
            {etablissements.map((etablissement) => (
              <option key={etablissement} value={etablissement}>
                {etablissement}
              </option>
            ))}
          </select>


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
            disabled={isCurrent}
            className="w-full border rounded-lg p-3 pl-10"
          />
          <p className="text-red-500 text-sm">
          {errors.dateFin?.message}
        </p>
        </div>

        <label className="inline-flex items-center mt-2">
          <input
            type="checkbox"
            {...register("posteActuel")}
            className="form-checkbox h-5 w-5 text-green-600"
          />
          <span className="ml-2 text-sm font-medium">
            Poste actuel
          </span>
        </label>


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