// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Navbar from "../components/Navbar";
// import {
//   ArrowLeft,
//   ArrowRight,
//   CheckCircle2,
//   FileText,
//   Info,
//   Mail,
//   MapPin,
//   Phone,
//   ShieldCheck,
//   Upload,
//   User,
//   Eye,
// } from "lucide-react";
// import { createPublicReclamation } from "../services/publicReclamationApi";

// const CATEGORY_OPTIONS = [
//   { value: "RETARD_TRAITEMENT", label: "Retard de traitement" },
//   { value: "ERREUR_DOSSIER", label: "Erreur sur dossier" },
//   { value: "DEMANDE_INFORMATION", label: "Demande d'information" },
//   { value: "QUALITE_SOINS", label: "Qualité des soins" },
//   { value: "INFORMATION_CONSENTEMENT", label: "Information et consentement" },
//   { value: "SECRET_PROFESSIONNEL", label: "Secret professionnel" },
//   { value: "COMPORTEMENT_INAPPROPRIE", label: "Comportement inapproprié" },
//   { value: "CERTIFICAT_MEDICAL", label: "Certificat médical" },
//   { value: "PRESCRIPTION_ABUSIVE", label: "Prescription abusive" },
//   { value: "CONFRATERNITE", label: "Confraternité" },
//   { value: "PUBLICITE_CHARLATANISME", label: "Publicité / charlatanisme" },
//   { value: "DECONSIDERATION_PROFESSION", label: "Déconsidération de la profession" },
//   { value: "AUTRE", label: "Autre" },
// ];

// const CATEGORY_GROUPS = [
//   { label: "Administratif", values: ["RETARD_TRAITEMENT", "ERREUR_DOSSIER", "DEMANDE_INFORMATION"] },
//   { label: "Pratique et relation", values: ["QUALITE_SOINS", "INFORMATION_CONSENTEMENT", "COMPORTEMENT_INAPPROPRIE"] },
//   { label: "Documents et prescriptions", values: ["CERTIFICAT_MEDICAL", "PRESCRIPTION_ABUSIVE"] },
//   { label: "Déontologie", values: ["SECRET_PROFESSIONNEL", "CONFRATERNITE", "PUBLICITE_CHARLATANISME", "DECONSIDERATION_PROFESSION"] },
//   { label: "Autres", values: ["AUTRE"] },
// ];

// const INITIAL_FORM = {
//   nom: "", prenom: "", ville: "", adresse: "",
//   telephone: "", email: "", categorie: "", objet: "", message: "", fichier: null,
// };

// const cx = (...xs) => xs.filter(Boolean).join(" ");
// const isBlank = (v) => !v || String(v).trim().length === 0;
// const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());
// const normalizePhone = (p) => String(p || "").trim().replace(/\s+/g, " ").replace(/[^0-9+ ]/g, "");
// const validatePhone = (p) => /^\+?[0-9]{8,15}$/.test(normalizePhone(p).replace(/\s/g, ""));
// const formatFileSize = (b) => {
//   if (!b && b !== 0) return "";
//   const kb = b / 1024;
//   return kb < 1024 ? `${Math.round(kb)} Ko` : `${(kb / 1024).toFixed(1)} Mo`;
// };

