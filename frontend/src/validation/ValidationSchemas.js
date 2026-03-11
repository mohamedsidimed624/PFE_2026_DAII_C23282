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
  specialite: z.string().min(2, "Spécialité requise"),

  sousSpecialite: z.string().min(2, "Sous-spécialité requise"),

  diplome: z.string().min(2, "Diplôme requis"),

  annee: z.string().regex(/^[0-9]{4}$/, "Année invalide"),

  pays: z.string().min(2, "Pays requis"),

  ville: z.string().min(2, "Ville requise"),

  universite: z.string().min(2, "Université requise"),
});

/* =========================
   EXPERIENCE
========================= */

export const experienceSchema = z.object({
  poste: z.string().min(2, "Poste requis"),

  etablissement: z.string().min(2, "Établissement requis"),

  dateDebut: z.string().min(1, "Date de début requise"),

  dateFin: z.string().min(1, "Date de fin requise"),

  pays: z.string().min(2, "Pays requis"),

  ville: z.string().min(2, "Ville requise"),

  description: z.string().min(10, "Description trop courte"),
});

export const documentsSchema = z.object({
  diplomes: z.array(z.any()).min(1, "Au moins un diplôme est requis"),

  certificats: z.array(z.any()).min(1, "Au moins un certificat est requis"),

  autres: z.array(z.any()).optional(),
});
