import { useEffect, useState } from "react";
import {
  checkSousSpecialiteCodeAvailable,
  checkSousSpecialiteLibelleAvailable,
} from "../../../services/adminSpecialiteApi";

function SousSpecialiteFormModal({
  isOpen,
  mode = "create",
  parentSpecialite = null,
  initialData = null,
  loading = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    code: "", libelle: "", description: "", ordreAffichage: "", active: true, specialiteId: "",
  });

  const [errors, setErrors] = useState({});
  const [checkingCode, setCheckingCode] = useState(false);
  const [checkingLibelle, setCheckingLibelle] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState(null);
  const [libelleAvailable, setLibelleAvailable] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      code: initialData?.code || "",
      libelle: initialData?.libelle || "",
      description: initialData?.description || "",
      ordreAffichage: initialData?.ordreAffichage !== null && initialData?.ordreAffichage !== undefined ? String(initialData.ordreAffichage) : "",
      active: initialData?.active !== null && initialData?.active !== undefined ? initialData.active : true,
      specialiteId: initialData?.specialiteId || parentSpecialite?.id || "",
    });
    setErrors({});
    setCodeAvailable(null);
    setLibelleAvailable(null);
  }, [isOpen, initialData, parentSpecialite]);

  useEffect(() => {
    if (!isOpen) return;
    const value = form.code.trim();
    if (!value) { setCodeAvailable(null); return; }
    if (mode === "edit" && value === (initialData?.code || "").trim()) { setCodeAvailable(true); return; }
    const timer = setTimeout(async () => {
      try {
        setCheckingCode(true);
        const res = await checkSousSpecialiteCodeAvailable(value, mode === "edit" ? initialData?.id : null);
        const available = typeof res === "boolean" ? res : typeof res?.available === "boolean" ? res.available : typeof res?.exists === "boolean" ? !res.exists : null;
        setCodeAvailable(available);
      } catch { setCodeAvailable(null); }
      finally { setCheckingCode(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.code, isOpen, mode, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const value = form.libelle.trim();
    if (!value || !form.specialiteId) { setLibelleAvailable(null); return; }
    if (mode === "edit" && value === (initialData?.libelle || "").trim() && String(form.specialiteId) === String(initialData?.specialiteId)) { setLibelleAvailable(true); return; }
    const timer = setTimeout(async () => {
      try {
        setCheckingLibelle(true);
        const res = await checkSousSpecialiteLibelleAvailable(value, form.specialiteId, mode === "edit" ? initialData?.id : null);
        const available = typeof res === "boolean" ? res : typeof res?.available === "boolean" ? res.available : typeof res?.exists === "boolean" ? !res.exists : null;
        setLibelleAvailable(available);
      } catch { setLibelleAvailable(null); }
      finally { setCheckingLibelle(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.libelle, form.specialiteId, isOpen, mode, initialData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "code") setCodeAvailable(null);
    if (field === "libelle" || field === "specialiteId") setLibelleAvailable(null);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.specialiteId) nextErrors.specialiteId = "La spécialité parent est obligatoire.";
    if (!form.code.trim())    nextErrors.code    = "Le code est obligatoire.";
    if (!form.libelle.trim()) nextErrors.libelle = "Le libellé est obligatoire.";
    if (codeAvailable === false)    nextErrors.code    = "Ce code existe déjà.";
    if (libelleAvailable === false) nextErrors.libelle = "Ce libellé existe déjà pour cette spécialité.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      code: form.code.trim(),
      libelle: form.libelle.trim(),
      description: form.description.trim() || null,
      ordreAffichage: form.ordreAffichage === "" ? null : Number(form.ordreAffichage),
      active: form.active,
      specialiteId: Number(form.specialiteId),
    });
  };

  if (!isOpen) return null;

  const inputCls = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/15 transition-all";

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/20 dark:bg-black/50 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {mode === "create" ? "Ajouter une sous-spécialité" : "Modifier la sous-spécialité"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Renseignez les informations de la sous-spécialité.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl transition-colors">×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Spécialité parent</label>
            <input
              type="text"
              value={parentSpecialite?.libelle || initialData?.specialiteLibelle || ""}
              disabled
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400"
            />
            {errors.specialiteId && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.specialiteId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
            <input type="text" value={form.code} onChange={(e) => handleChange("code", e.target.value)} className={inputCls} placeholder="Ex: CARD-INT" />
            {checkingCode && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Vérification du code...</p>}
            {!checkingCode && codeAvailable === true  && form.code.trim() && <p className="mt-1 text-xs text-green-600 dark:text-green-400">Code disponible.</p>}
            {!checkingCode && codeAvailable === false  && <p className="mt-1 text-xs text-red-600 dark:text-red-400">Ce code existe déjà.</p>}
            {errors.code && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Libellé</label>
            <input type="text" value={form.libelle} onChange={(e) => handleChange("libelle", e.target.value)} className={inputCls} placeholder="Ex: Cardiologie interventionnelle" />
            {checkingLibelle && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Vérification du libellé...</p>}
            {!checkingLibelle && libelleAvailable === true  && form.libelle.trim() && <p className="mt-1 text-xs text-green-600 dark:text-green-400">Libellé disponible.</p>}
            {!checkingLibelle && libelleAvailable === false  && <p className="mt-1 text-xs text-red-600 dark:text-red-400">Ce libellé existe déjà pour cette spécialité.</p>}
            {errors.libelle && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.libelle}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} className={inputCls} placeholder="Description courte..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ordre d'affichage</label>
            <input type="number" value={form.ordreAffichage} onChange={(e) => handleChange("ordreAffichage", e.target.value)} className={inputCls} placeholder="Ex: 1" />
          </div>

          {mode === "edit" && (
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={form.active} onChange={(e) => handleChange("active", e.target.checked)} />
              Sous-spécialité active
            </label>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || checkingCode || checkingLibelle || codeAvailable === false || libelleAvailable === false}
              className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {loading ? "Enregistrement..." : mode === "create" ? "Créer" : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SousSpecialiteFormModal;