// /* ─── Validation ─────────────────────────────────────────────── */
// function validateField(name, value, fullForm) {
//   switch (name) {
//     case "nom":      return isBlank(value) ? "Nom requis." : String(value).trim().length < 2 ? "Min. 2 caractères." : "";
//     case "prenom":   return isBlank(value) ? "Prénom requis." : String(value).trim().length < 2 ? "Min. 2 caractères." : "";
//     case "ville":    return isBlank(value) ? "Ville requise." : "";
//     case "adresse":  return isBlank(value) ? "Adresse requise." : String(value).trim().length < 5 ? "Adresse trop courte." : "";
//     case "telephone":return isBlank(value) ? "Téléphone requis." : !validatePhone(value) ? "Format invalide. Ex : +222XXXXXXXX" : "";
//     case "email":    return isBlank(value) ? "Email requis." : !validateEmail(value) ? "Email invalide." : "";
//     case "categorie":return isBlank(value) ? "Catégorie requise." : "";
//     case "objet":    return isBlank(value) ? "Objet requis." : String(value).trim().length < 5 ? "Min. 5 caractères." : "";
//     case "message":  return isBlank(value) ? "Message requis." : String(value).trim().length < 20 ? "Min. 20 caractères." : "";
//     case "fichier": {
//       const f = fullForm?.fichier;
//       if (!f) return "";
//       if (f.size > 5 * 1024 * 1024) return `Fichier trop lourd (max 5 Mo). Actuel : ${formatFileSize(f.size)}`;
//       if (f.type && !["application/pdf","image/png","image/jpeg","image/jpg"].includes(f.type)) return "Format non supporté (PDF, PNG, JPG).";
//       return "";
//     }
//     default: return "";
//   }
// }

// /* ─── Sub-components ─────────────────────────────────────────── */

// function StepIndicator({ step }) {
//   const steps = [
//     { n: 1, label: "Vos informations" },
//     { n: 2, label: "Votre réclamation" },
//     { n: 3, label: "Confirmation" },
//     { n: 4, label: "Envoyée" },
//   ];

//   return (
//     <ol className="flex items-center gap-0">
//       {steps.map((s, idx) => {
//         const done = step > s.n;
//         const current = step === s.n;

//         return (
//           <li key={s.n} className="flex items-center">
//             <div className="flex flex-col items-center gap-1">
//               <div className={cx(
//                 "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
//                 done    ? "bg-green-600 text-white"
//                 : current ? "bg-green-50 text-green-700 ring-2 ring-green-600"
//                 : "bg-slate-100 text-slate-400"
//               )}>
//                 {done ? <CheckCircle2 size={15} /> : s.n}
//               </div>
//               <span className={cx(
//                 "hidden text-[11px] font-medium sm:block whitespace-nowrap",
//                 current ? "text-slate-800" : "text-slate-400"
//               )}>
//                 {s.label}
//               </span>
//             </div>
//             {idx < steps.length - 1 && (
//               <div className={cx(
//                 "mx-2 mb-4 h-px w-8 transition-all",
//                 step > s.n ? "bg-green-500" : "bg-slate-200"
//               )} />
//             )}
//           </li>
//         );
//       })}
//     </ol>
//   );
// }

// function Field({ id, label, required, hint, value, onChange, onBlur, error, type = "text", autoComplete, inputMode, placeholder, icon, maxLength }) {
//   return (
//     <div className="space-y-1">
//       <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>
//       {hint && <p className="text-xs text-slate-400">{hint}</p>}
//       <div className="relative">
//         {icon && (
//           <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//             {icon}
//           </span>
//         )}
//         <input
//           id={id} name={id} type={type} value={value}
//           onChange={onChange} onBlur={onBlur}
//           autoComplete={autoComplete} inputMode={inputMode}
//           placeholder={placeholder} maxLength={maxLength}
//           aria-invalid={error ? "true" : "false"}
//           className={cx(
//             "w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition",
//             "focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500",
//             icon ? "pl-9" : "",
//             error ? "border-red-300 focus:border-red-400 focus:ring-red-500/20" : "border-slate-200"
//           )}
//         />
//       </div>
//       {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
//     </div>
//   );
// }

