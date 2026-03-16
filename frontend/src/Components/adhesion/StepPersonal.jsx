import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalSchema } from "../../validation/validationSchemas";
import { useFormData } from "../../context/FormContext";
import { checkUnique } from "../../services/api";
import { useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Flag
} from "lucide-react";

function StepPersonal({ nextStep }) {

  const { formData, updateSection } = useFormData();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: formData.personal
  });

  const nni = watch("nni");
  const email = watch("email");
  const telephone = watch("telephone");

  useEffect(() => {
    const check = async () => {

      if (!nni && !email && !telephone) 
        return;
      
      try {

        await checkUnique({ nni, email, telephone });
        clearErrors(["nni", "email", "telephone"]);
      } catch (err) {

        const apiErrors = err.response?.data;
        if (!apiErrors) return;

        if (apiErrors.nni) {
          setError("nni", { message: apiErrors.nni });
        }
        if (apiErrors.email) {
          setError("email", { message: apiErrors.email });
        }
        if (apiErrors.telephone) {
          setError("telephone", { message: apiErrors.telephone });
        }
      }
    };

    check();
  }, [nni, email, telephone, setError, clearErrors]);

  const onSubmit = async (data) => {

    try {

      await checkUnique({
        nni: data.nni,
        email: data.email,
        telephone: data.telephone
      });

      updateSection("personal", data);
      nextStep();

    } catch (err) {

      console.log(err.response.data);
      const apiErrors = err.response?.data;

      if (!apiErrors) return;

      if (apiErrors.nni) {
        setError("nni", { message: apiErrors.nni });
      }

      if (apiErrors.email) {
        setError("email", { message: apiErrors.email });
      }

      if (apiErrors.telephone) {
        setError("telephone", { message: apiErrors.telephone });
      }
      console.log(err.response.data);
    }
  };

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >

      {/* Sexe */}
      <div>
        <label className="text-sm font-medium">Sexe</label>

        <select
          {...register("sexe")}
          className="w-full border rounded-lg p-3 mt-1"
        >
          <option value="">Choisir</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>

        <p className="text-red-500 text-sm">{errors.sexe?.message}</p>
      </div>


      {/* Nationalité */}
      <div>
        <label className="text-sm font-medium">Nationalité</label>

        <div className="relative">

          <Flag className="absolute left-3 top-4 text-gray-400" size={18} />

          <select
            {...register("nationalite")}
            className="w-full border rounded-lg p-3 pl-10"
          >
            <option value="">Choisir</option>
            <option value="Mauritanienne">Mauritanienne</option>
            <option value="Sénégalaise">Sénégalaise</option>
            <option value="Marocaine">Marocaine</option>
            <option value="Française">Française</option>
            <option value="Autre">Autre</option>
          </select>

        </div>

        <p className="text-red-500 text-sm">{errors.nationalite?.message}</p>
      </div>


      {/* NNI */}
      <div>
        <label className="text-sm font-medium">
          Numéro pièce d'identité
        </label>

        <div className="relative">

          <CreditCard className="absolute left-3 top-4 text-gray-400" size={18} />

          <input
            {...register("nni")}
            placeholder="001122334455"
            className="w-full border rounded-lg p-3 pl-10"
          />

        </div>

        <p className="text-red-500 text-sm">{errors.nni?.message}</p>
      </div>


      {/* Téléphone */}
      <div>
        <label className="text-sm font-medium">
          Numéro de téléphone
        </label>

        <div className="relative">

          <Phone className="absolute left-3 top-4 text-gray-400" size={18} />

          <input
            {...register("telephone")}
            placeholder="+222 36 00 00 00"
            className="w-full border rounded-lg p-3 pl-10"
          />

        </div>

        <p className="text-red-500 text-sm">{errors.telephone?.message}</p>
      </div>


      {/* Nom */}
      <div>
        <label className="text-sm font-medium">Nom</label>

        <div className="relative">

          <User className="absolute left-3 top-4 text-gray-400" size={18} />

          <input
            {...register("nom")}
            placeholder="Nom"
            className="w-full border rounded-lg p-3 pl-10"
          />

        </div>

        <p className="text-red-500 text-sm">{errors.nom?.message}</p>
      </div>


      {/* Prénom */}
      <div>
        <label className="text-sm font-medium">Prénom</label>

        <div className="relative">

          <User className="absolute left-3 top-4 text-gray-400" size={18} />

          <input
            {...register("prenom")}
            placeholder="Prénom"
            className="w-full border rounded-lg p-3 pl-10"
          />

        </div>

        <p className="text-red-500 text-sm">{errors.prenom?.message}</p>
      </div>


      {/* Email */}
      <div>
        <label className="text-sm font-medium">Adresse email</label>

        <div className="relative">

          <Mail className="absolute left-3 top-4 text-gray-400" size={18} />

          <input
            {...register("email")}
            placeholder="email@example.com"
            className="w-full border rounded-lg p-3 pl-10"
          />

        </div>

        <p className="text-red-500 text-sm">{errors.email?.message}</p>
      </div>


      {/* Date naissance */}
      <div>
        <label className="text-sm font-medium">
          Date de naissance
        </label>

        <div className="relative">

          <Calendar className="absolute left-3 top-4 text-gray-400" size={18} />

          <input
            type="date"
            {...register("dateNaissance")}
            className="w-full border rounded-lg p-3 pl-10"
          />
          <p className="text-red-500 text-sm">{errors.dateNaissance?.message}</p>

        </div>
      </div>


      {/* Adresse */}
      <div>
        <label className="text-sm font-medium">Adresse</label>

        <div className="relative">

          <MapPin className="absolute left-3 top-4 text-gray-400" size={18} />

          <input
            {...register("adresse")}
            placeholder="Adresse actuelle"
            className="w-full border rounded-lg p-3 pl-10"
          />
          <p className="text-red-500 text-sm">{errors.adresse?.message}</p>

        </div>
      </div>


      {/* Bouton */}
      <div className="col-span-1 md:col-span-2 flex justify-end mt-6">

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 transition text-white px-10 py-3 rounded-lg shadow"
        >
          Suivant
        </button>

      </div>

    </form>
  );
}

export default StepPersonal;