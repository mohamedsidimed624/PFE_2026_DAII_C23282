import { useState } from "react";
import { useFormData } from "../../context/FormContext";
import { CloudUpload, FileText, Trash2 } from "lucide-react";

function StepDocuments({ nextStep, prevStep }) {
  const { formData, updateSection } = useFormData();
  const [error, setError] = useState("");

  const files = {
    diplomes: formData?.documents?.diplomes || [],
    certificats: formData?.documents?.certificats || [],
    autres: formData?.documents?.autres || [],
  };

  const handleUpload = (fileList, type) => {
    const validFiles = Array.from(fileList)
      .filter((file) => {
        const allowed =
          file.type === "application/pdf" ||
          file.type === "image/jpeg" ||
          file.type === "image/png";

        return allowed && file.size <= 5 * 1024 * 1024;
      })
      .map((file) => ({ file }));

    updateSection("documents", {
      ...files,
      [type]: [...files[type], ...validFiles],
    });
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
    <div>
      <h3 className="mb-2 text-sm font-bold text-slate-700">
        {title}
      </h3>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, type)}
        className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-green-300 bg-white text-xs font-semibold text-green-600 transition hover:border-green-500 hover:bg-green-50"
      >
        <CloudUpload size={14} />
        Importer un document

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files, type)}
        />
      </label>

      <div className="mt-5 space-y-4">
        {files[type].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg bg-white px-3 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-700">
              <FileText size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-700">
                {item.file.name}
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                {(item.file.size / 1024).toFixed(0)} KB
              </p>
            </div>

            <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-green-100 sm:block">
              <div className="h-full w-full rounded-full bg-green-600" />
            </div>

            <span className="text-[11px] font-semibold text-green-700">
              100%
            </span>

            <button
              type="button"
              onClick={() => removeFile(type, index)}
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-red-300 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {renderUploader("Diplômes universitaires", "diplomes")}
        {renderUploader("Certificats de spécialisation", "certificats")}
        {renderUploader("Autres documents", "autres")}
      </div>

      {error && (
        <p className="text-right text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-6 pt-20">
        <button
          type="button"
          onClick={prevStep}
          className="h-12 w-36 rounded-lg border border-slate-300 bg-white text-lg font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
        >
          Retour
        </button>

        <button
          type="button"
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
          className="h-12 w-80 rounded-lg bg-green-600 text-lg font-bold text-white transition hover:bg-green-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

export default StepDocuments;