// function TextArea({ id, label, required, hint, value, onChange, onBlur, error, placeholder, rows = 6, maxLength }) {
//   return (
//     <div className="space-y-1">
//       <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>
//       {hint && <p className="text-xs text-slate-400">{hint}</p>}
//       <textarea
//         id={id} name={id} value={value}
//         onChange={onChange} onBlur={onBlur}
//         placeholder={placeholder} rows={rows} maxLength={maxLength}
//         aria-invalid={error ? "true" : "false"}
//         className={cx(
//           "w-full resize-none rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition",
//           "focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500",
//           error ? "border-red-300" : "border-slate-200"
//         )}
//       />
//       <div className="flex items-center justify-between">
//         {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : <span />}
//         {typeof maxLength === "number" && (
//           <p className="text-xs text-slate-400">{String(value || "").length}/{maxLength}</p>
//         )}
//       </div>
//     </div>
//   );
// }

// function SummaryRow({ label, value }) {
//   return (
//     <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
//       <span className="text-xs text-slate-500 shrink-0">{label}</span>
//       <span className="text-xs font-medium text-slate-800 text-right break-words">
//         {value || <span className="text-slate-300">—</span>}
//       </span>
//     </div>
//   );
// }

// /* ─── Main component ─────────────────────────────────────────── */

// export default function PublicReclamationPage() {
//   const [step, setStep] = useState(1);
//   const [form, setForm] = useState(INITIAL_FORM);
//   const [snapshot, setSnapshot] = useState(null);
//   const [touched, setTouched] = useState({});
//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState("");
//   const [receipt, setReceipt] = useState(null);

//   const titleRef = useRef(null);
//   useEffect(() => { titleRef.current?.focus(); }, [step]);

//   const categoryByValue = useMemo(() => {
//     const map = new Map();
//     CATEGORY_OPTIONS.forEach((o) => map.set(o.value, o.label));
//     return map;
//   }, []);

//   const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
//   const markTouched = (name) => setTouched((prev) => ({ ...prev, [name]: true }));

//   const handleBlur = (name) => {
//     markTouched(name);
//     setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name], form) }));
//   };

//   const step1Fields = ["nom", "prenom", "ville", "adresse", "telephone", "email"];
//   const step2Fields = ["categorie", "objet", "message", "fichier"];

//   const step1Errors = useMemo(() => {
//     const e = {};
//     step1Fields.forEach((f) => { const m = validateField(f, form[f], form); if (m) e[f] = m; });
//     return e;
//   }, [form]);

//   const step2Errors = useMemo(() => {
//     const e = {};
//     step2Fields.forEach((f) => { const m = validateField(f, form[f], form); if (m) e[f] = m; });
//     return e;
//   }, [form]);

//   const step1Valid = Object.keys(step1Errors).length === 0;
//   const step2Valid = Object.keys(step2Errors).length === 0;

//   function goNext() {
//     setSubmitError("");
//     if (step === 1) {
//       setTouched((p) => { const n = { ...p }; step1Fields.forEach((f) => (n[f] = true)); return n; });
//       setErrors((p) => ({ ...p, ...step1Errors }));
//       if (!step1Valid) return;
//       setStep(2);
//     } else if (step === 2) {
//       setTouched((p) => { const n = { ...p }; step2Fields.forEach((f) => (n[f] = true)); return n; });
//       setErrors((p) => ({ ...p, ...step2Errors }));
//       if (!step2Valid) return;
//       // Aller à l'étape de confirmation (step 3) AVANT d'envoyer
//       setSnapshot({
//         nom: form.nom.trim(),
//         prenom: form.prenom.trim(),
//         ville: form.ville.trim(),
//         adresse: form.adresse.trim(),
//         telephone: normalizePhone(form.telephone),
//         email: form.email.trim(),
//         categorie: form.categorie,
//         objet: form.objet.trim(),
//         message: form.message.trim(),
//         fichierName: form.fichier ? form.fichier.name : null,
//       });
//       setStep(3);
//     } else if (step === 3) {
//       handleSubmit();
//     }
//   }

//   function goBack() {
//     setSubmitError("");
//     setStep((s) => Math.max(1, s - 1));
//   }

