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
  FileText,
} from "lucide-react";

function ExperienceForm({ setIsAdding, editingIndex, setEditingIndex }) {
  const { formData, updateSection } = useFormData();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      poste: "",
      pays: "",
      ville: "",
      etablissement: "",
      dateDebut: "",
      dateFin: "",
      posteActuel: false,
      description: "",
    },
  });

  const [villes, setVilles] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [isInitializingEdit, setIsInitializingEdit] = useState(false);

  const selectedPays = watch("pays");
  const selectedVille = watch("ville");
  const isCurrent = watch("posteActuel");

  useEffect(() => {
    if (editingIndex == null) {
      setIsInitializingEdit(false);
      reset({
        poste: "",
        pays: "",
        ville: "",
        etablissement: "",
        dateDebut: "",
        dateFin: "",
        posteActuel: false,
        description: "",
      });
      setVilles([]);
      setEtablissements([]);
      return;
    }

    const exp = formData.experience?.[editingIndex];
    if (!exp) return;

    setIsInitializingEdit(true);

    const villesPays = Object.keys(experienceData[exp.pays] || {});
    const etablissementsVille =
      experienceData[exp.pays]?.[exp.ville] || [];

    setVilles(villesPays);
    setEtablissements(etablissementsVille);

    reset({
      poste: exp.poste || "",
      pays: exp.pays || "",
      ville: exp.ville || "",
      etablissement: exp.etablissement || "",
      dateDebut: exp.dateDebut || "",
      dateFin:
        exp.dateFin !== null && exp.dateFin !== undefined ? exp.dateFin : "",
      posteActuel: exp.posteActuel ?? !exp.dateFin,
      description: exp.description || "",
    });

    setTimeout(() => {
      setIsInitializingEdit(false);
    }, 0);
  }, [editingIndex, formData.experience, reset]);

  useEffect(() => {
    if (!selectedPays) {
      setVilles([]);
      setEtablissements([]);
      return;
    }

    const villesPays = Object.keys(experienceData[selectedPays] || {});
    setVilles(villesPays);

    if (isInitializingEdit) return;

    const currentVille = getValues("ville");
    const villeExists = villesPays.includes(currentVille);

    if (!villeExists) {
      reset(
        {
          ...getValues(),
          ville: "",
          etablissement: "",
        },
        {
          keepErrors: true,
          keepDirty: true,
          keepTouched: true,
        }
      );
      setEtablissements([]);
    }
  }, [selectedPays, getValues, reset, isInitializingEdit]);

  useEffect(() => {
    if (!selectedPays || !selectedVille) {
      setEtablissements([]);
      return;
    }

    const list = experienceData[selectedPays]?.[selectedVille] || [];
    setEtablissements(list);

    if (isInitializingEdit) return;

    const currentEtablissement = getValues("etablissement");
    const exists = list.includes(currentEtablissement);

    if (!exists) {
      reset(
        {
          ...getValues(),
          etablissement: "",
        },
        {
          keepErrors: true,
          keepDirty: true,
          keepTouched: true,
        }
      );
    }
  }, [selectedPays, selectedVille, getValues, reset, isInitializingEdit]);

  const onSubmit = (data) => {
    const formatted = {
      ...data,
      dateFin: data.posteActuel ? "" : data.dateFin,
    };

    const updated = [...(formData.experience || [])];

    if (editingIndex !== null) {
      updated[editingIndex] = formatted;
    } else {
      updated.push(formatted);
    }

    updateSection("experience", updated);

    reset({
      poste: "",
      pays: "",
      ville: "",
      etablissement: "",
      dateDebut: "",
      dateFin: "",
      posteActuel: false,
      description: "",
    });

    setVilles([]);
    setEtablissements([]);
    setEditingIndex(null);
    setIsAdding(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div>
        <label className="text-sm font-medium">Poste occupé</label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-4 text-gray-400" size={18} />
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
        </div>
        <p className="text-red-500 text-sm">{errors.poste?.message}</p>
      </div>

      <div>
        <label className="text-sm font-medium">Pays</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-4 text-gray-400" size={18} />
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
        </div>
        <p className="text-red-500 text-sm">{errors.pays?.message}</p>
      </div>

      <div>
        <label className="text-sm font-medium">Ville</label>
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
        <p className="text-red-500 text-sm">{errors.ville?.message}</p>
      </div>

      <div>
        <label className="text-sm font-medium">Nom de l’établissement</label>
        <div className="relative">
          <Building className="absolute left-3 top-4 text-gray-400" size={18} />
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
        </div>
        <p className="text-red-500 text-sm">{errors.etablissement?.message}</p>
      </div>

      <div>
        <label className="text-sm font-medium">Date de début</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-4 text-gray-400" size={18} />
          <input
            type="date"
            {...register("dateDebut")}
            className="w-full border rounded-lg p-3 pl-10"
          />
        </div>
        <p className="text-red-500 text-sm">{errors.dateDebut?.message}</p>
      </div>

      <div>
        <label className="text-sm font-medium">Date de fin</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-4 text-gray-400" size={18} />
          <input
            type="date"
            {...register("dateFin")}
            disabled={isCurrent}
            className="w-full border rounded-lg p-3 pl-10"
          />
        </div>
        <p className="text-red-500 text-sm">{errors.dateFin?.message}</p>

        <label className="inline-flex items-center mt-2">
          <input
            type="checkbox"
            {...register("posteActuel")}
            className="form-checkbox h-5 w-5 text-green-600"
          />
          <span className="ml-2 text-sm font-medium">Poste actuel</span>
        </label>
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium">Description</label>
        <div className="relative">
          <FileText className="absolute left-3 top-4 text-gray-400" size={18} />
          <textarea
            {...register("description")}
            rows="4"
            placeholder="Décrire vos responsabilités..."
            className="w-full border rounded-lg p-3 pl-10"
          />
        </div>
        <p className="text-red-500 text-sm">{errors.description?.message}</p>
      </div>

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