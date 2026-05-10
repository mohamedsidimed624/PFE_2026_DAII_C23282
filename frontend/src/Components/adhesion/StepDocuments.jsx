import { useState } from "react";
import { useFormData } from "../../context/FormContext";
import { CloudUpload, FileText, Trash2, Check } from "lucide-react";

function StepDocuments({ nextStep, prevStep }) {
  const { formData, updateSection } = useFormData();
  const [error, setError] = useState("");

  const files = {
    diplomes:    formData?.documents?.diplomes    || [],
    certificats: formData?.documents?.certificats || [],
    autres:      formData?.documents?.autres      || [],
  };

  const handleUpload = (fileList, type) => {
    const validFiles = Array.from(fileList)
      .filter((file) => {
        const allowed = file.type === "application/pdf" || file.type === "image/jpeg" || file.type === "image/png";
        return allowed && file.size <= 5 * 1024 * 1024;
      })
      .map((file) => ({ file }));
    updateSection("documents", { ...files, [type]: [...files[type], ...validFiles] });
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files, type);
  };

  const removeFile = (type, index) => {
    const updated = [...files[type]];
    updated.splice(index, 1);
    updateSection("documents", { ...files, [type]: updated });
  };

  const renderUploader = (title, type) => (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <CloudUpload size={15} className="text-green-600" />
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, type)}
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50/30 transition-colors"
      >
        <CloudUpload size={28} className="mx-auto mb-3 text-slate-400" />
        <p className="text-sm text-slate-500 mb-1">Glisser les fichiers ici</p>
        <label className="text-sm font-medium text-green-600 cursor-pointer hover:text-green-700">
          ou cliquer pour ajouter
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files, type)}
          />
        </label>
        <p className="text-xs text-slate-400 mt-2">PDF / JPG / PNG — max 5MB</p>
      </div>

      <div className="mt-4 space-y-2">
        {files[type].map((item, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <FileText size={15} className="shrink-0 text-green-600" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-800">{item.file.name}</div>
              <div className="text-xs text-slate-400">{(item.file.size / 1024).toFixed(1)} KB</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                <Check size={10} />
                OK
              </span>
              <button onClick={() => removeFile(type, index)} className="text-slate-400 transition-colors hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderUploader("Diplômes universitaires", "diplomes")}
        {renderUploader("Certificats de spécialisation", "certificats")}
        {renderUploader("Autres documents", "autres")}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={prevStep}
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Retour
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={() => {
            if (files.diplomes.length === 0) {
              setError("Veuillez ajouter au moins un diplôme.");
              return;
            }
            if (files.certificats.length === 0) {
              setError("Veuillez ajouter au moins un certificat.");
              return;
            }
            setError("");
            nextStep();
          }}
          className="rounded-xl bg-green-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

export default StepDocuments;