//   async function handleSubmit() {
//     setSubmitError("");
//     setSubmitting(true);
//     try {
//       const res = await createPublicReclamation(
//         {
//           nom: snapshot.nom, prenom: snapshot.prenom,
//           ville: snapshot.ville, adresse: snapshot.adresse,
//           telephone: snapshot.telephone, email: snapshot.email,
//           categorie: snapshot.categorie, objet: snapshot.objet,
//           message: snapshot.message,
//         },
//         form.fichier
//       );
//       setReceipt({
//         reference: res?.numeroReclamation || res?.reference || res?.id || "—",
//         date: new Date().toISOString(),
//       });
//       setStep(4);
//     } catch (err) {
//       setSubmitError(err?.response?.data?.message || "Erreur lors de l'envoi. Veuillez réessayer.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   function resetForm() {
//     setForm(INITIAL_FORM);
//     setSnapshot(null);
//     setTouched({});
//     setErrors({});
//     setSubmitError("");
//     setReceipt(null);
//     setStep(1);
//   }

//   const stepTitles = {
//     1: "Vos informations",
//     2: "Votre réclamation",
//     3: "Confirmation",
//     4: "Réclamation envoyée",
//   };

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* <Navbar /> */}

//       {/* Header */}
//       <div className="border-b border-slate-200 bg-white">
//         <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="text-xs font-semibold uppercase tracking-widest text-green-600">
//                 Espace public
//               </p>
//               <h1 className="mt-0.5 text-xl font-semibold text-slate-900">
//                 Déposer une réclamation
//               </h1>
//             </div>
//             <StepIndicator step={step} />
//           </div>
//         </div>
//       </div>

//       <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">

//           {/* FORM CARD */}
//           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
//             <h2
//               ref={titleRef}
//               tabIndex={-1}
//               className="text-base font-semibold text-slate-900 outline-none"
//             >
//               {stepTitles[step]}
//             </h2>
//             {step < 4 && (
//               <p className="mt-1 text-xs text-slate-400">
//                 Les champs marqués <span className="text-red-500">*</span> sont obligatoires.
//               </p>
//             )}

//             {submitError && (
//               <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//                 {submitError}
//               </div>
//             )}

//             {/* ── STEP 1 ── */}
//             {step === 1 && (
//               <form onSubmit={(e) => { e.preventDefault(); goNext(); }} className="mt-5 space-y-4">
//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <Field id="nom" label="Nom" required value={form.nom}
//                     onChange={(e) => setField("nom", e.target.value)} onBlur={() => handleBlur("nom")}
//                     error={touched.nom ? errors.nom : ""} autoComplete="family-name"
//                     placeholder="Votre nom" icon={<User size={14} />} />
//                   <Field id="prenom" label="Prénom" required value={form.prenom}
//                     onChange={(e) => setField("prenom", e.target.value)} onBlur={() => handleBlur("prenom")}
//                     error={touched.prenom ? errors.prenom : ""} autoComplete="given-name"
//                     placeholder="Votre prénom" icon={<User size={14} />} />
//                 </div>
//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <Field id="ville" label="Ville" required value={form.ville}
//                     onChange={(e) => setField("ville", e.target.value)} onBlur={() => handleBlur("ville")}
//                     error={touched.ville ? errors.ville : ""} autoComplete="address-level2"
//                     placeholder="Ex. Nouakchott" icon={<MapPin size={14} />} />
//                   <Field id="telephone" label="Téléphone" required value={form.telephone}
//                     onChange={(e) => setField("telephone", e.target.value)} onBlur={() => handleBlur("telephone")}
//                     error={touched.telephone ? errors.telephone : ""} autoComplete="tel" inputMode="tel"
//                     placeholder="+222 XX XX XX XX" icon={<Phone size={14} />} />
//                 </div>
//                 <Field id="adresse" label="Adresse" required value={form.adresse}
//                   onChange={(e) => setField("adresse", e.target.value)} onBlur={() => handleBlur("adresse")}
//                   error={touched.adresse ? errors.adresse : ""} autoComplete="street-address"
//                   placeholder="Quartier, rue..." icon={<MapPin size={14} />} />
//                 <Field id="email" label="Email" required value={form.email}
//                   onChange={(e) => setField("email", e.target.value)} onBlur={() => handleBlur("email")}
//                   error={touched.email ? errors.email : ""} autoComplete="email" inputMode="email" type="email"
//                   placeholder="nom@domaine.com" icon={<Mail size={14} />} />

