// components/adhesion/StepPersonal.jsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalSchema } from "../../validation/validationSchemas";
import { useFormData } from "../../context/FormContext";
import { checkUnique } from "../../services/api";

const WILAYAS = [
  "Adrar", "Assaba", "Brakna", "Dakhlet Nouadhibou", "Gorgol", "Guidimakha",
  "Hodh Ech Chargui", "Hodh El Gharbi", "Inchiri", "Nouakchott Nord",
  "Nouakchott Ouest", "Nouakchott Sud", "Tagant", "Tiris Zemmour", "Trarza",
];

const inputCls = (hasError) =>
  `h-[48px] w-full rounded-lg border bg-white px-4 text-[15px] text-[#123F4A] outline-none transition
   placeholder:text-slate-300
   focus:border-[#35C878] focus:ring-2 focus:ring-[#35C878]/10
   ${
     hasError
       ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
       : "border-slate-200"
   }`;

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-2 block text-[17px] font-semibold text-[#123F4A]">
        {label}
        {required && <span className="ml-0.5 text-red-500"></span>}
      </label>

      {children}

      {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
    </div>
  );
}
function StepPersonal({ nextStep }) {
  const { formData, updateSection } = useFormData();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: { sexe: "", nationalite: "", ...formData.personal },
  });

  useEffect(() => {
    reset({ sexe: "", nationalite: "", ...formData.personal });
  }, [formData.personal, reset]);

  const nni = watch("nni");
  const email = watch("email");
  const telephone = watch("telephone");

  useEffect(() => {
    const check = async () => {
      if (!nni && !email && !telephone) return;
      try {
        await checkUnique({ nni, email, telephone });
        clearErrors(["nni", "email", "telephone"]);
      } catch (err) {
        const apiErrors = err.response?.data;
        if (!apiErrors) return;
        if (apiErrors.nni) setError("nni", { message: apiErrors.nni });
        if (apiErrors.email) setError("email", { message: apiErrors.email });
        if (apiErrors.telephone) setError("telephone", { message: apiErrors.telephone });
      }
    };
    check();
  }, [nni, email, telephone, setError, clearErrors]);

  const onSubmit = async (data) => {
    try {
      await checkUnique({
        nni: data.nni,
        email: data.email,
        telephone: data.telephone,
      });
      updateSection("personal", data);
      nextStep();
    } catch (err) {
      const apiErrors = err.response?.data;
      if (!apiErrors) return;
      if (apiErrors.nni) setError("nni", { message: apiErrors.nni });
      if (apiErrors.email) setError("email", { message: apiErrors.email });
      if (apiErrors.telephone) setError("telephone", { message: apiErrors.telephone });
    }
  };

  return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
      {/* Ligne 1 */}
      <Field label="Sexe" required error={errors.sexe?.message}>
        <select {...register("sexe")} className={inputCls(Boolean(errors.sexe))}>
          <option value="" disabled>Sexe</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>
      </Field>

      <Field label="Nationalité" required error={errors.nationalite?.message}>
        <select
          {...register("nationalite")}
          className={inputCls(Boolean(errors.nationalite))}
        >
          <option value="" disabled>Nationalité</option>
          <option value="Mauritanienne">Mauritanienne</option>
          <option value="Algérienne">Algérienne</option>
          <option value="Angolaise">Angolaise</option>
          <option value="Béninoise">Béninoise</option>
          <option value="Belge">Belge</option>
          <option value="Britannique">Britannique</option>
          <option value="Burkinabè">Burkinabè</option>
          <option value="Camerounaise">Camerounaise</option>
          <option value="Canadienne">Canadienne</option>
          <option value="Congolaise (RDC)">Congolaise (RDC)</option>
          <option value="Côte d'Ivoirienne">Côte d'Ivoirienne</option>
          <option value="Égyptienne">Égyptienne</option>
          <option value="Espagnole">Espagnole</option>
          <option value="Éthiopienne">Éthiopienne</option>
          <option value="Française">Française</option>
          <option value="Gabonaise">Gabonaise</option>
          <option value="Gambienne">Gambienne</option>
          <option value="Ghanéenne">Ghanéenne</option>
          <option value="Guinéenne">Guinéenne</option>
          <option value="Italienne">Italienne</option>
          <option value="Kényane">Kényane</option>
          <option value="Libyenne">Libyenne</option>
          <option value="Libérienne">Libérienne</option>
          <option value="Malienne">Malienne</option>
          <option value="Marocaine">Marocaine</option>
          <option value="Nigériane">Nigériane</option>
          <option value="Nigérienne">Nigérienne</option>
          <option value="Portugaise">Portugaise</option>
          <option value="Rwandaise">Rwandaise</option>
          <option value="Sénégalaise">Sénégalaise</option>
          <option value="Sierra-léonaise">Sierra-léonaise</option>
          <option value="Soudanaise">Soudanaise</option>
          <option value="Suisse">Suisse</option>
          <option value="Tchadienne">Tchadienne</option>
          <option value="Togolaise">Togolaise</option>
          <option value="Tunisienne">Tunisienne</option>
          <option value="Américaine">Américaine</option>
          <option value="Autre">Autre</option>
        </select>
      </Field>

      {/* Ligne 2 */}
      <Field
        label="Numéro de pièce d'identité"
        required
        error={errors.nni?.message}
      >
        <input
          {...register("nni")}
          placeholder="00112233445567"
          className={inputCls(Boolean(errors.nni))}
        />
      </Field>

      <Field
        label="Numéro de téléphone"
        required
        error={errors.telephone?.message}
      >
        <div className="flex gap-3">
          <div className="flex h-[48px] w-[80px] sm:w-[105px] items-center justify-center rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-[#123F4A]">
            +222
          </div>

          <input
            {...register("telephone")}
            placeholder="00 00 00 00"
            className={inputCls(Boolean(errors.telephone))}
          />
        </div>
      </Field>

      {/* Ligne 3 */}
<Field label="Nom" required error={errors.nom?.message}>
  <input
    {...register("nom")}
    placeholder="Nom"
    className={inputCls(Boolean(errors.nom))}
  />
</Field>

<Field label="Prénom" required error={errors.prenom?.message}>
  <input
    {...register("prenom")}
    placeholder="Prénom"
    className={inputCls(Boolean(errors.prenom))}
  />
</Field>

      <Field label="Adresse e-mail" required error={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          placeholder="Lorem"
          className={inputCls(Boolean(errors.email))}
        />
      </Field>

      {/* Ligne 4 */}
      <Field
        label="Date de naissance"
        required
        error={errors.dateNaissance?.message}
      >
        <input
          type="date"
          {...register("dateNaissance")}
          className={inputCls(Boolean(errors.dateNaissance))}
        />
      </Field>

      <Field label="Adresse" required error={errors.adresse?.message}>
        <input
          {...register("adresse")}
          placeholder=""
          className={inputCls(Boolean(errors.adresse))}
        />
      </Field>

      {/* Champ supplémentaire si tu veux le garder */}
      <Field
        label="Wilaya d'exercice"
        required
        error={errors.wilayaExercice?.message}
      >
        <select
          {...register("wilayaExercice")}
          className={inputCls(Boolean(errors.wilayaExercice))}
        >
          <option value="">— Sélectionner une wilaya —</option>
          {WILAYAS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </Field>
    </div>

    <div className="mt-11 flex justify-end">
      <button
        type="submit"
        className="h-[48px] w-full max-w-[310px] rounded-lg bg-[#03A84E] text-[17px] font-semibold text-white transition hover:bg-[#029646]"
      >
        Suivant
      </button>
    </div>
  </form>
);
}

export default StepPersonal;