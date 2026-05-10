import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalSchema } from "../../validation/validationSchemas";
import { useFormData } from "../../context/FormContext";
import { checkUnique } from "../../services/api";
import { useEffect } from "react";

const inputCls = (hasError) =>
  `w-full rounded-lg border bg-white px-3 py-3 text-sm text-slate-900 outline-none transition
   focus:ring-2 focus:ring-green-500/20 focus:border-green-500
   ${hasError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200"}`;

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
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
    defaultValues: formData.personal || {},
  });

  useEffect(() => {
    reset(formData.personal || {});
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
      await checkUnique({ nni: data.nni, email: data.email, telephone: data.telephone });
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Sexe / Nationalité */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sexe" required error={errors.sexe?.message}>
          <select {...register("sexe")} className={inputCls(Boolean(errors.sexe))}>
            <option value="">Choisir</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
        </Field>

        <Field label="Nationalité" required error={errors.nationalite?.message}>
          <select {...register("nationalite")} className={inputCls(Boolean(errors.nationalite))}>
            <option value="">Choisir</option>
            <option value="Mauritanienne">Mauritanienne</option>
            <option value="Sénégalaise">Sénégalaise</option>
            <option value="Marocaine">Marocaine</option>
            <option value="Française">Française</option>
            <option value="Autre">Autre</option>
          </select>
        </Field>
      </div>

      {/* NNI / Téléphone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Numéro de pièce d'identité" required error={errors.nni?.message}>
          <input
            {...register("nni")}
            placeholder="001122334455"
            className={inputCls(Boolean(errors.nni))}
          />
        </Field>

        <Field label="Numéro de téléphone" required error={errors.telephone?.message}>
          <input
            {...register("telephone")}
            placeholder="+222 36 00 00 00"
            className={inputCls(Boolean(errors.telephone))}
          />
        </Field>
      </div>

      {/* Nom / Prénom */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" required error={errors.nom?.message}>
          <input
            {...register("nom")}
            placeholder="Votre nom"
            className={inputCls(Boolean(errors.nom))}
          />
        </Field>

        <Field label="Prénom" required error={errors.prenom?.message}>
          <input
            {...register("prenom")}
            placeholder="Votre prénom"
            className={inputCls(Boolean(errors.prenom))}
          />
        </Field>
      </div>

      {/* Email / Date naissance */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Adresse e-mail" required error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            placeholder="email@exemple.com"
            className={inputCls(Boolean(errors.email))}
          />
        </Field>

        <Field label="Date de naissance" required error={errors.dateNaissance?.message}>
          <input
            type="date"
            {...register("dateNaissance")}
            className={inputCls(Boolean(errors.dateNaissance))}
          />
        </Field>
      </div>

      {/* Adresse */}
      <Field label="Adresse" required error={errors.adresse?.message}>
        <input
          {...register("adresse")}
          placeholder="Quartier, rue, numéro..."
          className={inputCls(Boolean(errors.adresse))}
        />
      </Field>

      <button
        type="submit"
        className="w-full rounded-lg bg-green-600 hover:bg-green-700 transition py-3 text-sm font-semibold text-white shadow-sm"
      >
        Suivant
      </button>
    </form>
  );
}

export default StepPersonal;