//                 <div className="flex items-center justify-between pt-2">
//                   <button type="button" onClick={resetForm}
//                     className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
//                     Réinitialiser
//                   </button>
//                   <button type="submit"
//                     className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
//                     Continuer <ArrowRight size={15} />
//                   </button>
//                 </div>
//               </form>
//             )}

//             {/* ── STEP 2 ── */}
//             {step === 2 && (
//               <div className="mt-5 space-y-4">
//                 {/* Catégorie */}
//                 <div className="space-y-1">
//                   <label htmlFor="categorie" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Catégorie <span className="text-red-500">*</span>
//                   </label>
//                   <select id="categorie" name="categorie" value={form.categorie}
//                     onChange={(e) => setField("categorie", e.target.value)}
//                     onBlur={() => handleBlur("categorie")}
//                     className={cx(
//                       "w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition",
//                       "focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500",
//                       touched.categorie && errors.categorie ? "border-red-300" : "border-slate-200"
//                     )}>
//                     <option value="">— Sélectionner —</option>
//                     {CATEGORY_GROUPS.map((group) => (
//                       <optgroup key={group.label} label={group.label}>
//                         {group.values.map((val) => {
//                           const opt = CATEGORY_OPTIONS.find((o) => o.value === val);
//                           return opt ? <option key={opt.value} value={opt.value}>{opt.label}</option> : null;
//                         })}
//                       </optgroup>
//                     ))}
//                   </select>
//                   {touched.categorie && errors.categorie && (
//                     <p role="alert" className="text-xs text-red-600">{errors.categorie}</p>
//                   )}
//                 </div>

//                 <Field id="objet" label="Objet" required hint="Résumé en une phrase."
//                   value={form.objet} onChange={(e) => setField("objet", e.target.value)}
//                   onBlur={() => handleBlur("objet")} error={touched.objet ? errors.objet : ""}
//                   placeholder="Objet de la réclamation" icon={<FileText size={14} />} maxLength={120} />

//                 <TextArea id="message" label="Message" required
//                   hint="Décrivez les faits, les dates et les éléments utiles."
//                   value={form.message} onChange={(e) => setField("message", e.target.value)}
//                   onBlur={() => handleBlur("message")} error={touched.message ? errors.message : ""}
//                   placeholder="Votre message…" rows={7} maxLength={2000} />

//                 {/* Fichier */}
//                 <div className="space-y-1">
//                   <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Pièce jointe <span className="text-slate-400 normal-case font-normal">(optionnelle)</span>
//                   </label>
//                   <p className="text-xs text-slate-400">PDF, PNG, JPG — max 5 Mo</p>
//                   <label className={cx(
//                     "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition",
//                     touched.fichier && errors.fichier ? "border-red-300 bg-red-50" : "border-slate-300 bg-slate-50 hover:border-green-400 hover:bg-green-50/30"
//                   )}>
//                     <Upload size={15} className="shrink-0 text-slate-400" />
//                     <span className="truncate text-sm text-slate-600">
//                       {form.fichier
//                         ? `${form.fichier.name} (${formatFileSize(form.fichier.size)})`
//                         : "Choisir un fichier..."}
//                     </span>
//                     <input type="file" accept="application/pdf,image/png,image/jpeg" className="hidden"
//                       onChange={(e) => {
//                         const f = e.target.files?.[0] || null;
//                         setField("fichier", f);
//                         setTouched((p) => ({ ...p, fichier: true }));
//                         setErrors((p) => ({ ...p, fichier: validateField("fichier", f, { ...form, fichier: f }) }));
//                       }} />
//                   </label>
//                   {touched.fichier && errors.fichier && (
//                     <p role="alert" className="text-xs text-red-600">{errors.fichier}</p>
//                   )}
//                 </div>

