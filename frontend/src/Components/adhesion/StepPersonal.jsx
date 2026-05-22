import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { personalSchema } from "../../validation/validationSchemas";
import { useFormData } from "../../context/FormContext";
import { checkUnique } from "../../services/api";

const inputCls = (hasError) =>
  `h-[44px] w-full rounded-lg border bg-white px-3.5 text-[13px] text-slate-800 outline-none transition
   placeholder:text-slate-300
   focus:border-green-500 focus:ring-2 focus:ring-green-500/10
   ${
     hasError
       ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
       : "border-slate-200"
   }`;

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[#123F4A]">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {children}

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
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
        if (apiErrors.telephone)
          setError("telephone", { message: apiErrors.telephone });
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
      if (apiErrors.telephone)
        setError("telephone", { message: apiErrors.telephone });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        <Field label="Sexe" required error={errors.sexe?.message}>
          <select
            {...register("sexe")}
            className={inputCls(Boolean(errors.sexe))}
          >
            <option value="">Choisir</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
        </Field>

        <Field
          label="Nationalité"
          required
          error={errors.nationalite?.message}
        >
          <select
            {...register("nationalite")}
            className={inputCls(Boolean(errors.nationalite))}
          >
            <option value="">Choisir</option>
            <option value="Mauritanienne">Mauritanienne</option>
            <option value="Sénégalaise">Sénégalaise</option>
            <option value="Marocaine">Marocaine</option>
            <option value="Française">Française</option>
            <option value="Autre">Autre</option>
          </select>
        </Field>

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
          <input
            {...register("telephone")}
            placeholder="+222 00 00 00 00"
            className={inputCls(Boolean(errors.telephone))}
          />
        </Field>

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

        <Field label="Adresse e-mail" required error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            placeholder="email@exemple.com"
            className={inputCls(Boolean(errors.email))}
          />
        </Field>

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
            placeholder="Votre adresse"
            className={inputCls(Boolean(errors.adresse))}
          />
        </Field>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="h-[42px] w-[280px] rounded-lg bg-green-600 text-[14px] font-semibold text-white transition hover:bg-green-700"
        >
          Suivant
        </button>
      </div>
    </form>
  );
}

export default StepPersonal;
