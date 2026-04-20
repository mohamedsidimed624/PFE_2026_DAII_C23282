import { z } from "zod";

/* =========================
   PERSONAL INFORMATION
========================= */

export const personalSchema = z.object({
  sexe: z.string().min(1, "Le sexe est requis"),

  nationalite: z.string().min(2, "La nationalité est requise"),

  adresse: z.string().min(2, "L'adresse est requise"),

  nni: z
    .string()
    .regex(/^[0-9]{10}$/, "Le NNI doit contenir exactement 10 chiffres"),

  telephone: z
    .string()
    .regex(
      /^[234][0-9]{7}$/,
      "Numéro invalide (8 chiffres commençant par 2,3 ou 4)",
    ),

  nom: z
    .string()
    .min(2, "Nom requis")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nom invalide"),

  prenom: z
    .string()
    .min(2, "Prénom requis")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Prénom invalide"),

  email: z.string().email("Email invalide"),

  dateNaissance: z.string().min(1, "Date de naissance requise"),
});

/* =========================
   EDUCATION
========================= */

export const educationSchema = z.object({
  specialiteId: z.string().min(1, "Spécialité requise"),

  sousSpecialiteId: z.string().optional(),

  diplome: z.string().min(1, "Diplôme requis"),

  anneeObtention: z.string().refine((value) => {
    const year = parseInt(value, 10);
    const currentYear = new Date().getFullYear();
    return !isNaN(year) && year >= 1900 && year <= currentYear;
  }, "Année invalide"),

  pays: z.string().min(2, "Pays requis"),

  ville: z.string().min(2, "Ville requise"),

  universite: z.string().min(2, "Université requise"),
});

/* =========================
   EXPERIENCE
========================= */

export const experienceSchema = z
  .object({
    poste: z.string().min(2, "Poste requis"),

    etablissement: z.string().min(2, "Établissement requis"),

    dateDebut: z.string().min(1, "Date de début requise"),

    dateFin: z.string().optional(),

    posteActuel: z.boolean().optional(),

    pays: z.string().min(2, "Pays requis"),

    ville: z.string().min(2, "Ville requise"),

    description: z.string().min(10, "Description trop courte"),
  })

  /* 1️⃣ vérifier date début <= aujourd'hui */

  .refine(
    (data) => {
      const today = new Date();
      const debut = new Date(data.dateDebut);

      return debut <= today;
    },
    {
      message: "La date de début ne peut pas être dans le futur",
      path: ["dateDebut"],
    },
  )

  /* 2️⃣ vérifier date fin <= aujourd'hui */

  /* 3️⃣ vérifier dateFin >= dateDebut */

  .refine(
    (data) => {
      if (data.posteActuel) return true;

      if (!data.dateFin) return false;

      return new Date(data.dateFin) >= new Date(data.dateDebut);
    },
    {
      message: "La date de fin doit être après la date de début",
      path: ["dateFin"],
    },
  );

export const documentsSchema = z.object({
  diplomes: z.array(z.any()).min(1, "Au moins un diplôme est requis"),

  certificats: z.array(z.any()).min(1, "Au moins un certificat est requis"),

  autres: z.array(z.any()).optional(),
});