//                 <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
//                   <button type="button" onClick={goBack}
//                     className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
//                     <ArrowLeft size={15} /> Retour
//                   </button>
//                   <button type="button" onClick={goNext}
//                     className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
//                     Vérifier et confirmer <ArrowRight size={15} />
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* ── STEP 3 — CONFIRMATION ── */}
//             {step === 3 && (
//               <div className="mt-5 space-y-5">
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <div className="flex items-center gap-2 mb-3">
//                     <Eye size={15} className="text-slate-500" />
//                     <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
//                       Récapitulatif — vérifiez avant d'envoyer
//                     </p>
//                   </div>

//                   <div className="mb-4">
//                     <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
//                       Identité
//                     </p>
//                     <div className="rounded-lg border border-slate-200 bg-white px-4 py-1">
//                       <SummaryRow label="Nom complet" value={`${snapshot?.prenom} ${snapshot?.nom}`} />
//                       <SummaryRow label="Email" value={snapshot?.email} />
//                       <SummaryRow label="Téléphone" value={snapshot?.telephone} />
//                       <SummaryRow label="Ville" value={snapshot?.ville} />
//                       <SummaryRow label="Adresse" value={snapshot?.adresse} />
//                     </div>
//                   </div>

//                   <div>
//                     <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
//                       Réclamation
//                     </p>
//                     <div className="rounded-lg border border-slate-200 bg-white px-4 py-1">
//                       <SummaryRow label="Catégorie" value={categoryByValue.get(snapshot?.categorie)} />
//                       <SummaryRow label="Objet" value={snapshot?.objet} />
//                       <SummaryRow label="Pièce jointe" value={snapshot?.fichierName || "Aucune"} />
//                     </div>
//                   </div>

//                   {snapshot?.message && (
//                     <div className="mt-4">
//                       <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
//                         Message
//                       </p>
//                       <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 leading-6 whitespace-pre-wrap">
//                         {snapshot.message}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <p className="text-xs text-slate-500">
//                   En cliquant sur <strong>Envoyer</strong>, vous confirmez que les informations
//                   ci-dessus sont exactes et acceptez qu'elles soient traitées par l'Ordre National des Médecins.
//                 </p>

//                 <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
//                   <button type="button" onClick={goBack}
//                     className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
//                     <ArrowLeft size={15} /> Modifier
//                   </button>
//                   <button type="button" onClick={goNext} disabled={submitting}
//                     className={cx(
//                       "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition",
//                       submitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//                     )}>
//                     {submitting ? (
//                       <>
//                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//                         Envoi en cours…
//                       </>
//                     ) : (
//                       <>Envoyer la réclamation <ArrowRight size={15} /></>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* ── STEP 4 — SUCCÈS ── */}
//             {step === 4 && (
//               <div className="mt-5 space-y-5">
//                 <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 py-8 px-6 text-center">
//                   <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
//                     <CheckCircle2 size={28} className="text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-base font-semibold text-green-900">
//                       Réclamation envoyée avec succès
//                     </h3>
//                     <p className="mt-1 text-sm text-green-700">
//                       Votre demande a bien été prise en compte par l'administration.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="grid gap-3 sm:grid-cols-2">
//                   <div className="rounded-xl border border-slate-200 bg-white p-4">
//                     <p className="text-xs text-slate-500">Référence</p>
//                     <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
//                       {receipt?.reference || "—"}
//                     </p>
//                   </div>
//                   <div className="rounded-xl border border-slate-200 bg-white p-4">
//                     <p className="text-xs text-slate-500">Date d'envoi</p>
//                     <p className="mt-1 text-sm font-medium text-slate-900">
//                       {receipt?.date
//                         ? new Date(receipt.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
//                         : "—"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="rounded-xl border border-slate-200 bg-white px-4 py-1">
//                   <SummaryRow label="Nom" value={`${snapshot?.prenom} ${snapshot?.nom}`} />
//                   <SummaryRow label="Email" value={snapshot?.email} />
//                   <SummaryRow label="Catégorie" value={categoryByValue.get(snapshot?.categorie)} />
//                   <SummaryRow label="Objet" value={snapshot?.objet} />
//                   <SummaryRow label="Pièce jointe" value={snapshot?.fichierName || "Aucune"} />
//                 </div>

