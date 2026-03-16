import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema } from "../../validation/validationSchemas";
import { useFormData } from "../../context/FormContext";
import { educationData } from "../../data/educationData";
import {
  GraduationCap,
  Calendar,
  MapPin,
  Building,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSousSpecialites, getSpecialites } from "../../services/api";
// import { set } from "zod";



function EducationForm({ setIsAdding, editingIndex, setEditingIndex }) {

  const { formData, updateSection } = useFormData();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(educationSchema)
  });

  const [specialites, setSpecialites] = useState([]);
  const [sousSpecialites, setSousSpecialites] = useState([]);

  const selectedSpecialite = watch("specialite");

  // charger spécialités
  useEffect(() => {

    const load = async () => {
      const res = await getSpecialites();
      setSpecialites(res.data);
    };

    load();

  }, []);

  // charger sous spécialités quand spécialité change
  useEffect(() => {

    if (!selectedSpecialite) return;

    const loadSous = async () => {

      try {
        const res = await getSousSpecialites(selectedSpecialite);
        setSousSpecialites(res.data);
      } catch (error) {
        console.error(error);
      }

    };

    loadSous();

  }, [selectedSpecialite]);

  useEffect(() => {

    if (editingIndex === null) {
      reset({});
      return;
    }

    const edu = formData.education[editingIndex];
    if (!edu) return;

    const loadData = async () => {

      // charger sous spécialités
      const res = await getSousSpecialites(edu.specialite);
      setSousSpecialites(res.data);

      // charger villes
      const villesPays = Object.keys(educationData[edu.pays] || {});
      setVilles(villesPays);

      // charger universités
      const univs =
        educationData[edu.pays]?.[edu.ville] || [];
      setUniversites(univs);

      // reset APRÈS chargement
      reset({
        specialite: String(edu.specialite),
        sousSpecialite: String(edu.sousSpecialite),
        diplome: edu.diplome,
        annee: edu.annee,
        pays: edu.pays,
        ville: edu.ville,
        universite: edu.universite
      });

    };

    loadData();

  }, [editingIndex]);

  const onSubmit = (data) => {

    const specialiteObj = specialites.find(
      s => String(s.id) === data.specialite
    );

    const sousSpecialiteObj = sousSpecialites.find(
      s => String(s.id) === data.sousSpecialite
    );

    const formattedData = {
      ...data,
      specialite: data.specialite,
      sousSpecialite: data.sousSpecialite,
      specialiteNom: specialiteObj?.nom || "",
      sousSpecialiteNom: sousSpecialiteObj?.nom || ""
    };

    let updated = [...(formData.education || [])];

    if (editingIndex !== null) {
      updated[editingIndex] = formattedData;
    } else {
      updated.push(formattedData);
    }

    updateSection("education", updated);

    reset();

    setEditingIndex(null);
    setIsAdding(false);


    console.log(formData.education);
  };


  const [villes, setVilles] = useState([]);
  const [universites, setUniversites] = useState([]);



  const selectedPays = watch("pays");
  const selectedVille = watch("ville");

  useEffect(() => {
    if (!selectedPays) {
      setVilles([]);
      setUniversites([]);
      return;
    }

    const villePays = Object.keys(educationData[selectedPays]);

    setVilles(villePays);
    setUniversites([]);
  }, [selectedPays]);

  useEffect(() => {
    if (!selectedPays || !selectedVille) {
      setUniversites([]);
      return;
    }

    setUniversites(educationData[selectedPays][selectedVille] || []);
  }, [selectedVille, selectedPays]);

    

    const diplomes = [
        "Doctorat médecine",
        "Master en sciences de la santé",
        "Licence en sciences de la santé",
        "Diplôme d'études spécialisées (DES)",
        "Diplôme d'études approfondies (DEA)",
        "Diplôme d'études supérieures spécialisées (DESS)",
        "Diplôme de spécialisation en médecine",
        "Diplôme de spécialisation en chirurgie",
        "Diplôme de spécialisation en pédiatrie",
        "Diplôme de spécialisation en gynécologie",
        "Diplôme de spécialisation en psychiatrie",
        "Diplôme de spécialisation en dermatologie",
        "Diplôme de spécialisation en ophtalmologie",
        "Diplôme de spécialisation en ORL",
        "Diplôme de spécialisation en radiologie",
        "Diplôme de spécialisation en anesthésiologie",
        "Diplôme de spécialisation en oncologie",
        "Diplôme de spécialisation en endocrinologie",
        "Diplôme de spécialisation en gastro-entérologie",
        "Diplôme de spécialisation en néphrologie",
        "Diplôme de spécialisation en rhumatologie",
        "Diplôme de spécialisation en hématologie",
        "Diplôme de spécialisation en infectiologie",
        "Diplôme de spécialisation en médecine du travail",
        "Diplôme de spécialisation en médecine légale",
        "Diplôme de spécialisation en médecine d'urgence",
        "Diplôme de spécialisation en médecine sportive",
        "Diplôme de spécialisation en médecine palliative",
        "Diplôme de spécialisation en médecine nucléaire",
        "Diplôme de spécialisation en médecine physique et de réadaptation",
        "Diplôme de spécialisation en médecine tropicale",
        "Diplôme de spécialisation en médecine vasculaire",
        "Diplôme de spécialisation en médecine aéronautique",
        "Diplôme de spécialisation en médecine spatiale",
        "Diplôme de spécialisation en médecine maritime",
        "Diplôme de spécialisation en médecine rurale",
        "Diplôme de spécialisation en médecine communautaire",
        "Diplôme de spécialisation en médecine de famille",
        "Diplôme de spécialisation en médecine interne",
        "Diplôme de spécialisation en médecine préventive",
        "Diplôme de spécialisation en médecine alternative",
        "Autre"
    ];


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

          {/* <input
            {...register("specialite")}
            placeholder="Médecine générale"
            className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-green-500"
          /> */}

          <select
            {...register("specialite")}
            className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Sélectionnez une spécialité</option>
            {specialites.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.nom}
              </option>
            ))}
          </select>

        </div>

        <p className="text-red-500 text-sm">
          {errors.specialite?.message}
        </p>

      </div>


      {/* Sous spécialité */}

      <div>
        <label className="text-sm font-medium">Sous-spécialité</label>

        {/* <input
          {...register("sousSpecialite")}
          placeholder="Cardiologie"
          className="w-full border rounded-lg p-3"
        /> */}

        <select
          {...register("sousSpecialite")}
          disabled={!selectedSpecialite}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
        >
          <option value="">Sélectionnez une sous-spécialité</option>
          {sousSpecialites.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.nom}
            </option>
          ))}
        </select>

        <p className="text-red-500 text-sm">
          {errors.sousSpecialite?.message}
        </p>

      </div>


      {/* Diplôme */}

      <div>
        <label className="text-sm font-medium">Diplôme</label>

        {/* <input
          {...register("diplome")}
          placeholder="Doctorat médecine"
          className="w-full border rounded-lg p-3"
        /> */}
        <select
          {...register("diplome")}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
        >
          <option value="">Sélectionnez une diplome</option>
          {diplomes.map((diplome) => (
            <option key={diplome} value={diplome}>
              {diplome}
            </option>
          ))}
        </select>


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
            className="absolute left-1 top-4 text-gray-400"
            size={18}
          />

          {/* <input
            {...register("pays")}
            placeholder="Mauritanie"
            className="w-full border rounded-lg p-3 pl-10"
          /> */}

          <select
          {...register("pays")}
          className="w-full border rounded-lg p-3 pl-5 focus:ring-2 focus:ring-green-500"
        >
          <option value="">Sélectionnez une pays</option>
          {Object.keys(educationData).map((pays) => (
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
        <label className="text-sm font-medium">Ville</label>

        {/* <input
          {...register("ville")}
          placeholder="Nouakchott"
          className="w-full border rounded-lg p-3"
        /> */}

        <select
          {...register("ville")}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          disabled={!selectedPays}
        >
          <option value="">Sélectionnez une ville</option>
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


      {/* Université */}

      <div className="md:col-span-2">

        <label className="text-sm font-medium">
          Université / établissement
        </label>

        <div className="relative">

          <Building
            className="absolute left-1 top-4 text-gray-400"
            size={18}
          />

          {/* <input
            {...register("universite")}
            placeholder="Université de Nouakchott"
            className="w-full border rounded-lg p-3 pl-10"
          /> */}

          <select
          {...register("universite")}
          className="w-full border rounded-lg p-3 pl-5 focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          disabled={!selectedPays || !selectedVille}
        >
          <option value="">Sélectionnez une universite</option>
          {universites.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

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