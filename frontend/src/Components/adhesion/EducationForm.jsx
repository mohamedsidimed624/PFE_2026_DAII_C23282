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

function EducationForm({ setIsAdding, editingIndex, setEditingIndex }) {
  const { formData, updateSection } = useFormData();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      specialiteId: "",
      sousSpecialiteId: "",
      diplome: "",
      anneeObtention: "",
      pays: "",
      ville: "",
      universite: "",
    },
  });

  const [specialites, setSpecialites] = useState([]);
  const [sousSpecialites, setSousSpecialites] = useState([]);
  const [villes, setVilles] = useState([]);
  const [universites, setUniversites] = useState([]);
  const [loadingSpecialites, setLoadingSpecialites] = useState(true);
  const [loadingSousSpecialites, setLoadingSousSpecialites] = useState(false);

  const selectedSpecialiteId = watch("specialiteId");
  const selectedPays = watch("pays");
  const selectedVille = watch("ville");

  const diplomes = [
    "Doctorat en médecine",
    "Diplôme d'études spécialisées (DES)",
    "Diplôme d'études spécialisées complémentaires",
    "Master",
    "Doctorat / PhD",
    "Licence",
    "Certificat / Attestation",
    "Autre",
  ];

  useEffect(() => {
    const loadSpecialites = async () => {
      try {
        setLoadingSpecialites(true);
        const res = await getSpecialites();
        setSpecialites(res.data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des spécialités :", error);
        setSpecialites([]);
      } finally {
        setLoadingSpecialites(false);
      }
    };

    loadSpecialites();
  }, []);

  useEffect(() => {
    const loadSousSpecialites = async () => {
      if (!selectedSpecialiteId) {
        setSousSpecialites([]);
        setValue("sousSpecialiteId", "");
        return;
      }

      try {
        setLoadingSousSpecialites(true);
        const res = await getSousSpecialites(selectedSpecialiteId);
        setSousSpecialites(res.data || []);
        setValue("sousSpecialiteId", "");
      } catch (error) {
        console.error("Erreur lors du chargement des sous-spécialités :", error);
        setSousSpecialites([]);
        setValue("sousSpecialiteId", "");
      } finally {
        setLoadingSousSpecialites(false);
      }
    };

    loadSousSpecialites();
  }, [selectedSpecialiteId, setValue]);

  useEffect(() => {
    if (!selectedPays) {
      setVilles([]);
      setUniversites([]);
      setValue("ville", "");
      setValue("universite", "");
      return;
    }

    const villesPays = Object.keys(educationData[selectedPays] || {});
    setVilles(villesPays);
    setUniversites([]);
    setValue("ville", "");
    setValue("universite", "");
  }, [selectedPays, setValue]);

  useEffect(() => {
    if (!selectedPays || !selectedVille) {
      setUniversites([]);
      setValue("universite", "");
      return;
    }

    setUniversites(educationData[selectedPays]?.[selectedVille] || []);
    setValue("universite", "");
  }, [selectedPays, selectedVille, setValue]);

  useEffect(() => {
    if (editingIndex === null) {
      reset({
        specialiteId: "",
        sousSpecialiteId: "",
        diplome: "",
        anneeObtention: "",
        pays: "",
        ville: "",
        universite: "",
      });
      setSousSpecialites([]);
      setVilles([]);
      setUniversites([]);
      return;
    }

    const edu = formData.education?.[editingIndex];
    if (!edu) return;

    const loadEditData = async () => {
      try {
        if (edu.specialiteId) {
          const res = await getSousSpecialites(edu.specialiteId);
          setSousSpecialites(res.data || []);
        } else {
          setSousSpecialites([]);
        }

        const villesPays = Object.keys(educationData[edu.pays] || {});
        setVilles(villesPays);

        const univs = educationData[edu.pays]?.[edu.ville] || [];
        setUniversites(univs);

        reset({
          specialiteId: edu.specialiteId || "",
          sousSpecialiteId: edu.sousSpecialiteId || "",
          diplome: edu.diplome || "",
          anneeObtention: edu.anneeObtention || "",
          pays: edu.pays || "",
          ville: edu.ville || "",
          universite: edu.universite || "",
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données d'édition :", error);
      }
    };

    loadEditData();
  }, [editingIndex, formData.education, reset]);

  const onSubmit = (data) => {
    const specialiteObj = specialites.find(
      (s) => String(s.id) === String(data.specialiteId)
    );

    const sousSpecialiteObj = sousSpecialites.find(
      (s) => String(s.id) === String(data.sousSpecialiteId)
    );

    const formattedData = {
      specialiteId: data.specialiteId,
      sousSpecialiteId: data.sousSpecialiteId || "",
      specialiteLibelle: specialiteObj?.libelle || "",
      sousSpecialiteLibelle: sousSpecialiteObj?.libelle || "",
      diplome: data.diplome,
      anneeObtention: data.anneeObtention,
      pays: data.pays,
      ville: data.ville,
      universite: data.universite,
    };

    const updated = [...(formData.education || [])];

    if (editingIndex !== null) {
      updated[editingIndex] = formattedData;
    } else {
      updated.push(formattedData);
    }

    updateSection("education", updated);

    reset({
      specialiteId: "",
      sousSpecialiteId: "",
      diplome: "",
      anneeObtention: "",
      pays: "",
      ville: "",
      universite: "",
    });

    setSousSpecialites([]);
    setVilles([]);
    setUniversites([]);
    setEditingIndex(null);
    setIsAdding(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div>
        <label className="text-sm font-medium">Spécialité</label>

        <div className="relative">
          <GraduationCap
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <select
            {...register("specialiteId")}
            className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-green-500"
            disabled={loadingSpecialites}
          >
            <option value="">Sélectionnez une spécialité</option>
            {specialites.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.libelle}
              </option>
            ))}
          </select>
        </div>

        <p className="text-red-500 text-sm mt-1">
          {errors.specialiteId?.message}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Sous-spécialité</label>

        <select
          {...register("sousSpecialiteId")}
          disabled={!selectedSpecialiteId || loadingSousSpecialites}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
        >
          <option value="">Sélectionnez une sous-spécialité</option>
          {sousSpecialites.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.libelle}
            </option>
          ))}
        </select>

        {selectedSpecialiteId &&
          !loadingSousSpecialites &&
          sousSpecialites.length === 0 && (
            <p className="text-gray-500 text-sm mt-1">
              Aucune sous-spécialité disponible pour cette spécialité.
            </p>
          )}

        <p className="text-red-500 text-sm mt-1">
          {errors.sousSpecialiteId?.message}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Diplôme</label>

        <select
          {...register("diplome")}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
        >
          <option value="">Sélectionnez un diplôme</option>
          {diplomes.map((diplome) => (
            <option key={diplome} value={diplome}>
              {diplome}
            </option>
          ))}
        </select>

        <p className="text-red-500 text-sm mt-1">
          {errors.diplome?.message}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Année d'obtention</label>

        <div className="relative">
          <Calendar
            className="absolute left-3 top-4 text-gray-400"
            size={18}
          />

          <input
            {...register("anneeObtention")}
            placeholder="2022"
            className="w-full border rounded-lg p-3 pl-10"
          />
        </div>

        <p className="text-red-500 text-sm mt-1">
          {errors.anneeObtention?.message}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Pays</label>

        <div className="relative">
          <MapPin
            className="absolute left-1 top-4 text-gray-400"
            size={18}
          />

          <select
            {...register("pays")}
            className="w-full border rounded-lg p-3 pl-5 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Sélectionnez un pays</option>
            {Object.keys(educationData).map((pays) => (
              <option key={pays} value={pays}>
                {pays}
              </option>
            ))}
          </select>
        </div>

        <p className="text-red-500 text-sm mt-1">
          {errors.pays?.message}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Ville</label>

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

        <p className="text-red-500 text-sm mt-1">
          {errors.ville?.message}
        </p>
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium">
          Université / établissement
        </label>

        <div className="relative">
          <Building
            className="absolute left-1 top-4 text-gray-400"
            size={18}
          />

          <select
            {...register("universite")}
            className="w-full border rounded-lg p-3 pl-5 focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            disabled={!selectedPays || !selectedVille}
          >
            <option value="">Sélectionnez une université</option>
            {universites.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <p className="text-red-500 text-sm mt-1">
          {errors.universite?.message}
        </p>
      </div>

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