//                 <div className="flex flex-col gap-3 sm:flex-row">
//                   <button type="button" onClick={resetForm}
//                     className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700">
//                     Nouvelle réclamation <ArrowRight size={15} />
//                   </button>
//                   <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//                     className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
//                     Retour en haut
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* SIDEBAR */}
//           <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">

//             {/* Aperçu temps réel (masqué aux étapes 3 et 4) */}
//             {step < 3 && (
//               <div className="rounded-xl border border-slate-200 bg-white p-4">
//                 <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
//                   Aperçu
//                 </p>
//                 <div className="space-y-0">
//                   <SummaryRow label="Nom" value={`${form.prenom} ${form.nom}`.trim() || undefined} />
//                   <SummaryRow label="Email" value={form.email} />
//                   <SummaryRow label="Téléphone" value={form.telephone} />
//                   <SummaryRow label="Ville" value={form.ville} />
//                   <SummaryRow label="Catégorie" value={categoryByValue.get(form.categorie)} />
//                   <SummaryRow label="Objet" value={form.objet} />
//                 </div>
//               </div>
//             )}

//             <div className="rounded-xl border border-slate-200 bg-white p-4">
//               <div className="flex items-start gap-2.5">
//                 <ShieldCheck size={15} className="mt-0.5 shrink-0 text-green-600" />
//                 <div>
//                   <p className="text-sm font-medium text-slate-800">Confidentialité</p>
//                   <p className="mt-1 text-xs leading-5 text-slate-500">
//                     Vos informations servent uniquement au traitement de votre réclamation.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-xl border border-slate-200 bg-white p-4">
//               <div className="flex items-start gap-2.5">
//                 <Info size={15} className="mt-0.5 shrink-0 text-slate-400" />
//                 <div>
//                   <p className="text-sm font-medium text-slate-800">Conseil</p>
//                   <p className="mt-1 text-xs leading-5 text-slate-500">
//                     Un message structuré et factuel accélère le traitement de votre dossier.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-xl border border-slate-200 bg-white p-4">
//               <div className="flex items-start gap-2.5">
//                 <Phone size={15} className="mt-0.5 shrink-0 text-slate-400" />
//                 <div>
//                   <p className="text-sm font-medium text-slate-800">Support</p>
//                   <p className="mt-1 text-xs leading-5 text-slate-500">
//                     En cas de difficulté, contactez l'administration via les canaux habituels.
//                   </p>
//                 </div>
//               </div>
//             </div>

//           </aside>
//         </div>
//       </main>

//       <footer className="mt-10 border-t border-slate-200 bg-white">
//         <div className="mx-auto max-w-5xl px-4 py-5 text-xs text-slate-400">
//           © {new Date().getFullYear()} Ordre National des Médecins — République Islamique de Mauritanie
//         </div>
//       </footer>
//     </div>
//   );
// }

import Navbar from '../components/Navbar';
import MultistepForm from '../components/reclamation/MultistepForm';

export default function PublicReclamationPage() {
  return (
    <div className='min-h-screen bg-base-100'> 
        <Navbar />
        <main className='pt-24 md:pt-28'>
            <MultistepForm />
        </main>
        

        

        {/* <Footer /> */}
    </div>
  )
}
